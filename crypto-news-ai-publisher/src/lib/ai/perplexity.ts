/**
 * Thin client around the Perplexity "sonar" online models, used as the
 * research agent that gathers up-to-date facts (market reactions, SEC/MiCA
 * news, company announcements) before an article is written.
 *
 * If PERPLEXITY_API_KEY is not configured, callers should fall back to the
 * RSS-based news context only - this module returns `null` in that case so
 * the rest of the pipeline can degrade gracefully.
 */

interface PerplexityResult {
  content: string;
  citations: string[];
}

export async function perplexityResearch(query: string): Promise<PerplexityResult | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Recherche-Assistent für Finanz- und Kryptojournalismus. Antworte präzise, faktenbasiert und nenne aktuelle Zahlen, Daten und Quellen.",
        },
        { role: "user", content: query },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    console.error("Perplexity API error", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? [];
  return { content, citations };
}
