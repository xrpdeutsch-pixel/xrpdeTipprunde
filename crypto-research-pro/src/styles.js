// ── Gemeinsame Styles (Dark-Theme im Look der XRP Deutschland Community) ──
export const S = {
  root: { minHeight: "100vh", background: "#04080f", color: "#dde5f0", position: "relative", overflowX: "hidden" },
  bgGlow1: { position: "fixed", top: "-20%", left: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,80,40,.18) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  bgGlow2: { position: "fixed", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,40,120,.15) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 },

  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(4,8,15,.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.07)" },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  brand: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  brandName: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, color: "#fff" },
  brandSub: { fontSize: 10, color: "#00d084", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" },
  nav: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  navBtn: { padding: "8px 14px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6, color: "#8a9ab0", fontSize: 13, fontWeight: 600 },
  navBtnOn: { color: "#fff", border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.05)" },

  main: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px", display: "flex", flexDirection: "column", gap: 24 },

  h1: { fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,6vw,64px)", letterSpacing: 4, color: "#fff", lineHeight: 1.05 },
  h2: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2, color: "#fff" },
  h3: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1.5, color: "#fff" },
  sub: { fontSize: 14, color: "#7a8fa8", lineHeight: 1.6 },

  card: { background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 },

  searchRow: { display: "flex", gap: 8, position: "relative" },
  searchInput: { flex: 1, padding: "12px 16px", fontSize: 15, borderRadius: 10 },
  searchResults: { position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0a0f1e", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, zIndex: 50, maxHeight: 360, overflowY: "auto", boxShadow: "0 12px 30px rgba(0,0,0,.5)" },
  searchResultRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,.05)" },

  sourceTag: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5a6a7a", padding: "4px 10px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 99, flexWrap: "wrap" },
  sourceTagWarn: { color: "#f0c040", border: "1px solid rgba(240,192,64,.3)", background: "rgba(240,192,64,.08)" },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thRow: { textAlign: "left", color: "#5a6a7a", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  th: { padding: "8px 10px", fontWeight: 700 },
  td: { padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,.05)", verticalAlign: "middle" },
  rowHover: { cursor: "pointer" },
  coinNameCell: { display: "flex", alignItems: "center", gap: 10, fontWeight: 700 },
  coinIcon: { width: 24, height: 24, borderRadius: "50%" },
  symbolBadge: { fontSize: 11, color: "#7a8fa8", textTransform: "uppercase", fontWeight: 600 },

  pillRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: { fontSize: 12, padding: "4px 12px", borderRadius: 99, fontWeight: 700, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#aab8cc" },
  pillGreen: { background: "rgba(0,208,132,.12)", border: "1px solid rgba(0,208,132,.3)", color: "#00d084" },
  pillYellow: { background: "rgba(240,192,64,.12)", border: "1px solid rgba(240,192,64,.3)", color: "#f0c040" },
  pillRed: { background: "rgba(255,80,80,.12)", border: "1px solid rgba(255,80,80,.3)", color: "#ff6b6b" },
  pillBlue: { background: "rgba(100,180,255,.12)", border: "1px solid rgba(100,180,255,.3)", color: "#6ab4ff" },
  pillPurple: { background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.35)", color: "#a78bfa" },
  pillGray: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#5a6a7a" },

  btn: { padding: "10px 20px", background: "#00d084", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 800 },
  btnGhost: { padding: "9px 18px", background: "transparent", color: "#dde5f0", border: "1px solid rgba(255,255,255,.18)", borderRadius: 8, fontSize: 13, fontWeight: 700 },
  btnSmall: { padding: "6px 12px", fontSize: 12, borderRadius: 6, background: "rgba(255,255,255,.06)", color: "#dde5f0", border: "1px solid rgba(255,255,255,.1)", fontWeight: 700 },
  btnDanger: { background: "rgba(255,80,80,.12)", border: "1px solid rgba(255,80,80,.3)", color: "#ff6b6b" },
  btnStarOn: { background: "rgba(240,192,64,.15)", border: "1px solid rgba(240,192,64,.35)", color: "#f0c040" },

  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 },
  statBox: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  statLabel: { fontSize: 11, color: "#7a8fa8", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 },
  statValue: { fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 },

  flagRow: { display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.05)" },
  flagDot: { width: 10, height: 10, borderRadius: "50%", marginTop: 5, flexShrink: 0 },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  linkChip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", color: "#dde5f0" },

  emptyState: { textAlign: "center", padding: "60px 20px", color: "#7a8fa8" },

  footer: { position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", textAlign: "center", fontSize: 12, color: "#5a6a7a", lineHeight: 1.7 },

  loadingBar: { fontSize: 13, color: "#7a8fa8", padding: "20px 0" },
  errorBox: { padding: "14px 18px", background: "rgba(255,80,80,.08)", border: "1px solid rgba(255,80,80,.25)", borderRadius: 10, fontSize: 13, color: "#ff8a8a" },
};
