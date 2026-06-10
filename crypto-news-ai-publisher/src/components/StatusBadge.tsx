const STATUS_STYLES: Record<string, string> = {
  QUEUED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  RESEARCHING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  GENERATING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  DRAFT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  REVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
  QUEUED: "Warteschlange",
  RESEARCHING: "Recherche",
  GENERATING: "Generierung",
  DRAFT: "Entwurf",
  REVIEW: "Review",
  PUBLISHED: "An WordPress gesendet",
  FAILED: "Fehler",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-zinc-200 text-zinc-700"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
