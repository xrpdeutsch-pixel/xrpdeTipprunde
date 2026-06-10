import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface GenerateOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

type Provider = "anthropic" | "openai";

function getProvider(): Provider {
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  return provider === "openai" ? "openai" : "anthropic";
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY ist nicht gesetzt.");
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY ist nicht gesetzt.");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Calls the configured LLM provider (Anthropic Claude by default, OpenAI as
 * fallback/alternative) and returns the raw text response.
 */
export async function generateText(opts: GenerateOptions): Promise<string> {
  const provider = getProvider();
  const maxTokens = opts.maxTokens ?? 8000;
  const temperature = opts.temperature ?? 0.7;

  if (provider === "openai") {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() ?? "";
  }

  const client = getAnthropic();
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    max_tokens: maxTokens,
    temperature,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });

  return message.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();
}

/**
 * Extracts and parses a JSON object from a model response. Models sometimes
 * wrap JSON in markdown code fences or add commentary, so this strips that
 * away before parsing.
 */
export function extractJson<T = unknown>(raw: string): T {
  let text = raw.trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(text) as T;
}

/**
 * Generates text and parses the result as JSON, retrying once with a
 * correction prompt if the first attempt fails to parse.
 */
export async function generateJson<T = unknown>(opts: GenerateOptions): Promise<T> {
  const raw = await generateText(opts);
  try {
    return extractJson<T>(raw);
  } catch {
    const retryRaw = await generateText({
      ...opts,
      prompt: `${opts.prompt}\n\nWICHTIG: Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt ohne Markdown-Codeblock, ohne Kommentare und ohne zusätzlichen Text davor oder danach.`,
    });
    return extractJson<T>(retryRaw);
  }
}
