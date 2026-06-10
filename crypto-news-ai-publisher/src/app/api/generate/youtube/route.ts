import { NextResponse } from "next/server";
import { generateArticleFromYoutube } from "@/lib/pipeline";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = (body?.url as string | undefined)?.trim();

    if (!url) {
      return NextResponse.json({ error: "Bitte einen YouTube-Link angeben." }, { status: 400 });
    }

    const article = await generateArticleFromYoutube(url);
    return NextResponse.json({ article });
  } catch (err) {
    console.error("YouTube-Artikel-Generierung fehlgeschlagen:", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
