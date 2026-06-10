import { S } from "../styles.js";
import { getBullBearCase, getHypeSignal } from "../lib/analysis.js";

const HYPE_LABEL = {
  neutral: { label: "Unauffällig", style: S.pillGreen },
  medium: { label: "Erhöhte Aufmerksamkeit", style: S.pillYellow },
  high: { label: "Mögliches Hype-Muster", style: S.pillRed },
};

export default function BullBearPanel({ coin, narratives }) {
  const { bull, bear } = getBullBearCase(coin, narratives);
  const hype = getHypeSignal(coin);

  return (
    <div style={S.card}>
      <h2 style={S.h3}>⚖️ Bull-Case / Bear-Case</h2>
      <p style={S.sub}>
        Automatisch generierte Beobachtungen auf Basis aktueller Marktdaten – kein Kursziel, keine Empfehlung.
        „Was müsste passieren, damit der Coin steigt / scheitert?“
      </p>
      <div style={S.twoCol}>
        <div>
          <h3 style={{ ...S.h3, color: "#00d084", fontSize: 15, marginBottom: 8 }}>📈 Bull-Case</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 18, fontSize: 13, color: "#aab8cc", lineHeight: 1.5 }}>
            {bull.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 style={{ ...S.h3, color: "#ff6b6b", fontSize: 15, marginBottom: 8 }}>📉 Bear-Case</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 18, fontSize: 13, color: "#aab8cc", lineHeight: 1.5 }}>
            {bear.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ ...S.h3, fontSize: 14 }}>🔍 Manipulations- &amp; Hype-Indikator</h3>
          <span style={{ ...S.pill, ...HYPE_LABEL[hype.level].style }}>{HYPE_LABEL[hype.level].label}</span>
        </div>
        {hype.signals.length > 0 ? (
          <ul style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18, fontSize: 13, color: "#aab8cc" }}>
            {hype.signals.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <p style={{ ...S.sub, marginTop: 8 }}>Keine ungewöhnlichen Muster in Kurs/Volumen/Entwicklung erkannt.</p>
        )}
        <p style={{ ...S.sub, marginTop: 8, fontSize: 11 }}>
          Basiert nur auf Kurs-, Volumen- und GitHub-Daten. Eine echte Hype-/Influencer-Erkennung erfordert
          Social-Media- &amp; News-Analyse per KI (kostenpflichtig, hier nicht enthalten).
        </p>
      </div>
    </div>
  );
}
