import { GeneratedArticle } from "@/types/article";

/**
 * Lightweight, deterministic SEO score (0-100) used for the editorial
 * dashboard. This is a heuristic check, not a replacement for a full SEO
 * audit - it flags missing fields and obvious length issues.
 */
export function calculateSeoScore(article: GeneratedArticle): number {
  let score = 0;
  const checks: { pass: boolean; points: number }[] = [
    { pass: article.wordCount >= 1500, points: 20 },
    { pass: article.seoTitle?.length > 0 && article.seoTitle.length <= 70, points: 10 },
    {
      pass: article.metaDescription?.length >= 120 && article.metaDescription.length <= 160,
      points: 10,
    },
    { pass: (article.keywords?.length ?? 0) >= 5, points: 10 },
    { pass: (article.semanticKeywords?.length ?? 0) >= 3, points: 5 },
    { pass: (article.faq?.length ?? 0) >= 3, points: 10 },
    { pass: (article.highlights?.length ?? 0) >= 3, points: 5 },
    { pass: !!article.slug && /^[a-z0-9-]+$/.test(article.slug), points: 5 },
    { pass: (article.internalLinks?.length ?? 0) >= 1, points: 5 },
    { pass: (article.externalLinks?.length ?? 0) >= 1, points: 5 },
    { pass: !!article.schemaMarkup, points: 5 },
    { pass: (article.bodyHtml?.match(/<h2/gi)?.length ?? 0) >= 2, points: 10 },
  ];

  for (const check of checks) {
    if (check.pass) score += check.points;
  }

  return Math.min(score, 100);
}
