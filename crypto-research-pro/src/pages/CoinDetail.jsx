import { useEffect, useState } from "react";
import { S } from "../styles.js";
import { getCoinDetail } from "../lib/api.js";
import { getNarratives, NARRATIVES } from "../lib/analysis.js";
import { formatCurrency, formatCompact, formatNumber, formatPercent, formatDate, pctColor } from "../lib/format.js";
import DataSourceTag from "../components/DataSourceTag.jsx";
import RedFlagPanel from "../components/RedFlagPanel.jsx";
import BullBearPanel from "../components/BullBearPanel.jsx";
import CompetitorComparison from "../components/CompetitorComparison.jsx";

export default function CoinDetail({ coinId, navigate, watchlist, onToggleWatch }) {
  const [coin, setCoin] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCoinDetail(coinId).then(({ data, meta: m }) => {
      if (cancelled) return;
      if (!data) setError("Coin-Daten konnten nicht geladen werden (CoinGecko nicht erreichbar).");
      setCoin(data);
      setMeta(m);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [coinId]);

  if (loading) return <div style={S.loadingBar}>Lade Coin-Daten…</div>;
  if (error || !coin) return <div style={S.errorBox}>{error || "Coin nicht gefunden."}</div>;

  const md = coin.market_data || {};
  const price = md.current_price?.eur;
  const chg24 = md.price_change_percentage_24h_in_currency?.eur ?? md.price_change_percentage_24h;
  const chg7d = md.price_change_percentage_7d_in_currency?.eur;
  const chg30d = md.price_change_percentage_30d_in_currency?.eur;
  const watched = watchlist?.some((w) => w.id === coin.id);
  const narratives = getNarratives(coin.categories);
  const description = coin.description?.de || coin.description?.en || "";
  const links = buildLinks(coin);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button style={S.btnGhost} onClick={() => navigate("dashboard")}>
        ← Zurück zur Übersicht
      </button>

      {/* ── Kopfbereich ─────────────────────────────────────────── */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {coin.image?.large && <img src={coin.image.large} alt="" style={{ width: 56, height: 56, borderRadius: "50%" }} />}
            <div>
              <h1 style={{ ...S.h2, fontSize: 32 }}>
                {coin.name} <span style={{ color: "#7a8fa8", fontSize: 18 }}>{coin.symbol?.toUpperCase()}</span>
              </h1>
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {md.market_cap_rank && <span style={S.pill}>Rang #{md.market_cap_rank}</span>}
                {narratives.map((n) => (
                  <span key={n.key} style={{ ...S.pill, ...S.pillPurple }}>
                    {n.icon} {n.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: "#fff", letterSpacing: 1 }}>{formatCurrency(price)}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4, flexWrap: "wrap" }}>
              <PctTag label="24h" value={chg24} />
              <PctTag label="7d" value={chg7d} />
              <PctTag label="30d" value={chg30d} />
            </div>
            <button
              style={{ ...S.btnSmall, ...(watched ? S.btnStarOn : {}), marginTop: 10 }}
              onClick={() => onToggleWatch(coin)}
            >
              {watched ? "★ In Watchlist" : "☆ Zur Watchlist"}
            </button>
          </div>
        </div>
        <DataSourceTag meta={meta} />
      </div>

      {/* ── Marktdaten ──────────────────────────────────────────── */}
      <div style={S.card}>
        <h2 style={S.h3}>📊 Marktdaten</h2>
        <div style={S.statGrid}>
          <Stat label="Marktkapitalisierung" value={md.market_cap?.eur ? `${formatCompact(md.market_cap.eur)} €` : "–"} />
          <Stat label="24h-Volumen" value={md.total_volume?.eur ? `${formatCompact(md.total_volume.eur)} €` : "–"} />
          <Stat label="24h Hoch / Tief" value={`${formatCurrency(md.high_24h?.eur)} / ${formatCurrency(md.low_24h?.eur)}`} />
          <Stat label="Circulating Supply" value={md.circulating_supply ? `${formatCompact(md.circulating_supply)} ${coin.symbol?.toUpperCase()}` : "–"} />
          <Stat label="Total Supply" value={md.total_supply ? `${formatCompact(md.total_supply)} ${coin.symbol?.toUpperCase()}` : "Unbegrenzt / k.A."} />
          <Stat label="Max Supply" value={md.max_supply ? `${formatCompact(md.max_supply)} ${coin.symbol?.toUpperCase()}` : "Unbegrenzt / k.A."} />
          <Stat
            label="Allzeithoch (ATH)"
            value={`${formatCurrency(md.ath?.eur)} (${formatDate(md.ath_date?.eur)})`}
            sub={formatPercent(md.ath_change_percentage?.eur)}
            subColor={pctColor(md.ath_change_percentage?.eur)}
          />
          <Stat
            label="Allzeittief (ATL)"
            value={`${formatCurrency(md.atl?.eur)} (${formatDate(md.atl_date?.eur)})`}
            sub={formatPercent(md.atl_change_percentage?.eur)}
            subColor={pctColor(md.atl_change_percentage?.eur)}
          />
        </div>
      </div>

      {/* ── Offizielle Quellen ──────────────────────────────────── */}
      <div style={S.card}>
        <h2 style={S.h3}>🔗 Offizielle Quellen &amp; Links</h2>
        <p style={S.sub}>Direkt verlinkt aus den von CoinGecko gepflegten Projekt-Stammdaten.</p>
        <div style={S.pillRow}>
          {links.length === 0 && <span style={S.sub}>Keine offiziellen Links hinterlegt.</span>}
          {links.map((l) => (
            <a key={l.label + l.url} href={l.url} target="_blank" rel="noreferrer" style={S.linkChip}>
              {l.icon} {l.label}
            </a>
          ))}
        </div>
        {!links.find((l) => l.type === "github") && (
          <div style={{ ...S.sourceTag, ...S.sourceTagWarn }}>⚠️ Kein GitHub-Repository verlinkt – Entwicklungsaktivität nicht öffentlich nachvollziehbar.</div>
        )}
        {!links.find((l) => l.type === "whitepaper") && (
          <div style={{ ...S.sourceTag, ...S.sourceTagWarn }}>⚠️ Kein Whitepaper über CoinGecko verlinkt – ggf. direkt auf der Projektseite suchen.</div>
        )}
      </div>

      {/* ── Beschreibung ────────────────────────────────────────── */}
      {description && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={S.h3}>📄 Projektbeschreibung</h2>
            <span style={S.sourceTag}>Quelle: CoinGecko / Projektangaben</span>
          </div>
          <DescriptionText html={description} />
        </div>
      )}

      {/* ── Narrative ───────────────────────────────────────────── */}
      <div style={S.card}>
        <h2 style={S.h3}>🧭 Narrative-Zuordnung</h2>
        <p style={S.sub}>Welchem aktuellen Markt-Narrativ wird dieser Coin zugeordnet (basierend auf CoinGecko-Kategorien)?</p>
        <div style={S.pillRow}>
          {NARRATIVES.map((n) => {
            const active = narratives.some((m) => m.key === n.key);
            return (
              <span key={n.key} style={{ ...S.pill, ...(active ? S.pillPurple : S.pillGray) }}>
                {n.icon} {n.label}
              </span>
            );
          })}
        </div>
        {coin.categories?.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <span style={{ ...S.statLabel }}>Alle CoinGecko-Kategorien</span>
            <div style={{ ...S.pillRow, marginTop: 6 }}>
              {coin.categories.filter(Boolean).map((c) => (
                <span key={c} style={{ ...S.pill, ...S.pillGray }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Entwicklung & Community ────────────────────────────── */}
      <div style={S.card}>
        <h2 style={S.h3}>👨‍💻 Entwicklung &amp; Community</h2>
        <p style={S.sub}>Kennzahlen zur Transparenz und Aktivität des Projekts (GitHub, Social Media).</p>
        <div style={S.statGrid}>
          <Stat label="GitHub Stars" value={formatNumber(coin.developer_data?.stars)} />
          <Stat label="GitHub Forks" value={formatNumber(coin.developer_data?.forks)} />
          <Stat label="Commits (4 Wochen)" value={formatNumber(coin.developer_data?.commit_count_4_weeks)} />
          <Stat label="Mitwirkende (Contributors)" value={formatNumber(coin.developer_data?.pull_request_contributors)} />
          <Stat label="Twitter/X-Follower" value={formatNumber(coin.community_data?.twitter_followers)} />
          <Stat label="Reddit-Mitglieder" value={formatNumber(coin.community_data?.reddit_subscribers)} />
          <Stat label="Telegram-Mitglieder" value={formatNumber(coin.community_data?.telegram_channel_user_count)} />
        </div>
      </div>

      {/* ── Top-Handelsplätze (Liquidität) ─────────────────────── */}
      {coin.tickers?.length > 0 && (
        <div style={S.card}>
          <h2 style={S.h3}>💱 Top-Handelsplätze (Liquidität &amp; Exchange-Daten)</h2>
          <p style={S.sub}>Die handelsstärksten Märkte laut CoinGecko – Trust Score gibt die geschätzte Datenqualität der Börse an.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>Börse</th>
                  <th style={S.th}>Paar</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Preis</th>
                  <th style={{ ...S.th, textAlign: "right" }}>24h-Volumen</th>
                  <th style={S.th}>Trust Score</th>
                </tr>
              </thead>
              <tbody>
                {coin.tickers.slice(0, 8).map((t, i) => (
                  <tr key={i}>
                    <td style={S.td}>{t.market?.name}</td>
                    <td style={S.td}>
                      {t.base}/{t.target}
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>{formatCurrency(t.converted_last?.eur)}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{t.converted_volume?.eur ? `${formatCompact(t.converted_volume.eur)} €` : "–"}</td>
                    <td style={S.td}>
                      <span style={{ ...S.pill, ...(t.trust_score === "green" ? S.pillGreen : t.trust_score === "yellow" ? S.pillYellow : S.pillRed) }}>
                        {t.trust_score || "k.A."}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RedFlagPanel coin={coin} />
      <BullBearPanel coin={coin} narratives={narratives} />
      <CompetitorComparison coin={coin} navigate={navigate} />
    </div>
  );
}

function Stat({ label, value, sub, subColor }) {
  return (
    <div style={S.statBox}>
      <span style={S.statLabel}>{label}</span>
      <span style={{ ...S.statValue, fontSize: 16 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, fontWeight: 700, color: subColor || "#7a8fa8" }}>{sub}</span>}
    </div>
  );
}

function PctTag({ label, value }) {
  return (
    <span style={{ fontSize: 13, fontWeight: 800, color: pctColor(value) }}>
      {label}: {formatPercent(value)}
    </span>
  );
}

function DescriptionText({ html }) {
  const [expanded, setExpanded] = useState(false);
  const plain = html.replace(/<[^>]*>/g, "");
  const short = plain.length > 420 ? plain.slice(0, 420) + "…" : plain;
  return (
    <div style={{ fontSize: 14, color: "#aab8cc", lineHeight: 1.7 }}>
      {expanded ? plain : short}
      {plain.length > 420 && (
        <button style={{ ...S.btnSmall, marginLeft: 8 }} onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
        </button>
      )}
    </div>
  );
}

function buildLinks(coin) {
  const l = coin.links || {};
  const out = [];
  const homepage = (l.homepage || []).find(Boolean);
  if (homepage) out.push({ label: "Offizielle Website", url: homepage, icon: "🌐", type: "homepage" });
  if (l.whitepaper) out.push({ label: "Whitepaper", url: l.whitepaper, icon: "📄", type: "whitepaper" });
  (l.repos_url?.github || []).slice(0, 1).forEach((u) => out.push({ label: "GitHub", url: u, icon: "💻", type: "github" }));
  if (l.twitter_screen_name) out.push({ label: "X / Twitter", url: `https://x.com/${l.twitter_screen_name}`, icon: "🐦", type: "twitter" });
  if (l.subreddit_url) out.push({ label: "Reddit", url: l.subreddit_url, icon: "👽", type: "reddit" });
  if (l.telegram_channel_identifier) out.push({ label: "Telegram", url: `https://t.me/${l.telegram_channel_identifier}`, icon: "✈️", type: "telegram" });
  (l.chat_url || []).filter(Boolean).slice(0, 1).forEach((u) => out.push({ label: "Discord / Chat", url: u, icon: "💬", type: "chat" }));
  (l.blockchain_site || []).filter(Boolean).slice(0, 2).forEach((u, i) => out.push({ label: `Block-Explorer ${i + 1}`, url: u, icon: "🔍", type: "explorer" }));
  (l.announcement_url || []).filter(Boolean).slice(0, 1).forEach((u) => out.push({ label: "Ankündigungen", url: u, icon: "📢", type: "announcement" }));
  return out;
}
