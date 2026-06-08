import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://ymwaobletazkijmzbtiy.supabase.co";
const SUPABASE_KEY = "sb_publishable_91Tw0CgJSBUdiAEyCONg8w_kZVpOFq7";

const sb = async (path, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${token||SUPABASE_KEY}`,"Prefer":method==="POST"?"return=representation":"" };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!res.ok){const err=await res.text();throw new Error(err);}
  const text=await res.text();return text?JSON.parse(text):null;
};
const sbAuth = async (endpoint, payload) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},body:JSON.stringify(payload)});
  const data=await res.json();if(!res.ok)throw new Error(data.error_description||data.msg||"Auth error");return data;
};

// ── OFFIZIELLE WM 2026 GRUPPEN ────────────────────────────────────────────────
const GROUPS = {
  A:["Mexiko","Südafrika","Südkorea","Tschechien"],
  B:["Kanada","Bosnien-Herzegowina","Katar","Schweiz"],
  C:["Brasilien","Marokko","Haiti","Schottland"],
  D:["USA","Paraguay","Australien","Türkei"],
  E:["Deutschland","Curaçao","Elfenbeinküste","Ecuador"],
  F:["Niederlande","Japan","Schweden","Tunesien"],
  G:["Belgien","Ägypten","Iran","Neuseeland"],
  H:["Spanien","Kap Verde","Saudi-Arabien","Uruguay"],
  I:["Frankreich","Senegal","Irak","Norwegen"],
  J:["Argentinien","Algerien","Österreich","Jordanien"],
  K:["Portugal","DR Kongo","Usbekistan","Kolumbien"],
  L:["England","Kroatien","Ghana","Panama"],
};

// ── ALLE 72 GRUPPENSPIELE (MESZ) ──────────────────────────────────────────────
const GROUP_MATCHES = [
  // GRUPPE A
  {id:"A1",phase:"Gruppe",group:"A",home:"Mexiko",away:"Südafrika",date:"11.06.2026",time:"21:00"},
  {id:"A2",phase:"Gruppe",group:"A",home:"Südkorea",away:"Tschechien",date:"12.06.2026",time:"04:00"},
  {id:"A3",phase:"Gruppe",group:"A",home:"Mexiko",away:"Südkorea",date:"18.06.2026",time:"21:00"},
  {id:"A4",phase:"Gruppe",group:"A",home:"Tschechien",away:"Südafrika",date:"19.06.2026",time:"00:00"},
  {id:"A5",phase:"Gruppe",group:"A",home:"Mexiko",away:"Tschechien",date:"25.06.2026",time:"02:00"},
  {id:"A6",phase:"Gruppe",group:"A",home:"Südafrika",away:"Südkorea",date:"25.06.2026",time:"02:00"},
  // GRUPPE B
  {id:"B1",phase:"Gruppe",group:"B",home:"Kanada",away:"Bosnien-Herzegowina",date:"12.06.2026",time:"21:00"},
  {id:"B2",phase:"Gruppe",group:"B",home:"Katar",away:"Schweiz",date:"13.06.2026",time:"21:00"},
  {id:"B3",phase:"Gruppe",group:"B",home:"Kanada",away:"Katar",date:"18.06.2026",time:"00:00"},
  {id:"B4",phase:"Gruppe",group:"B",home:"Schweiz",away:"Bosnien-Herzegowina",date:"18.06.2026",time:"18:00"},
  {id:"B5",phase:"Gruppe",group:"B",home:"Kanada",away:"Schweiz",date:"24.06.2026",time:"21:00"},
  {id:"B6",phase:"Gruppe",group:"B",home:"Bosnien-Herzegowina",away:"Katar",date:"24.06.2026",time:"21:00"},
  // GRUPPE C
  {id:"C1",phase:"Gruppe",group:"C",home:"Brasilien",away:"Marokko",date:"14.06.2026",time:"00:00"},
  {id:"C2",phase:"Gruppe",group:"C",home:"Haiti",away:"Schottland",date:"14.06.2026",time:"03:00"},
  {id:"C3",phase:"Gruppe",group:"C",home:"Brasilien",away:"Haiti",date:"18.06.2026",time:"21:00"},
  {id:"C4",phase:"Gruppe",group:"C",home:"Marokko",away:"Schottland",date:"19.06.2026",time:"03:00"},
  {id:"C5",phase:"Gruppe",group:"C",home:"Brasilien",away:"Schottland",date:"24.06.2026",time:"22:00"},
  {id:"C6",phase:"Gruppe",group:"C",home:"Marokko",away:"Haiti",date:"24.06.2026",time:"22:00"},
  // GRUPPE D
  {id:"D1",phase:"Gruppe",group:"D",home:"USA",away:"Paraguay",date:"13.06.2026",time:"03:00"},
  {id:"D2",phase:"Gruppe",group:"D",home:"Australien",away:"Türkei",date:"14.06.2026",time:"06:00"},
  {id:"D3",phase:"Gruppe",group:"D",home:"USA",away:"Australien",date:"19.06.2026",time:"03:00"},
  {id:"D4",phase:"Gruppe",group:"D",home:"Türkei",away:"Paraguay",date:"19.06.2026",time:"21:00"},
  {id:"D5",phase:"Gruppe",group:"D",home:"USA",away:"Türkei",date:"26.06.2026",time:"02:00"},
  {id:"D6",phase:"Gruppe",group:"D",home:"Paraguay",away:"Australien",date:"26.06.2026",time:"02:00"},
  // GRUPPE E – DEUTSCHLAND 🇩🇪
  {id:"E1",phase:"Gruppe",group:"E",home:"Deutschland",away:"Curaçao",date:"14.06.2026",time:"19:00"},
  {id:"E2",phase:"Gruppe",group:"E",home:"Elfenbeinküste",away:"Ecuador",date:"15.06.2026",time:"01:00"},
  {id:"E3",phase:"Gruppe",group:"E",home:"Deutschland",away:"Elfenbeinküste",date:"20.06.2026",time:"22:00"},
  {id:"E4",phase:"Gruppe",group:"E",home:"Ecuador",away:"Curaçao",date:"21.06.2026",time:"00:00"},
  {id:"E5",phase:"Gruppe",group:"E",home:"Ecuador",away:"Deutschland",date:"25.06.2026",time:"22:00"},
  {id:"E6",phase:"Gruppe",group:"E",home:"Curaçao",away:"Elfenbeinküste",date:"25.06.2026",time:"22:00"},
  // GRUPPE F
  {id:"F1",phase:"Gruppe",group:"F",home:"Niederlande",away:"Japan",date:"14.06.2026",time:"22:00"},
  {id:"F2",phase:"Gruppe",group:"F",home:"Schweden",away:"Tunesien",date:"15.06.2026",time:"04:00"},
  {id:"F3",phase:"Gruppe",group:"F",home:"Niederlande",away:"Schweden",date:"19.06.2026",time:"22:00"},
  {id:"F4",phase:"Gruppe",group:"F",home:"Japan",away:"Tunesien",date:"20.06.2026",time:"19:00"},
  {id:"F5",phase:"Gruppe",group:"F",home:"Niederlande",away:"Tunesien",date:"26.06.2026",time:"02:00"},
  {id:"F6",phase:"Gruppe",group:"F",home:"Japan",away:"Schweden",date:"26.06.2026",time:"02:00"},
  // GRUPPE G
  {id:"G1",phase:"Gruppe",group:"G",home:"Belgien",away:"Ägypten",date:"15.06.2026",time:"21:00"},
  {id:"G2",phase:"Gruppe",group:"G",home:"Iran",away:"Neuseeland",date:"16.06.2026",time:"03:00"},
  {id:"G3",phase:"Gruppe",group:"G",home:"Belgien",away:"Neuseeland",date:"20.06.2026",time:"19:00"},
  {id:"G4",phase:"Gruppe",group:"G",home:"Ägypten",away:"Iran",date:"21.06.2026",time:"03:00"},
  {id:"G5",phase:"Gruppe",group:"G",home:"Belgien",away:"Iran",date:"26.06.2026",time:"22:00"},
  {id:"G6",phase:"Gruppe",group:"G",home:"Ägypten",away:"Neuseeland",date:"26.06.2026",time:"22:00"},
  // GRUPPE H
  {id:"H1",phase:"Gruppe",group:"H",home:"Spanien",away:"Kap Verde",date:"15.06.2026",time:"18:00"},
  {id:"H2",phase:"Gruppe",group:"H",home:"Saudi-Arabien",away:"Uruguay",date:"16.06.2026",time:"00:00"},
  {id:"H3",phase:"Gruppe",group:"H",home:"Spanien",away:"Saudi-Arabien",date:"20.06.2026",time:"22:00"},
  {id:"H4",phase:"Gruppe",group:"H",home:"Uruguay",away:"Kap Verde",date:"21.06.2026",time:"21:00"},
  {id:"H5",phase:"Gruppe",group:"H",home:"Spanien",away:"Uruguay",date:"26.06.2026",time:"22:00"},
  {id:"H6",phase:"Gruppe",group:"H",home:"Kap Verde",away:"Saudi-Arabien",date:"26.06.2026",time:"22:00"},
  // GRUPPE I
  {id:"I1",phase:"Gruppe",group:"I",home:"Frankreich",away:"Senegal",date:"16.06.2026",time:"21:00"},
  {id:"I2",phase:"Gruppe",group:"I",home:"Irak",away:"Norwegen",date:"17.06.2026",time:"00:00"},
  {id:"I3",phase:"Gruppe",group:"I",home:"Frankreich",away:"Irak",date:"21.06.2026",time:"18:00"},
  {id:"I4",phase:"Gruppe",group:"I",home:"Norwegen",away:"Senegal",date:"22.06.2026",time:"00:00"},
  {id:"I5",phase:"Gruppe",group:"I",home:"Frankreich",away:"Norwegen",date:"27.06.2026",time:"21:00"},
  {id:"I6",phase:"Gruppe",group:"I",home:"Senegal",away:"Irak",date:"27.06.2026",time:"21:00"},
  // GRUPPE J
  {id:"J1",phase:"Gruppe",group:"J",home:"Argentinien",away:"Algerien",date:"17.06.2026",time:"03:00"},
  {id:"J2",phase:"Gruppe",group:"J",home:"Österreich",away:"Jordanien",date:"17.06.2026",time:"06:00"},
  {id:"J3",phase:"Gruppe",group:"J",home:"Argentinien",away:"Österreich",date:"22.06.2026",time:"19:00"},
  {id:"J4",phase:"Gruppe",group:"J",home:"Jordanien",away:"Algerien",date:"23.06.2026",time:"05:00"},
  {id:"J5",phase:"Gruppe",group:"J",home:"Argentinien",away:"Jordanien",date:"28.06.2026",time:"02:00"},
  {id:"J6",phase:"Gruppe",group:"J",home:"Algerien",away:"Österreich",date:"28.06.2026",time:"02:00"},
  // GRUPPE K
  {id:"K1",phase:"Gruppe",group:"K",home:"Portugal",away:"DR Kongo",date:"17.06.2026",time:"21:00"},
  {id:"K2",phase:"Gruppe",group:"K",home:"Usbekistan",away:"Kolumbien",date:"18.06.2026",time:"03:00"},
  {id:"K3",phase:"Gruppe",group:"K",home:"Portugal",away:"Usbekistan",date:"22.06.2026",time:"22:00"},
  {id:"K4",phase:"Gruppe",group:"K",home:"Kolumbien",away:"DR Kongo",date:"23.06.2026",time:"03:00"},
  {id:"K5",phase:"Gruppe",group:"K",home:"Portugal",away:"Kolumbien",date:"27.06.2026",time:"22:00"},
  {id:"K6",phase:"Gruppe",group:"K",home:"DR Kongo",away:"Usbekistan",date:"27.06.2026",time:"22:00"},
  // GRUPPE L
  {id:"L1",phase:"Gruppe",group:"L",home:"England",away:"Kroatien",date:"17.06.2026",time:"22:00"},
  {id:"L2",phase:"Gruppe",group:"L",home:"Ghana",away:"Panama",date:"18.06.2026",time:"01:00"},
  {id:"L3",phase:"Gruppe",group:"L",home:"England",away:"Ghana",date:"23.06.2026",time:"22:00"},
  {id:"L4",phase:"Gruppe",group:"L",home:"Kroatien",away:"Panama",date:"23.06.2026",time:"22:00"},
  {id:"L5",phase:"Gruppe",group:"L",home:"England",away:"Panama",date:"27.06.2026",time:"23:00"},
  {id:"L6",phase:"Gruppe",group:"L",home:"Kroatien",away:"Ghana",date:"27.06.2026",time:"23:00"},
];

const KO_MATCHES = [
  ...Array.from({length:16},(_,i)=>({id:`R16_${i+1}`,phase:"Sechzehntelfinale",home:"TBD",away:"TBD",date:"28.06.2026",time:"21:00",locked:true})),
  ...Array.from({length:8},(_,i)=>({id:`AF_${i+1}`,phase:"Achtelfinale",home:"TBD",away:"TBD",date:"05.07.2026",time:"21:00",locked:true})),
  ...Array.from({length:4},(_,i)=>({id:`VF_${i+1}`,phase:"Viertelfinale",home:"TBD",away:"TBD",date:"09.07.2026",time:"21:00",locked:true})),
  ...Array.from({length:2},(_,i)=>({id:`HF_${i+1}`,phase:"Halbfinale",home:"TBD",away:"TBD",date:"14.07.2026",time:"21:00",locked:true})),
  {id:"P3",phase:"Spiel um Platz 3",home:"TBD",away:"TBD",date:"18.07.2026",time:"21:00",locked:true},
  {id:"FINAL",phase:"Finale",home:"TBD",away:"TBD",date:"19.07.2026",time:"21:00",locked:true},
];

const ALL_MATCHES=[...GROUP_MATCHES,...KO_MATCHES];

const ALL_TEAMS=[
  "Mexiko","Südafrika","Südkorea","Tschechien",
  "Kanada","Bosnien-Herzegowina","Katar","Schweiz",
  "Brasilien","Marokko","Haiti","Schottland",
  "USA","Paraguay","Australien","Türkei",
  "Deutschland","Curaçao","Elfenbeinküste","Ecuador",
  "Niederlande","Japan","Schweden","Tunesien",
  "Belgien","Ägypten","Iran","Neuseeland",
  "Spanien","Kap Verde","Saudi-Arabien","Uruguay",
  "Frankreich","Senegal","Irak","Norwegen",
  "Argentinien","Algerien","Österreich","Jordanien",
  "Portugal","DR Kongo","Usbekistan","Kolumbien",
  "England","Kroatien","Ghana","Panama",
];

const FLAG={
  "Mexiko":"🇲🇽","Südafrika":"🇿🇦","Südkorea":"🇰🇷","Tschechien":"🇨🇿",
  "Kanada":"🇨🇦","Bosnien-Herzegowina":"🇧🇦","Katar":"🇶🇦","Schweiz":"🇨🇭",
  "Brasilien":"🇧🇷","Marokko":"🇲🇦","Haiti":"🇭🇹","Schottland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA":"🇺🇸","Paraguay":"🇵🇾","Australien":"🇦🇺","Türkei":"🇹🇷",
  "Deutschland":"🇩🇪","Curaçao":"🇨🇼","Elfenbeinküste":"🇨🇮","Ecuador":"🇪🇨",
  "Niederlande":"🇳🇱","Japan":"🇯🇵","Schweden":"🇸🇪","Tunesien":"🇹🇳",
  "Belgien":"🇧🇪","Ägypten":"🇪🇬","Iran":"🇮🇷","Neuseeland":"🇳🇿",
  "Spanien":"🇪🇸","Kap Verde":"🇨🇻","Saudi-Arabien":"🇸🇦","Uruguay":"🇺🇾",
  "Frankreich":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Norwegen":"🇳🇴",
  "Argentinien":"🇦🇷","Algerien":"🇩🇿","Österreich":"🇦🇹","Jordanien":"🇯🇴",
  "Portugal":"🇵🇹","DR Kongo":"🇨🇩","Usbekistan":"🇺🇿","Kolumbien":"🇨🇴",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Kroatien":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦","TBD":"❓",
};

const SPECIAL_BETS=[
  {id:"sb_champion",label:"🏆 Weltmeister",desc:"Wer wird Weltmeister 2026?",points:5,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_finalist1",label:"🥈 Finalist 1",desc:"Eines der beiden Finalteams",points:3,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_finalist2",label:"🥈 Finalist 2",desc:"Das andere Finalteam",points:3,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_sf1",label:"🏟️ Halbfinalist 1",desc:"Eines der vier Halbfinalteams",points:2,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_sf2",label:"🏟️ Halbfinalist 2",desc:"Eines der vier Halbfinalteams",points:2,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_sf3",label:"🏟️ Halbfinalist 3",desc:"Eines der vier Halbfinalteams",points:2,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_sf4",label:"🏟️ Halbfinalist 4",desc:"Eines der vier Halbfinalteams",points:2,deadline:"11.06.2026",dtime:"20:00"},
  {id:"sb_topscorer",label:"⚽ Torschützenkönig",desc:"Wer schießt die meisten Tore?",points:3,deadline:"11.06.2026",dtime:"20:00"},
];

const tendency=(h,a)=>h>a?"H":a>h?"A":"D";
const calcPoints=(tip,result)=>{
  if(!tip||!result||tip.home===""||tip.away==="")return null;
  if(Number(tip.home)===Number(result.home)&&Number(tip.away)===Number(result.away))return 3;
  if(tendency(tip.home,tip.away)===tendency(result.home,result.away))return 1;
  return 0;
};
const isMatchLocked=(date,time)=>{
  const[day,month,year]=date.split(".");
  const[hour,minute]=time.split(":");
  return new Date()>=new Date(`${year}-${month}-${day}T${hour}:${minute}:00+02:00`);
};

// ── Gruppentabelle wird live aus den eingetragenen Ergebnissen berechnet ──────
const computeStandings=(group,results)=>{
  const table={};
  GROUPS[group].forEach(t=>{table[t]={team:t,sp:0,s:0,u:0,n:0,tore:0,gegentore:0,diff:0,pkt:0};});
  GROUP_MATCHES.filter(m=>m.group===group).forEach(m=>{
    const r=results[m.id];
    if(!r||r.home===""||r.away===""||r.home==null||r.away==null)return;
    const hs=Number(r.home),as=Number(r.away);
    const H=table[m.home],A=table[m.away];
    H.sp++;A.sp++;H.tore+=hs;H.gegentore+=as;A.tore+=as;A.gegentore+=hs;
    if(hs>as){H.s++;H.pkt+=3;A.n++;}
    else if(as>hs){A.s++;A.pkt+=3;H.n++;}
    else{H.u++;A.u++;H.pkt++;A.pkt++;}
  });
  return Object.values(table).map(t=>({...t,diff:t.tore-t.gegentore})).sort((a,b)=>b.pkt-a.pkt||b.diff-a.diff||b.tore-a.tore);
};

export default function App(){
  const[page,setPage]=useState("home");
  const[session,setSession]=useState(null);
  const[profile,setProfile]=useState(null);
  const[tips,setTips]=useState({});
  const[specialTips,setSpecialTips]=useState({});
  const[results,setResults]=useState({});
  const[leaderboard,setLboard]=useState([]);
  const[notif,setNotif]=useState(null);
  const[loading,setLoading]=useState(false);

  const notify=(msg,type="ok")=>{setNotif({msg,type});setTimeout(()=>setNotif(null),3500);};

  const loadResults=useCallback(async()=>{
    try{const rows=await sb("results?select=match_id,home_score,away_score");const map={};(rows||[]).forEach(r=>{map[r.match_id]={home:r.home_score,away:r.away_score};});setResults(map);}catch(e){console.error(e);}
  },[]);

  const loadTips=useCallback(async(token)=>{
    try{
      let uid;try{uid=JSON.parse(atob(token.split(".")[1])).sub;}catch{}
      const q=sel=>uid?`tips?user_id=eq.${uid}&select=${sel}`:`tips?select=${sel}`;
      let rows;
      try{rows=await sb(q("match_id,home_score,away_score,submitted"),"GET",null,token);}
      catch{rows=await sb(q("match_id,home_score,away_score"),"GET",null,token);}
      const map={};(rows||[]).forEach(r=>{map[r.match_id]={home:r.home_score,away:r.away_score,submitted:!!r.submitted};});
      setTips(map);
    }catch(e){console.error(e);}
  },[]);

  const loadSpecialTips=useCallback(async(token)=>{
    try{
      let uid;try{uid=JSON.parse(atob(token.split(".")[1])).sub;}catch{}
      const q=sel=>uid?`special_tips?user_id=eq.${uid}&select=${sel}`:`special_tips?select=${sel}`;
      const rows=await sb(q("bet_id,value,submitted"),"GET",null,token);
      const map={};(rows||[]).forEach(r=>{map[r.bet_id]={value:r.value,submitted:!!r.submitted};});
      setSpecialTips(map);
    }catch(e){console.error(e);}
  },[]);

  const loadLeaderboard=useCallback(async()=>{
    try{
      const[profiles,allTips,allResults]=await Promise.all([sb("profiles?select=id,username"),sb("tips?select=user_id,match_id,home_score,away_score"),sb("results?select=match_id,home_score,away_score")]);
      const resMap={};(allResults||[]).forEach(r=>{resMap[r.match_id]={home:r.home_score,away:r.away_score};});
      const lb=(profiles||[]).map(p=>{
        const ut=(allTips||[]).filter(t=>t.user_id===p.id);
        let pts=0,exact=0,tend=0;
        ut.forEach(t=>{const p2=calcPoints({home:t.home_score,away:t.away_score},resMap[t.match_id]);if(p2===3){pts+=3;exact++;}else if(p2===1){pts+=1;tend++;}});
        return{username:p.username,pts,exact,tend,tipped:ut.length};
      }).sort((a,b)=>b.pts-a.pts||b.exact-a.exact);
      setLboard(lb);
    }catch(e){console.error(e);}
  },[]);

  useEffect(()=>{
    const stored=localStorage.getItem("xrp_session");
    if(stored){try{const sess=JSON.parse(stored);setSession(sess);loadTips(sess.access_token);loadSpecialTips(sess.access_token);}catch{}}
    loadResults();loadLeaderboard();
  },[loadResults,loadLeaderboard,loadTips,loadSpecialTips]);

  useEffect(()=>{
    if(!session)return;
    sb(`profiles?id=eq.${session.user.id}&select=username,bitvavo_uid,is_admin`,"GET",null,session.access_token).then(rows=>rows&&rows[0]&&setProfile(rows[0])).catch(console.error);
  },[session]);

  const handleRegister=async(username,password,bitvavoUID)=>{
    setLoading(true);
    try{
      const data=await sbAuth("signup",{email:`${username.replace(/\s/g,"_")}@xrp-wm.de`,password});
      const token=data.access_token;
      await sb("profiles","POST",{id:data.user.id,username,bitvavo_uid:bitvavoUID},token);
      const sess={access_token:token,user:data.user};
      setSession(sess);localStorage.setItem("xrp_session",JSON.stringify(sess));
      setProfile({username,bitvavo_uid:bitvavoUID,is_admin:false});setPage("tips");notify(`Willkommen, ${username}! 🎉`);
    }catch(e){notify(e.message||"Registrierung fehlgeschlagen","err");}
    setLoading(false);
  };

  const handleLogin=async(username,password)=>{
    setLoading(true);
    try{
      const data=await sbAuth("token?grant_type=password",{email:`${username.replace(/\s/g,"_")}@xrp-wm.de`,password});
      const sess={access_token:data.access_token,user:data.user};
      setSession(sess);localStorage.setItem("xrp_session",JSON.stringify(sess));
      await loadTips(data.access_token);await loadSpecialTips(data.access_token);setPage("tips");notify(`Willkommen zurück, ${username}! ⚽`);
    }catch(e){notify("Falscher Benutzername oder Passwort!","err");}
    setLoading(false);
  };

  const handleLogout=()=>{setSession(null);setProfile(null);setTips({});localStorage.removeItem("xrp_session");setPage("home");};

  const saveTip=async(matchId,home,away)=>{
    if(!session||home===""||away==="")return;
    const match=ALL_MATCHES.find(m=>m.id===matchId);
    if(match&&(match.locked||isMatchLocked(match.date,match.time))){notify("⛔ Spiel hat bereits begonnen – Tipp ist gesperrt!","err");return;}
    if(tips[matchId]?.submitted){notify("⛔ Tipp ist bereits abgeschickt und gesperrt!","err");return;}
    const body={user_id:session.user.id,match_id:matchId,home_score:parseInt(home),away_score:parseInt(away),submitted:false,updated_at:new Date().toISOString()};
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/tips`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${session.access_token}`,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body)});
      setTips(t=>({...t,[matchId]:{home:parseInt(home),away:parseInt(away),submitted:false}}));
    }catch(e){console.error(e);}
  };

  const submitTip=async(matchId,home,away)=>{
    if(!session||home===""||away==="")return;
    const match=ALL_MATCHES.find(m=>m.id===matchId);
    if(match&&(match.locked||isMatchLocked(match.date,match.time))){notify("⛔ Spiel hat bereits begonnen – Tipp ist gesperrt!","err");return;}
    if(tips[matchId]?.submitted)return;
    const body={user_id:session.user.id,match_id:matchId,home_score:parseInt(home),away_score:parseInt(away),submitted:true,updated_at:new Date().toISOString()};
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/tips`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${session.access_token}`,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body)});
      setTips(t=>({...t,[matchId]:{home:parseInt(home),away:parseInt(away),submitted:true}}));
      notify("🔒 Tipp abgeschickt & gesperrt – kann nicht mehr geändert werden!");
    }catch(e){notify("Fehler beim Abschicken!","err");}
  };

  const saveSpecialTip=async(betId,value)=>{
    if(!session||!value)return;
    if(isMatchLocked("11.06.2026","20:00")){notify("⛔ Sondertipps sind bereits gesperrt!","err");return;}
    if(specialTips[betId]?.submitted){notify("⛔ Sondertipp ist bereits abgeschickt und gesperrt!","err");return;}
    const body={user_id:session.user.id,bet_id:betId,value,submitted:false,updated_at:new Date().toISOString()};
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/special_tips`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${session.access_token}`,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body)});
      setSpecialTips(t=>({...t,[betId]:{value,submitted:false}}));
    }catch(e){console.error(e);}
  };

  const submitSpecialTip=async(betId,value)=>{
    if(!session||!value)return;
    if(isMatchLocked("11.06.2026","20:00")){notify("⛔ Sondertipps sind bereits gesperrt!","err");return;}
    if(specialTips[betId]?.submitted)return;
    const body={user_id:session.user.id,bet_id:betId,value,submitted:true,updated_at:new Date().toISOString()};
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/special_tips`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${session.access_token}`,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body)});
      setSpecialTips(t=>({...t,[betId]:{value,submitted:true}}));
      notify("🔒 Sondertipp abgeschickt & gesperrt!");
    }catch(e){notify("Fehler beim Abschicken!","err");}
  };

  const saveResult=async(matchId,home,away)=>{
    if(!session||home===""||away==="")return;
    const body={match_id:matchId,home_score:parseInt(home),away_score:parseInt(away),updated_at:new Date().toISOString()};
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/results`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${session.access_token}`,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body)});
      setResults(r=>({...r,[matchId]:{home:parseInt(home),away:parseInt(away)}}));loadLeaderboard();notify("Ergebnis gespeichert! ✓");
    }catch(e){notify("Fehler!","err");}
  };

  return(
    <div style={S.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0a0f1e}::-webkit-scrollbar-thumb{background:#1a3a2a;border-radius:3px}a:hover{opacity:.8}button:hover{filter:brightness(1.1)}select{background:#111;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:8px 12px;font-size:14px;outline:none;width:100%}`}</style>
      <div style={S.bgGlow1}/><div style={S.bgGlow2}/><div style={S.bgGrid}/>
      {notif&&<div style={{...S.notif,background:notif.type==="err"?"#c0392b":"#00b86e"}}>{notif.msg}</div>}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.brand} onClick={()=>setPage("home")}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="47" stroke="white" strokeWidth="3.5"/><circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1.5"/><path d="M18 20 L50 52 L82 20" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 80 L50 48 L82 80" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div><div style={S.brandName}>XRP Deutschland</div><div style={S.brandSub}>WM 2026 Tipprunde</div></div>
          </div>
          <nav style={S.nav}>
            {[["home","🏠"],["tips","⚽ Tippen"],["special","🌟 Sondertipps"],["leaderboard","🏆 Rangliste"]].map(([p,label])=>(
              <button key={p} style={{...S.navBtn,...(page===p?S.navBtnOn:{})}} onClick={()=>{if((p==="tips"||p==="special")&&!session){setPage("login");}else{setPage(p);}}}>
                {label}
              </button>
            ))}
            {session?(<><span style={S.navUser}>👤 {profile?.username||"…"}</span><button style={S.navBtn} onClick={handleLogout}>Abmelden</button></>):(
              <><button style={S.navBtn} onClick={()=>setPage("login")}>Anmelden</button><button style={{...S.navBtn,...S.navBtnGreen}} onClick={()=>setPage("register")}>Registrieren</button></>
            )}
          </nav>
        </div>
      </header>
      <main style={S.main}>
        {page==="home"&&<HomePage setPage={setPage} session={session}/>}
        {page==="register"&&<RegisterPage onRegister={handleRegister} setPage={setPage} loading={loading}/>}
        {page==="login"&&<LoginPage onLogin={handleLogin} setPage={setPage} loading={loading}/>}
        {page==="tips"&&<TipsPage session={session} profile={profile} tips={tips} results={results} saveTip={saveTip} submitTip={submitTip} saveResult={saveResult} setPage={setPage}/>}
        {page==="special"&&<SpecialBetsPage session={session} specialTips={specialTips} saveSpecialTip={saveSpecialTip} submitSpecialTip={submitSpecialTip} setPage={setPage}/>}
        {page==="leaderboard"&&<LeaderboardPage leaderboard={leaderboard} profile={profile} onRefresh={loadLeaderboard}/>}
      </main>
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={S.footerLeft}><span style={S.poweredBy}>powered by</span><span style={S.bitvavoBrand}>// bitvavo</span></div>
          <div style={S.footerRight}>
            <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={S.footerLink}>Bitvavo</a>
            <a href="https://www.youtube.com/@xrpdeutschland" target="_blank" rel="noreferrer" style={S.footerLink}>YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage({setPage,session}){
  return(
    <div style={S.homeWrap}>
      <div style={S.homeBadge}>🏆 FIFA WM 2026 · USA · Kanada · Mexiko · 11. Juni – 19. Juli</div>
      <h1 style={S.heroH1}>XRP<br/><span style={S.heroGreen}>Deutschland</span><br/>WM 2026</h1>
      <p style={S.heroP}>Tippe alle 72 Gruppenspiele + K.O.-Runde der WM 2026 in der größten deutschsprachigen XRP-Community!</p>
      <div style={S.prizeCard}>
        <div style={S.prizeHeadRow}><span style={S.prizeIcon}>🎁</span><span style={S.prizeHead}>Gewinne für Platz 1–3!</span></div>
        <p style={S.prizeBody}>Die besten drei Tipper erhalten <strong>coole Gewinne!</strong> Genauere Informationen über unsere Kanäle.</p>
        <div style={S.prizeRule}><strong>Teilnahmebedingungen:</strong> Meldet euch über unseren Link bei Bitvavo an. <em>Keine Gewinne ohne Bitvavo UID!</em></div>
        <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={S.bitvavoBtn}>
          <span>🔗</span><span>Jetzt bei Bitvavo registrieren &amp; 20€ in XRP sichern</span><span style={S.bitvavoBtnArrow}>→</span>
        </a>
      </div>
      <div style={S.pointsCard}>
        <div style={S.pointsHead}>📊 Punktesystem</div>
        <div style={S.pointsRow}>
          {[{pts:"3",label:"Genaues Ergebnis",color:"#00d084"},{pts:"1",label:"Richtige Tendenz (S/U/N)",color:"#f0c040"},{pts:"0",label:"Falsch getippt",color:"#888"},{pts:"2-5",label:"Sondertipps",color:"#a78bfa"}].map(p=>(
            <div key={p.pts} style={S.pointItem}><span style={{...S.pointNum,color:p.color}}>{p.pts}</span><span style={S.pointLabel}>Punkte</span><span style={S.pointDesc}>{p.label}</span></div>
          ))}
        </div>
      </div>
      {session?(<div style={S.ctaRow}><button style={S.ctaGreen} onClick={()=>setPage("tips")}>Zu meinen Tipps →</button><button style={S.ctaGhost} onClick={()=>setPage("special")}>🌟 Sondertipps</button></div>):(
        <div style={S.ctaRow}><button style={S.ctaGreen} onClick={()=>setPage("register")}>Jetzt mitmachen →</button><button style={S.ctaGhost} onClick={()=>setPage("login")}>Bereits registriert</button></div>
      )}
    </div>
  );
}

