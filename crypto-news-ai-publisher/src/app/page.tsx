import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { CATEGORY_LABELS } from "@/lib/news/sources";
import { NewsCategoryKey } from "@/types/article";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS: { category: NewsCategoryKey; label: string }[] = [
  { category: "XRP", label: "Neueste XRP News" },
  { category: "BITCOIN", label: "Neueste Bitcoin News" },
  { category: "CRYPTO", label: "Neueste Krypto News" },
  { category: "FINANCE", label: "Neueste Finanz News" },
  { category: "MACRO", label: "Neueste Makro News" },
];

export default async function DashboardPage() {
  const [totalArticles, statusCounts, recentArticles, recentNews] = await Promise.all([
    prisma.article.count(),
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        seoTitle: true,
        sourceTitle: true,
        status: true,
        seoScore: true,
        wordCount: true,
        sourceType: true,
        wpCategories: true,
        createdAt: true,
      },
    }),
    prisma.newsItem.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 6,
      select: { title: true, category: true, source: true, relevanceScore: true, url: true },
    }),
  ]);

  const countFor = (status: string) =>
    statusCounts.find((s) => s.status === status)?._count._all ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Redaktions-Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Übersicht über Artikel-Warteschlange, Entwürfe und Trendthemen.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Artikel gesamt" value={totalArticles} />
        <StatCard
          label="Warteschlange"
          value={countFor("QUEUED") + countFor("GENERATING") + countFor("RESEARCHING")}
        />
        <StatCard label="Entwürfe" value={countFor("DRAFT") + countFor("REVIEW")} />
        <StatCard label="An WordPress gesendet" value={countFor("PUBLISHED")} />
        <StatCard label="Fehler" value={countFor("FAILED")} accent="text-red-500" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          News Hunter
        </h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.category}
              href={`/news?category=${action.category}`}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Artikel-Warteschlange
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800">
            {recentArticles.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                Noch keine Artikel. Starte mit einem YouTube-Video oder den News-Hunter-Buttons.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2 font-medium">Titel</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">SEO</th>
                    <th className="px-4 py-2 font-medium">Wörter</th>
                  </tr>
                </thead>
                <tbody>
                  {recentArticles.map((article) => (
                    <tr key={article.id} className="border-t border-zinc-100 dark:border-zinc-700">
                      <td className="px-4 py-3">
                        <Link href={`/articles/${article.id}`} className="font-medium hover:text-emerald-600">
                          {article.seoTitle || article.sourceTitle || "Ohne Titel"}
                        </Link>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {((article.wpCategories as string[]) ?? []).join(", ") || article.sourceType}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{article.seoScore ?? "-"}</td>
                      <td className="px-4 py-3 text-zinc-500">{article.wordCount ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Trend-Themen
          </h2>
          <div className="space-y-2">
            {recentNews.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800">
                Noch keine News abgerufen.
              </div>
            ) : (
              recentNews.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-800"
                >
                  <p className="font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {CATEGORY_LABELS[item.category as NewsCategoryKey]} · {item.source}
                    {item.relevanceScore != null ? ` · Relevanz ${item.relevanceScore}` : ""}
                  </p>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}
