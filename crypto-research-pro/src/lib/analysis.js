// ── Analyse-Logik (alles client-seitig, basierend auf kostenlosen Daten) ──
// WICHTIG: Alle Bewertungen hier sind automatisch generierte Heuristiken auf
// Basis öffentlicher Marktdaten. Sie ersetzen keine eigene Recherche und
// stellen keine Anlageberatung dar.

// ── Narrative / Markt-Erzählungen ──────────────────────────────────────────
export const NARRATIVES = [
  { key: "ai", label: "AI", icon: "🤖", match: ["artificial intelligence", "ai agent", "ai-agent", " ai)"] },
  { key: "rwa", label: "RWA", icon: "🏦", match: ["real world assets", "rwa"] },
  { key: "payments", label: "Payments", icon: "💸", match: ["payment", "payments"] },
  { key: "defi", label: "DeFi", icon: "🏛️", match: ["decentralized finance", "defi"] },
  { key: "gaming", label: "Gaming", icon: "🎮", match: ["gaming", "gamefi", "metaverse", "play to earn", "play-to-earn"] },
  { key: "l1", label: "Layer 1", icon: "⛓️", match: ["layer 1", "smart contract platform"] },
  { key: "l2", label: "Layer 2", icon: "🧱", match: ["layer 2", "scaling"] },
  { key: "stablecoin", label: "Stablecoins", icon: "💵", match: ["stablecoin"] },
  { key: "interop", label: "Interoperability", icon: "🔗", match: ["interoperability", "cross-chain", "bridge"] },
  { key: "meme", label: "Meme", icon: "🐶", match: ["meme"] },
  { key: "institutional", label: "Institutional Adoption", icon: "🏢", match: ["institutional", "real world", "tokenized"] },
];

export function getNarratives(categories = []) {
  const lower = categories.filter(Boolean).map((c) => c.toLowerCase());
  return NARRATIVES.filter((n) => n.match.some((m) => lower.some((c) => c.includes(m))));
}

// ── Red-Flag-Scanner (nur mit kostenlosen Marktdaten prüfbar) ─────────────
// status: "ok" | "warn" | "risk" | "unknown"
export function getRedFlags(coin) {
  const md = coin.market_data || {};
  const flags = [];

  // 1. Liquidität: 24h-Volumen im Verhältnis zur Marktkapitalisierung
  const vol = md.total_volume?.eur;
  const mcap = md.market_cap?.eur;
  const liqRatio = mcap ? vol / mcap : null;
  flags.push({
    id: "liquidity",
    label: "Liquidität (24h-Volumen / Marktkap.)",
    status: liqRatio == null ? "unknown" : liqRatio < 0.005 ? "risk" : liqRatio < 0.02 ? "warn" : "ok",
    detail:
      liqRatio == null
        ? "Keine ausreichenden Daten verfügbar."
        : `24h-Handelsvolumen entspricht ${(liqRatio * 100).toFixed(2)} % der Marktkapitalisierung.${
            liqRatio < 0.005 ? " Sehr niedrig – hohes Risiko für starke Kursausschläge bei größeren Orders." : ""
          }`,
  });

  // 2. GitHub-Aktivität (Entwicklung)
  const commits = coin.developer_data?.commit_count_4_weeks;
  const repos = coin.links?.repos_url?.github || [];
  flags.push({
    id: "dev_activity",
    label: "Entwickler-Aktivität (GitHub, 4 Wochen)",
    status: repos.length === 0 ? "warn" : commits == null ? "unknown" : commits === 0 ? "risk" : commits < 10 ? "warn" : "ok",
    detail:
      repos.length === 0
        ? "Kein öffentliches GitHub-Repository verlinkt – Entwicklung kann nicht eingesehen werden."
        : commits == null
        ? "Keine Commit-Daten verfügbar."
        : `${commits} Commits in den letzten 4 Wochen.${commits === 0 ? " Keine sichtbare Entwicklungsaktivität – möglicherweise verlassenes Projekt." : ""}`,
  });

  // 3. Tokenomics-Transparenz (Supply-Daten vorhanden & konsistent)
  const circ = md.circulating_supply;
  const total = md.total_supply;
  const max = md.max_supply;
  let tokenomicsStatus = "ok";
  let tokenomicsDetail = "Angebotsdaten (Circulating/Total/Max Supply) sind vollständig verfügbar.";
  if (circ == null) {
    tokenomicsStatus = "warn";
    tokenomicsDetail = "Circulating Supply nicht verfügbar – Tokenomics schwer einschätzbar.";
  } else if (max != null && circ / max < 0.5) {
    tokenomicsStatus = "warn";
    tokenomicsDetail = `Nur ${((circ / max) * 100).toFixed(1)} % der maximalen Token-Menge im Umlauf – künftige Freigaben (Unlocks) können Verkaufsdruck erzeugen.`;
  } else if (max == null && total == null) {
    tokenomicsStatus = "warn";
    tokenomicsDetail = "Weder maximale noch totale Token-Menge angegeben – unbegrenztes Angebot möglich (inflationär).";
  }
  flags.push({ id: "tokenomics", label: "Tokenomics-Transparenz", status: tokenomicsStatus, detail: tokenomicsDetail });

  // 4. Abstand zum Allzeithoch (Volatilitäts-/Risiko-Hinweis)
  const athChange = md.ath_change_percentage?.eur;
  flags.push({
    id: "ath_distance",
    label: "Abstand zum Allzeithoch",
    status: athChange == null ? "unknown" : athChange < -90 ? "warn" : "ok",
    detail:
      athChange == null
        ? "Keine ATH-Daten verfügbar."
        : `Aktueller Kurs liegt ${athChange.toFixed(1)} % unter dem Allzeithoch vom ${formatShortDate(md.ath_date?.eur)}.${
            athChange < -90 ? " Extrem hoher Abstand – starkes Vertrauen der Anleger nötig für Erholung." : ""
          }`,
  });

  // 5. Marktkapitalisierungs-Rang (Größe / Etabliertheit)
  const rank = md.market_cap_rank;
  flags.push({
    id: "mcap_rank",
    label: "Marktkapitalisierungs-Rang (Größenrisiko)",
    status: rank == null ? "unknown" : rank > 500 ? "risk" : rank > 150 ? "warn" : "ok",
    detail:
      rank == null
        ? "Coin nicht im Marktkap.-Ranking gelistet – sehr kleines/illiquides Projekt."
        : `Marktkapitalisierungs-Rang #${rank}.${rank > 500 ? " Micro-Cap – überdurchschnittliches Risiko und Volatilität." : rank > 150 ? " Mid-/Small-Cap – erhöhtes Risiko gegenüber Top-Projekten." : ""}`,
  });

  // 6. Community-Aktivität (Reddit/Twitter)
  const cd = coin.community_data || {};
  const twitter = cd.twitter_followers;
  const reddit = cd.reddit_subscribers;
  const hasCommunity = (twitter && twitter > 0) || (reddit && reddit > 0);
  flags.push({
    id: "community",
    label: "Community-Reichweite",
    status: !hasCommunity ? "warn" : "ok",
    detail: !hasCommunity
      ? "Keine messbare Social-Media-Reichweite (Twitter/Reddit) über öffentliche Daten gefunden."
      : `Twitter/X: ${twitter != null ? formatThousands(twitter) : "k.A."} Follower, Reddit: ${reddit != null ? formatThousands(reddit) : "k.A."} Mitglieder.`,
  });

  return flags;
}