function RegisterPage({onRegister,setPage,loading}){
  const[u,setU]=useState("");const[p,setP]=useState("");const[p2,setP2]=useState("");const[err,setErr]=useState("");
  const go=()=>{setErr("");if(!u.trim())return setErr("Benutzername ist Pflicht.");if(p.length<6)return setErr("Passwort mind. 6 Zeichen.");if(p!==p2)return setErr("Passwörter stimmen nicht überein.");onRegister(u.trim(),p,"");};
  return(<div style={S.authWrap}><div style={S.authCard}>
    <h2 style={S.authTitle}>Registrieren</h2><p style={S.authSub}>Erstelle deinen Account für die XRP WM Tipprunde</p>
    {err&&<div style={S.errBox}>{err}</div>}
    <Field label="Benutzername" value={u} onChange={setU} placeholder="Dein Tipp-Name (keine Leerzeichen)"/>
    <Field label="Passwort" value={p} onChange={setP} type="password" placeholder="Mind. 6 Zeichen"/>
    <Field label="Passwort wiederholen" value={p2} onChange={setP2} type="password" placeholder="Passwort bestätigen"/>
    <div style={S.bvNote}>
      <strong>Hinweis:</strong> Für die Teilnahme an der Gewinnausschüttung benötigst du einen Bitvavo-Account.
      <a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={{fontSize:12,color:"#00d084",display:"block",marginTop:4}}>→ Noch kein Account? 20€ XRP Bonus sichern</a>
    </div>
    <button style={S.submitBtn} onClick={go} disabled={loading}>{loading?"Wird erstellt…":"Account erstellen →"}</button>
    <p style={S.switchTxt}>Bereits registriert? <span style={S.switchLink} onClick={()=>setPage("login")}>Anmelden</span></p>
  </div></div>);
}

