import { NewsCategoryKey } from "@/types/article";

export interface FeedSource {
  name: string;
  url: string;
}

const googleNews = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=de&gl=DE&ceid=DE:de`;

/**
 * RSS feed sources per news category. Mixes dedicated crypto/finance outlets
 * with Google News searches (which require no API key) so the "News Hunter"
 * works out of the box. NEWS_API_KEY / PERPLEXITY_API_KEY can be configured
 * for additional, broader coverage.
 */
export const NEWS_SOURCES: Record<NewsCategoryKey, FeedSource[]> = {
  XRP: [
    { name: "Google News: XRP & Ripple", url: googleNews("XRP Ripple") },
    { name: "CoinTelegraph: XRP", url: "https://cointelegraph.com/rss/tag/xrp" },
    { name: "Ripple Insights", url: "https://ripple.com/insights/feed/" },
    { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss/full/" },
    { name: "Google News: RLUSD & ODL", url: googleNews("RLUSD Ripple ODL Stablecoin") },
    {
      name: "Google News: SWIFT, ISO20022 & Banken",
      url: googleNews("Ripple SWIFT ISO20022 Banken institutionelle Adoption"),
    },
    { name: "Google News: XRP ETF & SEC", url: googleNews("XRP ETF SEC Verfahren") },
  ],
  BITCOIN: [
    { name: "Google News: Bitcoin", url: googleNews("Bitcoin Kurs") },
    { name: "CoinTelegraph: Bitcoin", url: "https://cointelegraph.com/rss/tag/bitcoin" },
    { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss/full/" },
    { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
    {
      name: "Google News: Bitcoin ETF & institutionelle Adoption",
      url: googleNews("Bitcoin ETF BlackRock Fidelity institutionelle Adoption"),
    },
  ],
  CRYPTO: [
    { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
    { name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
    { name: "Decrypt", url: "https://decrypt.co/feed" },
    { name: "Google News: Krypto", url: googleNews("Kryptowährungen") },
    {
      name: "Google News: Ethereum, Stablecoins & Tokenisierung",
      url: googleNews("Ethereum Stablecoins Tokenisierung CBDC Tether Circle"),
    },
    {
      name: "Google News: Börsen & institutionelle Adoption",
      url: googleNews("Coinbase Binance Kraken institutionelle Adoption Krypto"),
    },
  ],
  FINANCE: [
    { name: "Google News: Finanzen & Börse", url: googleNews("Finanzen Börse Aktien") },
    {
      name: "Handelsblatt Finanzen",
      url: "https://www.handelsblatt.com/contentexport/feed/finanzen",
    },
    { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex" },
    {
      name: "Google News: ETFs & Banken",
      url: googleNews("ETF Banken Vermögensverwaltung Fidelity BlackRock"),
    },
  ],
  MACRO: [
    {
      name: "Google News: Fed, EZB, Inflation",
      url: googleNews("Fed EZB Zinsen Inflation Wirtschaft"),
    },
    { name: "SEC Pressemitteilungen", url: "https://www.sec.gov/news/pressreleases.rss" },
    {
      name: "Google News: Makroökonomie",
      url: googleNews("Makroökonomie Konjunktur Weltwirtschaft"),
    },
    {
      name: "Google News: Banken & globale Wirtschaft",
      url: googleNews("Fed EZB Banken Economy Zentralbanken"),
    },
  ],
};

export const CATEGORY_LABELS: Record<NewsCategoryKey, string> = {
  XRP: "XRP",
  BITCOIN: "Bitcoin",
  CRYPTO: "Kryptowährungen",
  FINANCE: "Finanzen",
  MACRO: "Makroökonomie",
};
