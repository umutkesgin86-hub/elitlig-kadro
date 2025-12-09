/* ============================================================
   ELİT LİG – FRONTEND MANTIK DOSYASI (app.js)
   Bu dosya server.js + index.html + Supabase yapısına %100 uyumludur.
   ============================================================ */

/* ------------ GLOBAL DURUMLAR ------------ */

let matches = [];
const lineupsCache = {}; 
const eventsCache = {};  

let currentMatch = null;
let currentTeamSide = null; 
let currentTeamName = null;

let currentDetailMatch = null;
let currentDetailHomeLineup = null;
let currentDetailAwayLineup = null;

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let isMatchAdmin = false;
let editingMatch = null;


/* ------------ DOM ELEMENTLERİ ------------ */

const tabHome       = document.getElementById("tabHome");
const tabLineups    = document.getElementById("tabLineups");
const tabMatchAdmin = document.getElementById("tabMatchAdmin");

const screenHome          = document.getElementById("screen-home");
const screenLineup        = document.getElementById("screen-lineup");
const screenPitch         = document.getElementById("screen-pitch");
const screenLineupsList   = document.getElementById("screen-lineups-list");
const screenLineupsDetail = document.getElementById("screen-lineups-detail");
const screenInstagram     = document.getElementById("screen-instagram");
const screenMatchAdmin    = document.getElementById("screen-match-admin");

const matchesContainer   = document.getElementById("matchesContainer");
const playersForm        = document.getElementById("playersForm");
const lineupMatchTitle   = document.getElementById("lineupMatchTitle");
const lineupMatchSub     = document.getElementById("lineupMatchSub");
const pitchMatchTitle    = document.getElementById("pitchMatchTitle");
const pitchMatchSub      = document.getElementById("pitchMatchSub");

const backToHome    = document.getElementById("backToHome");
const saveLineup    = document.getElementById("saveLineup");
const btnEdit       = document.getElementById("btnEdit");
const btnExit       = document.getElementById("btnExit");

const lineupsList   = document.getElementById("lineupsList");
const backToLineups = document.getElementById("backToLineups");

const pitchSingle     = document.getElementById("pitchSingle");
const benchListSingle = document.getElementById("benchListSingle");

const detailMatchTitle = document.getElementById("detailMatchTitle");
const detailMatchSub   = document.getElementById("detailMatchSub");
const detailHomeTitle  = document.getElementById("detailHomeTitle");
const detailAwayTitle  = document.getElementById("detailAwayTitle");
const pitchHome        = document.getElementById("pitchHome");
const pitchAway        = document.getElementById("pitchAway");
const benchHome        = document.getElementById("benchHome");
const benchAway        = document.getElementById("benchAway");

const scoreHomeName  = document.getElementById("scoreHomeName");
const scoreAwayName  = document.getElementById("scoreAwayName");
const scoreHomeValue = document.getElementById("scoreHomeValue");
const scoreAwayValue = document.getElementById("scoreAwayValue");

const eventsHomeTitle = document.getElementById("eventsHomeTitle");
const eventsAwayTitle = document.getElementById("eventsAwayTitle");
const eventHomePlayer = document.getElementById("eventHomePlayer");
const eventAwayPlayer = document.getElementById("eventAwayPlayer");

const btnHomeGoal   = document.getElementById("btnHomeGoal");
const btnHomeYellow = document.getElementById("btnHomeYellow");
const btnHomeRed    = document.getElementById("btnHomeRed");

const btnAwayGoal   = document.getElementById("btnAwayGoal");
const btnAwayYellow = document.getElementById("btnAwayYellow");
const btnAwayRed    = document.getElementById("btnAwayRed");

const eventsHomeLog = document.getElementById("eventsHomeLog");
const eventsAwayLog = document.getElementById("eventsAwayLog");

const btnOpenInstagram = document.getElementById("btnOpenInstagram");
const btnInstaBack     = document.getElementById("btnInstaBack");
const btnInstaDownload = document.getElementById("btnInstaDownload");

const instaFrame       = document.getElementById("instaFrame");
const instaPhotoInput  = document.getElementById("instaPhotoInput");
const instaPhoto       = document.getElementById("instaPhoto");

const matchAdminLoginCard = document.getElementById("matchAdminLoginCard");
const matchAdminPanelCard = document.getElementById("matchAdminPanelCard");

const matchAdminUser  = document.getElementById("matchAdminUser");
const matchAdminPass  = document.getElementById("matchAdminPass");
const btnMatchLogin   = document.getElementById("btnMatchLogin");

