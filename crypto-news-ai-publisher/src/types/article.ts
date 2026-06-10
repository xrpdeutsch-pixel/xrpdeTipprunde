export interface FaqItem {
  question: string;
  answer: string;
}

export interface LinkItem {
  anchor: string;
  url: string;
}

export interface GeneratedArticle {
  seoTitle: string;
  seoSubheadline: string;
  slug: string;
  highlights: string[];
  introduction: string;
  bodyHtml: string;
  conclusion: string;
  metaDescription: string;
  keywords: string[];
  semanticKeywords: string[];
  faq: FaqItem[];
  schemaMarkup: Record<string, unknown>;
  wpTags: string[];
  wpCategories: string[];
  socialSnippet: string;
  twitterSnippet: string;
  featuredImagePrompt: string;
  thumbnailPrompt: string;
  xPostImagePrompt: string;
  instagramImagePrompt: string;
  internalLinks: LinkItem[];
  externalLinks: LinkItem[];
  wordCount: number;
}

export interface ResearchSummary {
  summary: string;
  keyFacts: string[];
  contradictions: string[];
  sources: { title: string; url: string }[];
}

export type NewsCategoryKey = "XRP" | "BITCOIN" | "CRYPTO" | "FINANCE" | "MACRO";
