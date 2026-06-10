import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSeoScore } from "@/lib/seo";
import { GeneratedArticle } from "@/types/article";

export async function GET(_request: Request, ctx: RouteContext<"/api/articles/[id]">) {
  const { id } = await ctx.params;
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    return NextResponse.json({ error: "Artikel nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/articles/[id]">) {
  const { id } = await ctx.params;
  const existing = await prisma.article.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Artikel nicht gefunden." }, { status: 404 });
  }

  const updates = await request.json();

  const allowedFields = [
    "status",
    "seoTitle",
    "seoSubheadline",
    "slug",
    "highlights",
    "introduction",
    "body",
    "conclusion",
    "metaDescription",
    "keywords",
    "semanticKeywords",
    "faq",
    "schemaMarkup",
    "internalLinks",
    "externalLinks",
    "wpTags",
    "wpCategories",
    "socialSnippet",
    "twitterSnippet",
    "featuredImagePrompt",
    "thumbnailPrompt",
    "xPostImagePrompt",
    "instagramImagePrompt",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in updates) data[field] = updates[field];
  }

  // Recalculate SEO score if any content fields were touched
  const merged = { ...existing, ...data } as typeof existing;
  const generated: GeneratedArticle = {
    seoTitle: merged.seoTitle ?? "",
    seoSubheadline: merged.seoSubheadline ?? "",
    slug: merged.slug ?? "",
    highlights: (merged.highlights as unknown as string[]) ?? [],
    introduction: merged.introduction ?? "",
    bodyHtml: merged.body ?? "",
    conclusion: merged.conclusion ?? "",
    metaDescription: merged.metaDescription ?? "",
    keywords: (merged.keywords as unknown as string[]) ?? [],
    semanticKeywords: (merged.semanticKeywords as unknown as string[]) ?? [],
    faq: (merged.faq as unknown as GeneratedArticle["faq"]) ?? [],
    schemaMarkup: (merged.schemaMarkup as unknown as GeneratedArticle["schemaMarkup"]) ?? {},
    wpTags: (merged.wpTags as unknown as string[]) ?? [],
    wpCategories: (merged.wpCategories as unknown as string[]) ?? [],
    socialSnippet: merged.socialSnippet ?? "",
    twitterSnippet: merged.twitterSnippet ?? "",
    featuredImagePrompt: merged.featuredImagePrompt ?? "",
    thumbnailPrompt: merged.thumbnailPrompt ?? "",
    xPostImagePrompt: merged.xPostImagePrompt ?? "",
    instagramImagePrompt: merged.instagramImagePrompt ?? "",
    internalLinks: (merged.internalLinks as unknown as GeneratedArticle["internalLinks"]) ?? [],
    externalLinks: (merged.externalLinks as unknown as GeneratedArticle["externalLinks"]) ?? [],
    wordCount: merged.wordCount ?? 0,
  };
  data.seoScore = calculateSeoScore(generated);

  const article = await prisma.article.update({ where: { id }, data });
  return NextResponse.json({ article });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/articles/[id]">) {
  const { id } = await ctx.params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