const matchHomeInput  = document.getElementById("matchHome");
const matchAwayInput  = document.getElementById("matchAway");
const matchDateInput  = document.getElementById("matchDate");
const matchTimeInput  = document.getElementById("matchTime");
const matchFieldInput = document.getElementById("matchField");
const btnAddMatch     = document.getElementById("btnAddMatch");
const matchListAdmin  = document.getElementById("matchListAdmin");


/* ------------ SAHA POZİSYONLARI ------------ */

const positions = [
  { code: "GK",  name: "Kaleci" },
  { code: "LB",  name: "Sol Bek" },
  { code: "LCB", name: "Sol Stoper" },
  { code: "RCB", name: "Sağ Stoper" },
  { code: "RB",  name: "Sağ Bek" },
  { code: "CDM", name: "Ön Libero" },
  { code: "LCM", name: "Sol Orta" },
  { code: "RCM", name: "Sağ Orta" },
  { code: "LW",  name: "Sol Kanat" },
  { code: "RW",  name: "Sağ Kanat" },
  { code: "ST",  name: "Santrafor" }
];

const positionCoords = {
  GK:  { x: 50, y: 90 },
  LB:  { x: 20, y: 75 },
  LCB: { x: 40, y: 70 },
  RCB: { x: 60, y: 70 },
  RB:  { x: 80, y: 75 },
  CDM: { x: 50, y: 60 },
  LCM: { x: 35, y: 50 },
  RCM: { x: 65, y: 50 },
  LW:  { x: 25, y: 35 },
  RW:  { x: 75, y: 35 },
  ST:  { x: 50, y: 25 }
};


/* ------------ EKRAN GEÇİŞLERİ ------------ */

function setActiveTab(tab) {
  tabHome.classList.remove("active");
  tabLineups.classList.remove("active");
  tabMatchAdmin.classList.remove("active");

  if (tab === "home") tabHome.classList.add("active");
  if (tab === "lineups") tabLineups.classList.add("active");
  if (tab === "match-admin") tabMatchAdmin.classList.add("active");
}

function showScreen(name) {
  [
    screenHome,
    screenLineup,
    screenPitch,
    screenLineupsList,
    screenLineupsDetail,
    screenInstagram,
    screenMatchAdmin
  ].forEach(s => s.classList.remove("active"));

  document.getElementById(`screen-${name}`).classList.add("active");
}


/* ------------ TARİH FORMATLAYICI ------------ */

function getTurkishDayName(idx) {
  const names = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  return names[idx] || "";
}

function formatMatchDateDisplay(match) {
  if (!match.date) return "";
  const [year, month, day] = match.date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dd = String(day).padStart(2,"0");
  const MM = String(month).padStart(2,"0");
  return `${dd}.${MM}.${year} ${getTurkishDayName(d.getDay())}`;
}

function getMatchStartTime(match) {
  try {
    const [year, month, day] = match.date.split("-").map(Number);
    const [hour, minute] = match.time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute).getTime();
  } catch {
    return null;
  }
}

function isMatchActive(match) {
  const start = getMatchStartTime(match);
  if (!start) return true;
  return Date.now() <= start + 3600000;
}


/* ------------ API FONKSİYONLARI ------------ */

async function fetchMatches() {
  const res = await fetch("/api/matches");
  matches = await res.json();
}

async function fetchLineups(matchId) {
  const res = await fetch(`/api/lineups/${matchId}`);
  const arr = await res.json();

  const result = { home: null, away: null };
  arr.forEach(item => {
    if (item.team_side === "home") result.home = item;
    if (item.team_side === "away") result.away = item;
  });

  result.home && (result.home.players = JSON.parse(result.home.players_json));
  result.away && (result.away.players = JSON.parse(result.away.players_json));

  lineupsCache[matchId] = result;
  return result;
}

async function saveLineupToServer(matchId, teamSide, teamName, players) {
  await fetch(`/api/lineups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      team_side: teamSide,
      team_name: teamName,
      players
    })
  });

  lineupsCache[matchId] = null;
}

async function fetchEvents(matchId) {
  const res = await fetch(`/api/events/${matchId}`);
  const data = await res.json();

  const cache = { home: [], away: [] };
  data.forEach(ev => {
    cache[ev.team_side].push({
      id: ev.id,
      type: ev.event_type,
      group: ev.player_group,
      index: ev.player_index
    });
  });

  eventsCache[matchId] = cache;
  return cache;
}

async function addEventToServer(matchId, side, type, group, index) {
  const res = await fetch(`/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      team_side: side,
      event_type: type,
      player_group: group,
      player_index: index
    })
  });

  const out = await res.json();
  await fetchEvents(matchId);
}

