import { prisma } from "@/lib/prisma";
import { calculateSeoScore } from "@/lib/seo";
import { extractVideoId, fetchTranscript, fetchVideoMetadata } from "@/lib/youtube";
import { analyzeYoutubeTranscript, researchTopic, writeArticle } from "@/lib/ai/generateArticle";
import { fetchNewsForCategory, RawNewsItem } from "@/lib/news/rss";
import { rankNewsItems } from "@/lib/news/rank";
import { GeneratedArticle, NewsCategoryKey } from "@/types/article";
import { Article, ArticleStatus, Prisma, SourceType } from "@prisma/client";
import { ResearchInput } from "@/lib/ai/prompts";

interface SaveArticleParams {
  article: GeneratedArticle;
  sourceType: SourceType;
  sourceUrl?: string;
  sourceTitle?: string;
  researchSummary?: unknown;
  status?: ArticleStatus;
}

export async function saveGeneratedArticle(params: SaveArticleParams): Promise<Article> {
  const { article } = params;
  const seoScore = calculateSeoScore(article);

  return prisma.article.create({
    data: {
      status: params.status ?? "DRAFT",
      sourceType: params.sourceType,
      sourceUrl: params.sourceUrl,
      sourceTitle: params.sourceTitle,
      seoTitle: article.seoTitle,
      seoSubheadline: article.seoSubheadline,
      slug: article.slug,
      highlights: article.highlights as unknown as Prisma.InputJsonValue,
      introduction: article.introduction,
      body: article.bodyHtml,
      conclusion: article.conclusion,
      metaDescription: article.metaDescription,
      keywords: article.keywords as unknown as Prisma.InputJsonValue,
      semanticKeywords: article.semanticKeywords as unknown as Prisma.InputJsonValue,
      faq: article.faq as unknown as Prisma.InputJsonValue,
      schemaMarkup: article.schemaMarkup as unknown as Prisma.InputJsonValue,
      internalLinks: article.internalLinks as unknown as Prisma.InputJsonValue,
      externalLinks: article.externalLinks as unknown as Prisma.InputJsonValue,
      seoScore,
      wpTags: article.wpTags as unknown as Prisma.InputJsonValue,
      wpCategories: article.wpCategories as unknown as Prisma.InputJsonValue,
      socialSnippet: article.socialSnippet,
      twitterSnippet: article.twitterSnippet,
      featuredImagePrompt: article.featuredImagePrompt,
      thumbnailPrompt: article.thumbnailPrompt,
      xPostImagePrompt: article.xPostImagePrompt,
      instagramImagePrompt: article.instagramImagePrompt,
      researchSummary: params.researchSummary as Prisma.InputJsonValue | undefined,
      wordCount: article.wordCount,
    },
  });
}

/**
 * Builds a compact, model-friendly text block from ranked news items, used
 * as additional research context.
 */
function buildNewsContext(items: RawNewsItem[], limit = 8): string {
  return items
    .slice(0, limit)
    .map(
      (item) =>
        `- [${item.source}] ${item.title}${
          item.publishedAt ? ` (${item.publishedAt.toISOString().slice(0, 10)})` : ""
        }: ${item.summary}`
    )
    .join("\n");
}

/**
 * Full pipeline: YouTube URL -> transcript -> analysis -> research ->
 * article -> saved DB record.
 */
export async function generateArticleFromYoutube(url: string): Promise<Article> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Ungültige YouTube-URL.");

  const [transcript, metadata] = await Promise.all([
    fetchTranscript(videoId),
    fetchVideoMetadata(videoId),
  ]);

  const analysis = await analyzeYoutubeTranscript(transcript, {
    title: metadata.title,
    channel: metadata.channel,
    url: metadata.url,
  });

  let newsContext = "";
  try {
    const newsItems = await fetchNewsForCategory(analysis.category);
    newsContext = buildNewsContext(newsItems);
  } catch (err) {
    console.error("Konnte Begleit-News nicht laden:", err);
  }

  const researchInput: ResearchInput = {
    topic: analysis.suggestedTopic,
    category: analysis.category,
    newsContext,
  };
  const research = await researchTopic(researchInput);

  const sourceContext = [
    `Video: ${metadata.title} (Kanal: ${metadata.channel})`,
    `Zusammenfassung: ${analysis.summary}`,
    `Kernaussagen:\n${analysis.keyPoints.map((p) => `- ${p}`).join("\n")}`,
    `Fakten:\n${analysis.facts.map((f) => `- ${f}`).join("\n")}`,
    `Zitate:\n${analysis.quotes.map((q) => `- ${q.speaker}: "${q.quote}"`).join("\n")}`,
    `Genannte Personen: ${analysis.persons.join(", ") || "-"}`,
    `Genannte Unternehmen: ${analysis.companies.join(", ") || "-"}`,
    `Genannte Kryptowährungen: ${analysis.cryptocurrencies.join(", ") || "-"}`,
  ].join("\n\n");

  const article = await writeArticle({
    category: analysis.category,
    topic: analysis.suggestedTopic,
    sourceContext,
    researchSummary: JSON.stringify(research, null, 2),
  });

  return saveGeneratedArticle({
    article,
    sourceType: "YOUTUBE",
    sourceUrl: metadata.url,
    sourceTitle: metadata.title,
    researchSummary: { videoAnalysis: analysis, research },
  });
}