function LoginPage({onLogin,setPage,loading}){
  const[u,setU]=useState("");const[p,setP]=useState("");
  return(<div style={S.authWrap}><div style={S.authCard}>
    <h2 style={S.authTitle}>Anmelden</h2><p style={S.authSub}>Willkommen zurück in der Tipprunde!</p>
    <Field label="Benutzername" value={u} onChange={setU} placeholder="Dein Benutzername"/>
    <Field label="Passwort" value={p} onChange={setP} type="password" placeholder="Dein Passwort" onKeyDown={e=>e.key==="Enter"&&onLogin(u,p)}/>
    <button style={S.submitBtn} onClick={()=>onLogin(u,p)} disabled={loading}>{loading?"Anmelden…":"Anmelden →"}</button>
    <p style={S.switchTxt}>Noch kein Account? <span style={S.switchLink} onClick={()=>setPage("register")}>Registrieren</span></p>
  </div></div>);
}

function TipsPage({session,profile,tips,results,saveTip,submitTip,saveResult,setPage}){
  const[activePhase,setActivePhase]=useState("Gruppe");
  const[activeGroup,setActiveGroup]=useState("A");
  const phases=["Gruppe","Sechzehntelfinale","Achtelfinale","Viertelfinale","Halbfinale","Spiel um Platz 3","Finale"];
  const phaseMatches=activePhase==="Gruppe"?ALL_MATCHES.filter(m=>m.phase==="Gruppe"&&m.group===activeGroup):ALL_MATCHES.filter(m=>m.phase===activePhase);
  const tipCount=Object.keys(tips).length;

  if(!session)return(<div style={S.guestWrap}><div style={S.guestCard}>
    <span style={{fontSize:72}}>⚽</span><h2 style={S.authTitle}>Meld dich an!</h2>
    <p style={{color:"#7a8fa8",marginBottom:16}}>Du musst eingeloggt sein um Tipps abzugeben.</p>
    <button style={S.ctaGreen} onClick={()=>setPage("register")}>Jetzt registrieren →</button>
    <button style={{...S.ctaGhost,marginTop:8}} onClick={()=>setPage("login")}>Anmelden</button>
  </div></div>);

  return(<div style={S.tipsWrap}>
    <div style={S.tipsTop}>
      <h2 style={S.tipsH2}>Deine Tipps{profile?`, ${profile.username}`:""} 👋</h2>
      <p style={S.tipsHint}>✅ {tipCount} Tipps abgegeben · Automatisch gespeichert · Sperre bei Anpfiff (MESZ)</p>
      {profile?.is_admin&&<div style={S.adminBadge}>🔐 Admin-Modus – Ergebnisse eintragen</div>}
    </div>
    <div style={S.tabs}>{phases.map(ph=>(<button key={ph} style={{...S.tab,...(activePhase===ph?S.tabOn:{})}} onClick={()=>setActivePhase(ph)}>{ph}</button>))}</div>
    {activePhase==="Gruppe"&&(<>
      <div style={S.groupRow}>{Object.keys(GROUPS).map(g=>(<button key={g} style={{...S.groupBtn,...(activeGroup===g?S.groupBtnOn:{})}} onClick={()=>setActiveGroup(g)}>{g}{g==="E"?" 🇩🇪":""}</button>))}</div>
      <GroupTable group={activeGroup} results={results}/>
    </>)}
    {activePhase!=="Gruppe"&&phaseMatches.every(m=>m.locked)&&(
      <div style={S.koHint}>🔒 Diese Runde ist noch gesperrt – die Paarungen stehen erst nach Abschluss der Vorrunde fest und werden dann von der Turnierleitung eingetragen.</div>
    )}
    <div style={S.matchGrid}>{phaseMatches.map(m=>(<MatchCard key={m.id} match={m} tip={tips[m.id]} result={results[m.id]} onTip={(h,a)=>saveTip(m.id,h,a)} onSubmit={(h,a)=>submitTip(m.id,h,a)} onResult={(h,a)=>saveResult(m.id,h,a)} isAdmin={profile?.is_admin}/>))}</div>
  </div>);
}

