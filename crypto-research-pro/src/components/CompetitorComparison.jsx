import { useEffect, useState } from "react";
import { S } from "../styles.js";
import { getCategoriesList, getMarketsByCategory } from "../lib/api.js";
import { formatCurrency, formatCompact, formatPercent, pctColor } from "../lib/format.js";
import DataSourceTag from "./DataSourceTag.jsx";

export default function CompetitorComparison({ coin, navigate }) {
  const [category, setCategory] = useState(null);
  const [coins, setCoins] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const cats = coin.categories || [];
      if (cats.length === 0) {
        if (!cancelled) {
          setCategory(null);
          setLoading(false);
        }
        return;
      }
      const { data: catList } = await getCategoriesList();
      let match = null;
      for (const cat of cats) {
        const found = catList.find((c) => c.name?.toLowerCase() === cat.toLowerCase());
        if (found) {
          match = found;
          break;
        }
      }
      if (!match) {
        if (!cancelled) {
          setCategory(null);
          setLoading(false);
        }
        return;
      }
      const { data, meta: m } = await getMarketsByCategory(match.category_id, 8);
      if (!cancelled) {
        setCategory(match.name);
        setCoins(data.filter((c) => c.id !== coin.id).slice(0, 6));
        setMeta(m);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coin.id, coin.categories]);

  if (loading) {
    return (
      <div style={S.card}>
        <h2 style={S.h3}>🥊 Konkurrenz-Vergleich</h2>
        <div style={S.loadingBar}>Lade Vergleichsdaten…</div>
      </div>
    );
  }

  if (!category || coins.length === 0) {
    return (
      <div style={S.card}>
        <h2 style={S.h3}>🥊 Konkurrenz-Vergleich</h2>
        <p style={S.sub}>Keine vergleichbaren Projekte über die CoinGecko-Kategorien gefunden.</p>
      </div>
    );
  }

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 style={S.h3}>🥊 Konkurrenz-Vergleich</h2>
        <DataSourceTag meta={meta} />
      </div>
      <p style={S.sub}>
        Andere Projekte aus der Kategorie <strong>{category}</strong> (nach Marktkapitalisierung).
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr style={S.thRow}>
              <th style={S.th}>Coin</th>
              <th style={{ ...S.th, textAlign: "right" }}>Preis</th>
              <th style={{ ...S.th, textAlign: "right" }}>24h %</th>
              <th style={{ ...S.th, textAlign: "right" }}>Marktkap.</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((c) => (
              <tr key={c.id} style={S.rowHover} onClick={() => navigate("coin", c.id)}>
                <td style={S.td}>
                  <div style={S.coinNameCell}>
                    {c.image && <img src={c.image} alt="" style={S.coinIcon} />}
                    <span>{c.name}</span>
                    <span style={S.symbolBadge}>{c.symbol}</span>
                  </div>
                </td>
                <td style={{ ...S.td, textAlign: "right" }}>{formatCurrency(c.current_price)}</td>
                <td style={{ ...S.td, textAlign: "right", color: pctColor(c.price_change_percentage_24h) }}>
                  {formatPercent(c.price_change_percentage_24h)}
                </td>
                <td style={{ ...S.td, textAlign: "right" }}>{c.market_cap ? `${formatCompact(c.market_cap)} €` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
