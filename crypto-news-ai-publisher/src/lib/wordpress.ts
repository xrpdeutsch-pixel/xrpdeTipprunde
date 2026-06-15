import { GeneratedArticle } from "@/types/article";
import { getWordPressSettings, WordPressSettings } from "@/lib/settings";

export interface WordPressConfig {
  baseUrl: string;
  username: string;
  appPassword: string;
}

export async function isWordPressConfigured(): Promise<boolean> {
  return (await getWordPressSettings()) !== null;
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

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

/**
 * Verifies WordPress credentials by calling the authenticated "me" endpoint.
 */
export async function testWordPressConnection(
  config: WordPressConfig
): Promise<ConnectionTestResult> {
  try {
    const me = (await wpFetch(config, "users/me?context=edit")) as {
      name?: string;
      slug?: string;
    };
    return {
      success: true,
      message: `Verbindung erfolgreich - angemeldet als "${me.name ?? me.slug ?? "unbekannt"}".`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unbekannter Fehler bei der Verbindung.",
    };
  }
}

/**
 * Creates a draft (or, if configured, private/published) post on the
 * configured WordPress site via the REST API. Defaults to status "draft" -
 * it is never published automatically unless explicitly configured.
 */
export async function publishDraftToWordPress(
  article: GeneratedArticle
): Promise<WordPressPublishResult> {
  const settings = await getWordPressSettings();
  if (!settings) {
    throw new Error(
      "WordPress ist nicht konfiguriert. Bitte unter Einstellungen die WordPress-Verbindung speichern."
    );
  }

  const config: WordPressConfig = {
    baseUrl: settings.baseUrl,
    username: settings.username,
    appPassword: settings.appPassword,
  };

  const categories = article.wpCategories?.length
    ? article.wpCategories
    : settings.defaultCategory
      ? [settings.defaultCategory]
      : [];

  const tags = Array.from(new Set([...(article.wpTags ?? []), ...(settings.defaultTags ?? [])]));

  const [categoryIds, tagIds] = await Promise.all([
    Promise.all(categories.map((name) => getOrCreateTermId(config, "categories", name))),
    Promise.all(tags.map((name) => getOrCreateTermId(config, "tags", name))),
  ]);

  const post = await wpFetch(config, "posts", {
    method: "POST",
    body: JSON.stringify({
      title: article.seoTitle,
      slug: article.slug,
      excerpt: article.metaDescription,
      content: buildHtmlContent(article),
      status: settings.uploadStatus ?? "draft",
      categories: categoryIds,
      tags: tagIds,
    }),
  });

  const result = post as { id: number; link: string; status: string };
  return result;
}

export type { WordPressSettings };
