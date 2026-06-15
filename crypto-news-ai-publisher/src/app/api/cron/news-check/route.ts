import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleToGenerated, fetchAndRankNews, generateArticleFromNews } from "@/lib/pipeline";
import { publishDraftToWordPress, isWordPressConfigured } from "@/lib/wordpress";
import { NewsCategoryKey } from "@/types/article";

export const maxDuration = 300;

const CATEGORIES: NewsCategoryKey[] = ["XRP", "BITCOIN", "CRYPTO", "FINANCE", "MACRO"];
const RELEVANCE_THRESHOLD = 75;

/**
 * Hourly automation entry point. Checks every news category for a top story
 * above the relevance threshold that hasn't been processed yet, generates a
 * full article and stores it as a WordPress draft (if configured).
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

  const results: Record<string, string> = {};

  for (const category of CATEGORIES) {
    try {
      const ranking = await fetchAndRankNews(category);
      const topIndex = ranking.topStoryIndex;

      if (topIndex === null) {
        results[category] = "Keine relevante Story gefunden.";
        continue;
      }

      const top = ranking.items[topIndex];
      if (top.overallScore < RELEVANCE_THRESHOLD) {
        results[category] = `Top-Story unter Relevanz-Schwelle (${top.overallScore}).`;
        continue;
      }

      const existing = await prisma.newsItem.findUnique({ where: { url: top.url } });
      if (existing) {
        results[category] = "Top-Story bereits verarbeitet.";
        continue;
      }

      const newsItem = await prisma.newsItem.create({
        data: {
          title: top.title,
          url: top.url,
          source: top.source,
          summary: top.summary,
          category,
          publishedAt: top.publishedAt,
          relevanceScore: top.relevanceScore,
          trustScore: top.trustScore,
          seoScore: top.seoScore,
          overallScore: top.overallScore,
          isDuplicate: top.isDuplicate,
          isFakeNews: top.isFakeNews,
        },
      });

      const article = await generateArticleFromNews(category, top, ranking.items.slice(0, 8));

      await prisma.newsItem.update({ where: { id: newsItem.id }, data: { articleId: article.id } });

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
      }

      await prisma.automationLog.create({
        data: {
          type: "NEWS_CHECK",
          status: "SUCCESS",
          message: `Artikel für "${top.title}" (${category}) erstellt - Artikel-ID ${article.id}.`,
        },
      });

      results[category] = `Artikel erstellt: ${article.id}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      console.error(`Cron-Fehler für Kategorie ${category}:`, err);
      await prisma.automationLog.create({
        data: { type: "NEWS_CHECK", status: "ERROR", message: `${category}: ${message}` },
      });
      results[category] = `Fehler: ${message}`;
    }
  }

  return NextResponse.json({ results });
}
