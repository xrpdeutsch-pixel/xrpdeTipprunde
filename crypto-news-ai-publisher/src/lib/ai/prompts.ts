import { NewsCategoryKey } from "@/types/article";

/**
 * Phrases and patterns that make a text "sound like AI". The model is
 * instructed to never use these - in German finance journalism they are an
 * instant tell.
 */
export const BANNED_PHRASES = [
  "In der heutigen Welt",
  "In der heutigen schnelllebigen Welt",
  "Es ist wichtig zu beachten",
  "Es ist wichtig zu erwähnen",
  "Zusammenfassend lässt sich sagen",
  "Abschließend lässt sich sagen",
  "Zusammenfassend kann gesagt werden",
  "Es ist erwähnenswert",
  "Lassen Sie uns eintauchen",
  "Tauchen wir ein",
  "Im Folgenden werden wir",
  "Dieser Artikel beleuchtet",
  "Dieser Artikel wird",
  "wie bereits erwähnt",
  "auf der ganzen Welt",
  "im digitalen Zeitalter",
  "Geschwindigkeit des Wandels",
  "Es bleibt abzuwarten",
  "Die Zukunft wird zeigen",
  "Fazit:",
  "Als KI-Sprachmodell",
];

/**
 * Core persona and house style instructions shared by every article
 * generation prompt. Modelled on Handelsblatt / Bloomberg / WSJ / Forbes /
 * CoinDesk / The Block quality.
 */
export const JOURNALIST_SYSTEM_PROMPT = `Du bist ein erfahrener Wirtschafts- und Krypto-Redakteur einer führenden deutschsprachigen Finanzpublikation. Dein Schreibstil orientiert sich am Niveau von Handelsblatt, Bloomberg, dem Wall Street Journal, Forbes, CoinDesk und The Block.

SCHREIBSTIL:
- Natürlich, sachlich, präzise und menschlich - wie von einem Redakteur mit jahrelanger Erfahrung geschrieben.
- Aktiver Stil, klare Sätze, konkrete Zahlen, Daten und Fakten statt vager Aussagen.
- Variiere Satzlänge und Satzbau. Vermeide repetitive Satzanfänge.
- Ordne Informationen journalistisch: die wichtigste Information zuerst (umgekehrte Pyramide), dann Kontext, Einordnung und Analyse.
- Zitate werden eingeordnet und mit Attribution versehen ("sagte ... gegenüber ...", "laut ...", "wie ... mitteilte").
- Eigene Einordnung und Analyse einbauen, nicht nur Fakten aneinanderreihen.

STRENG VERBOTEN sind KI-typische Floskeln und Phrasen, u.a.:
${BANNED_PHRASES.map((p) => `- "${p}"`).join("\n")}
Vermeide generell jede Formulierung, die nach einer KI-generierten Zusammenfassung klingt. Kein Meta-Kommentar über den Artikel selbst.

INHALTLICHE ANFORDERUNGEN:
- Faktenbasiert, mehrere Quellen einordnen, Widersprüche benennen.
- Bei Kursangaben, Prozentzahlen, Daten und Namen so präzise wie möglich bleiben - wenn Informationen unsicher sind, dies transparent kennzeichnen ("laut ersten Angaben", "Stand Redaktionsschluss").
- Deutschsprachiger Artikel (de-DE), für ein Publikum mit Interesse an Krypto, Finanzen, Börse und Makroökonomie.
- SEO-optimiert, aber niemals auf Kosten der Lesbarkeit ("Keyword-Stuffing" vermeiden).

AUSGABEFORMAT:
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt (keine Markdown-Codeblöcke, kein Text davor oder danach), das exakt folgender Struktur entspricht:

{
  "seoTitle": string,            // SEO-Headline, max. 70 Zeichen, mit Hauptkeyword
  "seoSubheadline": string,      // Subheadline/Dachzeile, max. 140 Zeichen
  "slug": string,                // URL-Slug, kleingeschrieben, mit Bindestrichen, ohne Umlaute/Sonderzeichen
  "highlights": string[],        // 3-5 prägnante Stichpunkte ("Auf einen Blick")
  "introduction": string,        // Einleitung (HTML, 2-3 Absätze in <p> Tags)
  "bodyHtml": string,            // Hauptteil als HTML mit mehreren <h2>/<h3> Zwischenüberschriften und <p> Absätzen
  "conclusion": string,          // Schlussabschnitt (HTML, 1-2 Absätze in <p> Tags) - Einordnung/Ausblick, KEIN "Fazit:"-Label
  "metaDescription": string,     // Meta Description, 150-160 Zeichen
  "keywords": string[],          // 5-10 SEO Hauptkeywords
  "semanticKeywords": string[],  // 5-10 semantisch verwandte Begriffe (LSI Keywords)
  "faq": [{ "question": string, "answer": string }], // 4-6 FAQ-Einträge, Featured-Snippet-tauglich
  "schemaMarkup": object,        // JSON-LD Schema.org Markup vom Typ NewsArticle inkl. FAQPage falls sinnvoll
  "wpTags": string[],            // 5-10 WordPress Tags
  "wpCategories": string[],      // 1-3 WordPress Kategorien (z.B. "XRP", "Bitcoin", "Kryptowährungen", "Finanzen", "Makroökonomie")
  "socialSnippet": string,       // Social-Media-Post (Facebook/LinkedIn Stil), max. 400 Zeichen
  "twitterSnippet": string,      // X/Twitter Post inkl. relevanter Hashtags, max. 280 Zeichen
  "featuredImagePrompt": string, // Bildgenerierungs-Prompt für das Beitragsbild (Englisch, detailliert)
  "thumbnailPrompt": string,     // Bildgenerierungs-Prompt für ein YouTube-Thumbnail (Englisch, reißerisch aber seriös)
  "xPostImagePrompt": string,    // Bildgenerierungs-Prompt für einen X/Twitter-Post (Englisch)
  "instagramImagePrompt": string,// Bildgenerierungs-Prompt für ein Instagram-Visual (Englisch, quadratisches Format)
  "internalLinks": [{ "anchor": string, "url": string }], // 2-4 Vorschläge für interne Verlinkungen (Platzhalter-URLs wie /thema/xrp-kurs)
  "externalLinks": [{ "anchor": string, "url": string }], // 2-4 Vorschläge für externe Verlinkungen zu seriösen Quellen (z.B. ripple.com, sec.gov, coindesk.com)
  "wordCount": number            // ungefähre Wortzahl von introduction + bodyHtml + conclusion
}

Der Artikeltext (introduction + bodyHtml + conclusion) muss insgesamt mindestens 1500 Wörter umfassen, idealerweise 1500-3000 Wörter.`;

