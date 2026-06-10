export const dynamic = "force-dynamic";

interface ConfigItem {
  label: string;
  description: string;
  configured: boolean;
  required: boolean;
}

function buildConfigItems(): ConfigItem[] {
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

  return [
    {
      label: "Datenbank (PostgreSQL / Prisma)",
      description: "DATABASE_URL",
      configured: !!process.env.DATABASE_URL,
      required: true,
    },
    {
      label: `KI-Provider: ${provider === "openai" ? "OpenAI" : "Anthropic Claude"}`,
      description: provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY",
      configured: provider === "openai" ? !!process.env.OPENAI_API_KEY : !!process.env.ANTHROPIC_API_KEY,
      required: true,
    },
    {
      label: "Perplexity Recherche-Agent (optional)",
      description: "PERPLEXITY_API_KEY - aktuelle Marktdaten, SEC/MiCA-Recherche",
      configured: !!process.env.PERPLEXITY_API_KEY,
      required: false,
    },
    {
      label: "YouTube Data API (optional)",
      description: "YOUTUBE_API_KEY - erweiterte Video-Metadaten",
      configured: !!process.env.YOUTUBE_API_KEY,
      required: false,
    },
    {
      label: "WordPress REST API",
      description: "WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD",
      configured: !!(
        process.env.WORDPRESS_URL &&
        process.env.WORDPRESS_USERNAME &&
        process.env.WORDPRESS_APP_PASSWORD
      ),
      required: true,
    },
    {
      label: "Automatisierung (stündlicher News-Check)",
      description: "CRON_SECRET - sichert /api/cron/news-check ab",
      configured: !!process.env.CRON_SECRET,
      required: false,
    },
  ];
}

export default function SettingsPage() {
  const items = buildConfigItems();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Konfiguration erfolgt über Umgebungsvariablen (.env). Diese Seite zeigt nur den
          Konfigurationsstatus an - keine Geheimnisse werden angezeigt.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2 font-medium">Funktion</th>
              <th className="px-4 py-2 font-medium">Umgebungsvariable(n)</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.label} className="border-t border-zinc-100 dark:border-zinc-700">
                <td className="px-4 py-3 font-medium">
                  {item.label}
                  {item.required && <span className="ml-1 text-red-500">*</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.description}</td>
                <td className="px-4 py-3">
                  {item.configured ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Konfiguriert
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      Nicht konfiguriert
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Automatisierung einrichten
        </h2>
        <p>
          Richte einen stündlichen Cron-Job (z.B. via Vercel Cron oder einem externen Scheduler)
          ein, der <code className="font-mono">GET /api/cron/news-check</code> aufruft. Die
          Anfrage muss den Header{" "}
          <code className="font-mono">Authorization: Bearer &lt;CRON_SECRET&gt;</code> enthalten,
          falls <code className="font-mono">CRON_SECRET</code> gesetzt ist. Bei einer wichtigen
          Top-Story (Relevanz ≥ 75) wird automatisch ein Artikel erstellt und - falls WordPress
          konfiguriert ist - als Entwurf gespeichert.
        </p>
      </div>

      <p className="text-xs text-zinc-400">* Erforderlich für den vollen Funktionsumfang.</p>
    </div>
  );
}
