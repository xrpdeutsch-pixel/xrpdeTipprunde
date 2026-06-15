import { NextResponse } from "next/server";
import { generateArticleFromBrief } from "@/lib/pipeline";
import { NewsCategoryKey } from "@/types/article";

export const maxDuration = 300;

const VALID_CATEGORIES: NewsCategoryKey[] = ["XRP", "BITCOIN", "CRYPTO", "FINANCE", "MACRO"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = body?.category as NewsCategoryKey | undefined;
    const topic = (body?.topic as string | undefined)?.trim();
    const notes = (body?.notes as string | undefined)?.trim() ?? "";

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Ungültige Kategorie. Erlaubt: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!topic) {
      return NextResponse.json({ error: "Bitte ein Thema angeben." }, { status: 400 });
    }

    const article = await generateArticleFromBrief(category, topic, notes);
    return NextResponse.json({ article });
  } catch (err) {
    console.error("Freitext-Artikel-Generierung fehlgeschlagen:", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
