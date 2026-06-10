import { S } from "../styles.js";
import { getRedFlags, getUnavailableChecks } from "../lib/analysis.js";

const STATUS = {
  ok: { color: "#00d084", label: "OK" },
  warn: { color: "#f0c040", label: "Warnung" },
  risk: { color: "#ff6b6b", label: "Risiko" },
  unknown: { color: "#5a6a7a", label: "Keine Daten" },
};

export default function RedFlagPanel({ coin }) {
  const flags = getRedFlags(coin);
  const unavailable = getUnavailableChecks();
  const riskCount = flags.filter((f) => f.status === "risk").length;
  const warnCount = flags.filter((f) => f.status === "warn").length;

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 style={S.h3}>🚩 Red-Flag-Scanner</h2>
        <span style={{ ...S.pill, ...(riskCount ? S.pillRed : warnCount ? S.pillYellow : S.pillGreen) }}>
          {riskCount ? `${riskCount} Risiko-Signal(e)` : warnCount ? `${warnCount} Warnung(en)` : "Keine Auffälligkeiten"}
        </span>
      </div>
      <p style={S.sub}>Automatische Prüfung anhand öffentlicher Marktdaten (CoinGecko). Keine Anlageberatung.</p>

      {flags.map((f) => (
        <div key={f.id} style={S.flagRow}>
          <span style={{ ...S.flagDot, background: STATUS[f.status].color }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e8edf5" }}>
              {f.label} <span style={{ fontWeight: 600, fontSize: 11, color: STATUS[f.status].color }}>· {STATUS[f.status].label}</span>
            </div>
            <div style={{ fontSize: 13, color: "#aab8cc", marginTop: 2 }}>{f.detail}</div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <h3 style={{ ...S.h3, fontSize: 14, marginBottom: 8 }}>Nicht prüfbar mit kostenlosen Daten</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {unavailable.map((u) => (
            <div key={u.label} style={S.flagRow}>
              <span style={{ ...S.flagDot, background: "#3a4a5a" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#aab8cc" }}>{u.label}</div>
                <div style={{ fontSize: 12, color: "#5a6a7a", marginTop: 2 }}>{u.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