async function deleteEventFromServer(matchId, eventId) {
  await fetch(`/api/events/${eventId}`, { method: "DELETE" });
  await fetchEvents(matchId);
}


/* ------------ ANA SAYFA MAÇ LİSTELEME ------------ */

function renderMatches() {
  matchesContainer.innerHTML = "";

  const active = matches.filter(isMatchActive).slice(0, 10);

  if (!active.length) {
    matchesContainer.textContent = "Aktif maç yok.";
    return;
  }

  active.forEach(match => {
    const card = document.createElement("div");
    card.className = "match-card";

    const date = formatMatchDateDisplay(match);

    card.innerHTML = `
      <div class="match-header">
        <span>${match.home_team} vs ${match.away_team}</span>
        <span>${match.time}</span>
      </div>
      <div class="match-meta">${date} • ${match.field}</div>

      <div class="team-buttons">
        <button class="btn-team" data-id="${match.id}" data-side="home">
          ${match.home_team} Kaptanı
        </button>

        <button class="btn-team" data-id="${match.id}" data-side="away">
          ${match.away_team} Kaptanı
        </button>
      </div>
    `;

    matchesContainer.appendChild(card);
  });

  matchesContainer.querySelectorAll(".btn-team").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      const side = btn.dataset.side;

      currentMatch = matches.find(m => m.id === id);
      currentTeamSide = side;
      currentTeamName = side === "home"
        ? currentMatch.home_team
        : currentMatch.away_team;

      await openLineupScreen();
    };
  });
}


/* ------------ KADRO GİRİŞİ ------------ */

async function openLineupScreen() {
  const match = currentMatch;
  const date = formatMatchDateDisplay(match);

  lineupMatchTitle.textContent = `${match.home_team} vs ${match.away_team}`;
  lineupMatchSub.textContent =
    `${date} • ${match.time} • ${match.field} • ${currentTeamName} kadrosu`;

  const lineups = await fetchLineups(match.id);
  const existing =
    currentTeamSide === "home"
      ? lineups.home?.players
      : lineups.away?.players;

  playersForm.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const row = document.createElement("div");
    row.className = "player-row";

    const isAs = i < 7;
    const labelText = isAs ? `As Oyuncu ${i+1}` : `Yedek ${i-6}`;

    let nameVal = "";
    let posVal = "";
    let noVal = "";

    if (existing) {
      const src = isAs ? existing.as[i] : existing.yedek[i-7];
      if (src) {
        nameVal = src.name;
        posVal = src.pos;
        noVal  = src.no || "";
      }
    }

    row.innerHTML = `
      <span class="tag ${isAs?"tag-as":"tag-sub"}">${labelText}</span>

      <label>İsim Soyisim</label>
      <div class="row-inline">
        <input class="p-name" type="text" value="${nameVal}">
        <input class="p-no" type="text" placeholder="No" value="${noVal}">
      </div>

      <label>Mevki</label>
      <select class="p-pos">
        <option value="">Mevki seç</option>
        ${positions.map(p => `
          <option value="${p.code}" ${p.code===posVal?"selected":""}>
            ${p.code} - ${p.name}
          </option>`).join("")}
      </select>
    `;

    playersForm.appendChild(row);
  }

  showScreen("lineup");
}

function getLineupFromForm() {
  const rows = playersForm.querySelectorAll(".player-row");
  const as = [];
  const yedek = [];

  let error = false;

  rows.forEach((row, index) => {
    const name = row.querySelector(".p-name").value.trim();
    const no   = row.querySelector(".p-no").value.trim();
    const pos  = row.querySelector(".p-pos").value;

    const isAs = index < 7;

    if (isAs) {
      if (!name || !pos) {
        error = true;
        row.style.background = "#450a0a";
      } else {
        row.style.background = "";
        as.push({ name, pos, no });
      }
    } else {
      if (!name && !pos && !no) return;
      if ((name && !pos) || (!name && pos)) {
        error = true;
        row.style.background = "#450a0a";
      } else {
        row.style.background = "";
        yedek.push({ name, pos, no });
      }
    }
  });

  if (error) {
    alert("Eksik oyuncu bilgileri var.");
    return null;
  }

  if (as.length < 7) {
    alert("7 As oyuncu doldurulmalıdır!");
    return null;
  }

  return { as, yedek };
}