function GroupTable({group,results}){
  const table=computeStandings(group,results);
  const played=table.some(t=>t.sp>0);
  return(<div style={S.tableCard}>
    <div style={S.tableHead}>📊 Tabelle Gruppe {group}{group==="E"?" 🇩🇪":""} <span style={S.tableHint}>– wird automatisch nach jedem eingetragenen Ergebnis aktualisiert</span></div>
    {!played?(
      <div style={{padding:"16px 4px",color:"#7a8fa8",fontSize:13}}>Noch keine Ergebnisse eingetragen – die Tabelle füllt sich automatisch, sobald die ersten Spiele ausgewertet sind.</div>
    ):(
      <div style={S.tableWrap}>
        <div style={{...S.tableRow,...S.tableRowHead}}>
          <span style={S.tablePos}>#</span><span style={{flex:1}}>Team</span>
          <span style={S.tableCol}>Sp</span><span style={S.tableCol}>S</span><span style={S.tableCol}>U</span><span style={S.tableCol}>N</span>
          <span style={S.tableCol}>Tore</span><span style={S.tableCol}>Diff</span><span style={S.tableColPts}>Pkt</span>
        </div>
        {table.map((t,i)=>(
          <div key={t.team} style={{...S.tableRow,...(i<2?S.tableRowQ:{})}}>
            <span style={S.tablePos}>{i+1}.</span>
            <span style={{flex:1,display:"flex",alignItems:"center",gap:8,fontWeight:700}}><span>{FLAG[t.team]}</span>{t.team}</span>
            <span style={S.tableCol}>{t.sp}</span><span style={S.tableCol}>{t.s}</span><span style={S.tableCol}>{t.u}</span><span style={S.tableCol}>{t.n}</span>
            <span style={S.tableCol}>{t.tore}:{t.gegentore}</span><span style={S.tableCol}>{t.diff>0?`+${t.diff}`:t.diff}</span>
            <span style={S.tableColPts}>{t.pkt}</span>
          </div>
        ))}
        <div style={S.tableLegend}><span style={S.tableLegendDot}/> Plätze 1–2 qualifizieren sich direkt für die K.O.-Runde (+ die 8 besten Gruppendritten)</div>
      </div>
    )}
  </div>);
}

