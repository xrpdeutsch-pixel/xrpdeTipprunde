import { S } from "../styles.js";
import { timeAgo } from "../lib/format.js";

// Zeigt transparent: Datenquelle, Zeitpunkt der letzten Aktualisierung,
// mögliche Verzögerung sowie ob eine Fallback-Quelle verwendet wurde.
export default function DataSourceTag({ meta, primary = "CoinGecko", fallback = "CryptoCompare" }) {
  if (!meta) return null;

  if (meta.error && !meta.fromCache) {
    return (
      <span style={{ ...S.sourceTag, ...S.sourceTagWarn }}>
        ⚠️ Live-Daten von {primary} aktuell nicht erreichbar (Fallback {fallback} ebenfalls fehlgeschlagen)
      </span>
    );
  }

  const usingFallback = meta.fallback && meta.source !== primary;

  return (
    <span style={{ ...S.sourceTag, ...(meta.stale || usingFallback ? S.sourceTagWarn : {}) }}>
      📡 Quelle: <strong>{meta.source}</strong>
      {meta.fetchedAt && <> · Stand: {timeAgo(meta.fetchedAt)}</>}
      {meta.fromCache && !meta.stale && <> · aus Cache</>}
      {meta.stale && <> · ⚠️ evtl. veraltet (Live-Abruf fehlgeschlagen)</>}
      {usingFallback && <> · Fallback-Quelle aktiv (Primärquelle {primary} nicht erreichbar)</>}
      {!usingFallback && <> · mögliche Verzögerung: ~30–60 Sek.</>}
    </span>
  );
}
