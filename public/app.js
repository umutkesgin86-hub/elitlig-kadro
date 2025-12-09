// -----------------------------
//  GLOBAL STATE
// -----------------------------
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

// -----------------------------
//  DOM ELEMENTS
// -----------------------------
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

// Scoreboard
const scoreHomeName  = document.getElementById("scoreHomeName");
const scoreAwayName  = document.getElementById("scoreAwayName");
const scoreHomeValue = document.getElementById("scoreHomeValue");
const scoreAwayValue = document.getElementById("scoreAwayValue");

// Events
const eventsHomeTitle = document.getElementById("eventsHomeTitle");
const eventsAwayTitle = document.getElementById("eventsAwayTitle");
const eventHomePlayer = document.getElementById("eventHomePlayer");
const eventAwayPlayer = document.getElementById("eventAwayPlayer");
const btnHomeGoal     = document.getElementById("btnHomeGoal");
const btnHomeYellow   = document.getElementById("btnHomeYellow");
const btnHomeRed      = document.getElementById("btnHomeRed");
const btnAwayGoal     = document.getElementById("btnAwayGoal");
const btnAwayYellow   = document.getElementById("btnAwayYellow");
const btnAwayRed      = document.getElementById("btnAwayRed");
const eventsHomeLog   = document.getElementById("eventsHomeLog");
const eventsAwayLog   = document.getElementById("eventsAwayLog");

// Insta
const btnOpenInstagram = document.getElementById("btnOpenInstagram");
const btnInstaBack     = document.getElementById("btnInstaBack");
const btnInstaDownload = document.getElementById("btnInstaDownload");
const instaFrame       = document.getElementById("instaFrame");

// Match Admin
const matchAdminLoginCard = document.getElementById("matchAdminLoginCard");
const matchAdminPanelCard = document.getElementById("matchAdminPanelCard");
const matchAdminUser      = document.getElementById("matchAdminUser");
const matchAdminPass      = document.getElementById("matchAdminPass");
const btnMatchLogin       = document.getElementById("btnMatchLogin");

const matchHomeInput  = document.getElementById("matchHome");
const matchAwayInput  = document.getElementById("matchAway");
const matchDateInput  = document.getElementById("matchDate");
const matchTimeInput  = document.getElementById("matchTime");
const matchFieldInput = document.getElementById("matchField");
const btnAddMatch     = document.getElementById("btnAddMatch");
const matchListAdmin  = document.getElementById("matchListAdmin");

// -----------------------------
//  POSITIONS
// -----------------------------
const positions = [
  { code: "GK", name: "Kaleci" },
  { code: "LB", name: "Sol Bek" },
  { code: "LCB", name: "Sol Stoper" },
  { code: "RCB", name: "Sağ Stoper" },
  { code: "RB", name: "Sağ Bek" },
  { code: "CDM", name: "Ön Libero" },
  { code: "LCM", name: "Sol Orta" },
  { code: "RCM", name: "Sağ Orta" },
  { code: "LW", name: "Sol Kanat" },
  { code: "RW", name: "Sağ Kanat" },
  { code: "ST", name: "Santrafor" }
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

// -----------------------------
//  SCREENS
// -----------------------------
function showScreen(name) {
  [
    screenHome, screenLineup, screenPitch,
    screenLineupsList, screenLineupsDetail,
    screenInstagram, screenMatchAdmin
  ].forEach(s => s.classList.remove("active"));

  document.getElementById(`screen-${name}`).classList.add("active");
}

// -----------------------------
//  API
// -----------------------------
async function fetchMatches() {
  const res = await fetch("/api/matches");
  const data = await res.json();
  matches = data;
}

async function fetchLineups(matchId) {
  const res = await fetch(`/api/matches/${matchId}/lineups`);
  const raw = await res.json();

  const formatted = {
    home: raw.find(x => x.team_side === "home") || null,
    away: raw.find(x => x.team_side === "away") || null
  };

  if (formatted.home) formatted.home.players = JSON.parse(formatted.home.players_json);
  if (formatted.away) formatted.away.players = JSON.parse(formatted.away.players_json);

  return formatted;
}

async function saveLineupToServer(matchId, side, teamName, players) {
  await fetch(`/api/lineups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      team_side: side,
      team_name: teamName,
      players
    })
  });
}

async function saveEvent(matchId, teamSide, eventType, playerGroup, playerIndex) {
  await fetch(`/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      team_side: teamSide,
      event_type: eventType,
      player_group: playerGroup,
      player_index: playerIndex
    })
  });
}

