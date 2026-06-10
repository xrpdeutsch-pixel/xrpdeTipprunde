import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishDraftToWordPress } from "@/lib/wordpress";
import { articleToGenerated } from "@/lib/pipeline";

export const maxDuration = 60;

export async function POST(_request: Request, ctx: RouteContext<"/api/articles/[id]/publish">) {
  const { id } = await ctx.params;
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    return NextResponse.json({ error: "Artikel nicht gefunden." }, { status: 404 });
  }

  const generated = articleToGenerated(article);

  try {
    const result = await publishDraftToWordPress(generated);

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        wordpressPostId: result.id,
        wordpressUrl: result.link,
        wordpressStatus: result.status,
      },
    });

    return NextResponse.json({ article: updated });
  } catch (err) {
    console.error("WordPress-Veröffentlichung fehlgeschlagen:", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    await prisma.article.update({
      where: { id },
      data: { status: "FAILED", errorMessage: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