function SpecialBetsPage({session,specialTips,saveSpecialTip,submitSpecialTip,setPage}){
  if(!session)return(<div style={S.guestWrap}><div style={S.guestCard}>
    <span style={{fontSize:72}}>🌟</span><h2 style={S.authTitle}>Meld dich an!</h2>
    <p style={{color:"#7a8fa8",marginBottom:16}}>Sondertipps nur für angemeldete Nutzer.</p>
    <button style={S.ctaGreen} onClick={()=>setPage("register")}>Jetzt registrieren →</button>
    <button style={{...S.ctaGhost,marginTop:8}} onClick={()=>setPage("login")}>Anmelden</button>
  </div></div>);
  const allLocked=isMatchLocked("11.06.2026","20:00");
  return(<div style={S.tipsWrap}>
    <div style={S.tipsTop}>
      <h2 style={S.tipsH2}>🌟 Sondertipps</h2>
      <p style={S.tipsHint}>Deadline: vor dem Eröffnungsspiel · 11.06.2026 · 21:00 Uhr MESZ</p>
      {allLocked&&<div style={{...S.adminBadge,background:"rgba(255,80,80,.15)",borderColor:"rgba(255,80,80,.3)",color:"#ff8080"}}>🔒 Gesperrt – Turnier hat begonnen</div>}
    </div>
    <div style={S.matchGrid}>{SPECIAL_BETS.map(bet=>{
      const entry=specialTips[bet.id];
      const val=entry?.value||"";
      const submitted=!!entry?.submitted;
      const locked=allLocked||submitted;
      const canSubmit=!allLocked&&!submitted&&!!val;
      return(<div key={bet.id} style={S.mCard}>
        <div style={S.mMeta}>
          <span style={S.mGroup}>{bet.label}</span>
          <span style={{...S.ptsPill,background:"rgba(167,139,250,.2)",color:"#a78bfa",border:"1px solid rgba(167,139,250,.4)"}}>+{bet.points} Punkte</span>
          <span style={S.mDate}>Deadline: {bet.deadline} · {bet.dtime} Uhr</span>
          {submitted&&<span style={{...S.ptsPill,background:"rgba(0,208,132,.15)",color:"#00d084",border:"1px solid rgba(0,208,132,.35)"}}>🔒 Abgeschickt</span>}
        </div>
        <p style={{fontSize:13,color:"#7a8fa8",marginBottom:8}}>{bet.desc}</p>
        {locked?(
          <div style={{padding:"10px 14px",background:"rgba(255,255,255,.05)",borderRadius:8,fontSize:14,color:"#aab8cc"}}>{val?<><span style={{marginRight:8}}>{FLAG[val]||"🏳️"}</span>{val}</>:"Kein Tipp abgegeben"}</div>
        ):(<>
          <select value={val} onChange={e=>saveSpecialTip(bet.id,e.target.value)}>
            <option value="">– Team auswählen –</option>
            {ALL_TEAMS.sort().map(t=>(<option key={t} value={t}>{FLAG[t]||"🏳️"} {t}</option>))}
          </select>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <button style={{...S.submitTipBtn,...(canSubmit?{}:S.submitTipBtnOff)}} disabled={!canSubmit} onClick={()=>submitSpecialTip(bet.id,val)}>🔒 Tipp abschicken &amp; sperren</button>
          </div>
        </>)}
        {val&&!locked&&<div style={{marginTop:8,fontSize:13,color:"#00d084"}}>✓ Entwurf gespeichert: {FLAG[val]} {val} <span style={{color:"#7a8fa8"}}>– zum Sperren auf „Abschicken“ klicken</span></div>}
        {submitted&&<div style={{marginTop:8,fontSize:13,color:"#00d084"}}>🔒 Final abgeschickt – kann nicht mehr geändert werden.</div>}
      </div>);
    })}</div>
  </div>);
}

