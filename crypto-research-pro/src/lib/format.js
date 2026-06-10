// ── Formatierungs-Helfer (deutsches Format) ────────────────────────────────

export function formatCurrency(value, currency = "EUR", opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  const digits = value !== 0 && Math.abs(value) < 1 ? 6 : 2;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: opts.digits ?? (Math.abs(value) < 1 ? digits : 2),
    maximumFractionDigits: opts.digits ?? (Math.abs(value) < 1 ? digits : 2),
  }).format(value);
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// Kompakte Darstellung großer Zahlen: 1,2 Mrd. / 340 Mio. / 12,3 Tsd.
export function formatCompact(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${formatNumber(value / 1e12, 2)} Bio.`;
  if (abs >= 1e9) return `${formatNumber(value / 1e9, 2)} Mrd.`;
  if (abs >= 1e6) return `${formatNumber(value / 1e6, 2)} Mio.`;
  if (abs >= 1e3) return `${formatNumber(value / 1e3, 1)} Tsd.`;
  return formatNumber(value, 2);
}

export function formatPercent(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, digits)} %`;
}

export function formatDate(dateString) {
  if (!dateString) return "–";
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(dateString));
  } catch {
    return "–";
  }
}

export function formatDateTime(value) {
  if (!value) return "–";
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
  } catch {
    return "–";
  }
}

// Zeitstempel (ms oder Sekunden) -> "vor X Sek./Min."
export function timeAgo(timestamp) {
  if (!timestamp) return "unbekannt";
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = Date.now() - ms;
  const sec = Math.round(diff / 1000);
  if (sec < 5) return "gerade eben";
  if (sec < 60) return `vor ${sec} Sek.`;
  const min = Math.round(sec / 60);
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.round(h / 24);
  return `vor ${d} Tag${d === 1 ? "" : "en"}`;
}

export function pctColor(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "#7a8fa8";
  return value > 0 ? "#00d084" : value < 0 ? "#ff6b6b" : "#7a8fa8";
}
