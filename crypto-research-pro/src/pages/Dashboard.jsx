import { useEffect, useState } from "react";
import { S } from "../styles.js";
import { getGlobalMarket, getMarkets, getTrending } from "../lib/api.js";
import { formatCompact, formatPercent, pctColor } from "../lib/format.js";
import DataSourceTag from "../components/DataSourceTag.jsx";
import CoinTable from "../components/CoinTable.jsx";
import SearchBar from "../components/SearchBar.jsx";

export default function Dashboard({ navigate, watchlist, onToggleWatch }) {
  const [global, setGlobal] = useState(null);
  const [globalMeta, setGlobalMeta] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [marketsMeta, setMarketsMeta] = useState(null);
  const [trending, setTrending] = useState([]);
  const [trendingMeta, setTrendingMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [g, m, t] = await Promise.all([getGlobalMarket(), getMarkets({ perPage: 50 }), getTrending()]);
    setGlobal(g.data);
    setGlobalMeta(g.meta);
    setMarkets(m.data);
    setMarketsMeta(m.meta);
    setTrending(t.data);
    setTrendingMeta(t.meta);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={S.h1}>
          Crypto<br />
          <span style={{ color: "#00d084" }}>Research Pro</span>
        </h1>
        <p style={{ ...S.sub, maxWidth: 640, marginTop: 12 }}>
          Echtzeit-Kurse, Projekt-Recherche, Red-Flag-Scanner, Narrative-Analyse und Bull-/Bear-Case –
          basierend auf öffentlich zugänglichen, kostenlosen Daten von CoinGecko (Fallback: CryptoCompare).
        </p>
      </div>

      <SearchBar onSelect={(id) => navigate("coin", id)} />

      {global && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={S.h3}>🌍 Globaler Markt</h2>
            <DataSourceTag meta={globalMeta} />
          </div>
          <div style={S.statGrid}>
            <div style={S.statBox}>
              <span style={S.statLabel}>Marktkap. gesamt</span>
              <span style={S.statValue}>{formatCompact(global.total_market_cap?.eur)} €</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statLabel}>24h-Volumen</span>
              <span style={S.statValue}>{formatCompact(global.total_volume?.eur)} €</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statLabel}>BTC-Dominanz</span>
              <span style={S.statValue}>{global.market_cap_percentage?.btc?.toFixed(1)} %</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statLabel}>ETH-Dominanz</span>
              <span style={S.statValue}>{global.market_cap_percentage?.eth?.toFixed(1)} %</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statLabel}>Marktkap.-Änderung 24h</span>
              <span style={{ ...S.statValue, color: pctColor(global.market_cap_change_percentage_24h_usd) }}>
                {formatPercent(global.market_cap_change_percentage_24h_usd)}
              </span>
            </div>
            <div style={S.statBox}>
              <span style={S.statLabel}>Aktive Kryptowährungen</span>
              <span style={S.statValue}>{global.active_cryptocurrencies}</span>
            </div>
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={S.h3}>🔥 Trending (meistgesucht)</h2>
            <DataSourceTag meta={trendingMeta} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {trending.slice(0, 7).map(({ item }) => (
              <div
                key={item.id}
                style={{ ...S.linkChip, cursor: "pointer" }}
                onClick={() => navigate("coin", item.id)}
              >
                {item.thumb && <img src={item.thumb} alt="" style={{ width: 18, height: 18, borderRadius: "50%" }} />}
                {item.name} <span style={{ color: "#7a8fa8" }}>#{item.market_cap_rank ?? "–"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={S.h3}>📊 Top 50 nach Marktkapitalisierung</h2>
          <DataSourceTag meta={marketsMeta} />
        </div>
        {loading && markets.length === 0 ? (
          <div style={S.loadingBar}>Lade Live-Daten…</div>
        ) : (
          <CoinTable coins={markets} onSelect={(id) => navigate("coin", id)} watchlist={watchlist} onToggleWatch={onToggleWatch} />
        )}
      </div>

      <div style={S.errorBox}>
        ⚠️ <strong>Hinweis:</strong> Alle Kurse, Kennzahlen und automatisch generierten Analysen (Red Flags, Narrative,
        Bull-/Bear-Case) basieren auf öffentlichen API-Daten und stellen <strong>keine Anlageberatung</strong> dar.
        Bei API-Limits kann es zu kurzen Verzögerungen oder Cache-Daten kommen – Quelle &amp; Zeitstempel werden
        immer angezeigt.
      </div>
    </div>
  );
}