function MatchCard({match,tip,result,onTip,onSubmit,onResult,isAdmin}){
  const[h,setH]=useState(tip?.home??"");const[a,setA]=useState(tip?.away??"");
  const[rh,setRh]=useState(result?.home??"");const[ra,setRa]=useState(result?.away??"");
  useEffect(()=>{setH(tip?.home??"");setA(tip?.away??"");},[tip]);
  useEffect(()=>{setRh(result?.home??"");setRa(result?.away??"");},[result]);
  const pts=(result&&tip&&h!==""&&a!=="")?calcPoints(tip,result):null;
  const timeLocked=match.locked||(!isAdmin&&isMatchLocked(match.date,match.time));
  const submitted=!!tip?.submitted;
  const locked=timeLocked||submitted;
  const canSubmit=!timeLocked&&!submitted&&h!==""&&a!=="";
  const ptsStyle=pts===3?{background:"rgba(0,208,132,.2)",color:"#00d084",border:"1px solid rgba(0,208,132,.4)"}:pts===1?{background:"rgba(240,192,64,.2)",color:"#f0c040",border:"1px solid rgba(240,192,64,.4)"}:pts===0?{background:"rgba(255,80,80,.15)",color:"#ff6b6b",border:"1px solid rgba(255,80,80,.3)"}:{};
  return(<div style={S.mCard}>
    <div style={S.mMeta}>
      <span style={S.mDate}>{match.date} · {match.time} Uhr</span>
      {match.group&&<span style={S.mGroup}>Gr. {match.group}</span>}
      {match.phase!=="Gruppe"&&<span style={S.mPhase}>{match.phase}</span>}
      {pts!==null&&<span style={{...S.ptsPill,...ptsStyle}}>{pts===3?"✓ 3 Pkt":pts===1?"≈ 1 Pkt":"✗ 0 Pkt"}</span>}
      {submitted&&pts===null&&<span style={{...S.ptsPill,background:"rgba(0,208,132,.15)",color:"#00d084",border:"1px solid rgba(0,208,132,.35)"}}>🔒 Abgeschickt</span>}
      {!locked&&h!==""&&a!==""&&<span style={{fontSize:10,color:"#00d084",marginLeft:"auto"}}>✓</span>}
    </div>
    <div style={S.mRow}>
      <div style={S.mTeam}><span style={S.mFlag}>{FLAG[match.home]||"🏳️"}</span><span style={S.mTeamName}>{match.home}</span></div>
      <div style={S.mScore}>
        {locked?(
          submitted?(
            <span style={{fontSize:22,fontWeight:900,fontFamily:"'Bebas Neue',sans-serif",color:"#00d084"}}>{h} : {a}</span>
          ):(
            <span style={{fontSize:12,color:match.locked?"#3a4a5a":"#ff6b6b",fontStyle:"italic",padding:"0 8px"}}>{match.locked?"TBD":"🔒 Gesperrt"}</span>
          )
        ):(
          <><input style={S.scoreIn} type="number" min="0" max="30" value={h} placeholder="–" onChange={e=>{setH(e.target.value);onTip(e.target.value,a);}}/><span style={S.scoreSep}>:</span><input style={S.scoreIn} type="number" min="0" max="30" value={a} placeholder="–" onChange={e=>{setA(e.target.value);onTip(h,e.target.value);}}/></>
        )}
      </div>
      <div style={{...S.mTeam,justifyContent:"flex-end"}}><span style={S.mTeamName}>{match.away}</span><span style={S.mFlag}>{FLAG[match.away]||"🏳️"}</span></div>
    </div>
    {!timeLocked&&!submitted&&(
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button style={{...S.submitTipBtn,...(canSubmit?{}:S.submitTipBtnOff)}} disabled={!canSubmit} onClick={()=>onSubmit(h,a)}>🔒 Tipp abschicken &amp; sperren</button>
      </div>
    )}
    {submitted&&!result&&<div style={{fontSize:12,color:"#00d084"}}>🔒 Abgeschickt – dein Tipp ist final gespeichert und kann nicht mehr geändert werden.</div>}
    <div style={S.mBottom}>
      {result&&<span style={S.resultPill}>Ergebnis: {result.home}:{result.away}</span>}
      {isAdmin&&!match.locked&&(<div style={S.adminRow}>
        <span style={S.adminLabel}>Admin:</span>
        <input style={S.scoreInSm} type="number" min="0" value={rh} placeholder="–" onChange={e=>setRh(e.target.value)}/><span style={{color:"#888"}}>:</span>
        <input style={S.scoreInSm} type="number" min="0" value={ra} placeholder="–" onChange={e=>setRa(e.target.value)}/>
        <button style={S.saveBtn} onClick={()=>onResult(rh,ra)}>✓</button>
      </div>)}
    </div>
  </div>);
}

