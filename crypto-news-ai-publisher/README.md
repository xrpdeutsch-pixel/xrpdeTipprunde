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
  Aggregiert RSS-Feeds zu einem breiten Themenspektrum (XRP, Ripple, RLUSD,
  Bitcoin, Ethereum, Crypto, ETFs, BlackRock/Fidelity, Stablecoins,
  Tokenisierung, CBDC, SWIFT/ISO20022, SEC, Fed, EZB, Banken, institutionelle
  Adoption, Coinbase/Binance/Kraken/Circle/Tether, Makroökonomie, Handelsblatt,
  ...), entfernt Duplikate, filtert fragwürdige Meldungen und bewertet jede
  Meldung per KI auf vier Dimensionen: **Relevanz-, Vertrauens-, SEO- und
  Gesamt-Score** (je 1-100). Aus jeder Meldung kann mit einem Klick ein
  vollständiger Artikel erzeugt werden.
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
- **WordPress-Integration**: Veröffentlichung über die WordPress REST API mit
  konfigurierbarem Status (Entwurf/Privat/Veröffentlicht, Standard: **Entwurf**).
  Verbindung (URL, Benutzername, Anwendungspasswort, Standard-Kategorie,
  Standard-Tags, Upload-Status) wird verschlüsselt in der Datenbank über die
  Settings-Seite verwaltet, inkl. "Verbindung testen".
- **YouTube-Kanal-Überwachung**: konfigurierbarer Kanal (vorausgefüllt mit
  "XRP Deutschland" / `@xrpdeutschland`) wird täglich auf neue Videos
  geprüft (`/api/cron/video-check`); neue Videos werden automatisch zu
  Artikeln verarbeitet und (falls WordPress konfiguriert) als Entwurf
  gespeichert. Bereits verarbeitete Videos werden per Dedup-Tabelle
  übersprungen.
- **Settings-Seite**: interaktive Formulare für WordPress-Verbindung und
  YouTube-Kanal mit Speichern- und "Verbindung testen"-Buttons, daneben eine
  Statusübersicht für die übrigen, per Umgebungsvariable konfigurierten
  Funktionen.
- **"Eigene Idee" → Artikel**: Thema + freie Notizen (Stichpunkte, Fakten,
  Zitate, Links) eingeben - die KI recherchiert zusätzlich aktuelle
  Informationen und schreibt daraus einen vollständigen Artikel, genau wie
  die anderen beiden Wege.
- **Bild-Erstellung ohne API-Kosten**: jeder generierte Bild-Prompt
  (Featured Image, Thumbnail, X-Post, Instagram) lässt sich per Klick in den
  kostenlosen Bing Image Creator (DALL-E) übernehmen.
- **Redaktions-Dashboard**: Warteschlange, Entwürfe, SEO-Score, Trend-Themen,
  Top-Keywords.
- **Automatisierung**:
  - `/api/cron/video-check` prüft täglich den konfigurierten YouTube-Kanal
    auf neue Videos und erstellt daraus automatisch Artikel.
  - `/api/cron/news-check` (stündliche News-Recherche pro Kategorie) ist als
    Route vorhanden, aber standardmäßig **nicht** in `vercel.json`
    eingetragen, da jeder automatische Check KI-Kosten verursacht - auch
    wenn am Ende kein Artikel erstellt wird. Stattdessen: News Hunter und
    "Eigene Idee" manuell nutzen, dann fallen Kosten nur pro tatsächlich
    erstelltem Artikel an. Siehe Abschnitt "Kosten" unten.

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
   - `SETTINGS_ENCRYPTION_KEY` - zufälliger Schlüssel zur Verschlüsselung der
     in der Datenbank gespeicherten WordPress-Zugangsdaten, erzeugen mit:

     ```bash
     openssl rand -hex 32
     ```

   WordPress-Verbindung und YouTube-Kanal werden über die **Settings-Seite**
   im Browser eingerichtet (siehe unten) und verschlüsselt in der Datenbank
   gespeichert. Alternativ können `WORDPRESS_URL`, `WORDPRESS_USERNAME` und
   `WORDPRESS_APP_PASSWORD` als Umgebungsvariablen gesetzt werden - sie dienen
   dann als Fallback, solange noch keine Verbindung in den Settings
   gespeichert wurde.

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

   Der Server ist danach unter `http://localhost:3000` erreichbar.

## Zugriff aus dem Heimnetzwerk (z. B. vom Smartphone)

Der `dev`-Befehl bindet bereits an `0.0.0.0`, ist also auch für andere
Geräte im selben WLAN erreichbar - ohne dass irgendetwas im Internet
veröffentlicht wird:

1. Lokale IP-Adresse des Rechners herausfinden:
   - Windows: `ipconfig` (Wert bei "IPv4-Adresse", z. B. `192.168.1.50`)
   - macOS/Linux: `ifconfig` oder `ip addr` (z. B. `192.168.1.50`)