function renderSinglePitch(lineup) {
  pitchSingle.innerHTML = '<div class="pitch-line"></div>';
  benchListSingle.innerHTML = "";

  lineup.as.forEach(p => {
    const c = positionCoords[p.pos];
    const el = document.createElement("div");
    el.className = "player-dot";
    el.style.left = c.x+"%";
    el.style.top = c.y+"%";
    el.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      ${p.no?`<span class="pd-no">🎽${p.no}</span>`:""}
      <span class="pd-name">${p.name.toUpperCase()}</span>
    `;
    pitchSingle.appendChild(el);
  });

  if (!lineup.yedek.length) {
    benchListSingle.textContent = "Yedek yok.";
  } else {
    lineup.yedek.forEach(p=>{
      benchListSingle.innerHTML +=
        `${p.no?`${p.no} | `:""}${p.pos} - ${p.name.toUpperCase()}<br>`;
    });
  }

  showScreen("pitch");
}


/* ------------ KADROLAR SAYFASI ------------ */

async function renderLineupsList() {
  lineupsList.innerHTML = "Yükleniyor...";

  await fetchMatches();
  let printed = false;

  for (const m of matches) {
    const line = await fetchLineups(m.id);
    if (!line.home || !line.away) continue;

    printed = true;

    const card = document.createElement("div");
    card.className = "match-card";

    const date = formatMatchDateDisplay(m);

    card.innerHTML = `
      <div class="match-header">
        <span>${m.home_team} vs ${m.away_team}</span>
        <span>${m.time}</span>
      </div>
      <div class="match-meta">${date} • ${m.field}</div>
    `;

    const btn = document.createElement("button");
    btn.className = "btn-small";
    btn.textContent = "Maçı Aç";
    btn.onclick = () =>
      renderTwoPitches(m, line.home.players, line.away.players);

    card.appendChild(btn);
    lineupsList.appendChild(card);
  }

  if (!printed) lineupsList.textContent = "Henüz kadroları tamamlanan bir maç yok.";
}


/* ------------ 2 SAHA + OLAY PANELİ ------------ */

async function renderTwoPitches(match, homePlayers, awayPlayers) {
  currentDetailMatch = match;
  currentDetailHomeLineup = homePlayers;
  currentDetailAwayLineup = awayPlayers;

  const date = formatMatchDateDisplay(match);

  detailMatchTitle.textContent = `${match.home_team} vs ${match.away_team}`;
  detailMatchSub.textContent   = `${date} • ${match.time} • ${match.field}`;

  detailHomeTitle.textContent = match.home_team;
  detailAwayTitle.textContent = match.away_team;

  pitchHome.innerHTML = '<div class="pitch-line"></div>';
  pitchAway.innerHTML = '<div class="pitch-line"></div>';
  benchHome.innerHTML = "";
  benchAway.innerHTML = "";

  drawTeamPitch(pitchHome, benchHome, homePlayers);
  drawTeamPitch(pitchAway, benchAway, awayPlayers);

  eventsHomeTitle.textContent = `${match.home_team} Olayları`;
  eventsAwayTitle.textContent = `${match.away_team} Olayları`;

  fillPlayerSelect(eventHomePlayer, homePlayers);
  fillPlayerSelect(eventAwayPlayer, awayPlayers);

  await fetchEvents(match.id);
  renderEventsLog("home");
  renderEventsLog("away");

  updateScoreboard();

  renderInstagramCard();

  showScreen("lineups-detail");
}

function drawTeamPitch(pitchEl, benchEl, players) {
  players.as.forEach(p => {
    const c = positionCoords[p.pos];
    const el = document.createElement("div");
    el.className = "player-dot";
    el.style.left = c.x+"%";
    el.style.top = c.y+"%";
    el.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      ${p.no?`<span class="pd-no">🎽${p.no}</span>`:""}
      <span class="pd-name">${p.name.toUpperCase()}</span>
    `;
    pitchEl.appendChild(el);
  });

  players.yedek.forEach(p=>{
    benchEl.innerHTML += `${p.no?`${p.no} | `:""}${p.pos} - ${p.name.toUpperCase()}<br>`;
  });
}

