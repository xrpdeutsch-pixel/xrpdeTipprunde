"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface FaqItem {
  question: string;
  answer: string;
}

interface LinkItem {
  anchor: string;
  url: string;
}

export interface ArticleData {
  id: string;
  status: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  seoTitle: string | null;
  seoSubheadline: string | null;
  slug: string | null;
  highlights: string[] | null;
  introduction: string | null;
  body: string | null;
  conclusion: string | null;
  metaDescription: string | null;
  keywords: string[] | null;
  semanticKeywords: string[] | null;
  faq: FaqItem[] | null;
  schemaMarkup: Record<string, unknown> | null;
  internalLinks: LinkItem[] | null;
  externalLinks: LinkItem[] | null;
  seoScore: number | null;
  wpTags: string[] | null;
  wpCategories: string[] | null;
  wordpressPostId: number | null;
  wordpressUrl: string | null;
  socialSnippet: string | null;
  twitterSnippet: string | null;
  featuredImagePrompt: string | null;
  thumbnailPrompt: string | null;
  xPostImagePrompt: string | null;
  instagramImagePrompt: string | null;
  researchSummary: unknown;
  wordCount: number | null;
  errorMessage: string | null;
}

export default function ArticleEditor({ article }: { article: ArticleData }) {
  const [data, setData] = useState(article);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const update = <K extends keyof ArticleData>(key: K, value: ArticleData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/articles/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Speichern fehlgeschlagen.");
      setData(result.article);
      setMessage("Gespeichert.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/articles/${data.id}/publish`, { method: "POST" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Veröffentlichung fehlgeschlagen.");
      setData(result.article);
      setMessage("Als Entwurf in WordPress gespeichert.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <StatusBadge status={data.status} />
            {data.seoScore != null && (
              <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                SEO-Score: {data.seoScore}/100
              </span>
            )}
            {data.wordCount != null && (
              <span className="text-xs text-zinc-500">{data.wordCount} Wörter</span>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {data.seoTitle || data.sourceTitle || "Artikel"}
          </h1>
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-500 hover:text-emerald-600"
            >
              Quelle ({data.sourceType}): {data.sourceUrl}
            </a>
          )}
          {data.errorMessage && (
            <p className="mt-1 text-xs text-red-500">Fehler: {data.errorMessage}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {message && <span className="text-xs text-zinc-500">{message}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-emerald-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {publishing ? "Wird gesendet..." : "Als Entwurf in WordPress speichern"}
          </button>
        </div>
      </div>

      {data.wordpressUrl && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          In WordPress gespeichert (Status: Entwurf) -{" "}
          <a href={data.wordpressUrl} target="_blank" rel="noreferrer" className="underline">
            {data.wordpressUrl}
          </a>
        </div>
      )}

      <Section title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="SEO-Headline" value={data.seoTitle} onChange={(v) => update("seoTitle", v)} />
          <TextField label="Slug" value={data.slug} onChange={(v) => update("slug", v)} />
        </div>
        <TextField
          label="SEO-Subheadline"
          value={data.seoSubheadline}
          onChange={(v) => update("seoSubheadline", v)}
        />
        <TextAreaField
          label="Meta Description"
          value={data.metaDescription}
          onChange={(v) => update("metaDescription", v)}
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ListField
            label="Keywords"
            values={data.keywords}
            onChange={(v) => update("keywords", v)}
          />
          <ListField
            label="Semantische Keywords"
            values={data.semanticKeywords}
            onChange={(v) => update("semanticKeywords", v)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ListField
            label="WordPress Tags"
            values={data.wpTags}
            onChange={(v) => update("wpTags", v)}
          />
          <ListField
            label="WordPress Kategorien"
            values={data.wpCategories}
            onChange={(v) => update("wpCategories", v)}
          />
        </div>
      </Section>

      <Section title="Highlights (Auf einen Blick)">
        <ListField
          label="Highlights"
          values={data.highlights}
          onChange={(v) => update("highlights", v)}
          rows={5}
        />
      </Section>

      <Section title="Artikeltext">
        <TextAreaField
          label="Einleitung (HTML)"
          value={data.introduction}
          onChange={(v) => update("introduction", v)}
          rows={5}
        />
        <TextAreaField
          label="Hauptteil (HTML, mit Zwischenüberschriften)"
          value={data.body}
          onChange={(v) => update("body", v)}
          rows={16}
        />
        <TextAreaField
          label="Schlussabschnitt (HTML)"
          value={data.conclusion}
          onChange={(v) => update("conclusion", v)}
          rows={5}
        />
        <details className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <summary className="cursor-pointer text-sm font-medium">Vorschau</summary>
          <article
            className="prose prose-sm mt-3 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: `${data.introduction ?? ""}${data.body ?? ""}${data.conclusion ?? ""}`,
            }}
          />
        </details>
      </Section>

      <Section title="FAQ">
        <FaqEditor items={data.faq} onChange={(v) => update("faq", v)} />
      </Section>

      <Section title="Verlinkungen">
        <div className="grid gap-4 sm:grid-cols-2">
          <LinkListEditor
            label="Interne Verlinkungen"
            items={data.internalLinks}
            onChange={(v) => update("internalLinks", v)}
          />
          <LinkListEditor
            label="Externe Verlinkungen"
            items={data.externalLinks}
            onChange={(v) => update("externalLinks", v)}
          />
        </div>
      </Section>

      <Section title="Social Media">
        <TextAreaField
          label="Social Media Snippet"
          value={data.socialSnippet}
          onChange={(v) => update("socialSnippet", v)}
          rows={3}
        />
        <TextAreaField
          label="X / Twitter Snippet"
          value={data.twitterSnippet}
          onChange={(v) => update("twitterSnippet", v)}
          rows={3}
        />
      </Section>

      <Section title="Bild-Prompts">
        <p className="text-xs text-zinc-500">
          Mit &quot;Bild erstellen&quot; öffnest du den kostenlosen Bing Image Creator (basiert auf
          DALL-E) mit dem jeweiligen Prompt in der Zwischenablage - einfach im neuen Tab einfügen
          und generieren.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePromptField
            label="Featured Image Prompt"
            value={data.featuredImagePrompt}
            onChange={(v) => update("featuredImagePrompt", v)}
          />
          <ImagePromptField
            label="YouTube Thumbnail Prompt"
            value={data.thumbnailPrompt}
            onChange={(v) => update("thumbnailPrompt", v)}
          />
          <ImagePromptField
            label="X Post Image Prompt"
            value={data.xPostImagePrompt}
            onChange={(v) => update("xPostImagePrompt", v)}
          />
          <ImagePromptField
            label="Instagram Prompt"
            value={data.instagramImagePrompt}
            onChange={(v) => update("instagramImagePrompt", v)}
          />
        </div>
      </Section>

      <Section title="Schema Markup (JSON-LD)">
        <pre className="max-h-80 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs text-emerald-300">
          {JSON.stringify(data.schemaMarkup, null, 2)}
        </pre>
      </Section>

      {data.researchSummary != null && (
        <Section title="Recherche-Zusammenfassung">
          <pre className="max-h-80 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs text-zinc-300">
            {JSON.stringify(data.researchSummary, null, 2)}
          </pre>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}

const BING_IMAGE_CREATOR_URL = "https://www.bing.com/images/create";

function ImagePromptField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const openInBingImageCreator = async () => {
    try {
      await navigator.clipboard.writeText(value ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard-Zugriff kann z.B. ohne HTTPS fehlschlagen - Bing trotzdem öffnen.
    }
    window.open(BING_IMAGE_CREATOR_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-2">
      <TextAreaField label={label} value={value} onChange={onChange} rows={3} />
      <button
        type="button"
        onClick={openInBingImageCreator}
        disabled={!value}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium transition-colors hover:border-emerald-400 disabled:opacity-50 dark:border-zinc-700"
      >
        {copied ? "Prompt kopiert - Bing öffnet sich..." : "🎨 Bild erstellen (Bing Image Creator)"}
      </button>
    </div>
  );
}

function ListField({
  label,
  values,
  onChange,
  rows = 3,
}: {
  label: string;
  values: string[] | null;
  onChange: (values: string[]) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-zinc-600 dark:text-zinc-300">
        {label} <span className="font-normal text-zinc-400">(eine pro Zeile)</span>
      </span>
      <textarea
        value={(values ?? []).join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
        rows={rows}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}

function FaqEditor({
  items,
  onChange,
}: {
  items: FaqItem[] | null;
  onChange: (items: FaqItem[]) => void;
}) {
  const list = items ?? [];

  const updateItem = (index: number, key: keyof FaqItem, value: string) => {
    const next = list.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange(next);
  };

  const remove = (index: number) => onChange(list.filter((_, i) => i !== index));
  const add = () => onChange([...list, { question: "", answer: "" }]);

  return (
    <div className="space-y-3">
      {list.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateItem(i, "question", e.target.value)}
              placeholder="Frage"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              onClick={() => remove(i)}
              className="shrink-0 text-xs text-zinc-400 hover:text-red-500"
            >
              Entfernen
            </button>
          </div>
          <textarea
            value={item.answer}
            onChange={(e) => updateItem(i, "answer", e.target.value)}
            placeholder="Antwort"
            rows={2}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
      >
        + Frage hinzufügen
      </button>
    </div>
  );
}

function LinkListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: LinkItem[] | null;
  onChange: (items: LinkItem[]) => void;
}) {
  const list = items ?? [];

  const updateItem = (index: number, key: keyof LinkItem, value: string) => {
    const next = list.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange(next);
  };

  const remove = (index: number) => onChange(list.filter((_, i) => i !== index));
  const add = () => onChange([...list, { anchor: "", url: "" }]);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      {list.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item.anchor}
            onChange={(e) => updateItem(i, "anchor", e.target.value)}
            placeholder="Anchor-Text"
            className="w-1/3 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            value={item.url}
            onChange={(e) => updateItem(i, "url", e.target.value)}
            placeholder="URL"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button onClick={() => remove(i)} className="text-xs text-zinc-400 hover:text-red-500">
            ✕
          </button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
        + Link hinzufügen
      </button>
    </div>
  );
}
