import { GeneratedArticle } from "@/types/article";

interface WordPressConfig {
  baseUrl: string;
  username: string;
  appPassword: string;
}

function getConfig(): WordPressConfig | null {
  const baseUrl = process.env.WORDPRESS_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const appPassword = process.env.WORDPRESS_APP_PASSWORD;
  if (!baseUrl || !username || !appPassword) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), username, appPassword };
}

export function isWordPressConfigured(): boolean {
  return getConfig() !== null;
}

function authHeader(config: WordPressConfig): string {
  const token = Buffer.from(`${config.username}:${config.appPassword}`).toString("base64");
  return `Basic ${token}`;
}

async function wpFetch(config: WordPressConfig, path: string, init: RequestInit = {}) {
  const res = await fetch(`${config.baseUrl}/wp-json/wp/v2/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(config),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WordPress API Fehler (${res.status}) bei ${path}: ${body}`);
  }

  return res.json();
}

/**
 * Looks up a category/tag term by name, creating it if it doesn't exist yet.
 */
async function getOrCreateTermId(
  config: WordPressConfig,
  taxonomy: "categories" | "tags",
  name: string
): Promise<number> {
  const search = await wpFetch(
    config,
    `${taxonomy}?search=${encodeURIComponent(name)}&per_page=10`
  );

  const exact = (search as { id: number; name: string }[]).find(
    (term) => term.name.toLowerCase() === name.toLowerCase()
  );
  if (exact) return exact.id;

  const created = await wpFetch(config, taxonomy, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return (created as { id: number }).id;
}

function buildHtmlContent(article: GeneratedArticle): string {
  const highlightsHtml = article.highlights?.length
    ? `<h2>Auf einen Blick</h2><ul>${article.highlights
        .map((h) => `<li>${h}</li>`)
        .join("")}</ul>`
    : "";

  const faqHtml = article.faq?.length
    ? `<h2>Häufige Fragen</h2>${article.faq
        .map((f) => `<h3>${f.question}</h3><p>${f.answer}</p>`)
        .join("")}`
    : "";

  return [
    article.introduction ?? "",
    highlightsHtml,
    article.bodyHtml ?? "",
    article.conclusion ?? "",
    faqHtml,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export interface WordPressPublishResult {
  id: number;
  link: string;
  status: string;
}

/**
 * Creates a draft post on the configured WordPress site via the REST API.
 * The post is always created with status "draft" - it is never published
 * automatically.
 */
export async function publishDraftToWordPress(
  article: GeneratedArticle
): Promise<WordPressPublishResult> {
  const config = getConfig();
  if (!config) {
    throw new Error(
      "WordPress ist nicht konfiguriert. Bitte WORDPRESS_URL, WORDPRESS_USERNAME und WORDPRESS_APP_PASSWORD setzen."
    );
  }

  const [categoryIds, tagIds] = await Promise.all([
    Promise.all(
      (article.wpCategories ?? []).map((name) => getOrCreateTermId(config, "categories", name))
    ),
    Promise.all((article.wpTags ?? []).map((name) => getOrCreateTermId(config, "tags", name))),
  ]);

  const post = await wpFetch(config, "posts", {
    method: "POST",
    body: JSON.stringify({
      title: article.seoTitle,
      slug: article.slug,
      excerpt: article.metaDescription,
      content: buildHtmlContent(article),
      status: "draft",
      categories: categoryIds,
      tags: tagIds,
    }),
  });

  const result = post as { id: number; link: string; status: string };
  return result;
}
