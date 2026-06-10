import { useEffect, useState } from "react";
import { S } from "../styles.js";
import { getSimplePrices } from "../lib/api.js";
import { formatCurrency, formatPercent, pctColor } from "../lib/format.js";
import DataSourceTag from "../components/DataSourceTag.jsx";
import SearchBar from "../components/SearchBar.jsx";

export default function WatchlistPage({ navigate, watchlist, onToggleWatch, onAdd }) {
  const [prices, setPrices] = useState({});
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (watchlist.length === 0) {
      setPrices({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, meta: m } = await getSimplePrices(watchlist);
    setPrices(data);
    setMeta(m);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 45_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={S.h2}>⭐ Watchlist</h2>
        <p style={S.sub}>Lokal in deinem Browser gespeichert (kein Login nötig). Live-Kurse werden alle 45 Sekunden aktualisiert.</p>
      </div>

      <SearchBar
        placeholder="Coin zur Watchlist hinzufügen…"
        onSelect={(id, coin) => onAdd(coin)}
      />

      {watchlist.length === 0 ? (
        <div style={S.emptyState}>
          Deine Watchlist ist leer. Suche oben nach einem Coin oder füge welche über die{" "}
          <span style={{ color: "#00d084", cursor: "pointer" }} onClick={() => navigate("dashboard")}>
            Übersicht
          </span>{" "}
          hinzu (★-Symbol).
        </div>
      ) : (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h3 style={S.h3}>{watchlist.length} Coin(s) beobachtet</h3>
            {meta && <DataSourceTag meta={meta} />}
          </div>
          {loading && Object.keys(prices).length === 0 ? (
            <div style={S.loadingBar}>Lade Live-Kurse…</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thRow}>
                    <th style={S.th}>Coin</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Preis (EUR)</th>
                    <th style={{ ...S.th, textAlign: "right" }}>24h %</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((c) => {
                    const p = prices[c.id];
                    return (
                      <tr key={c.id}>
                        <td style={S.td} onClick={() => navigate("coin", c.id)}>
                          <div style={{ ...S.coinNameCell, cursor: "pointer" }}>
                            {c.image && <img src={c.image} alt="" style={S.coinIcon} />}
                            <span>{c.name}</span>
                            <span style={S.symbolBadge}>{c.symbol}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: "right" }}>{p ? formatCurrency(p.eur) : "–"}</td>
                        <td style={{ ...S.td, textAlign: "right", color: pctColor(p?.eur_24h_change) }}>
                          {p?.eur_24h_change != null ? formatPercent(p.eur_24h_change) : "–"}
                        </td>
                        <td style={{ ...S.td, textAlign: "center" }}>
                          <button style={{ ...S.btnSmall, ...S.btnDanger }} onClick={() => onToggleWatch(c)}>
                            Entfernen
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
