"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PIPELINE_STEPS = [
  "Transkript abrufen",
  "Video analysieren (Fakten, Zitate, Personen, Unternehmen, Kryptowährungen)",
  "Aktuelle News & Marktdaten recherchieren",
  "Fakten prüfen & redaktionelle Zusammenfassung erstellen",
  "Artikel im Handelsblatt/Bloomberg-Stil verfassen",
  "SEO-Daten, FAQ, Schema-Markup & Social Snippets generieren",
];

export default function GeneratePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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
        <h1 className="text-2xl font-semibold tracking-tight">YouTube → Artikel</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Füge einen YouTube-Link ein. Die KI erstellt automatisch einen vollständigen,
          journalistischen Artikel inkl. SEO-Daten und speichert ihn als Entwurf.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          disabled={loading}
        />
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