// Prüfungen, die eine kostenlose API NICHT abdecken kann – transparent ausweisen
export function getUnavailableChecks() {
  return [
    {
      label: "Token-Konzentration / Whale-Wallets",
      reason: "Erfordert On-Chain-Analyse (z. B. Etherscan Pro, Nansen, Arkham) – kostenpflichtig.",
    },
    {
      label: "Anonyme Teams",
      reason: "Strukturierte Team-/KYC-Daten sind über kostenlose Markt-APIs nicht verfügbar.",
    },
    {
      label: "Unrealistische Renditeversprechen",
      reason: "Erfordert Auswertung von Marketing-/Social-Media-Texten per KI/NLP.",
    },
    {
      label: "Plötzliche Wallet-Bewegungen / Exchange-Flows",
      reason: "Erfordert kostenpflichtige On-Chain-Tracking-APIs.",
    },
    {
      label: "Regulatorische Meldungen (SEC/CFTC/MiCA/EU)",
      reason: "Erfordert Anbindung an Regulierungs-Datenbanken und News-APIs.",
    },
    {
      label: "Unlock- & Vesting-Kalender",
      reason: "Erfordert spezialisierte Tokenomics-Datenanbieter (z. B. Token Unlocks, Tokenomist) – kostenpflichtig/ohne offene API.",
    },
  ];
}

