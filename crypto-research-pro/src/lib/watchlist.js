// ── Watchlist (lokal im Browser gespeichert, kein Login nötig) ────────────

const KEY = "crypto_research_watchlist";

export function loadWatchlist() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* localStorage evtl. nicht verfügbar (privater Modus) */
  }
}

export function isInWatchlist(list, id) {
  return list.some((c) => c.id === id);
}

export function addToWatchlist(list, coin) {
  if (isInWatchlist(list, coin.id)) return list;
  const entry = { id: coin.id, symbol: coin.symbol, name: coin.name, image: coin.image || coin.thumb || null };
  return [...list, entry];
}

export function removeFromWatchlist(list, id) {
  return list.filter((c) => c.id !== id);
}