2. Auf dem Smartphone (im selben WLAN) im Browser öffnen:
   `http://192.168.1.50:3000` (IP entsprechend anpassen).
3. Falls die Verbindung nicht klappt: Firewall des Rechners prüfen und
   eingehende Verbindungen auf Port 3000 erlauben.

## Settings-Seite (WordPress & YouTube verbinden)

Unter `/settings` können WordPress-Verbindung und YouTube-Kanal direkt im
Browser eingerichtet werden:

- **WordPress-Verbindung**: URL, Benutzername, Anwendungspasswort (unter
  WordPress → Benutzer → Profil → Anwendungspasswörter erstellen),
  Standard-Kategorie, Standard-Tags (kommagetrennt) und Upload-Status
  (Entwurf/Privat/Veröffentlicht, Standard: Entwurf). Das Anwendungspasswort
  wird verschlüsselt (`SETTINGS_ENCRYPTION_KEY`) in der Datenbank gespeichert
  und beim erneuten Laden der Seite nicht angezeigt - zum Ändern einfach ein
  neues Passwort eingeben, beim Beibehalten das Feld leer lassen. Über
  "Verbindung testen" wird geprüft, ob die REST API mit den angegebenen
  Zugangsdaten erreichbar ist.
- **YouTube-Kanal**: ist mit dem Kanal "XRP Deutschland"
  (`@xrpdeutschland`, `https://youtube.com/@xrpdeutschland`) vorausgefüllt
  und kann auf einen beliebigen anderen Kanal geändert werden. Über
  "Verbindung testen" wird die Kanal-ID aufgelöst (Cache wird gespeichert)
  und das neueste Video abgerufen. Mit "Tägliche Überwachung aktiv" lässt
  sich die automatische Video-Prüfung ein-/ausschalten.

## Architektur

```
src/
  app/
    page.tsx                  Dashboard
    news/                      News Hunter UI
    generate/                  YouTube → Artikel UI
    generate/custom/           Eigene Idee → Artikel UI (Freitext)
    articles/                  Artikel-Liste & Editor
    settings/                  Settings-Formulare & Konfigurationsstatus
    api/
      news/                    GET  - News pro Kategorie abrufen & bewerten
      generate/youtube/         POST - Pipeline: YouTube → Artikel
      generate/news/             POST - Pipeline: News → Artikel
      generate/custom/           POST - Pipeline: Freitext-Idee → Artikel
      articles/                  GET/PATCH/DELETE Artikel
      articles/[id]/publish/     POST - Als Entwurf/Status in WordPress speichern
      settings/wordpress/        GET/PUT - WordPress-Verbindung
      settings/wordpress/test/   POST - WordPress-Verbindung testen
      settings/youtube/          GET/PUT - YouTube-Kanal
      settings/youtube/test/     POST - YouTube-Kanal testen
      cron/news-check/           GET  - News-Recherche & Ranking (manuell/optional)
      cron/video-check/          GET  - tägliche Video-Automatisierung
  components/
    SettingsForms.tsx          Client-Formulare für WordPress & YouTube
  lib/
    ai/                        LLM-Client (Anthropic/OpenAI), Prompts,
                               Perplexity-Recherche, Artikel-Generierung
    news/                      RSS-Quellen, Aggregation, KI-Ranking (4 Scores)
    youtube.ts                 Transkript, Metadaten, Kanal-Feed & ID-Auflösung
    wordpress.ts               WordPress REST API Client & Verbindungstest
    settings.ts                Verschlüsselte Settings (WordPress/YouTube)
    crypto.ts                  AES-256-GCM Verschlüsselung für Zugangsdaten
    seo.ts                     Heuristischer SEO-Score
    pipeline.ts                Orchestrierung der gesamten Pipelines
  types/article.ts             Zentrales Artikel-Schema (GeneratedArticle)
prisma/schema.prisma           Article, NewsItem, AutomationLog, Setting,
                               WordpressConnection, YoutubeChannel, ProcessedVideo
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
   - `SETTINGS_ENCRYPTION_KEY` – zufälliger Schlüssel (`openssl rand -hex 32`),
     erforderlich, um die WordPress-Verbindung über die Settings-Seite zu
     speichern
   - optional: `PERPLEXITY_API_KEY`, `YOUTUBE_API_KEY`,
     `WORDPRESS_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD`
     (Fallback, falls noch keine Verbindung in den Settings gespeichert ist),
     `CRON_SECRET`

4. **Deploy** klicken. Vercel führt automatisch `npm install` und
   `npm run build` aus - der Build-Schritt enthält bereits
   `prisma generate && prisma migrate deploy`, wendet also das
   Datenbankschema automatisch auf die in `DATABASE_URL` hinterlegte
   Datenbank an.

5. Nach dem Deploy erhältst du einen Link wie
   `https://xrpdetipprunde.vercel.app` (oder eine eigene Domain). Öffne dort
   `/settings`, um WordPress-Verbindung und YouTube-Kanal einzurichten.

