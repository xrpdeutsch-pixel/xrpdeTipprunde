import { generateJson } from "./client";
import { perplexityResearch } from "./perplexity";
import {
  ArticlePromptInput,
  JOURNALIST_SYSTEM_PROMPT,
  ResearchInput,
  VideoAnalysis,
  buildArticlePrompt,
  buildResearchPrompt,
  buildVideoAnalysisPrompt,
  getSpecialModeNotes,
} from "./prompts";
import { GeneratedArticle, ResearchSummary } from "@/types/article";

const ANALYSIS_SYSTEM_PROMPT = `Du bist ein Recherche-Analyst für einen Finanz- und Kryptojournalisten. Du analysierst Video-Transkripte und extrahierst strukturierte Informationen für die Artikelproduktion. Antworte ausschließlich mit validem JSON, ohne Markdown-Codeblock.`;

const RESEARCH_SYSTEM_PROMPT = `Du bist der Recherche-Agent einer Finanz- und Kryptoredaktion. Du prüfst Quellen, vergleichst Informationen, identifizierst Widersprüche und erstellst eine objektive redaktionelle Zusammenfassung. Antworte ausschließlich mit validem JSON, ohne Markdown-Codeblock.`;

export async function analyzeYoutubeTranscript(
  transcript: string,
  video: { title: string; channel: string; url: string; publishedAt?: string }
): Promise<VideoAnalysis> {
  return generateJson<VideoAnalysis>({
    system: ANALYSIS_SYSTEM_PROMPT,
    prompt: buildVideoAnalysisPrompt(transcript, video),
    maxTokens: 4000,
    temperature: 0.3,
  });
}

export async function researchTopic(input: ResearchInput): Promise<ResearchSummary> {
  let perplexityContext = input.perplexityContext ?? null;

  if (!perplexityContext) {
    const query = `Aktuelle Nachrichten, Marktreaktionen, Kursdaten sowie SEC- und MiCA-relevante Informationen zu: ${input.topic}. Stand heute.`;
    const result = await perplexityResearch(query);
    if (result) {
      perplexityContext = `${result.content}\n\nQuellen: ${result.citations.join(", ")}`;
    }
  }

  return generateJson<ResearchSummary>({
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: buildResearchPrompt({ ...input, perplexityContext }),
    maxTokens: 4000,
    temperature: 0.3,
  });
}

export async function writeArticle(input: ArticlePromptInput): Promise<GeneratedArticle> {
  const specialModeNotes = input.specialModeNotes ?? getSpecialModeNotes(input.category);

  const article = await generateJson<GeneratedArticle>({
    system: JOURNALIST_SYSTEM_PROMPT,
    prompt: buildArticlePrompt({ ...input, specialModeNotes }),
    maxTokens: 16000,
    temperature: 0.8,
  });

  return article;
}
