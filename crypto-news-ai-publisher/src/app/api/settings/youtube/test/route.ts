import { NextResponse } from "next/server";
import { getYoutubeChannelSettings, saveYoutubeChannelSettings } from "@/lib/settings";
import { fetchLatestChannelVideos, resolveChannelId } from "@/lib/youtube";

/**
 * Resolves and caches the channel ID (if not already known) and fetches the
 * latest upload to confirm the connection works.
 */
export async function POST() {
  const settings = await getYoutubeChannelSettings();
  let channelId = settings.channelId;

  if (!channelId) {
    channelId = await resolveChannelId(settings.handle || settings.channelUrl);
    if (channelId) {
      await saveYoutubeChannelSettings({ channelId });
    }
  }

  if (!channelId) {
    return NextResponse.json(
      { success: false, message: `Kanal-ID für "${settings.handle}" konnte nicht ermittelt werden.` },
      { status: 400 }
    );
  }

  try {
    const videos = await fetchLatestChannelVideos(channelId, 1);
    return NextResponse.json({
      success: true,
      message: videos[0]
        ? `Verbindung erfolgreich. Neuestes Video: "${videos[0].title}".`
        : "Verbindung erfolgreich, aber keine Videos gefunden.",
      channelId,
      latestVideo: videos[0] ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
