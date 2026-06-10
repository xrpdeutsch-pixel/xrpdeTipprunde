import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { ArticleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { label: string; value: ArticleStatus | "ALL" }[] = [
  { label: "Alle", value: "ALL" },
  { label: "Warteschlange", value: "QUEUED" },
  { label: "Entwürfe", value: "DRAFT" },
  { label: "Review", value: "REVIEW" },
  { label: "An WordPress gesendet", value: "PUBLISHED" },
  { label: "Fehler", value: "FAILED" },
];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (status as ArticleStatus | undefined) ?? undefined;

  const articles = await prisma.article.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      seoTitle: true,
      sourceTitle: true,
      sourceType: true,
      status: true,
      seoScore: true,
      wordCount: true,
      wpCategories: true,
      wordpressUrl: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Artikel</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Warteschlange, Entwürfe und an WordPress gesendete Artikel.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/articles" : `/articles?status=${f.value}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (filter ?? "ALL") === f.value
                ? "bg-zinc-900 text-white dark:bg-emerald-500"
                : "border border-zinc-300 bg-white text-zinc-600 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800">
        {articles.length === 0 ? (
          <div className="p-6 text-sm text-zinc-500">Keine Artikel gefunden.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 font-medium">Titel</th>
                <th className="px-4 py-2 font-medium">Quelle</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">SEO</th>
                <th className="px-4 py-2 font-medium">Wörter</th>
                <th className="px-4 py-2 font-medium">Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-t border-zinc-100 dark:border-zinc-700">
                  <td className="px-4 py-3">
                    <Link href={`/articles/${article.id}`} className="font-medium hover:text-emerald-600">
                      {article.seoTitle || article.sourceTitle || "Ohne Titel"}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {((article.wpCategories as string[]) ?? []).join(", ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{article.sourceType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{article.seoScore ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-500">{article.wordCount ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(article.createdAt).toLocaleString("de-DE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
