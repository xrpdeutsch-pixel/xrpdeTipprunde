import { NextResponse } from "next/server";
import { generateArticleFromNews } from "@/lib/pipeline";
import { NewsCategoryKey } from "@/types/article";
import { RawNewsItem } from "@/lib/news/rss";

export const maxDuration = 300;

const VALID_CATEGORIES: NewsCategoryKey[] = ["XRP", "BITCOIN", "CRYPTO", "FINANCE", "MACRO"];

interface RequestBody {
  category: NewsCategoryKey;
  selected: {
    title: string;
    url: string;
    source: string;
    summary: string;
    publishedAt: string | null;
  };
  contextItems?: RequestBody["selected"][];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json(
        { error: `Ungültige Kategorie. Erlaubt: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!body.selected?.title || !body.selected?.url) {
      return NextResponse.json({ error: "Bitte eine Nachricht auswählen." }, { status: 400 });
    }

    const toRaw = (item: RequestBody["selected"]): RawNewsItem => ({
      ...item,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    });

    const article = await generateArticleFromNews(
      body.category,
      toRaw(body.selected),
      (body.contextItems ?? []).map(toRaw)
    );

    return NextResponse.json({ article });
  } catch (err) {
    console.error("News-Artikel-Generierung fehlgeschlagen:", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