interface VideoMeta {
  title: string;
  channel: string;
  url: string;
  publishedAt?: string;
}

export interface VideoAnalysis {
  summary: string;
  keyPoints: string[];
  facts: string[];
  quotes: { speaker: string; quote: string }[];
  persons: string[];
  companies: string[];
  cryptocurrencies: string[];
  suggestedTopic: string;
  researchQuery: string;
  category: NewsCategoryKey;
}

export function buildVideoAnalysisPrompt(transcript: string, video: VideoMeta): string {
  return `Analysiere folgendes YouTube-Video-Transkript und extrahiere strukturierte Informationen.

VIDEO-METADATEN:
Titel: ${video.title}
Kanal: ${video.channel}
URL: ${video.url}
${video.publishedAt ? `Veröffentlicht: ${video.publishedAt}` : ""}

TRANSKRIPT:
"""
${transcript}
"""

Antworte mit einem JSON-Objekt exakt in dieser Struktur:
{
  "summary": string,              // 3-5 Sätze Zusammenfassung des Videoinhalts
  "keyPoints": string[],           // 5-10 zentrale Aussagen/Kernaussagen
  "facts": string[],               // konkrete Fakten, Zahlen, Daten, Kursangaben aus dem Video
  "quotes": [{ "speaker": string, "quote": string }], // 3-6 wichtige wörtliche Zitate
  "persons": string[],             // im Video genannte relevante Personen
  "companies": string[],           // im Video genannte relevante Unternehmen/Organisationen
  "cryptocurrencies": string[],    // erwähnte Kryptowährungen (z.B. XRP, BTC, ETH)
  "suggestedTopic": string,        // ein prägnantes Artikelthema basierend auf dem Video
  "researchQuery": string,         // eine gute Suchanfrage, um aktuelle Nachrichten zu diesem Thema zu finden
  "category": "XRP" | "BITCOIN" | "CRYPTO" | "FINANCE" | "MACRO" // beste Kategorie für das Thema
}`;
}

