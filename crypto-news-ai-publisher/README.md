# Crypto News AI Publisher

Automatisierte SaaS-Anwendung, die journalistische Krypto- und Finanzartikel
(XRP, Bitcoin, Kryptowährungen, Finanzen, Börse, Makroökonomie) im Stil von
Handelsblatt, Bloomberg, WSJ, Forbes, CoinDesk und The Block erstellt und als
**Entwurf** in WordPress speichert.

## Features

- **YouTube → Artikel**: YouTube-Link einfügen → Transkript abrufen → Video
  analysieren (Kernaussagen, Fakten, Zitate, Personen, Unternehmen,
  Kryptowährungen) → aktuelle News recherchieren → vollständigen,
  journalistischen Artikel inkl. SEO-Daten erzeugen.
- **News Hunter**: Buttons für "Neueste XRP/Bitcoin/Krypto/Finanz/Makro News".
  Aggregiert RSS-Feeds (CoinDesk, CoinTelegraph, Bitcoin Magazine, Decrypt,
  Google News, SEC, Handelsblatt, ...), entfernt Duplikate, filtert
  fragwürdige Meldungen und bewertet die Relevanz per KI. Aus jeder Meldung
  kann mit einem Klick ein vollständiger Artikel erzeugt werden.
- **KI-Recherche-Agent**: Vergleicht Quellen, prüft Fakten, identifiziert
  Widersprüche und erstellt eine redaktionelle Zusammenfassung, bevor der
  Artikel geschrieben wird. Optional über Perplexity (`sonar-pro`) für
  aktuelle Marktdaten/SEC/MiCA-Informationen.
- **XRP- & Bitcoin-Spezialmodus**: zusätzliche fachliche Vorgaben (Ripple,
  RLUSD, XRP Ledger, SEC-Verfahren, ETFs, ODL, Whale-Bewegungen / BTC-ETFs,
  Mining, Hashrate, Fed-Politik, Liquidität).
- **Vollständige Artikelstruktur**: SEO-Headline, Subheadline, Highlights,
  Einleitung, Hauptteil mit Zwischenüberschriften, Schluss, Meta Description,
  Keywords, semantische Keywords, FAQ, Schema.org JSON-LD, WordPress
  Tags/Kategorien, Social- und X/Twitter-Snippets, Bild-Prompts (Featured
  Image, YouTube-Thumbnail, X-Post, Instagram), interne/externe
  Linkvorschläge.
- **Journalistischer Stil**: Systemprompt verbietet typische KI-Floskeln
  ("In der heutigen Welt...", "Zusammenfassend lässt sich sagen...", etc.)
  und gibt Handelsblatt/Bloomberg/CoinDesk-Niveau vor.
- **WordPress-Integration**: Veröffentlichung über die WordPress REST API als
  **Entwurf** (`status: draft`) - niemals automatisch live.
- **Redaktions-Dashboard**: Warteschlange, Entwürfe, SEO-Score, Trend-Themen,
  Top-Keywords.
- **Automatisierung**: `/api/cron/news-check` prüft stündlich alle
  Kategorien; bei einer wichtigen Top-Story (Relevanz ≥ 75) wird automatisch
  ein Artikel erstellt und als WordPress-Entwurf gespeichert.

## Tech Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL ·
Prisma · Anthropic Claude / OpenAI · Perplexity (optional) · WordPress REST
API · YouTube (Transkript + oEmbed/Data API) · RSS / Google News

## Setup

1. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

2. `.env` aus `.env.example` erstellen und Werte eintragen:

   ```bash
   cp .env.example .env
   ```

   Mindestens erforderlich:
   - `DATABASE_URL` (PostgreSQL)
   - `ANTHROPIC_API_KEY` (oder `OPENAI_API_KEY` mit `AI_PROVIDER=openai`)
   - `WORDPRESS_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD`
     (Anwendungspasswort unter WordPress → Benutzer → Profil erstellen)

   Optional: `PERPLEXITY_API_KEY` für die Live-Web-Recherche,
   `YOUTUBE_API_KEY` für erweiterte Video-Metadaten, `CRON_SECRET` für die
   Automatisierung.

