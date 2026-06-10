# Crypto Research Pro

Eigenständige React/Vite-App für Live-Krypto-Kurse, Coin-Recherche und eine
lokale Watchlist – auf Basis kostenloser, öffentlicher APIs.

## Features

- **Live-Kurse & Marktübersicht**: Top 50 Coins, globale Marktdaten und
  Trending-Coins von der CoinGecko Public API. Bei jeder Datenanzeige werden
  Quelle, Zeitstempel der letzten Aktualisierung und ggf. eine Fallback-Quelle
  (CryptoCompare) angezeigt.
- **Coin-Detailseite**: Kursdaten, Marktkapitalisierung, Supply (Circulating /
  Total / Max), ATH/ATL, Top-Handelsplätze, offizielle Links (Website,
  Whitepaper, GitHub, X/Twitter, Reddit, Telegram, Block-Explorer).
- **Narrative-Analyse**: Ordnet einen Coin automatisch aktuellen
  Markt-Narrativen zu (AI, RWA, DeFi, Gaming, Layer 1/2, Stablecoins, Meme, …)
  basierend auf den CoinGecko-Kategorien.
- **Red-Flag-Scanner**: Automatische Heuristiken zu Liquidität,
  GitHub-Aktivität, Tokenomics-Transparenz, Marktkap.-Rang und
  Community-Reichweite – inkl. transparenter Liste, was mit kostenlosen Daten
  *nicht* geprüft werden kann (Whale-Wallets, Team-Anonymität,
  Regulierungs-News, Unlock-Kalender etc.).
- **Bull-Case / Bear-Case**: Automatisch generierte Pro-/Contra-Beobachtungen
  sowie ein einfacher Hype-/Manipulations-Indikator.
- **Konkurrenz-Vergleich**: Vergleich mit anderen Projekten derselben
  CoinGecko-Kategorie.
- **Watchlist**: Lokal im Browser gespeichert (kein Login nötig), mit
  Live-Kurs-Updates.

Alle Analysen sind automatisch generierte Heuristiken auf Basis öffentlicher
Marktdaten und stellen **keine Anlageberatung** dar.

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
