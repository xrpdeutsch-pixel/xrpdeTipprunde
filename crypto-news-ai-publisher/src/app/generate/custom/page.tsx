"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewsCategoryKey } from "@/types/article";

const CATEGORIES: { value: NewsCategoryKey; label: string }[] = [
  { value: "XRP", label: "XRP" },
  { value: "BITCOIN", label: "Bitcoin" },
  { value: "CRYPTO", label: "Kryptowährungen" },
  { value: "FINANCE", label: "Finanzen" },
  { value: "MACRO", label: "Makroökonomie" },
];

const PIPELINE_STEPS = [
  "Aktuelle Infos & Marktdaten recherchieren",
  "Fakten prüfen & redaktionelle Zusammenfassung erstellen",
  "Artikel im Handelsblatt/Bloomberg-Stil verfassen",
  "SEO-Daten, FAQ, Schema-Markup & Social Snippets generieren",
];

export default function CustomGeneratePage() {
  const router = useRouter();
  const [category, setCategory] = useState<NewsCategoryKey>("XRP");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, topic, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Artikel-Generierung fehlgeschlagen.");
      router.push(`/articles/${data.article.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Eigene Idee → Artikel</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Beschreibe ein Thema und füge alle Infos ein, die du hast (Stichpunkte, Zahlen, Links,
          Zitate, Quellen...) - genau wie in einem Chat. Die KI recherchiert zusätzlich aktuelle
          Informationen und schreibt daraus einen vollständigen, journalistischen Artikel inkl.
          SEO-Daten.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Kategorie</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NewsCategoryKey)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Thema / Arbeitstitel</span>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="z.B. Ripple kündigt neue Bankenpartnerschaft in Europa an"
            disabled={loading}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Infos & Material (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            placeholder="Stichpunkte, Fakten, Zahlen, Zitate, Links zu Quellen, eigene Einschätzung..."
            disabled={loading}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
          <span className="mt-1 block text-xs text-zinc-500">
            Je mehr konkrete Infos du hier einfügst, desto präziser wird der Artikel. Die KI
            ergänzt zusätzlich eigene aktuelle Recherche.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Artikel wird erstellt..." : "Artikel generieren"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800">
          <p className="mb-2 text-sm font-medium">Pipeline läuft - das kann einige Minuten dauern:</p>
          <ol className="space-y-1 text-sm text-zinc-500">
            {PIPELINE_STEPS.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
