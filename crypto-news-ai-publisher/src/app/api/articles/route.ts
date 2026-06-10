import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ArticleStatus | null;

  const articles = await prisma.article.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      sourceType: true,
      sourceTitle: true,
      sourceUrl: true,
      seoTitle: true,
      slug: true,
      seoScore: true,
      wordCount: true,
      wpCategories: true,
      wordpressUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ articles });
}