function LeaderboardPage({leaderboard,profile,onRefresh}){
  const medals=["🥇","🥈","🥉"];
  return(<div style={S.lbWrap}>
    <div style={S.lbTop}><h2 style={S.lbH2}>🏆 Rangliste</h2><button style={S.refreshBtn} onClick={onRefresh}>↻ Aktualisieren</button></div>
    <p style={S.lbSub}>Wer tippt am besten in der XRP Deutschland Community?</p>
    {leaderboard.length===0?(<div style={S.lbEmpty}>Noch keine Teilnehmer – sei der Erste! 🚀</div>):(
      <div style={S.lbList}>
        <div style={{...S.lbRow,background:"transparent",border:"none",color:"#5a6a7a",fontSize:11,letterSpacing:1,textTransform:"uppercase"}}>
          <span style={S.lbRank}>#</span><span style={{flex:1}}>Spieler</span><span style={S.lbCol}>Punkte</span><span style={S.lbCol}>Exakt</span><span style={S.lbCol}>Tendenz</span><span style={S.lbCol}>Tipps</span>
        </div>
        {leaderboard.map((e,i)=>{const isMe=e.username===profile?.username;return(
          <div key={e.username} style={{...S.lbRow,...(i===0?S.lbGold:i===1?S.lbSilver:i===2?S.lbBronze:{}),...(isMe?S.lbMe:{})}}>
            <span style={S.lbRank}>{i<3?medals[i]:`${i+1}.`}</span>
            <span style={{flex:1,fontWeight:700,color:isMe?"#00d084":"#e8edf5"}}>{e.username}{isMe&&<span style={{fontSize:11,color:"#00d084",marginLeft:6}}>(Du)</span>}</span>
            <span style={{...S.lbCol,color:"#00d084",fontSize:20,fontWeight:900}}>{e.pts}</span>
            <span style={S.lbCol}>{e.exact}</span><span style={S.lbCol}>{e.tend}</span><span style={S.lbCol}>{e.tipped}</span>
          </div>
        );})}
      </div>
    )}
    <div style={S.lbNote}><strong>🎁 Preise für Platz 1–3!</strong> Genauere Informationen über unsere Kanäle.<br/><em>Voraussetzung: Bitvavo-Account über unseren </em><a href="https://bitvavo.com/de/affiliate/xrpbros?a=8C3C4335B9" target="_blank" rel="noreferrer" style={{color:"#00d084"}}>Affiliate-Link</a><em> registriert.</em></div>
  </div>);
}

function Field({label,value,onChange,type="text",placeholder="",onKeyDown}){
  return(<div style={{display:"flex",flexDirection:"column",gap:5}}>
    <label style={S.fieldLabel}>{label}</label>
    <input style={S.fieldInput} type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onKeyDown={onKeyDown}/>
  </div>);
}

