import Parser from "rss-parser";
import { NewsCategoryKey } from "@/types/article";
import { NEWS_SOURCES } from "./sources";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; CryptoNewsAIPublisher/1.0; +https://example.com)",
  },
});

export interface RawNewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: Date | null;
}

/**
 * Fetches and merges all RSS feeds configured for a category. Feed errors
 * (timeouts, blocked feeds, etc.) are swallowed per-feed so one broken
 * source doesn't take down the whole category.
 */
export async function fetchNewsForCategory(category: NewsCategoryKey): Promise<RawNewsItem[]> {
  const feeds = NEWS_SOURCES[category];

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const data = await parser.parseURL(feed.url);
      return (data.items ?? []).map((item) => normalizeItem(item, feed.name));
    })
  );

  const items: RawNewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error("RSS feed error:", result.reason);
    }
  }

  return items.filter((item) => item.title && item.url);
}

function normalizeItem(item: Parser.Item, sourceName: string): RawNewsItem {
  const itemWithContentEncoded = item as Parser.Item & { "content:encoded"?: string };
  const summary =
    item.contentSnippet?.trim() ||
    stripHtml(item.content ?? "") ||
    stripHtml(itemWithContentEncoded["content:encoded"] ?? "");

  return {
    title: (item.title ?? "").trim(),
    url: (item.link ?? "").trim(),
    source: sourceName,
    summary: summary.slice(0, 600),
    publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