function fillPlayerSelect(select, lineup) {
  select.innerHTML = '<option value="">Oyuncu seç</option>';

  lineup.as.forEach((p,i)=>{
    select.innerHTML += `
      <option value="as-${i}">${p.no?`${p.no} | `:""}${p.name.toUpperCase()} (${p.pos})</option>
    `;
  });

  lineup.yedek.forEach((p,i)=>{
    select.innerHTML += `
      <option value="yedek-${i}">[Y] ${p.no?`${p.no} | `:""}${p.name.toUpperCase()} (${p.pos})</option>
    `;
  });
}


/* ------------ OLAYLAR ------------ */

function renderEventsLog(side) {
  const matchId = currentDetailMatch.id;
  const cache = eventsCache[matchId] || { home:[], away:[] };
  const list = side === "home" ? cache.home : cache.away;

  const lineup = side === "home"
    ? currentDetailHomeLineup
    : currentDetailAwayLineup;

  const container = side === "home"
    ? eventsHomeLog
    : eventsAwayLog;

  container.innerHTML = "";

  if (!list.length) {
    container.textContent = "Olay yok.";
    updateScoreboard();
    return;
  }

  list.forEach((ev, index)=>{
    const player = ev.group==="as"
      ? lineup.as[ev.index]
      : lineup.yedek[ev.index];

    if (!player) return;

    const name = player.name.toUpperCase();
    const noTxt = player.no ? `${player.no} | ` : "";

    let icon = "⚽";
    if (ev.type === "yellow") icon = "🟨";
    if (ev.type === "red") icon = "🟥";

    const row = document.createElement("div");
    row.className = "event-row";

    row.innerHTML = `
      <div class="event-text">${icon} ${noTxt}${name}</div>
      <button class="event-delete-btn">×</button>
    `;

    row.querySelector("button").onclick = async () => {
      await deleteEventFromServer(matchId, ev.id);
      await fetchEvents(matchId);
      renderEventsLog(side);
      updateScoreboard();
    };

    container.appendChild(row);
  });

  updateScoreboard();
}

async function addEvent(side, type) {
  const matchId = currentDetailMatch.id;
  const select = side==="home" ? eventHomePlayer : eventAwayPlayer;
  const value = select.value;

  if (!value) return alert("Oyuncu seç.");

  const [group, idx] = value.split("-");
  const index = Number(idx);

  await addEventToServer(matchId, side, type, group, index);
  renderEventsLog(side);
}


/* ------------ SKORBOARD ------------ */

function updateScoreboard() {
  const matchId = currentDetailMatch.id;
  const cache = eventsCache[matchId] || { home:[], away:[] };

  const homeGoals = cache.home.filter(e=>e.type==="goal").length;
  const awayGoals = cache.away.filter(e=>e.type==="goal").length;

  scoreHomeName.textContent  = currentDetailMatch.home_team;
  scoreAwayName.textContent  = currentDetailMatch.away_team;
  scoreHomeValue.textContent = homeGoals;
  scoreAwayValue.textContent = awayGoals;

  renderInstagramCard();
}


/* ------------ INSTAGRAM GÖRSELİ ------------ */

instaPhotoInput.onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    instaPhoto.src = reader.result;
    instaPhoto.style.display = "block";
  };
  reader.readAsDataURL(f);
};

function renderInstagramCard() {
  if (!currentDetailMatch) return;

  const m = currentDetailMatch;

  const [y,mo,d] = m.date.split("-").map(Number);
  const dt = `${d}.${mo}.${y}`;
  const gunler = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  const g = gunler[new Date(y,mo-1,d).getDay()].toUpperCase();

  const cache = eventsCache[m.id] || { home:[], away:[] };
  const homeGoals = cache.home.filter(e=>e.type==="goal").length;
  const awayGoals = cache.away.filter(e=>e.type==="goal").length;

  document.getElementById("instaHomeName").textContent = m.home_team.toUpperCase();
  document.getElementById("instaAwayName").textContent = m.away_team.toUpperCase();
  document.getElementById("instaScore").textContent    = `${homeGoals} - ${awayGoals}`;

  const homeEv = document.getElementById("instaHomeEvents");
  const awayEv = document.getElementById("instaAwayEvents");

  homeEv.innerHTML = "";
  awayEv.innerHTML = "";

  function pushEvents(list, lineup, el) {
    list.forEach(ev=>{
      const p = ev.group==="as" ? lineup.as[ev.index] : lineup.yedek[ev.index];
      if (!p) return;

      let icon = "⚽";
      if (ev.type==="yellow") icon="🟨";
      if (ev.type==="red") icon="🟥";

      el.innerHTML += `${icon} ${p.name.toUpperCase()}<br>`;
    });
  }

  pushEvents(cache.home, currentDetailHomeLineup, homeEv);
  pushEvents(cache.away, currentDetailAwayLineup, awayEv);

  document.getElementById("instaBottomInfo").textContent =
    `${dt} • ${g} • ${m.field.toUpperCase()} • ${m.time}`;
}

