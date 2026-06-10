import { useEffect, useState, useCallback } from "react";
import { S } from "./styles.js";
import Dashboard from "./pages/Dashboard.jsx";
import CoinDetail from "./pages/CoinDetail.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import { loadWatchlist, saveWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } from "./lib/watchlist.js";

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [page, param] = hash.split("/");
  if (page === "coin" && param) return { page: "coin", coinId: param };
  if (page === "watchlist") return { page: "watchlist", coinId: null };
  return { page: "dashboard", coinId: null };
}

export default function App() {
  const [route, setRoute] = useState(parseHash());
  const [watchlist, setWatchlist] = useState(() => loadWatchlist());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((page, param) => {
    if (page === "dashboard") window.location.hash = "#/";
    else if (page === "coin") window.location.hash = `#/coin/${param}`;
    else if (page === "watchlist") window.location.hash = "#/watchlist";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onToggleWatch = useCallback((coin) => {
    setWatchlist((prev) => {
      const next = isInWatchlist(prev, coin.id) ? removeFromWatchlist(prev, coin.id) : addToWatchlist(prev, coin);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const onAddToWatch = useCallback((coin) => {
    setWatchlist((prev) => {
      const next = addToWatchlist(prev, coin);
      saveWatchlist(next);
      return next;
    });
  }, []);

  return (
    <div style={S.root}>
      <div style={S.bgGlow1} />
      <div style={S.bgGlow2} />
      <div style={S.bgGrid} />

      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.brand} onClick={() => navigate("dashboard")}>
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="47" stroke="#00d084" strokeWidth="3.5" />
              <path d="M30 65 L42 45 L55 55 L70 30" stroke="#00d084" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="70" cy="30" r="5" fill="#00d084" />
            </svg>
            <div>
              <div style={S.brandName}>CRYPTO RESEARCH</div>
              <div style={S.brandSub}>Pro · Live-Daten</div>
            </div>
          </div>
          <nav style={S.nav}>
            <button style={{ ...S.navBtn, ...(route.page === "dashboard" ? S.navBtnOn : {}) }} onClick={() => navigate("dashboard")}>
              📊 Übersicht
            </button>
            <button style={{ ...S.navBtn, ...(route.page === "watchlist" ? S.navBtnOn : {}) }} onClick={() => navigate("watchlist")}>
              ⭐ Watchlist {watchlist.length > 0 && `(${watchlist.length})`}
            </button>
          </nav>
        </div>
      </header>

      <main style={S.main}>
        {route.page === "dashboard" && <Dashboard navigate={navigate} watchlist={watchlist} onToggleWatch={onToggleWatch} />}
        {route.page === "coin" && (
          <CoinDetail key={route.coinId} coinId={route.coinId} navigate={navigate} watchlist={watchlist} onToggleWatch={onToggleWatch} />
        )}
        {route.page === "watchlist" && (
          <WatchlistPage navigate={navigate} watchlist={watchlist} onToggleWatch={onToggleWatch} onAdd={onAddToWatch} />
        )}
      </main>

      <footer style={S.footer}>
        Datenquelle: CoinGecko Public API (Fallback: CryptoCompare) · Alle Angaben ohne Gewähr · Keine Anlageberatung
        <br />
        Automatisch generierte Analysen (Red Flags, Narrative, Bull-/Bear-Case) basieren auf öffentlich
        zugänglichen Marktdaten und ersetzen keine eigene Recherche.
      </footer>
    </div>
  );
}
