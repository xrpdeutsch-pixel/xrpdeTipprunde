"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABELS } from "@/lib/news/sources";
import { NewsCategoryKey } from "@/types/article";

const CATEGORIES: NewsCategoryKey[] = ["XRP", "BITCOIN", "CRYPTO", "FINANCE", "MACRO"];

interface NewsItemDto {
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string | null;
  relevanceScore: number;
  isDuplicate: boolean;
  isFakeNews: boolean;
  reason?: string;
}

export default function NewsHunter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as NewsCategoryKey) || "XRP";

  const [category, setCategory] = useState<NewsCategoryKey>(
    CATEGORIES.includes(initialCategory) ? initialCategory : "XRP"
  );
  const [items, setItems] = useState<NewsItemDto[]>([]);
  const [topStoryIndex, setTopStoryIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingUrl, setGeneratingUrl] = useState<string | null>(null);

  const loadNews = async (cat: NewsCategoryKey) => {
    setLoading(true);
    setError(null);
    setItems([]);
    setTopStoryIndex(null);
    try {
      const res = await fetch(`/api/news?category=${cat}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Laden der News.");
      setItems(data.items);
      setTopStoryIndex(data.topStoryIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNews(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryClick = (cat: NewsCategoryKey) => {
    setCategory(cat);
    loadNews(cat);
  };

  const handleGenerate = async (item: NewsItemDto) => {
    setGeneratingUrl(item.url);
    setError(null);
    try {
      const res = await fetch("/api/generate/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          selected: item,
          contextItems: items.filter((i) => i.url !== item.url).slice(0, 6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Artikel-Generierung fehlgeschlagen.");
      router.push(`/articles/${data.article.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setGeneratingUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">News Hunter</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Live-Nachrichten aus Krypto- und Finanzmedien - dedupliziert, bewertet und bereit zur
          Artikelerstellung.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-emerald-500 text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            Neueste {CATEGORY_LABELS[cat]} News
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800">
          Lade und bewerte Nachrichten für {CATEGORY_LABELS[category]}...
        </div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800">
              Keine Nachrichten gefunden.
            </div>
          )}
          {items.map((item, idx) => (
            <div
              key={item.url}
              className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-800 ${
                idx === topStoryIndex
                  ? "border-emerald-400 ring-1 ring-emerald-400"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {idx === topStoryIndex && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Top-Story
                      </span>
                    )}
                    {item.isDuplicate && (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        Duplikat
                      </span>
                    )}
                    {item.isFakeNews && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Fragwürdig
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">
                      Relevanz {item.relevanceScore}/100
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block font-medium leading-snug hover:text-emerald-600"
                  >
                    {item.title}
                  </a>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.source}
                    {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleString("de-DE")}` : ""}
                  </p>
                  {item.summary && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.summary}</p>
                  )}
                </div>
                <button
                  onClick={() => handleGenerate(item)}
                  disabled={generatingUrl !== null}
                  className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  {generatingUrl === item.url ? "Erstelle Artikel..." : "Artikel erstellen"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