btnOpenInstagram.onclick = () => {
  renderInstagramCard();
  showScreen("instagram");
};

btnInstaBack.onclick = () => showScreen("lineups-detail");

btnInstaDownload.onclick = async () => {
  const canvas = await html2canvas(instaFrame, { scale: 2 });
  const link = document.createElement("a");
  link.download = "mac-sonucu.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.75);
  link.click();
};


/* ------------ ADMİN PANELİ ------------ */

btnMatchLogin.onclick = () => {
  if (matchAdminUser.value === ADMIN_USER && matchAdminPass.value === ADMIN_PASS) {
    isMatchAdmin = true;
    renderMatchAdminView();
  } else {
    alert("Hatalı giriş!");
  }
};

function renderMatchAdminView() {
  if (!isMatchAdmin) {
    matchAdminLoginCard.style.display = "block";
    matchAdminPanelCard.style.display = "none";
  } else {
    matchAdminLoginCard.style.display = "none";
    matchAdminPanelCard.style.display = "block";
    renderMatchAdminList();
  }
}

async function renderMatchAdminList() {
  await fetchMatches();
  matchListAdmin.innerHTML = "";

  matches.forEach(m=>{
    const row = document.createElement("div");
    const date = formatMatchDateDisplay(m);

    row.innerHTML = `
      #${m.id} - ${m.home_team} vs ${m.away_team}
      • ${date} • ${m.time} • ${m.field}
    `;

    const btnD = document.createElement("button");
    btnD.className = "btn-small";
    btnD.textContent = "Detay";
    btnD.onclick = async ()=>{
      const line = await fetchLineups(m.id);
      if (!line.home || !line.away) return alert("Kadro eksik.");
      renderTwoPitches(m, line.home.players, line.away.players);
    };

    const btnE = document.createElement("button");
    btnE.className = "btn-small";
    btnE.textContent = "Güncelle";
    btnE.onclick = ()=>{
      editingMatch = m;
      matchHomeInput.value = m.home_team;
      matchAwayInput.value = m.away_team;
      matchDateInput.value = m.date;
      matchTimeInput.value = m.time;
      matchFieldInput.value = m.field;
      btnAddMatch.textContent = "Güncelle";
    };

    row.appendChild(btnD);
    row.appendChild(btnE);
    matchListAdmin.appendChild(row);
  });
}

btnAddMatch.onclick = async () => {
  const date = matchDateInput.value;
  const time = matchTimeInput.value;
  const home = matchHomeInput.value;
  const away = matchAwayInput.value;
  const field = matchFieldInput.value || "Elit Lig Arena";

  if (!date || !time || !home || !away) return alert("Tüm alanlar zorunlu!");

  if (editingMatch) {
    await fetch(`/api/matches/${editingMatch.id}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ home_team:home, away_team:away, date, time, field })
    });
    editingMatch = null;
    btnAddMatch.textContent = "Kaydet";
  } else {
    await fetch(`/api/matches`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ home_team:home, away_team:away, date, time, field })
    });
  }

  matchHomeInput.value = "";
  matchAwayInput.value = "";
  matchDateInput.value = "";
  matchTimeInput.value = "";
  matchFieldInput.value = "";

  await fetchMatches();
  renderMatches();
  renderMatchAdminList();
};


/* ------------ EVENT BUTTONLARI ------------ */

btnHomeGoal.onclick   = () => addEvent("home","goal");
btnHomeYellow.onclick = () => addEvent("home","yellow");
btnHomeRed.onclick    = () => addEvent("home","red");

btnAwayGoal.onclick   = () => addEvent("away","goal");
btnAwayYellow.onclick = () => addEvent("away","yellow");
btnAwayRed.onclick    = () => addEvent("away","red");


/* ------------ KADRO DÜZENLE/ÇIKIŞ ------------ */

btnEdit.onclick = () => openLineupScreen();
btnExit.onclick = () => showScreen("home");


/* ------------ SAYFA BAŞLANGICI ------------ */

(async () => {
  await fetchMatches();
  renderMatches();

  setInterval(async ()=>{
    await fetchMatches();
    renderMatches();
  }, 60000);
})();