async function fetchMatchEvents(matchId) {
  const res = await fetch(`/api/events/${matchId}`);
  return await res.json();
}

// -----------------------------
//  MATCH LIST
// -----------------------------
function renderMatches() {
  matchesContainer.innerHTML = "";

  matches
    .sort((a, b) => (b.id - a.id))
    .forEach(match => {
      const div = document.createElement("div");
      div.className = "match-card";

      div.innerHTML = `
        <div class="match-header">
          <span>${match.home_team} vs ${match.away_team}</span>
          <span>${match.time}</span>
        </div>
        <div class="match-meta">${match.date} • ${match.field}</div>
        <div class="team-buttons">
          <button class="btn-team" data-id="${match.id}" data-side="home">${match.home_team} Kaptanı</button>
          <button class="btn-team" data-id="${match.id}" data-side="away">${match.away_team} Kaptanı</button>
        </div>
      `;

      matchesContainer.appendChild(div);
    });

  document.querySelectorAll(".btn-team").forEach(btn => {
    btn.onclick = () => {
      currentMatch = matches.find(m => m.id == btn.dataset.id);
      currentTeamSide = btn.dataset.side;
      currentTeamName =
        currentTeamSide === "home" ? currentMatch.home_team : currentMatch.away_team;
      openLineupScreen();
    };
  });
}

// -----------------------------
//  KADRO GİRİŞİ
// -----------------------------
async function openLineupScreen() {
  const { id } = currentMatch;
  const lineups = await fetchLineups(id);

  const existing = currentTeamSide === "home"
    ? lineups.home?.players
    : lineups.away?.players;

  playersForm.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const isAs = i < 7;
    let name = "", pos = "", no = "";

    if (existing) {
      const src = isAs ? existing.as[i] : existing.yedek[i - 7];
      if (src) { name = src.name; pos = src.pos; no = src.no; }
    }

    const div = document.createElement("div");
    div.className = "player-row";

    div.innerHTML = `
      <span class="tag ${isAs ? "tag-as" : "tag-sub"}">
        ${isAs ? "As " + (i + 1) : "Yedek " + (i - 6)}
      </span>

      <label>İsim Soyisim</label>
      <input class="p-name" value="${name}">

      <label>Mevki</label>
      <select class="p-pos">
        <option value="">Seç</option>
        ${positions.map(p => `
          <option value="${p.code}" ${p.code === pos ? "selected" : ""}>
            ${p.code} - ${p.name}
          </option>`).join("")}
      </select>

      <label>No</label>
      <input class="p-no" value="${no}">
    `;

    playersForm.appendChild(div);
  }

  lineupMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  lineupMatchSub.textContent = `${currentTeamName} kadrosu`;

  showScreen("lineup");
}

function getLineupFromForm() {
  const rows = [...document.querySelectorAll(".player-row")];

  const as = [], yedek = [];
  let error = false;

  rows.forEach((row, i) => {
    const name = row.querySelector(".p-name").value.trim();
    const pos  = row.querySelector(".p-pos").value;
    const no   = row.querySelector(".p-no").value.trim();

    const isAs = i < 7;

    if (isAs) {
      if (!name || !pos) { error = true; row.style.background="#450a0a"; }
      else row.style.background="transparent";
      as.push({ name, pos, no });
    } else {
      if (!name && !pos && !no) return;
      if (!name || !pos) { error = true; row.style.background="#450a0a"; }
      else row.style.background="transparent";
      yedek.push({ name, pos, no });
    }
  });

  if (error) {
    alert("Hatalı alanları düzelt.");
    return null;
  }

  if (as.length < 7) {
    alert("7 As oyuncu zorunludur.");
    return null;
  }

  return { as, yedek };
}