/**
 * Full pipeline: selected news item -> research -> article -> saved DB
 * record. Marks the source NewsItem (and any detected duplicates) as used.
 */
export async function generateArticleFromNews(
  category: NewsCategoryKey,
  selected: RawNewsItem,
  contextItems: RawNewsItem[] = []
): Promise<Article> {
  const newsContext = buildNewsContext(
    [selected, ...contextItems.filter((i) => i.url !== selected.url)],
    10
  );

  const research = await researchTopic({
    topic: selected.title,
    category,
    newsContext,
  });

  const sourceContext = `Hauptmeldung: ${selected.title} (Quelle: ${selected.source})\n${selected.summary}\n\nWeitere Meldungen:\n${newsContext}`;

  const article = await writeArticle({
    category,
    topic: selected.title,
    sourceContext,
    researchSummary: JSON.stringify(research, null, 2),
  });

  return saveGeneratedArticle({
    article,
    sourceType: "NEWS",
    sourceUrl: selected.url,
    sourceTitle: selected.title,
    researchSummary: { research },
  });
}

export async function fetchAndRankNews(category: NewsCategoryKey) {
  const rawItems = await fetchNewsForCategory(category);
  const ranking = await rankNewsItems(rawItems, category);
  return ranking;
}

/**
 * Full pipeline: a free-form topic/brief written by the editor -> research
 * (incl. live web search if Perplexity is configured) -> article -> saved DB
 * record.
 */
export async function generateArticleFromBrief(
  category: NewsCategoryKey,
  topic: string,
  notes: string
): Promise<Article> {
  const research = await researchTopic({
    topic,
    category,
    newsContext: notes || "Keine zusätzlichen Informationen angegeben.",
  });

  const sourceContext = notes
    ? `Vorgaben/Informationen der Redaktion:\n${notes}`
    : `Vorgaben/Informationen der Redaktion: keine - recherchiere eigenständig zum Thema.`;

  const article = await writeArticle({
    category,
    topic,
    sourceContext,
    researchSummary: JSON.stringify(research, null, 2),
  });

  return saveGeneratedArticle({
    article,
    sourceType: "MANUAL",
    sourceTitle: topic,
    researchSummary: { research },
  });
}

/**
 * Converts a stored Article DB record back into the GeneratedArticle shape
 * used by the WordPress publisher.
 */
export function articleToGenerated(article: Article): GeneratedArticle {
  return {
    seoTitle: article.seoTitle ?? "",
    seoSubheadline: article.seoSubheadline ?? "",
    slug: article.slug ?? "",
    highlights: (article.highlights as unknown as string[]) ?? [],
    introduction: article.introduction ?? "",
    bodyHtml: article.body ?? "",
    conclusion: article.conclusion ?? "",
    metaDescription: article.metaDescription ?? "",
    keywords: (article.keywords as unknown as string[]) ?? [],
    semanticKeywords: (article.semanticKeywords as unknown as string[]) ?? [],
    faq: (article.faq as unknown as GeneratedArticle["faq"]) ?? [],
    schemaMarkup: (article.schemaMarkup as unknown as GeneratedArticle["schemaMarkup"]) ?? {},
    wpTags: (article.wpTags as unknown as string[]) ?? [],
    wpCategories: (article.wpCategories as unknown as string[]) ?? [],
    socialSnippet: article.socialSnippet ?? "",
    twitterSnippet: article.twitterSnippet ?? "",
    featuredImagePrompt: article.featuredImagePrompt ?? "",
    thumbnailPrompt: article.thumbnailPrompt ?? "",
    xPostImagePrompt: article.xPostImagePrompt ?? "",
    instagramImagePrompt: article.instagramImagePrompt ?? "",
    internalLinks: (article.internalLinks as unknown as GeneratedArticle["internalLinks"]) ?? [],
    externalLinks: (article.externalLinks as unknown as GeneratedArticle["externalLinks"]) ?? [],
    wordCount: article.wordCount ?? 0,
  };
}
