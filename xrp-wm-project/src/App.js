import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   SUPABASE CONFIG
   ═══════════════════════════════════════════════════════════════════ */
const SUPABASE_URL = "https://ymwaobletazkijmzbtiy.supabase.co";
const SUPABASE_KEY = "sb_publishable_91Tw0CgJSBUdiAEyCONg8w_kZVpOFq7";

const sb = async (path, method = "GET", body = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${token || SUPABASE_KEY}`,
    "Prefer": method === "POST" ? "return=representation" : "",
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// Auth helpers
const sbAuth = async (endpoint, payload) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Auth error");
  return data;
};

/* ═══════════════════════════════════════════════════════════════════
   SQL SETUP INSTRUCTIONS (run once in Supabase SQL Editor)
   ═══════════════════════════════════════════════════════════════════
   
   -- 1) profiles
   create table profiles (
     id uuid references auth.users primary key,
     username text unique not null,
     bitvavo_uid text not null,
     is_admin boolean default false,
     created_at timestamptz default now()
   );
   alter table profiles enable row level security;
   create policy "Public read" on profiles for select using (true);
   create policy "Own insert" on profiles for insert with check (auth.uid() = id);

   -- 2) tips
   create table tips (
     id bigserial primary key,
     user_id uuid references auth.users not null,
     match_id text not null,
     home_score int not null,
     away_score int not null,
     updated_at timestamptz default now(),
     unique(user_id, match_id)
   );
   alter table tips enable row level security;
   create policy "Public read" on tips for select using (true);
   create policy "Own write" on tips for insert with check (auth.uid() = user_id);
   create policy "Own update" on tips for update using (auth.uid() = user_id);

   -- 3) results (admin only)
   create table results (
     match_id text primary key,
     home_score int not null,
     away_score int not null,
     updated_at timestamptz default now()
   );
   alter table results enable row level security;
   create policy "Public read" on results for select using (true);
   create policy "Admin write" on results for all using (
     exists (select 1 from profiles where id = auth.uid() and is_admin = true)
   );
   ═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   WM 2026 DATA
   ═══════════════════════════════════════════════════════════════════ */
const GROUPS = {
  A: ["USA", "Kanada", "Mexiko", "Venezuela"],
  B: ["Argentinien", "Chile", "Peru", "Australien"],
  C: ["Spanien", "Marokko", "Senegal", "Ukraine"],
  D: ["Frankreich", "Portugal", "Belgien", "Kamerun"],
  E: ["Deutschland", "Niederlande", "Türkei", "Nigeria"],
  F: ["England", "Schweiz", "Dänemark", "Saudi-Arabien"],
  G: ["Brasilien", "Kolumbien", "Ecuador", "Polen"],
  H: ["Japan", "Südkorea", "Ägypten", "Kroatien"],
  I: ["Uruguay", "Serbien", "Elfenbeinküste", "Neuseeland"],
  J: ["Iran", "Ghana", "Algerien", "Österreich"],
  K: ["Mexiko", "Kamerun", "Tschechien", "Paraguay"],
  L: ["Qatar", "Tunesien", "Sudan", "Bolivien"],
};

const GROUP_MATCH_DATES = {
  A: ["11.06.2026","11.06.2026","15.06.2026","15.06.2026","19.06.2026","19.06.2026"],
  B: ["12.06.2026","12.06.2026","16.06.2026","16.06.2026","20.06.2026","20.06.2026"],
  C: ["12.06.2026","12.06.2026","16.06.2026","16.06.2026","20.06.2026","20.06.2026"],
  D: ["13.06.2026","13.06.2026","17.06.2026","17.06.2026","21.06.2026","21.06.2026"],
  E: ["13.06.2026","13.06.2026","17.06.2026","17.06.2026","21.06.2026","21.06.2026"],
  F: ["14.06.2026","14.06.2026","18.06.2026","18.06.2026","22.06.2026","22.06.2026"],
  G: ["14.06.2026","14.06.2026","18.06.2026","18.06.2026","22.06.2026","22.06.2026"],
  H: ["15.06.2026","15.06.2026","19.06.2026","19.06.2026","23.06.2026","23.06.2026"],
  I: ["15.06.2026","15.06.2026","19.06.2026","19.06.2026","23.06.2026","23.06.2026"],
  J: ["16.06.2026","16.06.2026","20.06.2026","20.06.2026","24.06.2026","24.06.2026"],
  K: ["16.06.2026","16.06.2026","20.06.2026","20.06.2026","24.06.2026","24.06.2026"],
  L: ["17.06.2026","17.06.2026","21.06.2026","21.06.2026","25.06.2026","25.06.2026"],
};

const GROUP_MATCHES = Object.entries(GROUPS).flatMap(([group, t]) => {
  const d = GROUP_MATCH_DATES[group];
  return [
    { id:`${group}1`, phase:"Gruppe", group, home:t[0], away:t[1], date:d[0], time:"18:00" },
    { id:`${group}2`, phase:"Gruppe", group, home:t[2], away:t[3], date:d[1], time:"21:00" },
    { id:`${group}3`, phase:"Gruppe", group, home:t[0], away:t[2], date:d[2], time:"18:00" },
    { id:`${group}4`, phase:"Gruppe", group, home:t[1], away:t[3], date:d[3], time:"21:00" },
    { id:`${group}5`, phase:"Gruppe", group, home:t[0], away:t[3], date:d[4], time:"21:00" },
    { id:`${group}6`, phase:"Gruppe", group, home:t[1], away:t[2], date:d[5], time:"21:00" },
  ];
});

const KO_MATCHES = [
  ...Array.from({length:16},(_,i)=>({ id:`R32_${i+1}`, phase:"Achtelfinale", home:"TBD", away:"TBD", date:"29.06.2026", time:"18:00", locked:true })),
  ...Array.from({length:8},(_,i)=>({ id:`QF_${i+1}`,  phase:"Viertelfinale", home:"TBD", away:"TBD", date:"04.07.2026", time:"18:00", locked:true })),
  ...Array.from({length:4},(_,i)=>({ id:`SF_${i+1}`,  phase:"Halbfinale",    home:"TBD", away:"TBD", date:"09.07.2026", time:"18:00", locked:true })),
  { id:"3RD",   phase:"Spiel um Platz 3", home:"TBD", away:"TBD", date:"12.07.2026", time:"18:00", locked:true },
  { id:"FINAL", phase:"Finale",            home:"TBD", away:"TBD", date:"14.07.2026", time:"18:00", locked:true },
];

const ALL_MATCHES = [...GROUP_MATCHES, ...KO_MATCHES];

const FLAG = {
  "USA":"🇺🇸","Kanada":"🇨🇦","Mexiko":"🇲🇽","Venezuela":"🇻🇪",
  "Argentinien":"🇦🇷","Chile":"🇨🇱","Peru":"🇵🇪","Australien":"🇦🇺",
  "Spanien":"🇪🇸","Marokko":"🇲🇦","Senegal":"🇸🇳","Ukraine":"🇺🇦",
  "Frankreich":"🇫🇷","Portugal":"🇵🇹","Belgien":"🇧🇪","Kamerun":"🇨🇲",
  "Deutschland":"🇩🇪","Niederlande":"🇳🇱","Türkei":"🇹🇷","Nigeria":"🇳🇬",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Schweiz":"🇨🇭","Dänemark":"🇩🇰","Saudi-Arabien":"🇸🇦",
  "Brasilien":"🇧🇷","Kolumbien":"🇨🇴","Ecuador":"🇪🇨","Polen":"🇵🇱",
  "Japan":"🇯🇵","Südkorea":"🇰🇷","Ägypten":"🇪🇬","Kroatien":"🇭🇷",
  "Uruguay":"🇺🇾","Serbien":"🇷🇸","Elfenbeinküste":"🇨🇮","Neuseeland":"🇳🇿",
  "Iran":"🇮🇷","Ghana":"🇬🇭","Algerien":"🇩🇿","Österreich":"🇦🇹",
  "Qatar":"🇶🇦","Tunesien":"🇹🇳","Sudan":"🇸🇩","Bolivien":"🇧🇴",
  "Tschechien":"🇨🇿","Paraguay":"🇵🇾","TBD":"❓",
};

/* ═══════════════════════════════════════════════════════════════════
   POINTS LOGIC
   ═══════════════════════════════════════════════════════════════════ */
const tendency = (h, a) => h > a ? "H" : a > h ? "A" : "D";
const calcPoints = (tip, result) => {
  if (!tip || !result || tip.home === "" || tip.away === "") return null;
  if (Number(tip.home) === Number(result.home) && Number(tip.away) === Number(result.away)) return 3;
  if (tendency(tip.home, tip.away) === tendency(result.home, result.away)) return 1;
  return 0;
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage]           = useState("home");
  const [session, setSession]     = useState(null); // { access_token, user }
  const [profile, setProfile]     = useState(null); // { username, bitvavo_uid, is_admin }
  const [tips, setTips]           = useState({});   // { match_id: {home,away} }
  const [results, setResults]     = useState({});   // { match_id: {home,away} }
  const [leaderboard, setLboard]  = useState([]);
  const [notif, setNotif]         = useState(null);
  const [loading, setLoading]     = useState(false);

  const notify = (msg, type = "ok") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  // ── Load results (public) ────────────────────────────────────────
  const loadResults = useCallback(async () => {
    try {
      const rows = await sb("results?select=match_id,home_score,away_score");
      const map = {};
      (rows || []).forEach(r => { map[r.match_id] = { home: r.home_score, away: r.away_score }; });
      setResults(map);
    } catch(e) { console.error("loadResults", e); }
  }, []);

  // ── Load tips for current user ───────────────────────────────────
  const loadTips = useCallback(async (token) => {
    try {
      const rows = await sb("tips?select=match_id,home_score,away_score", "GET", null, token);
      const map = {};
      (rows || []).forEach(r => { map[r.match_id] = { home: r.home_score, away: r.away_score }; });
      setTips(map);
    } catch(e) { console.error("loadTips", e); }
  }, []);

  // ── Load leaderboard ─────────────────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    try {
      const [profiles, allTips, allResults] = await Promise.all([
        sb("profiles?select=id,username"),
        sb("tips?select=user_id,match_id,home_score,away_score"),
        sb("results?select=match_id,home_score,away_score"),
      ]);
      const resMap = {};
      (allResults || []).forEach(r => { resMap[r.match_id] = { home: r.home_score, away: r.away_score }; });

      const lb = (profiles || []).map(p => {
        const userTips = (allTips || []).filter(t => t.user_id === p.id);
        let pts = 0, exact = 0, tend = 0;
        userTips.forEach(t => {
          const res = resMap[t.match_id];
          const tip = { home: t.home_score, away: t.away_score };
          const pts2 = calcPoints(tip, res);
          if (pts2 === 3) { pts += 3; exact++; }
          else if (pts2 === 1) { pts += 1; tend++; }
        });
        return { username: p.username, pts, exact, tend, tipped: userTips.length };
      }).sort((a, b) => b.pts - a.pts || b.exact - a.exact);

      setLboard(lb);
    } catch(e) { console.error("loadLeaderboard", e); }
  }, []);

  // ── Init: restore session from localStorage ──────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("xrp_session");
    if (stored) {
      try {
        const sess = JSON.parse(stored);
        setSession(sess);
        loadTips(sess.access_token);
      } catch {}
    }
    loadResults();
    loadLeaderboard();
  }, [loadResults, loadLeaderboard, loadTips]);

  // ── Load profile after session set ──────────────────────────────
  useEffect(() => {
    if (!session) return;
    sb(`profiles?id=eq.${session.user.id}&select=username,bitvavo_uid,is_admin`, "GET", null, session.access_token)
      .then(rows => rows && rows[0] && setProfile(rows[0]))
      .catch(console.error);
  }, [session]);

  // ── REGISTER ─────────────────────────────────────────────────────
  const handleRegister = async (username, password, bitvavoUID) => {
    setLoading(true);
    try {
      const data = await sbAuth("signup", { email: `${username}@xrp-wm.de`, password });
      const token = data.access_token;
      // Insert profile
      await sb("profiles", "POST", {
        id: data.user.id,
        username,
        bitvavo_uid: bitvavoUID,
      }, token);
      const sess = { access_token: token, user: data.user };
      setSession(sess);
      localStorage.setItem("xrp_session", JSON.stringify(sess));
      setProfile({ username, bitvavo_uid: bitvavoUID, is_admin: false });
      setPage("tips");
      notify(`Willkommen, ${username}! 🎉`);
    } catch(e) {
      notify(e.message || "Registrierung fehlgeschlagen", "err");
    }
    setLoading(false);
  };

  // ── LOGIN ─────────────────────────────────────────────────────────
  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const data = await sbAuth("token?grant_type=password", {
        email: `${username}@xrp-wm.de`, password,
      });
      const sess = { access_token: data.access_token, user: data.user };
      setSession(sess);
      localStorage.setItem("xrp_session", JSON.stringify(sess));
      await loadTips(data.access_token);
      setPage("tips");
      notify(`Willkommen zurück, ${username}! ⚽`);
    } catch(e) {
      notify("Falscher Benutzername oder Passwort!", "err");
    }
    setLoading(false);
  };

  // ── LOGOUT ────────────────────────────────────────────────────────
  const handleLogout = () => {
    setSession(null); setProfile(null); setTips({});
    localStorage.removeItem("xrp_session");
    setPage("home");
  };

  // ── SAVE TIP ──────────────────────────────────────────────────────
  const saveTip = async (matchId, home, away) => {
    if (!session || home === "" || away === "") return;
    const body = {
      user_id: session.user.id,
      match_id: matchId,
      home_score: parseInt(home),
      away_score: parseInt(away),
      updated_at: new Date().toISOString(),
    };
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/tips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${session.access_token}`,
          "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(body),
      });
      setTips(t => ({ ...t, [matchId]: { home: parseInt(home), away: parseInt(away) } }));
    } catch(e) { console.error("saveTip", e); }
  };

  // ── SAVE RESULT (admin) ───────────────────────────────────────────
  const saveResult = async (matchId, home, away) => {
    if (!session || home === "" || away === "") return;
    const body = {
      match_id: matchId,
      home_score: parseInt(home),
      away_score: parseInt(away),
      updated_at: new Date().toISOString(),
    };
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${session.access_token}`,
          "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(body),
      });
      setResults(r => ({ ...r, [matchId]: { home: parseInt(home), away: parseInt(away) } }));
      loadLeaderboard();
      notify("Ergebnis gespeichert! ✓");
    } catch(e) { notify("Fehler beim Speichern!", "err"); }
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1a3a2a; border-radius: 3px; }
        a:hover { opacity: 0.8; }
        button:hover { filter: brightness(1.12); }
      `}</style>

      <div style={S.bgGlow1} />
      <div style={S.bgGlow2} />
      <div style={S.bgGrid} />

      {/* Notification */}
      {notif && (
        <div style={{ ...S.notif, background: notif.type === "err" ? "#c0392b" : "#00b86e" }}>
          {notif.msg}
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.brand} onClick={() => setPage("home")}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="47" stroke="white" strokeWidth="3.5"/>
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1.5"/>
              <path d="M18 20 L50 52 L82 20" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 80 L50 48 L82 80" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={S.brandName}>XRP Deutschland</div>
              <div style={S.brandSub}>WM 2026 Tipprunde</div>
            </div>
          </div>

          <nav style={S.nav}>
            {["home","tips","leaderboard"].map(p => (
              <button key={p} style={{ ...S.navBtn, ...(page===p ? S.navBtnOn : {}) }}
                onClick={() => { if (p==="tips" && !session) setPage("login"); else setPage(p); }}>
                {p==="home" ? "🏠 Start" : p==="tips" ? "⚽ Tippen" : "🏆 Rangliste"}
              </button>
            ))}
            {session ? (
              <>
                <span style={S.navUser}>👤 {profile?.username || "…"}</span>
                <button style={S.navBtn} onClick={handleLogout}>Abmelden</button>
              </>
            ) : (
              <>
                <button style={S.navBtn} onClick={() => setPage("login")}>Anmelden</button>
                <button style={{ ...S.navBtn, ...S.navBtnGreen }} onClick={() => setPage("register")}>Registrieren</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={S.main}>
        {page === "home"       && <HomePage setPage={setPage} session={session} />}
        {page === "register"   && <RegisterPage onRegister={handleRegister} setPage={setPage} loading={loading} />}
        {page === "login"      && <LoginPage onLogin={handleLogin} setPage={setPage} loading={loading} />}
        {page === "tips"       && <TipsPage session={session} profile={profile} tips={tips} results={results} saveTip={saveTip} saveResult={saveResult} setPage={setPage} />}
        {page === "leaderboard"&& <LeaderboardPage leaderboard={leaderboard} profile={profile} onRefresh={loadLeaderboard} />}
      </main>

      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={S.footerLeft}>
            <span style={S.poweredBy}>powered by</span>
            <span style={S.bitvavoBrand}>//&nbsp;bitvavo</span>
          </div>
          <div style={S.footerRight}>
            <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={S.footerLink}>Bitvavo Affiliate</a>
            <a href="https://www.youtube.com/@xrpdeutschland" target="_blank" rel="noreferrer" style={S.footerLink}>YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════════ */
function HomePage({ setPage, session }) {
  return (
    <div style={S.homeWrap}>
      <div style={S.homeBadge}>🏆 FIFA Weltmeisterschaft 2026 · USA · Kanada · Mexiko</div>
      <h1 style={S.heroH1}>
        XRP<br/>
        <span style={S.heroGreen}>Deutschland</span><br/>
        WM 2026
      </h1>
      <p style={S.heroP}>Tippe alle Spiele der WM 2026 und beweise dein Fußball-Wissen in der größten deutschsprachigen XRP-Community!</p>

      {/* Prize box */}
      <div style={S.prizeCard}>
        <div style={S.prizeHeadRow}>
          <span style={S.prizeIcon}>🎁</span>
          <span style={S.prizeHead}>Gewinne für Platz 1–3!</span>
        </div>
        <p style={S.prizeBody}>Die besten drei Tipper erhalten <strong>coole Gewinne!</strong> Genauere Informationen über unsere Kanäle.</p>
        <div style={S.prizeRule}>
          <strong>Teilnahmebedingungen:</strong> Meldet euch über unseren Link bei Bitvavo an. <em>Keine Gewinne ohne Bitvavo UID!</em>
        </div>
        <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={S.bitvavoBtn}>
          <span>🔗</span>
          <span>Jetzt bei Bitvavo registrieren &amp; 20€ in XRP sichern</span>
          <span style={S.bitvavoBtnArrow}>→</span>
        </a>
      </div>

      {/* Points system */}
      <div style={S.pointsCard}>
        <div style={S.pointsHead}>📊 Punktesystem</div>
        <div style={S.pointsRow}>
          {[
            { pts:"3", label:"Genaues Ergebnis", color:"#00d084" },
            { pts:"1", label:"Richtige Tendenz (S/U/N)", color:"#f0c040" },
            { pts:"0", label:"Falsch getippt", color:"#888" },
          ].map(p => (
            <div key={p.pts} style={S.pointItem}>
              <span style={{ ...S.pointNum, color: p.color }}>{p.pts}</span>
              <span style={S.pointLabel}>Punkte</span>
              <span style={S.pointDesc}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {session ? (
        <button style={S.ctaGreen} onClick={() => setPage("tips")}>Zu meinen Tipps →</button>
      ) : (
        <div style={S.ctaRow}>
          <button style={S.ctaGreen} onClick={() => setPage("register")}>Jetzt mitmachen →</button>
          <button style={S.ctaGhost} onClick={() => setPage("login")}>Bereits registriert? Anmelden</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REGISTER PAGE
   ═══════════════════════════════════════════════════════════════════ */
function RegisterPage({ onRegister, setPage, loading }) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [p2, setP2] = useState(""); const [bv, setBv] = useState("");
  const [err, setErr] = useState("");

  const go = () => {
    setErr("");
    if (!u.trim()) return setErr("Benutzername ist Pflicht.");
    if (u.includes("@")) return setErr("Benutzername darf kein @ enthalten.");
    if (p.length < 6) return setErr("Passwort mind. 6 Zeichen.");
    if (p !== p2) return setErr("Passwörter stimmen nicht überein.");
    if (!bv.trim()) return setErr("Bitvavo UID ist für die Teilnahme Pflicht!");
    onRegister(u.trim(), p, bv.trim());
  };

  return (
    <div style={S.authWrap}>
      <div style={S.authCard}>
        <h2 style={S.authTitle}>Registrieren</h2>
        <p style={S.authSub}>Erstelle deinen Account für die XRP WM Tipprunde</p>
        {err && <div style={S.errBox}>{err}</div>}
        <Field label="Benutzername" value={u} onChange={setU} placeholder="Dein Tipp-Name" />
        <Field label="Passwort" value={p} onChange={setP} type="password" placeholder="Mind. 6 Zeichen" />
        <Field label="Passwort wiederholen" value={p2} onChange={setP2} type="password" placeholder="Passwort bestätigen" />
        <div>
          <Field label="Bitvavo UID *Pflicht" value={bv} onChange={setBv} placeholder="Deine Bitvavo Benutzer-ID" />
          <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#00d084", display:"block", marginTop:4 }}>
            → Noch kein Bitvavo Account? 20€ XRP Bonus sichern
          </a>
        </div>
        <button style={S.submitBtn} onClick={go} disabled={loading}>
          {loading ? "Wird erstellt…" : "Account erstellen →"}
        </button>
        <p style={S.switchTxt}>Bereits registriert? <span style={S.switchLink} onClick={() => setPage("login")}>Anmelden</span></p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
function LoginPage({ onLogin, setPage, loading }) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  return (
    <div style={S.authWrap}>
      <div style={S.authCard}>
        <h2 style={S.authTitle}>Anmelden</h2>
        <p style={S.authSub}>Willkommen zurück in der Tipprunde!</p>
        <Field label="Benutzername" value={u} onChange={setU} placeholder="Dein Benutzername" />
        <Field label="Passwort" value={p} onChange={setP} type="password" placeholder="Dein Passwort"
          onKeyDown={e => e.key==="Enter" && onLogin(u, p)} />
        <button style={S.submitBtn} onClick={() => onLogin(u,p)} disabled={loading}>
          {loading ? "Anmelden…" : "Anmelden →"}
        </button>
        <p style={S.switchTxt}>Noch kein Account? <span style={S.switchLink} onClick={() => setPage("register")}>Registrieren</span></p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIPS PAGE
   ═══════════════════════════════════════════════════════════════════ */
function TipsPage({ session, profile, tips, results, saveTip, saveResult, setPage }) {
  const [activePhase, setActivePhase] = useState("Gruppe");
  const [activeGroup, setActiveGroup] = useState("A");

  const phases = ["Gruppe","Achtelfinale","Viertelfinale","Halbfinale","Spiel um Platz 3","Finale"];

  const phaseMatches = activePhase === "Gruppe"
    ? ALL_MATCHES.filter(m => m.phase==="Gruppe" && m.group===activeGroup)
    : ALL_MATCHES.filter(m => m.phase===activePhase);

  if (!session) return (
    <div style={S.guestWrap}>
      <div style={S.guestCard}>
        <span style={{ fontSize:72 }}>⚽</span>
        <h2 style={S.authTitle}>Meld dich an!</h2>
        <p style={{ color:"#7a90a8", marginBottom:16 }}>Du musst eingeloggt sein um Tipps abzugeben.</p>
        <button style={S.ctaGreen} onClick={() => setPage("register")}>Jetzt registrieren →</button>
        <button style={{ ...S.ctaGhost, marginTop:8 }} onClick={() => setPage("login")}>Anmelden</button>
      </div>
    </div>
  );

  return (
    <div style={S.tipsWrap}>
      <div style={S.tipsTop}>
        <h2 style={S.tipsH2}>Deine Tipps{profile ? `, ${profile.username}` : ""} 👋</h2>
        <p style={S.tipsHint}>Tipps können bis zum Spielbeginn geändert werden · Gespeichert wird automatisch</p>
        {profile?.is_admin && <div style={S.adminBadge}>🔐 Admin-Modus aktiv – du kannst Ergebnisse eintragen</div>}
      </div>

      {/* Phase tabs */}
      <div style={S.tabs}>
        {phases.map(ph => (
          <button key={ph} style={{ ...S.tab, ...(activePhase===ph ? S.tabOn : {}) }} onClick={() => setActivePhase(ph)}>
            {ph}
          </button>
        ))}
      </div>

      {/* Group tabs */}
      {activePhase === "Gruppe" && (
        <div style={S.groupRow}>
          {Object.keys(GROUPS).map(g => (
            <button key={g} style={{ ...S.groupBtn, ...(activeGroup===g ? S.groupBtnOn : {}) }} onClick={() => setActiveGroup(g)}>
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Matches */}
      <div style={S.matchGrid}>
        {phaseMatches.map(m => (
          <MatchCard key={m.id} match={m} tip={tips[m.id]} result={results[m.id]}
            onTip={(h,a) => saveTip(m.id,h,a)}
            onResult={(h,a) => saveResult(m.id,h,a)}
            isAdmin={profile?.is_admin} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MATCH CARD
   ═══════════════════════════════════════════════════════════════════ */
function MatchCard({ match, tip, result, onTip, onResult, isAdmin }) {
  const [h, setH] = useState(tip?.home ?? "");
  const [a, setA] = useState(tip?.away ?? "");
  const [rh, setRh] = useState(result?.home ?? "");
  const [ra, setRa] = useState(result?.away ?? "");

  useEffect(() => { setH(tip?.home ?? ""); setA(tip?.away ?? ""); }, [tip]);
  useEffect(() => { setRh(result?.home ?? ""); setRa(result?.away ?? ""); }, [result]);

  const pts = (result && tip && h !== "" && a !== "") ? calcPoints(tip, result) : null;
  const locked = match.locked && !isAdmin;

  const ptsStyle = pts === 3
    ? { background:"rgba(0,208,132,0.2)", color:"#00d084", border:"1px solid rgba(0,208,132,0.4)" }
    : pts === 1
    ? { background:"rgba(240,192,64,0.2)", color:"#f0c040", border:"1px solid rgba(240,192,64,0.4)" }
    : pts === 0
    ? { background:"rgba(255,80,80,0.15)", color:"#ff6b6b", border:"1px solid rgba(255,80,80,0.3)" }
    : {};

  return (
    <div style={S.mCard}>
      <div style={S.mMeta}>
        <span style={S.mDate}>{match.date} · {match.time}</span>
        {match.group  && <span style={S.mGroup}>Gruppe {match.group}</span>}
        {match.phase !== "Gruppe" && <span style={S.mPhase}>{match.phase}</span>}
        {pts !== null && (
          <span style={{ ...S.ptsPill, ...ptsStyle }}>
            {pts === 3 ? "✓ 3 Pkt" : pts === 1 ? "≈ 1 Pkt" : "✗ 0 Pkt"}
          </span>
        )}
      </div>

      <div style={S.mRow}>
        <div style={S.mTeam}>
          <span style={S.mFlag}>{FLAG[match.home]||"🏳️"}</span>
          <span style={S.mTeamName}>{match.home}</span>
        </div>

        <div style={S.mScore}>
          {locked ? (
            <span style={S.mLocked}>K.O.-Phase – kommt bald</span>
          ) : (
            <>
              <input style={S.scoreIn} type="number" min="0" max="30" value={h} placeholder="–"
                onChange={e => { setH(e.target.value); onTip(e.target.value, a); }} />
              <span style={S.scoreSep}>:</span>
              <input style={S.scoreIn} type="number" min="0" max="30" value={a} placeholder="–"
                onChange={e => { setA(e.target.value); onTip(h, e.target.value); }} />
            </>
          )}
        </div>

        <div style={{ ...S.mTeam, justifyContent:"flex-end" }}>
          <span style={S.mTeamName}>{match.away}</span>
          <span style={S.mFlag}>{FLAG[match.away]||"🏳️"}</span>
        </div>
      </div>

      {/* Result row */}
      <div style={S.mBottom}>
        {result && (
          <span style={S.resultPill}>
            Ergebnis: {result.home}:{result.away}
          </span>
        )}
        {isAdmin && !locked && (
          <div style={S.adminRow}>
            <span style={S.adminLabel}>Admin-Ergebnis:</span>
            <input style={S.scoreInSm} type="number" min="0" value={rh} placeholder="–" onChange={e => setRh(e.target.value)} />
            <span style={{ color:"#888" }}>:</span>
            <input style={S.scoreInSm} type="number" min="0" value={ra} placeholder="–" onChange={e => setRa(e.target.value)} />
            <button style={S.saveBtn} onClick={() => onResult(rh, ra)}>Speichern ✓</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEADERBOARD
   ═══════════════════════════════════════════════════════════════════ */
function LeaderboardPage({ leaderboard, profile, onRefresh }) {
  const medals = ["🥇","🥈","🥉"];
  return (
    <div style={S.lbWrap}>
      <div style={S.lbTop}>
        <h2 style={S.lbH2}>🏆 Rangliste</h2>
        <button style={S.refreshBtn} onClick={onRefresh}>↻ Aktualisieren</button>
      </div>
      <p style={S.lbSub}>Wer tippt am besten in der XRP Deutschland Community?</p>

      {leaderboard.length === 0 ? (
        <div style={S.lbEmpty}>Noch keine Teilnehmer – sei der Erste! 🚀</div>
      ) : (
        <div style={S.lbList}>
          {/* Table header */}
          <div style={{ ...S.lbRow, background:"transparent", border:"none", color:"#5a6a7a", fontSize:11, letterSpacing:1, textTransform:"uppercase" }}>
            <span style={S.lbRank}>#</span>
            <span style={{ flex:1 }}>Spieler</span>
            <span style={S.lbCol}>Punkte</span>
            <span style={S.lbCol}>Exakt</span>
            <span style={S.lbCol}>Tendenz</span>
            <span style={S.lbCol}>Tipps</span>
          </div>

          {leaderboard.map((e,i) => {
            const isMe = e.username === profile?.username;
            return (
              <div key={e.username} style={{
                ...S.lbRow,
                ...(i===0 ? S.lbGold : i===1 ? S.lbSilver : i===2 ? S.lbBronze : {}),
                ...(isMe ? S.lbMe : {}),
              }}>
                <span style={S.lbRank}>{i<3 ? medals[i] : `${i+1}.`}</span>
                <span style={{ flex:1, fontWeight:700, color: isMe ? "#00d084" : "#e8edf5" }}>
                  {e.username}{isMe && <span style={{ fontSize:11, color:"#00d084", marginLeft:6 }}>(Du)</span>}
                </span>
                <span style={{ ...S.lbCol, color:"#00d084", fontSize:20, fontWeight:900 }}>{e.pts}</span>
                <span style={S.lbCol}>{e.exact}</span>
                <span style={S.lbCol}>{e.tend}</span>
                <span style={S.lbCol}>{e.tipped}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={S.lbNote}>
        <strong>🎁 Preise für Platz 1–3!</strong> Genauere Informationen über unsere Kanäle.<br/>
        <em>Voraussetzung: Bitvavo-Account über unseren </em>
        <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={{ color:"#00d084" }}>
          Affiliate-Link
        </a>
        <em> registriert und UID im Account hinterlegt.</em>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FIELD COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
function Field({ label, value, onChange, type="text", placeholder="", onKeyDown }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={S.fieldLabel}>{label}</label>
      <input style={S.fieldInput} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════ */
const S = {
  root: { minHeight:"100vh", background:"#04080f", color:"#dde5f0", fontFamily:"'Barlow', sans-serif", position:"relative", overflowX:"hidden" },
  bgGlow1: { position:"fixed", top:"-20%", left:"-10%", width:"60vw", height:"60vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,80,40,0.18) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 },
  bgGlow2: { position:"fixed", bottom:"-20%", right:"-10%", width:"50vw", height:"50vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,40,120,0.15) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 },
  bgGrid: { position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0 },

  notif: { position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:9999, padding:"12px 28px", borderRadius:8, fontSize:14, fontWeight:700, color:"#fff", boxShadow:"0 4px 30px rgba(0,0,0,0.5)", whiteSpace:"nowrap" },

  header: { position:"sticky", top:0, zIndex:100, background:"rgba(4,8,15,0.9)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.07)" },
  headerInner: { maxWidth:1120, margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 },
  brand: { display:"flex", alignItems:"center", gap:12, cursor:"pointer" },
  brandName: { fontFamily:"'Bebas Neue', sans-serif", fontSize:22, letterSpacing:3, color:"#fff" },
  brandSub: { fontSize:10, color:"#00d084", letterSpacing:3, fontWeight:700, textTransform:"uppercase" },
  nav: { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" },
  navBtn: { padding:"7px 14px", background:"transparent", border:"1px solid rgba(255,255,255,0.12)", borderRadius:6, color:"#8a9ab0", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"'Barlow',sans-serif", letterSpacing:0.3 },
  navBtnOn: { color:"#fff", borderColor:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.05)" },
  navBtnGreen: { background:"#00d084", color:"#000", borderColor:"#00d084", fontWeight:800 },
  navUser: { color:"#00d084", fontSize:13, fontWeight:700 },

  main: { position:"relative", zIndex:1, maxWidth:1120, margin:"0 auto", padding:"36px 24px 80px" },

  // HOME
  homeWrap: { display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:36 },
  homeBadge: { display:"inline-block", padding:"6px 20px", background:"rgba(0,208,132,0.08)", border:"1px solid rgba(0,208,132,0.25)", borderRadius:99, fontSize:12, color:"#00d084", letterSpacing:2, fontWeight:700, textTransform:"uppercase" },
  heroH1: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(56px,10vw,110px)", lineHeight:0.95, letterSpacing:6, color:"#fff" },
  heroGreen: { color:"#00d084" },
  heroP: { fontSize:17, color:"#7a8fa8", maxWidth:540, lineHeight:1.65 },

  prizeCard: { width:"100%", maxWidth:660, background:"linear-gradient(135deg,rgba(0,80,40,0.22),rgba(0,40,100,0.18))", border:"1px solid rgba(0,208,132,0.2)", borderRadius:20, padding:"28px 32px", display:"flex", flexDirection:"column", gap:14, textAlign:"left" },
  prizeHeadRow: { display:"flex", alignItems:"center", gap:10 },
  prizeIcon: { fontSize:28 },
  prizeHead: { fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:"#fff" },
  prizeBody: { fontSize:15, color:"#aab8cc", lineHeight:1.65 },
  prizeRule: { fontSize:13, color:"#7a8fa8", lineHeight:1.65, background:"rgba(0,0,0,0.25)", borderRadius:8, padding:"10px 14px" },
  bitvavoBtn: { display:"flex", alignItems:"center", gap:10, padding:"14px 20px", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(0,208,132,0.35)", borderRadius:10, color:"#00d084", textDecoration:"none", fontSize:14, fontWeight:700, letterSpacing:0.4 },
  bitvavoBtnArrow: { marginLeft:"auto" },

  pointsCard: { width:"100%", maxWidth:660, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"24px 28px" },
  pointsHead: { fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, color:"#fff", marginBottom:18 },
  pointsRow: { display:"flex", gap:12, flexWrap:"wrap" },
  pointItem: { flex:1, minWidth:140, background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"18px 14px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 },
  pointNum: { fontFamily:"'Bebas Neue',sans-serif", fontSize:48, lineHeight:1 },
  pointLabel: { fontSize:11, color:"#7a8fa8", fontWeight:700, letterSpacing:1, textTransform:"uppercase" },
  pointDesc: { fontSize:13, color:"#aab8cc", textAlign:"center" },

  ctaGreen: { padding:"15px 36px", background:"#00d084", color:"#000", border:"none", borderRadius:10, fontSize:16, fontWeight:800, cursor:"pointer", letterSpacing:1, fontFamily:"'Barlow',sans-serif" },
  ctaGhost: { padding:"14px 28px", background:"transparent", color:"#dde5f0", border:"1px solid rgba(255,255,255,0.18)", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Barlow',sans-serif" },
  ctaRow: { display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" },

  // AUTH
  authWrap: { display:"flex", justifyContent:"center" },
  authCard: { width:"100%", maxWidth:480, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"36px 32px", display:"flex", flexDirection:"column", gap:14 },
  authTitle: { fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:3, color:"#fff" },
  authSub: { fontSize:14, color:"#7a8fa8", marginTop:-8 },
  fieldLabel: { fontSize:11, fontWeight:700, color:"#7a8fa8", letterSpacing:1, textTransform:"uppercase" },
  fieldInput: { padding:"12px 16px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#fff", fontSize:15, outline:"none", fontFamily:"'Barlow',sans-serif" },
  submitBtn: { padding:"14px", background:"#00d084", color:"#000", border:"none", borderRadius:8, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Barlow',sans-serif", marginTop:4 },
  switchTxt: { fontSize:13, color:"#7a8fa8", textAlign:"center" },
  switchLink: { color:"#00d084", cursor:"pointer" },
  errBox: { padding:"10px 14px", background:"rgba(192,57,43,0.2)", border:"1px solid rgba(192,57,43,0.35)", borderRadius:8, fontSize:13, color:"#ff8080" },

  // TIPS
  tipsWrap: { display:"flex", flexDirection:"column", gap:20 },
  tipsTop: { display:"flex", flexDirection:"column", gap:4 },
  tipsH2: { fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:3, color:"#fff" },
  tipsHint: { fontSize:13, color:"#7a8fa8" },
  adminBadge: { display:"inline-block", padding:"4px 14px", background:"rgba(240,192,64,0.12)", border:"1px solid rgba(240,192,64,0.3)", borderRadius:6, fontSize:12, color:"#f0c040", fontWeight:700 },
  tabs: { display:"flex", gap:6, flexWrap:"wrap" },
  tab: { padding:"8px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#8a9ab0", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"'Barlow',sans-serif" },
  tabOn: { background:"rgba(0,208,132,0.12)", borderColor:"rgba(0,208,132,0.35)", color:"#00d084" },
  groupRow: { display:"flex", gap:6, flexWrap:"wrap" },
  groupBtn: { padding:"6px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:6, color:"#8a9ab0", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"'Barlow',sans-serif" },
  groupBtnOn: { background:"rgba(100,180,255,0.12)", borderColor:"rgba(100,180,255,0.35)", color:"#6ab4ff" },
  matchGrid: { display:"flex", flexDirection:"column", gap:10 },

  // MATCH CARD
  mCard: { background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 },
  mMeta: { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  mDate: { fontSize:11, color:"#5a6a7a", letterSpacing:0.8 },
  mGroup: { fontSize:11, color:"#6ab4ff", fontWeight:700, letterSpacing:1 },
  mPhase: { fontSize:11, color:"#f0c040", fontWeight:700, letterSpacing:1 },
  ptsPill: { marginLeft:"auto", fontSize:12, padding:"2px 10px", borderRadius:99, fontWeight:800 },
  mRow: { display:"flex", alignItems:"center", gap:12 },
  mTeam: { flex:1, display:"flex", alignItems:"center", gap:10 },
  mFlag: { fontSize:24 },
  mTeamName: { fontSize:15, fontWeight:700, color:"#e0e8f4", letterSpacing:0.3 },
  mScore: { display:"flex", alignItems:"center", gap:8, flexShrink:0 },
  scoreIn: { width:52, padding:"8px 4px", textAlign:"center", background:"rgba(0,208,132,0.08)", border:"1px solid rgba(0,208,132,0.25)", borderRadius:7, color:"#fff", fontSize:22, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", outline:"none" },
  scoreSep: { fontSize:22, fontWeight:900, color:"#5a6a7a", fontFamily:"'Bebas Neue',sans-serif" },
  mLocked: { fontSize:12, color:"#3a4a5a", fontStyle:"italic" },
  mBottom: { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  resultPill: { fontSize:12, padding:"3px 12px", background:"rgba(255,255,255,0.06)", borderRadius:99, color:"#aab8cc" },
  adminRow: { display:"flex", alignItems:"center", gap:8 },
  adminLabel: { fontSize:11, color:"#f0c040", fontWeight:700 },
  scoreInSm: { width:42, padding:"5px 4px", textAlign:"center", background:"rgba(240,192,64,0.1)", border:"1px solid rgba(240,192,64,0.25)", borderRadius:5, color:"#fff", fontSize:16, fontWeight:700, fontFamily:"'Barlow',sans-serif", outline:"none" },
  saveBtn: { padding:"5px 12px", background:"#f0c040", color:"#000", border:"none", borderRadius:5, cursor:"pointer", fontWeight:800, fontSize:13, fontFamily:"'Barlow',sans-serif" },

  // GUEST
  guestWrap: { display:"flex", justifyContent:"center" },
  guestCard: { textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12, maxWidth:380, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"40px 32px" },

  // LEADERBOARD
  lbWrap: { display:"flex", flexDirection:"column", gap:20 },
  lbTop: { display:"flex", alignItems:"center", gap:16 },
  lbH2: { fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff" },
  refreshBtn: { padding:"7px 16px", background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, color:"#8a9ab0", cursor:"pointer", fontSize:13, fontFamily:"'Barlow',sans-serif" },
  lbSub: { fontSize:14, color:"#7a8fa8", marginTop:-12 },
  lbEmpty: { textAlign:"center", padding:60, color:"#7a8fa8", fontSize:16 },
  lbList: { display:"flex", flexDirection:"column", gap:5 },
  lbRow: { display:"flex", alignItems:"center", gap:8, padding:"13px 18px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, fontSize:15 },
  lbGold: { background:"rgba(255,215,0,0.07)", border:"1px solid rgba(255,215,0,0.25)" },
  lbSilver: { background:"rgba(192,192,192,0.06)", border:"1px solid rgba(192,192,192,0.2)" },
  lbBronze: { background:"rgba(205,127,50,0.07)", border:"1px solid rgba(205,127,50,0.2)" },
  lbMe: { border:"1px solid rgba(0,208,132,0.4)", background:"rgba(0,208,132,0.05)" },
  lbRank: { width:38, fontSize:18 },
  lbCol: { width:80, textAlign:"center", color:"#8a9ab0", fontSize:14 },
  lbNote: { fontSize:13, color:"#7a8fa8", lineHeight:1.75, padding:"16px 22px", background:"rgba(0,208,132,0.05)", border:"1px solid rgba(0,208,132,0.12)", borderRadius:10 },

  // FOOTER
  footer: { position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(4,8,15,0.8)", padding:"20px 0" },
  footerInner: { maxWidth:1120, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
  footerLeft: { display:"flex", alignItems:"center", gap:8 },
  poweredBy: { fontSize:10, color:"#5a6a7a", letterSpacing:2, textTransform:"uppercase" },
  bitvavoBrand: { fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"#fff", letterSpacing:2 },
  footerRight: { display:"flex", gap:20 },
  footerLink: { fontSize:13, color:"#5a6a7a", textDecoration:"none" },
};