saveLineup.onclick = async () => {
  const players = getLineupFromForm();
  if (!players) return;

  await saveLineupToServer(
    currentMatch.id,
    currentTeamSide,
    currentTeamName,
    players
  );

  renderSinglePitch(players);
};

function renderSinglePitch(lineup) {
  pitchSingle.innerHTML = `<div class="pitch-line"></div>`;
  benchListSingle.innerHTML = "";

  pitchMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  pitchMatchSub.textContent = `${currentTeamName} – Sahada`;

  lineup.as.forEach(p => {
    const c = positionCoords[p.pos];
    if (!c) return;

    const dot = document.createElement("div");
    dot.className = "player-dot";
    dot.style.left = c.x + "%";
    dot.style.top  = c.y + "%";
    dot.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      <span class="pd-name">${p.name}</span>
    `;
    pitchSingle.appendChild(dot);
  });

  lineup.yedek.forEach(p => {
    benchListSingle.innerHTML += `
      <div>${p.no ? p.no + " - " : ""}${p.pos} - ${p.name}</div>`;
  });

  showScreen("pitch");
}

// -----------------------------
//  KADROLAR LİSTESİ
// -----------------------------
async function renderLineupsList() {
  lineupsList.innerHTML = "";

  for (const m of matches) {
    const lu = await fetchLineups(m.id);
    if (!lu.home || !lu.away) continue;

    const div = document.createElement("div");
    div.className = "match-card";

    div.innerHTML = `
      <div class="match-header">
        <span>${m.home_team} vs ${m.away_team}</span>
        <span>${m.time}</span>
      </div>
      <div class="match-meta">${m.date} • ${m.field}</div>
      <button class="btn-primary" data-id="${m.id}">Maçı Aç</button>
    `;

    lineupsList.appendChild(div);
  }

  document.querySelectorAll("#lineupsList button").forEach(btn => {
    btn.onclick = () => openMatchDetail(btn.dataset.id);
  });
}

// -----------------------------
//  MAÇ DETAY
// -----------------------------
async function openMatchDetail(matchId) {
  currentDetailMatch = matches.find(m => m.id == matchId);

  const lu = await fetchLineups(matchId);
  currentDetailHomeLineup = lu.home.players;
  currentDetailAwayLineup = lu.away.players;

  detailMatchTitle.textContent = `${currentDetailMatch.home_team} vs ${currentDetailMatch.away_team}`;
  detailMatchSub.textContent = `${currentDetailMatch.date} • ${currentDetailMatch.time}`;

  scoreHomeName.textContent = currentDetailMatch.home_team;
  scoreAwayName.textContent = currentDetailMatch.away_team;

  renderPitchSide("home", pitchHome, benchHome, currentDetailHomeLineup);
  renderPitchSide("away", pitchAway, benchAway, currentDetailAwayLineup);

  fillEventSelectors();

  await loadEvents(matchId);

  showScreen("lineups-detail");
}

function renderPitchSide(side, pitchEl, benchEl, lineup) {
  pitchEl.innerHTML = `<div class="pitch-line"></div>`;
  benchEl.innerHTML = "";

  lineup.as.forEach((p, idx) => {
    const c = positionCoords[p.pos];
    if (!c) return;

    const dot = document.createElement("div");
    dot.className = "player-dot";
    dot.style.left = c.x + "%";
    dot.style.top  = c.y + "%";

    dot.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      <span class="pd-name">${p.name}</span>
    `;

    pitchEl.appendChild(dot);
  });

  lineup.yedek.forEach((p, idx) => {
    benchEl.innerHTML += `<div>${p.no ? p.no+" - ":""}${p.pos} - ${p.name}</div>`;
  });
}