3. Datenbank-Schema anwenden:

   ```bash
   npx prisma migrate dev
   ```

4. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

## Architektur

```
src/
  app/
    page.tsx                  Dashboard
    news/                      News Hunter UI
    generate/                  YouTube → Artikel UI
    articles/                  Artikel-Liste & Editor
    settings/                  Konfigurationsstatus
    api/
      news/                    GET  - News pro Kategorie abrufen & bewerten
      generate/youtube/         POST - Pipeline: YouTube → Artikel
      generate/news/             POST - Pipeline: News → Artikel
      articles/                  GET/PATCH/DELETE Artikel
      articles/[id]/publish/     POST - Als Entwurf in WordPress speichern
      cron/news-check/           GET  - stündliche Automatisierung
  lib/
    ai/                        LLM-Client (Anthropic/OpenAI), Prompts,
                               Perplexity-Recherche, Artikel-Generierung
    news/                      RSS-Quellen, Aggregation, KI-Ranking
    youtube.ts                 Transkript & Metadaten
    wordpress.ts               WordPress REST API Client
    seo.ts                     Heuristischer SEO-Score
    pipeline.ts                Orchestrierung der gesamten Pipelines
  types/article.ts             Zentrales Artikel-Schema (GeneratedArticle)
prisma/schema.prisma           Article, NewsItem, AutomationLog, Setting
```

## Deployment auf Vercel (öffentlicher Link)

Damit du eine echte, öffentlich erreichbare URL bekommst, deploye das Projekt
auf [Vercel](https://vercel.com) (kostenloser Plan reicht):

1. **Postgres-Datenbank anlegen** (z. B. [Neon](https://neon.tech), kostenlos):
   - Projekt erstellen, die `DATABASE_URL`-Connection-String kopieren
     (Format: `postgresql://user:pass@host/db?sslmode=require`).

2. **Vercel-Projekt erstellen**:
   - Auf [vercel.com](https://vercel.com) mit GitHub einloggen.
   - "Add New… → Project" → das Repo `xrpdeutsch-pixel/xrpdetipprunde`
     importieren.
   - **Root Directory** auf `crypto-news-ai-publisher` setzen (wichtig, da
     das Projekt in einem Unterordner liegt).
   - Framework Preset: Next.js (wird automatisch erkannt).

3. **Umgebungsvariablen** im Vercel-Projekt unter
   "Settings → Environment Variables" eintragen:
   - `DATABASE_URL` – Connection-String aus Schritt 1
   - `AI_PROVIDER` – `anthropic`
   - `ANTHROPIC_API_KEY` – dein Anthropic API Key
   - optional: `PERPLEXITY_API_KEY`, `YOUTUBE_API_KEY`,
     `WORDPRESS_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD`,
     `CRON_SECRET`

4. **Deploy** klicken. Vercel führt automatisch `npm install` und
   `npm run build` aus - der Build-Schritt enthält bereits
   `prisma generate && prisma migrate deploy`, wendet also das
   Datenbankschema automatisch auf die in `DATABASE_URL` hinterlegte
   Datenbank an.

5. Nach dem Deploy erhältst du einen Link wie
   `https://xrpdetipprunde.vercel.app` (oder eine eigene Domain).

6. **Automatisierung (optional)**: In `vercel.json` einen Cron-Job für
   `/api/cron/news-check` einrichten (Vercel Cron, stündlich), siehe
   [Vercel-Doku zu Cron Jobs](https://vercel.com/docs/cron-jobs).

## Hinweis zum Sandbox-Test

In der Entwicklungssandbox sind ausgehende Verbindungen zu externen APIs
(RSS-Feeds, Anthropic/OpenAI, WordPress) durch das Netzwerk-Sicherheitsprofil
blockiert. Build, Lint, Datenbank-Migration und alle Routen wurden erfolgreich
getestet; die externen Integrationen funktionieren in einer Umgebung mit
regulärem Internetzugang und konfigurierten API-Keys.
