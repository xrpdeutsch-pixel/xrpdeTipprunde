import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [statusCounts, recentArticles, totalArticles, recentNews] = await Promise.all([
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        seoTitle: true,
        status: true,
        seoScore: true,
        wordCount: true,
        sourceType: true,
        wpCategories: true,
        keywords: true,
        createdAt: true,
      },
    }),
    prisma.article.count(),
    prisma.newsItem.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 30,
      select: { title: true, category: true, source: true, relevanceScore: true, url: true },
    }),
  ]);

  const keywordCounts = new Map<string, number>();
  for (const article of recentArticles) {
    for (const kw of (article.keywords as string[] | null) ?? []) {
      keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1);
    }
  }
  const topKeywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  return NextResponse.json({
    totalArticles,
    statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count._all })),
    recentArticles,
    topKeywords,
    trendingNews: recentNews,
  });
}
