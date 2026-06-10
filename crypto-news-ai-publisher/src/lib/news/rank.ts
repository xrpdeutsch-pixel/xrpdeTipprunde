import { generateJson } from "@/lib/ai/client";
import { NewsCategoryKey } from "@/types/article";
import { RawNewsItem } from "./rss";

export interface RankedNewsItem extends RawNewsItem {
  relevanceScore: number;
  isDuplicate: boolean;
  isFakeNews: boolean;
  reason?: string;
}

export interface NewsRankingResult {
  items: RankedNewsItem[];
  topStoryIndex: number | null;
}

const RANKING_SYSTEM_PROMPT = `Du bist der Chef vom Dienst einer Krypto- und Finanzredaktion. Du bewertest eingehende Newsmeldungen: Du erkennst Duplikate (gleiche Story von mehreren Quellen), filterst unwichtige oder unseriöse Meldungen aus und bewertest die journalistische Relevanz. Antworte ausschließlich mit validem JSON ohne Markdown-Codeblock.`;

const MAX_ITEMS = 40;

/**
 * Uses the LLM to deduplicate, score relevance and pick the top story for a
 * batch of raw RSS items.
 */
export async function rankNewsItems(
  items: RawNewsItem[],
  category: NewsCategoryKey
): Promise<NewsRankingResult> {
  if (items.length === 0) return { items: [], topStoryIndex: null };

  const trimmed = items.slice(0, MAX_ITEMS);

  const list = trimmed
    .map(
      (item, i) =>
        `${i}. [${item.source}] ${item.title}${
          item.publishedAt ? ` (${item.publishedAt.toISOString()})` : ""
        }\n   ${item.summary}`
    )
    .join("\n");

  const prompt = `Kategorie: ${category}

Hier ist eine Liste aktueller Meldungen (Index, Quelle, Titel, Datum, Kurzbeschreibung):

${list}

Aufgaben:
1. Erkenne Duplikate: Mehrere Einträge, die über dieselbe Story berichten. Markiere alle bis auf den qualitativ besten Eintrag pro Story als Duplikat.
2. Erkenne unseriöse/clickbait/wahrscheinlich falsche Meldungen ("isFakeNews").
3. Bewerte jeden Eintrag mit einem Relevanz-Score 0-100 für eine seriöse Krypto-/Finanzredaktion (Aktualität, Bedeutung, Seriosität der Quelle).
4. Wähle den Index der wichtigsten, berichtenswertesten Story des Tages ("topStoryIndex"). Wähle keine Story, die als Duplikat oder Fake News markiert ist.

Antworte mit:
{
  "items": [{ "index": number, "relevanceScore": number, "isDuplicate": boolean, "isFakeNews": boolean, "reason": string }],
  "topStoryIndex": number | null
}`;

  const result = await generateJson<{
    items: { index: number; relevanceScore: number; isDuplicate: boolean; isFakeNews: boolean; reason?: string }[];
    topStoryIndex: number | null;
  }>({
    system: RANKING_SYSTEM_PROMPT,
    prompt,
    maxTokens: 4000,
    temperature: 0.2,
  });

  const scoreMap = new Map(result.items.map((r) => [r.index, r]));

  const ranked: RankedNewsItem[] = trimmed.map((item, i) => {
    const score = scoreMap.get(i);
    return {
      ...item,
      relevanceScore: score?.relevanceScore ?? 0,
      isDuplicate: score?.isDuplicate ?? false,
      isFakeNews: score?.isFakeNews ?? false,
      reason: score?.reason,
    };
  });

  ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);

  let topStoryIndex: number | null = null;
  if (typeof result.topStoryIndex === "number" && trimmed[result.topStoryIndex]) {
    const topItem = trimmed[result.topStoryIndex];
    topStoryIndex = ranked.findIndex((r) => r.url === topItem.url);
  }

  return { items: ranked, topStoryIndex };
}