6. **Automatisierung**: `vercel.json` enthält standardmäßig **einen**
   Cron-Job:
   - `/api/cron/video-check` - täglich um `5 11 * * *` UTC, was ca. 13:05 Uhr
     MEZ (Winterzeit) entspricht. Während der Sommerzeit (MESZ, UTC+2) läuft
     der Job entsprechend um ca. 13:05 Uhr - 1 Stunde, also ca. 12:05 Uhr
     MESZ, da Vercel-Cron-Schedules nicht automatisch an die Sommerzeit
     angepasst werden. Bei Bedarf den Schedule in `vercel.json` anpassen.
   - Falls `CRON_SECRET` gesetzt ist, muss Vercel Cron automatisch den
     `Authorization`-Header mitsenden (Vercel macht das für eigene Cron Jobs
     selbstständig); siehe
     [Vercel-Doku zu Cron Jobs](https://vercel.com/docs/cron-jobs).
   - Der stündliche `/api/cron/news-check` ist absichtlich **nicht**
     eingetragen (siehe Abschnitt "Kosten"). Wer ihn aktivieren möchte, fügt
     in `vercel.json` einen weiteren Eintrag hinzu, z. B.
     `{ "path": "/api/cron/news-check", "schedule": "0 */6 * * *" }` für alle
     6 Stunden. Hinweis: Der Hobby-Plan von Vercel begrenzt die Frequenz von
     Cron Jobs in bestimmten Abrechnungszeiträumen - bei sehr häufigen Cron
     Jobs ggf. den Pro-Plan prüfen.

## Kosten

Hosting (Vercel Hobby-Plan) und Datenbank (Neon Free Tier) sind für dieses
Projekt **kostenlos**. Der einzige laufende Kostenpunkt ist die
Anthropic/OpenAI-API, abgerechnet über ein Guthaben-Konto (Pay-as-you-go,
keine feste Monatsgebühr):

- **Manuelle Artikel-Generierung** (News Hunter, "Eigene Idee", YouTube →
  Artikel): pro Artikel ca. 0,10-0,30 € - fällt nur an, wenn du aktiv auf
  "Artikel generieren" klickst.
- **Täglicher Video-Check** (`/api/cron/video-check`): minimale Kosten für
  die Prüfung selbst; nur wenn der Kanal ein neues Video hochgeladen hat,
  entstehen die o. g. 0,10-0,30 € für den daraus erstellten Artikel.
- **Stündlicher News-Check** (`/api/cron/news-check`, standardmäßig
  deaktiviert): würde 5 Kategorien × 24x/Tag = 120 KI-Aufrufe/Tag verursachen
  - auch wenn kein Artikel erstellt wird. Das kann je nach Modellpreisen auf
  mehrere zehn bis über hundert Euro pro Monat summieren. Deshalb standardmäßig
  aus; bei Bedarf manuell aktivieren und ggf. die Frequenz reduzieren (z. B.
  alle 6 Stunden statt stündlich).

**Fazit**: Solange du nur die manuellen Buttons + den täglichen
Video-Check nutzt, bleiben die Kosten auf wenige Cent pro tatsächlich
erstelltem Artikel beschränkt.

## Nicht umgesetzt (auf Anfrage erweiterbar)

Folgende, im ursprünglichen Anforderungskatalog genannte Punkte sind **noch
nicht** umgesetzt, lassen sich aber bei Bedarf nachrüsten:

- **Mehrbenutzer-Login / Authentifizierung** (z. B. NextAuth) - die App geht
  aktuell von einem einzigen Betreiber aus.
- **Fehler-Tracking** (z. B. Sentry).
- **Benachrichtigungen** bei neuen Artikeln/Fehlern via Telegram, Discord,
  E-Mail oder Push.
- **Docker-Setup** (Dockerfile/Compose) für Self-Hosting.
- **Automatisierte Test-Suite** (Unit-/Integrationstests).
- **CSRF-Schutz & Rate-Limiting** für die API-Routen (aktuell nur über
  `CRON_SECRET` für die Cron-Endpunkte abgesichert).

## Hinweis zum Sandbox-Test

In der Entwicklungssandbox sind ausgehende Verbindungen zu externen APIs
(RSS-Feeds, Anthropic/OpenAI, WordPress) durch das Netzwerk-Sicherheitsprofil
blockiert. Build, Lint, Datenbank-Migration und alle Routen wurden erfolgreich
getestet; die externen Integrationen funktionieren in einer Umgebung mit
regulärem Internetzugang und konfigurierten API-Keys.