function fillEventSelectors() {
  eventHomePlayer.innerHTML = "";
  eventAwayPlayer.innerHTML = "";

  currentDetailHomeLineup.as.forEach((p,i)=>{
    const opt=document.createElement("option");
    opt.value="as-"+i;
    opt.textContent=p.name;
    eventHomePlayer.appendChild(opt);
  });

  currentDetailAwayLineup.as.forEach((p,i)=>{
    const opt=document.createElement("option");
    opt.value="as-"+i;
    opt.textContent=p.name;
    eventAwayPlayer.appendChild(opt);
  });
}

// -----------------------------
//  EVENTS
// -----------------------------
async function loadEvents(matchId) {
  const events = await fetchMatchEvents(matchId);

  eventsHomeLog.innerHTML = "";
  eventsAwayLog.innerHTML = "";

  events.forEach(ev => {
    const target = ev.team_side === "home" ? eventsHomeLog : eventsAwayLog;

    const li = document.createElement("div");
    li.className = "event-item";

    let group = ev.player_group === "as" ? "As" : "Yedek";
    li.textContent = `${group} ${ev.player_index + 1} → ${ev.event_type}`;

    target.appendChild(li);
  });
}

function handleEvent(teamSide, selectEl, type) {
  const val = selectEl.value;  // "as-3"
  const [grp, idx] = val.split("-");
  saveEvent(currentDetailMatch.id, teamSide, type, grp, Number(idx));
  loadEvents(currentDetailMatch.id);
}

btnHomeGoal.onclick   = () => handleEvent("home", eventHomePlayer, "Gol");
btnHomeYellow.onclick = () => handleEvent("home", eventHomePlayer, "Sarı Kart");
btnHomeRed.onclick    = () => handleEvent("home", eventHomePlayer, "Kırmızı");

btnAwayGoal.onclick   = () => handleEvent("away", eventAwayPlayer, "Gol");
btnAwayYellow.onclick = () => handleEvent("away", eventAwayPlayer, "Sarı Kart");
btnAwayRed.onclick    = () => handleEvent("away", eventAwayPlayer, "Kırmızı");

// -----------------------------
//  MATCH ADMIN
// -----------------------------
btnMatchLogin.onclick = () => {
  const u = matchAdminUser.value.trim();
  const p = matchAdminPass.value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    matchAdminLoginCard.style.display = "none";
    matchAdminPanelCard.style.display = "block";
  } else alert("Hatalı bilgiler");
};

btnAddMatch.onclick = async () => {
  const home = matchHomeInput.value.trim();
  const away = matchAwayInput.value.trim();
  const date = matchDateInput.value;
  const time = matchTimeInput.value;
  const field = matchFieldInput.value.trim();

  if (!home || !away || !date || !time) {
    alert("Eksik bilgi");
    return;
  }

  await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      home_team: home,
      away_team: away,
      date,
      time,
      field
    })
  });

  await fetchMatches();
  renderMatches();
  renderAdminMatches();
};

function renderAdminMatches() {
  matchListAdmin.innerHTML = "";

  matches.forEach(m => {
    const div = document.createElement("div");
    div.className = "match-card small";

    div.innerHTML = `
      <div>${m.home_team} vs ${m.away_team}</div>
      <div>${m.date} • ${m.time}</div>
      <div>${m.field}</div>
    `;

    matchListAdmin.appendChild(div);
  });
}

// -----------------------------
//  NAVIGATION
// -----------------------------
tabHome.onclick = async () => {
  await fetchMatches();
  renderMatches();
  showScreen("home");
};

tabLineups.onclick = async () => {
  await fetchMatches();
  await renderLineupsList();
  showScreen("lineups-list");
};

tabMatchAdmin.onclick = () => showScreen("match-admin");

btnEdit.onclick  = () => openLineupScreen();
btnExit.onclick  = () => showScreen("home");
backToHome.onclick = () => showScreen("home");
backToLineups.onclick = () => showScreen("lineups-list");

// -----------------------------
//  INITIAL LOAD
// -----------------------------
(async ()=>{
  await fetchMatches();
  renderMatches();
})();
