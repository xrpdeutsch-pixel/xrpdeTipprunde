// ── Live-Daten-Layer ──────────────────────────────────────────────────────
// Primärquelle: CoinGecko Public API (kostenlos, kein Key nötig)
// Fallback-Quelle: CryptoCompare Min-API (kostenlos, kein Key nötig)
// Jede Funktion liefert { data, meta } zurück. meta enthält Quelle,
// Zeitpunkt der Aktualisierung, ob aus Cache/Fallback und evtl. Fehler.

const CG_BASE = "https://api.coingecko.com/api/v3";
const CC_BASE = "https://min-api.cryptocompare.com/data";

const cache = new Map();

async function fetchJSON(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Holt JSON mit Cache (TTL in ms). Bei Fehler wird – falls vorhanden – der
// letzte bekannte (ggf. veraltete) Cache-Eintrag als Fallback zurückgegeben.
async function cachedFetch(key, url, ttl) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.time < ttl) {
    return { data: cached.data, fetchedAt: cached.time, fromCache: true, stale: false };
  }

  try {
    const data = await fetchJSON(url);
    cache.set(key, { data, time: now });
    return { data, fetchedAt: now, fromCache: false, stale: false };
  } catch (e) {
    if (cached) {
      return { data: cached.data, fetchedAt: cached.time, fromCache: true, stale: true, error: e };
    }
    throw e;
  }
}

const VS = "eur";

// ── Globale Marktdaten (Marktkap., BTC-Dominanz, ...) ──────────────────────
export async function getGlobalMarket() {
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(
      "global",
      `${CG_BASE}/global`,
      60_000
    );
    return {
      data: data.data,
      meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false },
    };
  } catch (e) {
    return { data: null, meta: { source: "CoinGecko", error: e.message, fallback: false } };
  }
}

// ── Top-Coins nach Marktkapitalisierung ────────────────────────────────────
export async function getMarkets({ page = 1, perPage = 50 } = {}) {
  const url = `${CG_BASE}/coins/markets?vs_currency=${VS}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h,7d`;
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(`markets_${page}_${perPage}`, url, 45_000);
    return { data, meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    // Fallback: CryptoCompare Top-Liste (eingeschränkter Funktionsumfang)
    try {
      const ccUrl = `${CC_BASE}/top/mktcapfull?limit=${perPage}&tsym=EUR`;
      const { data, fetchedAt, fromCache, stale } = await cachedFetch(`cc_markets_${perPage}`, ccUrl, 45_000);
      const mapped = (data?.Data || []).map((d) => {
        const raw = d.RAW?.EUR || {};
        const inf = d.CoinInfo || {};
        return {
          id: inf.Name?.toLowerCase(),
          symbol: inf.Name?.toLowerCase(),
          name: inf.FullName,
          image: inf.ImageUrl ? `https://www.cryptocompare.com${inf.ImageUrl}` : null,
          current_price: raw.PRICE,
          market_cap: raw.MKTCAP,
          market_cap_rank: null,
          total_volume: raw.TOTALVOLUME24H,
          price_change_percentage_24h: raw.CHANGEPCT24HOUR,
          price_change_percentage_7d_in_currency: null,
        };
      });
      return { data: mapped, meta: { source: "CryptoCompare", fetchedAt, fromCache, stale, fallback: true, error: e.message } };
    } catch (e2) {
      return { data: [], meta: { source: "CoinGecko", error: e.message, fallbackError: e2.message, fallback: true } };
    }
  }
}

// ── Trending-Coins (meistgesuchte Coins der letzten Stunden) ──────────────
export async function getTrending() {
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch("trending", `${CG_BASE}/search/trending`, 120_000);
    return { data: data.coins || [], meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    return { data: [], meta: { source: "CoinGecko", error: e.message, fallback: false } };
  }
}

// ── Suche nach Coins (für Watchlist / Detail-Navigation) ───────────────────
export async function searchCoins(query) {
  if (!query || query.trim().length < 1) return { data: [], meta: { source: "CoinGecko" } };
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(
      `search_${query.toLowerCase()}`,
      `${CG_BASE}/search?query=${encodeURIComponent(query)}`,
      60_000
    );
    return { data: data.coins || [], meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    return { data: [], meta: { source: "CoinGecko", error: e.message, fallback: false } };
  }
}

// ── Vollständige Coin-Detaildaten ──────────────────────────────────────────
export async function getCoinDetail(id) {
  const url = `${CG_BASE}/coins/${id}?localization=de&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=false`;
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(`coin_${id}`, url, 60_000);
    return { data, meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    return { data: null, meta: { source: "CoinGecko", error: e.message, fallback: false } };
  }
}

// ── Einfache Preise für die Watchlist (id -> {eur, change24h}) ────────────
export async function getSimplePrices(coins) {
  // coins: [{id, symbol}]
  if (!coins.length) return { data: {}, meta: { source: "CoinGecko" } };
  const ids = coins.map((c) => c.id).join(",");
  const url = `${CG_BASE}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=eur,usd&include_24hr_change=true&include_last_updated_at=true`;
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(`simple_${ids}`, url, 30_000);
    return { data, meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    // Fallback: CryptoCompare nach Symbol
    try {
      const symbols = coins.map((c) => c.symbol.toUpperCase()).join(",");
      const ccUrl = `${CC_BASE}/pricemultifull?fsyms=${encodeURIComponent(symbols)}&tsyms=EUR,USD`;
      const { data, fetchedAt, fromCache, stale } = await cachedFetch(`cc_simple_${symbols}`, ccUrl, 30_000);
      const mapped = {};
      coins.forEach((c) => {
        const raw = data?.RAW?.[c.symbol.toUpperCase()];
        if (raw?.EUR) {
          mapped[c.id] = {
            eur: raw.EUR.PRICE,
            usd: raw.USD?.PRICE,
            eur_24h_change: raw.EUR.CHANGEPCT24HOUR,
            last_updated_at: Math.floor((raw.EUR.LASTUPDATE || Date.now() / 1000)),
          };
        }
      });
      return { data: mapped, meta: { source: "CryptoCompare", fetchedAt, fromCache, stale, fallback: true, error: e.message } };
    } catch (e2) {
      return { data: {}, meta: { source: "CoinGecko", error: e.message, fallbackError: e2.message, fallback: true } };
    }
  }
}

// ── Kategorien-Liste (Name -> ID) für Konkurrenz-Vergleich ─────────────────
export async function getCategoriesList() {
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(
      "categories_list",
      `${CG_BASE}/coins/categories/list`,
      24 * 60 * 60_000
    );
    return { data, meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    return { data: [], meta: { source: "CoinGecko", error: e.message, fallback: false } };
  }
}

// ── Top-Coins einer Kategorie (für Konkurrenz-Vergleich) ───────────────────
export async function getMarketsByCategory(categoryId, perPage = 6) {
  const url = `${CG_BASE}/coins/markets?vs_currency=${VS}&category=${categoryId}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h`;
  try {
    const { data, fetchedAt, fromCache, stale } = await cachedFetch(`cat_${categoryId}`, url, 5 * 60_000);
    return { data, meta: { source: "CoinGecko", fetchedAt, fromCache, stale, fallback: false } };
  } catch (e) {
    return { data: [], meta: { source: "CoinGecko", error: e.message, fallback: false } };
  }
}
