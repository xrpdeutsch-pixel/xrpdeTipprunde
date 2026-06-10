import { S } from "../styles.js";
import { formatCurrency, formatCompact, formatPercent, pctColor } from "../lib/format.js";

export default function CoinTable({ coins, onSelect, watchlist, onToggleWatch }) {
  if (!coins?.length) {
    return <div style={S.emptyState}>Keine Daten verfügbar.</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={S.table}>
        <thead>
          <tr style={S.thRow}>
            <th style={S.th}>#</th>
            <th style={S.th}>Coin</th>
            <th style={{ ...S.th, textAlign: "right" }}>Preis</th>
            <th style={{ ...S.th, textAlign: "right" }}>24h %</th>
            <th style={{ ...S.th, textAlign: "right" }}>7d %</th>
            <th style={{ ...S.th, textAlign: "right" }}>Marktkap.</th>
            <th style={{ ...S.th, textAlign: "right" }}>Volumen (24h)</th>
            <th style={S.th}></th>
          </tr>
        </thead>
        <tbody>
          {coins.map((c) => {
            const watched = watchlist?.some((w) => w.id === c.id);
            return (
              <tr key={c.id} style={S.rowHover} onClick={() => onSelect?.(c.id)}>
                <td style={S.td}>{c.market_cap_rank ?? "–"}</td>
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
                <td style={{ ...S.td, textAlign: "right", color: pctColor(c.price_change_percentage_7d_in_currency) }}>
                  {formatPercent(c.price_change_percentage_7d_in_currency)}
                </td>
                <td style={{ ...S.td, textAlign: "right" }}>{c.market_cap ? `${formatCompact(c.market_cap)} €` : "–"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{c.total_volume ? `${formatCompact(c.total_volume)} €` : "–"}</td>
                <td style={{ ...S.td, textAlign: "center" }}>
                  {onToggleWatch && (
                    <button
                      style={{ ...S.btnSmall, ...(watched ? S.btnStarOn : {}) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatch(c);
                      }}
                      title={watched ? "Von Watchlist entfernen" : "Zur Watchlist hinzufügen"}
                    >
                      {watched ? "★" : "☆"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