const S={
  root:{minHeight:"100vh",background:"#04080f",color:"#dde5f0",fontFamily:"'Barlow',sans-serif",position:"relative",overflowX:"hidden"},
  bgGlow1:{position:"fixed",top:"-20%",left:"-10%",width:"60vw",height:"60vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,80,40,.18) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  bgGlow2:{position:"fixed",bottom:"-20%",right:"-10%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,40,120,.15) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  bgGrid:{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none",zIndex:0},
  notif:{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,padding:"12px 28px",borderRadius:8,fontSize:14,fontWeight:700,color:"#fff",boxShadow:"0 4px 30px rgba(0,0,0,.5)",whiteSpace:"nowrap"},
  header:{position:"sticky",top:0,zIndex:100,background:"rgba(4,8,15,.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,.07)"},
  headerInner:{maxWidth:1120,margin:"0 auto",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16},
  brand:{display:"flex",alignItems:"center",gap:12,cursor:"pointer"},
  brandName:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,color:"#fff"},
  brandSub:{fontSize:10,color:"#00d084",letterSpacing:3,fontWeight:700,textTransform:"uppercase"},
  nav:{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"},
  navBtn:{padding:"7px 12px",background:"transparent",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,color:"#8a9ab0",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Barlow',sans-serif"},
  navBtnOn:{color:"#fff",borderColor:"rgba(255,255,255,.35)",background:"rgba(255,255,255,.05)"},
  navBtnGreen:{background:"#00d084",color:"#000",borderColor:"#00d084",fontWeight:800},
  navUser:{color:"#00d084",fontSize:13,fontWeight:700},
  main:{position:"relative",zIndex:1,maxWidth:1120,margin:"0 auto",padding:"36px 24px 80px"},
  homeWrap:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:32},
  homeBadge:{display:"inline-block",padding:"6px 20px",background:"rgba(0,208,132,.08)",border:"1px solid rgba(0,208,132,.25)",borderRadius:99,fontSize:12,color:"#00d084",letterSpacing:2,fontWeight:700,textTransform:"uppercase"},
  heroH1:{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(56px,10vw,110px)",lineHeight:.95,letterSpacing:6,color:"#fff"},
  heroGreen:{color:"#00d084"},
  heroP:{fontSize:17,color:"#7a8fa8",maxWidth:540,lineHeight:1.65},
  prizeCard:{width:"100%",maxWidth:660,background:"linear-gradient(135deg,rgba(0,80,40,.22),rgba(0,40,100,.18))",border:"1px solid rgba(0,208,132,.2)",borderRadius:20,padding:"28px 32px",display:"flex",flexDirection:"column",gap:14,textAlign:"left"},
  prizeHeadRow:{display:"flex",alignItems:"center",gap:10},
  prizeIcon:{fontSize:28},prizeHead:{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:"#fff"},
  prizeBody:{fontSize:15,color:"#aab8cc",lineHeight:1.65},
  prizeRule:{fontSize:13,color:"#7a8fa8",lineHeight:1.65,background:"rgba(0,0,0,.25)",borderRadius:8,padding:"10px 14px"},
  bitvavoBtn:{display:"flex",alignItems:"center",gap:10,padding:"14px 20px",background:"rgba(0,0,0,.3)",border:"1px solid rgba(0,208,132,.35)",borderRadius:10,color:"#00d084",textDecoration:"none",fontSize:14,fontWeight:700},
  bitvavoBtnArrow:{marginLeft:"auto"},
  pointsCard:{width:"100%",maxWidth:660,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:"24px 28px"},
  pointsHead:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:"#fff",marginBottom:18},
  pointsRow:{display:"flex",gap:12,flexWrap:"wrap"},
  pointItem:{flex:1,minWidth:120,background:"rgba(255,255,255,.04)",borderRadius:12,padding:"18px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:4},
  pointNum:{fontFamily:"'Bebas Neue',sans-serif",fontSize:44,lineHeight:1},
  pointLabel:{fontSize:11,color:"#7a8fa8",fontWeight:700,letterSpacing:1,textTransform:"uppercase"},
  pointDesc:{fontSize:13,color:"#aab8cc",textAlign:"center"},
  ctaGreen:{padding:"15px 36px",background:"#00d084",color:"#000",border:"none",borderRadius:10,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow',sans-serif"},
  ctaGhost:{padding:"14px 28px",background:"transparent",color:"#dde5f0",border:"1px solid rgba(255,255,255,.18)",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Barlow',sans-serif"},
  ctaRow:{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"},
  authWrap:{display:"flex",justifyContent:"center"},
  authCard:{width:"100%",maxWidth:480,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:20,padding:"36px 32px",display:"flex",flexDirection:"column",gap:14},
  authTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:"#fff"},
  authSub:{fontSize:14,color:"#7a8fa8",marginTop:-8},
  fieldLabel:{fontSize:11,fontWeight:700,color:"#7a8fa8",letterSpacing:1,textTransform:"uppercase"},
  fieldInput:{padding:"12px 16px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#fff",fontSize:15,outline:"none",fontFamily:"'Barlow',sans-serif"},
  submitBtn:{padding:"14px",background:"#00d084",color:"#000",border:"none",borderRadius:8,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow',sans-serif",marginTop:4},
  switchTxt:{fontSize:13,color:"#7a8fa8",textAlign:"center"},
  switchLink:{color:"#00d084",cursor:"pointer"},
  errBox:{padding:"10px 14px",background:"rgba(192,57,43,.2)",border:"1px solid rgba(192,57,43,.35)",borderRadius:8,fontSize:13,color:"#ff8080"},
  bvNote:{padding:"12px 16px",background:"rgba(0,208,132,.06)",border:"1px solid rgba(0,208,132,.2)",borderRadius:8,fontSize:13,color:"#aab8cc",lineHeight:1.6},
  tipsWrap:{display:"flex",flexDirection:"column",gap:20},
  tipsTop:{display:"flex",flexDirection:"column",gap:4},
  tipsH2:{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:"#fff"},
  tipsHint:{fontSize:13,color:"#7a8fa8"},
  adminBadge:{display:"inline-block",padding:"4px 14px",background:"rgba(240,192,64,.12)",border:"1px solid rgba(240,192,64,.3)",borderRadius:6,fontSize:12,color:"#f0c040",fontWeight:700},
  tabs:{display:"flex",gap:6,flexWrap:"wrap"},
  tab:{padding:"8px 14px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,color:"#8a9ab0",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Barlow',sans-serif"},
  tabOn:{background:"rgba(0,208,132,.12)",borderColor:"rgba(0,208,132,.35)",color:"#00d084"},
  groupRow:{display:"flex",gap:6,flexWrap:"wrap"},
  koHint:{padding:"14px 18px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,fontSize:13,color:"#7a8fa8",lineHeight:1.6},
  tableCard:{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:"16px 18px",display:"flex",flexDirection:"column",gap:8},
  tableHead:{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:.5},
  tableHint:{fontSize:11,fontWeight:500,color:"#5a6a7a"},
  tableWrap:{display:"flex",flexDirection:"column",gap:4},
  tableRow:{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:8,fontSize:13},
  tableRowHead:{color:"#5a6a7a",fontSize:11,letterSpacing:1,textTransform:"uppercase",fontWeight:700},
  tableRowQ:{background:"rgba(0,208,132,.06)",border:"1px solid rgba(0,208,132,.18)"},
  tablePos:{width:24,color:"#8a9ab0"},
  tableCol:{width:46,textAlign:"center",color:"#aab8cc"},
  tableColPts:{width:40,textAlign:"center",fontWeight:900,color:"#00d084",fontSize:15},
  tableLegend:{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#5a6a7a",marginTop:4},
  tableLegendDot:{width:10,height:10,borderRadius:3,background:"rgba(0,208,132,.35)",border:"1px solid rgba(0,208,132,.5)",display:"inline-block"},
  groupBtn:{padding:"6px 12px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:6,color:"#8a9ab0",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Barlow',sans-serif"},
  groupBtnOn:{background:"rgba(100,180,255,.12)",borderColor:"rgba(100,180,255,.35)",color:"#6ab4ff"},
  matchGrid:{display:"flex",flexDirection:"column",gap:10},
  mCard:{background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"14px 18px",display:"flex",flexDirection:"column",gap:10},
  mMeta:{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"},
  mDate:{fontSize:11,color:"#5a6a7a",letterSpacing:.8},
  mGroup:{fontSize:11,color:"#6ab4ff",fontWeight:700,letterSpacing:1},
  mPhase:{fontSize:11,color:"#f0c040",fontWeight:700,letterSpacing:1},
  ptsPill:{marginLeft:"auto",fontSize:12,padding:"2px 10px",borderRadius:99,fontWeight:800},
  mRow:{display:"flex",alignItems:"center",gap:12},
  mTeam:{flex:1,display:"flex",alignItems:"center",gap:10},
  mFlag:{fontSize:24},
  mTeamName:{fontSize:14,fontWeight:700,color:"#e0e8f4"},
  mScore:{display:"flex",alignItems:"center",gap:8,flexShrink:0},
  scoreIn:{width:52,padding:"8px 4px",textAlign:"center",background:"rgba(0,208,132,.08)",border:"1px solid rgba(0,208,132,.25)",borderRadius:7,color:"#fff",fontSize:22,fontWeight:900,fontFamily:"'Bebas Neue',sans-serif",outline:"none"},
  scoreSep:{fontSize:22,fontWeight:900,color:"#5a6a7a",fontFamily:"'Bebas Neue',sans-serif"},
  mBottom:{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"},
  resultPill:{fontSize:12,padding:"3px 12px",background:"rgba(255,255,255,.06)",borderRadius:99,color:"#aab8cc"},
  submitTipBtn:{padding:"7px 16px",background:"#00d084",color:"#000",border:"none",borderRadius:7,cursor:"pointer",fontWeight:800,fontSize:12,fontFamily:"'Barlow',sans-serif"},
  submitTipBtnOff:{background:"rgba(255,255,255,.06)",color:"#5a6a7a",cursor:"not-allowed"},
  adminRow:{display:"flex",alignItems:"center",gap:6},
  adminLabel:{fontSize:11,color:"#f0c040",fontWeight:700},
  scoreInSm:{width:42,padding:"5px 4px",textAlign:"center",background:"rgba(240,192,64,.1)",border:"1px solid rgba(240,192,64,.25)",borderRadius:5,color:"#fff",fontSize:16,fontWeight:700,outline:"none"},
  saveBtn:{padding:"5px 12px",background:"#f0c040",color:"#000",border:"none",borderRadius:5,cursor:"pointer",fontWeight:800,fontSize:13},
  guestWrap:{display:"flex",justifyContent:"center"},
  guestCard:{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:12,maxWidth:380,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"40px 32px"},
  lbWrap:{display:"flex",flexDirection:"column",gap:20},
  lbTop:{display:"flex",alignItems:"center",gap:16},
  lbH2:{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:"#fff"},
  refreshBtn:{padding:"7px 16px",background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,color:"#8a9ab0",cursor:"pointer",fontSize:13},
  lbSub:{fontSize:14,color:"#7a8fa8",marginTop:-12},
  lbEmpty:{textAlign:"center",padding:60,color:"#7a8fa8",fontSize:16},
  lbList:{display:"flex",flexDirection:"column",gap:5},
  lbRow:{display:"flex",alignItems:"center",gap:8,padding:"13px 18px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,fontSize:15},
  lbGold:{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.25)"},
  lbSilver:{background:"rgba(192,192,192,.06)",border:"1px solid rgba(192,192,192,.2)"},
  lbBronze:{background:"rgba(205,127,50,.07)",border:"1px solid rgba(205,127,50,.2)"},
  lbMe:{border:"1px solid rgba(0,208,132,.4)",background:"rgba(0,208,132,.05)"},
  lbRank:{width:38,fontSize:18},
  lbCol:{width:72,textAlign:"center",color:"#8a9ab0",fontSize:14},
  lbNote:{fontSize:13,color:"#7a8fa8",lineHeight:1.75,padding:"16px 22px",background:"rgba(0,208,132,.05)",border:"1px solid rgba(0,208,132,.12)",borderRadius:10},
  footer:{position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(4,8,15,.8)",padding:"20px 0"},
  footerInner:{maxWidth:1120,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},
  footerLeft:{display:"flex",alignItems:"center",gap:8},
  poweredBy:{fontSize:10,color:"#5a6a7a",letterSpacing:2,textTransform:"uppercase"},
  bitvavoBrand:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#fff",letterSpacing:2},
  footerRight:{display:"flex",gap:20},
  footerLink:{fontSize:13,color:"#5a6a7a",textDecoration:"none"},
};