export interface ResearchInput {
  topic: string;
  category: NewsCategoryKey;
  newsContext: string;
  perplexityContext?: string | null;
}

export function buildResearchPrompt(input: ResearchInput): string {
  return `Du bereitest die Recherche für einen Artikel zum Thema "${input.topic}" (Kategorie: ${input.category}) vor.

VERFÜGBARE QUELLEN UND NACHRICHTEN:
"""
${input.newsContext || "Keine zusätzlichen Nachrichtenquellen verfügbar."}
"""

${input.perplexityContext ? `AKTUELLE WEB-RECHERCHE (z.B. Marktreaktionen, Kursdaten, SEC/MiCA-Informationen):\n"""\n${input.perplexityContext}\n"""\n` : ""}

Gehe wie folgt vor:
1. Durchsuche und vergleiche alle verfügbaren Quellen.
2. Prüfe Fakten auf Plausibilität und identifiziere Widersprüche zwischen Quellen.
3. Erstelle eine eigene, redaktionelle Zusammenfassung des aktuellen Stands.

Antworte mit einem JSON-Objekt:
{
  "summary": string,              // redaktionelle Zusammenfassung des aktuellen Sachstands (5-10 Sätze)
  "keyFacts": string[],           // wichtige geprüfte Einzelfakten (Zahlen, Daten, Aussagen)
  "contradictions": string[],     // identifizierte Widersprüche zwischen Quellen, falls vorhanden (sonst leeres Array)
  "sources": [{ "title": string, "url": string }] // verwendete Quellen
}`;
}

export interface ArticlePromptInput {
  category: NewsCategoryKey;
  topic: string;
  sourceContext: string;
  researchSummary: string;
  specialModeNotes?: string;
}

export function buildArticlePrompt(input: ArticlePromptInput): string {
  return `Schreibe einen vollständigen, journalistischen Artikel zum Thema: "${input.topic}".

KATEGORIE: ${input.category}

AUSGANGSMATERIAL (Quelle/Transkript/News):
"""
${input.sourceContext}
"""

REDAKTIONELLE RECHERCHE (geprüfte Fakten, aktuelle Marktlage, Quellen):
"""
${input.researchSummary}
"""
${input.specialModeNotes ? `\nZUSÄTZLICHE FACHLICHE ASPEKTE FÜR DIESE KATEGORIE:\n${input.specialModeNotes}\n` : ""}

Schreibe nun den vollständigen Artikel gemäß der vorgegebenen JSON-Struktur. Baue die recherchierten Fakten, Marktdaten und Einordnungen ein. Schreibe wie ein erfahrener Redakteur - nicht wie eine Zusammenfassung des Ausgangsmaterials.`;
}

export const XRP_SPECIAL_MODE_NOTES = `Berücksichtige - sofern relevant für das Thema - folgende XRP-spezifische Aspekte:
- Aktuelle Ripple-Unternehmensnachrichten
- RLUSD (Ripple USD Stablecoin) Entwicklungen
- XRP Ledger (Technologie, Validatoren, Netzwerkaktivität)
- Stand des SEC-Verfahrens und regulatorische Entwicklungen
- ETF-Entwicklungen rund um XRP
- Bankenpartnerschaften und ODL (On-Demand Liquidity)
- Institutionelle Adoption
- Auffällige Whale-Bewegungen / On-Chain-Daten`;

export const BITCOIN_SPECIAL_MODE_NOTES = `Berücksichtige - sofern relevant für das Thema - folgende Bitcoin-spezifische Aspekte:
- Bitcoin-ETFs (Zu-/Abflüsse, Anbieter wie BlackRock, Fidelity)
- Mining-Branche und Hashrate-Entwicklung
- Makroökonomisches Umfeld: Fed-Zinspolitik, Inflation, Liquidität
- Institutionelle Adoption und Unternehmensbestände
- On-Chain-Daten und Marktstruktur`;

export function getSpecialModeNotes(category: NewsCategoryKey): string | undefined {
  if (category === "XRP") return XRP_SPECIAL_MODE_NOTES;
  if (category === "BITCOIN") return BITCOIN_SPECIAL_MODE_NOTES;
  return undefined;
}
