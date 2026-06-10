import { NextResponse } from "next/server";
import { fetchAndRankNews } from "@/lib/pipeline";
import { NewsCategoryKey } from "@/types/article";

export const maxDuration = 120;

const VALID_CATEGORIES: NewsCategoryKey[] = ["XRP", "BITCOIN", "CRYPTO", "FINANCE", "MACRO"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.toUpperCase() as NewsCategoryKey | null;

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `Ungültige Kategorie. Erlaubt: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const ranking = await fetchAndRankNews(category);
    return NextResponse.json({
      category,
      items: ranking.items.map((item) => ({
        ...item,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      })),
      topStoryIndex: ranking.topStoryIndex,
    });
  } catch (err) {
    console.error("News-Abruf fehlgeschlagen:", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
