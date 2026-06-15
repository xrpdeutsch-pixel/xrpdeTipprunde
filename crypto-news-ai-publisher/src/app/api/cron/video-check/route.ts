import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getYoutubeChannelSettings, saveYoutubeChannelSettings } from "@/lib/settings";
import { fetchLatestChannelVideos, resolveChannelId } from "@/lib/youtube";
import { articleToGenerated, generateArticleFromYoutube } from "@/lib/pipeline";
import { isWordPressConfigured, publishDraftToWordPress } from "@/lib/wordpress";

export const maxDuration = 300;

const RECENT_VIDEOS_TO_CHECK = 3;

/**
 * Daily automation entry point (configured for ~13:05 Europe/Berlin in
 * vercel.json). Checks the configured YouTube channel for new uploads that
 * haven't been turned into an article yet, generates a full article for each
 * and stores it as a WordPress draft (if configured).
 *
 * Protect with a CRON_SECRET: requests must include
 * `Authorization: Bearer <CRON_SECRET>` when the env var is set.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const channel = await getYoutubeChannelSettings();
  if (!channel.active) {
    return NextResponse.json({ message: "YouTube-Kanal-Überwachung ist deaktiviert." });
  }

  let channelId = channel.channelId;
  if (!channelId) {
    channelId = await resolveChannelId(channel.handle || channel.channelUrl);
    if (channelId) await saveYoutubeChannelSettings({ channelId });
  }

  if (!channelId) {
    const message = `Kanal-ID für "${channel.handle}" konnte nicht ermittelt werden.`;
    await prisma.automationLog.create({
      data: { type: "VIDEO_CHECK", status: "ERROR", message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let videos;
  try {
    videos = await fetchLatestChannelVideos(channelId, RECENT_VIDEOS_TO_CHECK);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    await prisma.automationLog.create({
      data: { type: "VIDEO_CHECK", status: "ERROR", message: `Feed-Abruf fehlgeschlagen: ${message}` },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const results: Record<string, string> = {};

  for (const video of videos) {
    const existing = await prisma.processedVideo.findUnique({ where: { videoId: video.videoId } });
    if (existing) continue;

    try {
      const article = await generateArticleFromYoutube(video.url);

      let wpInfo = "";
      if (await isWordPressConfigured()) {
        const generated = articleToGenerated(article);
        const wpResult = await publishDraftToWordPress(generated);
        await prisma.article.update({
          where: { id: article.id },
          data: {
            status: "PUBLISHED",
            wordpressPostId: wpResult.id,
            wordpressUrl: wpResult.link,
            wordpressStatus: wpResult.status,
          },
        });
        wpInfo = ` -> WordPress-Entwurf ${wpResult.link}`;
      }

      await prisma.processedVideo.create({
        data: { videoId: video.videoId, title: video.title, channelId, articleId: article.id },
      });

      await prisma.automationLog.create({
        data: {
          type: "VIDEO_CHECK",
          status: "SUCCESS",
          message: `Neues Video "${video.title}" verarbeitet - Artikel ${article.id}${wpInfo}`,
        },
      });

      results[video.videoId] = `Artikel erstellt: ${article.id}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      console.error(`Video-Check-Fehler für ${video.videoId}:`, err);
      await prisma.automationLog.create({
        data: { type: "VIDEO_CHECK", status: "ERROR", message: `${video.title}: ${message}` },
      });
      results[video.videoId] = `Fehler: ${message}`;
    }
  }

  if (Object.keys(results).length === 0) {
    await prisma.automationLog.create({
      data: { type: "VIDEO_CHECK", status: "SUCCESS", message: "Keine neuen Videos gefunden." },
    });
    return NextResponse.json({ message: "Keine neuen Videos gefunden." });
  }

  return NextResponse.json({ results });
}