// ── Bull-Case / Bear-Case (automatisch generierte Beobachtungen) ─────────
export function getBullBearCase(coin, narratives) {
  const md = coin.market_data || {};
  const dev = coin.developer_data || {};
  const bull = [];
  const bear = [];

  const rank = md.market_cap_rank;
  if (rank != null) {
    if (rank <= 20) bull.push(`Top-${rank}-Projekt nach Marktkapitalisierung – hohe Etabliertheit und Liquidität.`);
    else if (rank > 500) bear.push(`Marktkapitalisierungs-Rang #${rank} – Micro-Cap mit entsprechend hohem Risiko.`);
  }

  const chg24 = md.price_change_percentage_24h_in_currency?.eur ?? md.price_change_percentage_24h;
  const chg7d = md.price_change_percentage_7d_in_currency?.eur;
  const chg30d = md.price_change_percentage_30d_in_currency?.eur;
  if (chg7d != null) {
    if (chg7d > 5) bull.push(`Positiver Kurzfristtrend: +${chg7d.toFixed(1)} % in den letzten 7 Tagen.`);
    if (chg7d < -10) bear.push(`Negativer Kurzfristtrend: ${chg7d.toFixed(1)} % in den letzten 7 Tagen.`);
  }
  if (chg30d != null) {
    if (chg30d > 15) bull.push(`Starkes Momentum über 30 Tage: +${chg30d.toFixed(1)} %.`);
    if (chg30d < -25) bear.push(`Deutlicher Abwärtstrend über 30 Tage: ${chg30d.toFixed(1)} %.`);
  }
  if (chg24 != null && chg24 < -5 && (chg7d == null || chg7d >= -10)) {
    bear.push(`Kurzfristig negative 24h-Bewegung: ${chg24.toFixed(1)} %.`);
  }

  const athChange = md.ath_change_percentage?.eur;
  if (athChange != null) {
    if (athChange < -70) bull.push(`Erholungspotenzial: Kurs liegt ${Math.abs(athChange).toFixed(0)} % unter dem Allzeithoch – signifikanter Spielraum bei Trendwende.`);
    if (athChange > -20) bear.push(`Kurs nahe am Allzeithoch (${athChange.toFixed(1)} %) – begrenztes kurzfristiges Aufwärtspotenzial, höheres Rückschlagrisiko.`);
  }

  const commits = dev.commit_count_4_weeks;
  if (commits != null) {
    if (commits > 20) bull.push(`Sehr aktive Entwicklung: ${commits} GitHub-Commits in den letzten 4 Wochen.`);
    if (commits === 0) bear.push("Keine GitHub-Commits in den letzten 4 Wochen – Entwicklung wirkt inaktiv.");
  }

  const circ = md.circulating_supply;
  const max = md.max_supply;
  if (max != null && circ != null) {
    const ratio = circ / max;
    if (ratio < 0.5) bear.push(`Erst ${(ratio * 100).toFixed(0)} % der maximalen Token-Menge im Umlauf – künftige Unlocks könnten Verkaufsdruck erzeugen.`);
    if (ratio > 0.95) bull.push("Nahezu vollständig zirkulierendes Angebot – kein nennenswerter Verwässerungsdruck durch neue Emissionen.");
  } else if (max == null) {
    bear.push("Kein Maximalangebot definiert (potenziell unbegrenzte Inflation).");
  }

  if (narratives?.length) {
    const labels = narratives.map((n) => n.label).join(", ");
    bull.push(`Profitiert vom aktuellen Markt-Narrativ: ${labels}.`);
  } else {
    bear.push("Keinem der aktuell stark gehandelten Markt-Narrative eindeutig zuordenbar – ggf. weniger Aufmerksamkeit von Investoren.");
  }

  if (bull.length === 0) bull.push("Keine eindeutigen positiven Signale in den verfügbaren Marktdaten erkennbar.");
  if (bear.length === 0) bear.push("Keine eindeutigen Risikosignale in den verfügbaren Marktdaten erkennbar.");

  return { bull, bear };
}

// ── Hype- / Manipulations-Hinweis (sehr grobe Heuristik) ───────────────────
export function getHypeSignal(coin) {
  const md = coin.market_data || {};
  const cd = coin.community_data || {};
  const dev = coin.developer_data || {};
  const chg24 = md.price_change_percentage_24h_in_currency?.eur ?? md.price_change_percentage_24h;
  const vol = md.total_volume?.eur;
  const mcap = md.market_cap?.eur;
  const liqRatio = mcap ? vol / mcap : null;
  const commits = dev.commit_count_4_weeks;
  const social = (cd.twitter_followers || 0) + (cd.reddit_subscribers || 0) * 2;

  const signals = [];
  if (chg24 != null && Math.abs(chg24) > 20) {
    signals.push(`Sehr starke 24h-Kursbewegung (${chg24.toFixed(1)} %) – kann auf News, aber auch auf koordinierten Hype/Pump hindeuten.`);
  }
  if (liqRatio != null && liqRatio > 0.5) {
    signals.push("Außergewöhnlich hohes Handelsvolumen im Verhältnis zur Marktkapitalisierung – ungewöhnliche Aktivität.");
  }
  if ((commits == null || commits === 0) && social > 50000 && chg24 != null && chg24 > 10) {
    signals.push("Starke Kursbewegung & große Social-Reichweite bei gleichzeitig fehlender Entwicklungsaktivität – mögliches Hype-getriebenes Bewegungsmuster statt fundamentaler News.");
  }

  let level = "neutral";
  if (signals.length >= 2) level = "high";
  else if (signals.length === 1) level = "medium";

  return { level, signals };
}

function formatShortDate(d) {
  if (!d) return "k.A.";
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(d));
  } catch {
    return "k.A.";
  }
}

function formatThousands(n) {
  return new Intl.NumberFormat("de-DE").format(n);
}
