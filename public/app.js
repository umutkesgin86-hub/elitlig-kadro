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
let editingMatch = null;

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

const matchHomeInput      = document.getElementById("matchHome");
const matchAwayInput      = document.getElementById("matchAway");
const matchDateInput      = document.getElementById("matchDate");
const matchTimeInput      = document.getElementById("matchTime");
const matchFieldInput     = document.getElementById("matchField");
const btnAddMatch         = document.getElementById("btnAddMatch");
const matchListAdmin      = document.getElementById("matchListAdmin");

// -----------------------------
// POSITION MAPS
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
  GK: { x: 50, y: 90 },
  LB: { x: 20, y: 75 },
  LCB: { x: 40, y: 70 },
  RCB: { x: 60, y: 70 },
  RB: { x: 80, y: 75 },
  CDM: { x: 50, y: 60 },
  LCM: { x: 35, y: 50 },
  RCM: { x: 65, y: 50 },
  LW: { x: 25, y: 35 },
  RW: { x: 75, y: 35 },
  ST: { x: 50, y: 25 }
};

// -----------------------------
//  UTILS
// -----------------------------
function showScreen(name) {
  [screenHome, screenLineup, screenPitch, screenLineupsList, screenLineupsDetail, screenInstagram, screenMatchAdmin]
    .forEach(s => s.classList.remove("active"));

  if (name === "home") screenHome.classList.add("active");
  if (name === "lineup") screenLineup.classList.add("active");
  if (name === "pitch") screenPitch.classList.add("active");
  if (name === "lineups-list") screenLineupsList.classList.add("active");
  if (name === "lineups-detail") screenLineupsDetail.classList.add("active");
  if (name === "instagram") screenInstagram.classList.add("active");
  if (name === "match-admin") screenMatchAdmin.classList.add("active");
}

function formatMatchDateDisplay(match) {
  if (!match.date) return "";

  const [y, m, d] = match.date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  const dd = String(d).padStart(2, "0");
  const MM = String(m).padStart(2, "0");
  const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cts"];

  return `${dd}.${MM}.${y} ${days[dateObj.getDay()]}`;
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

  // Backend OBJECT → FRONTEND FORMAT
  const formatted = {
    home: raw.find?.(x => x.team_side === "home") || raw.home || null,
    away: raw.find?.(x => x.team_side === "away") || raw.away || null
  };

  lineupsCache[matchId] = formatted;
  return formatted;
}

async function saveLineupToServer(matchId, side, teamName, players) {
  const res = await fetch(`/api/lineups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      team_side: side,
      team_name: teamName,
      players
    })
  });

  const data = await res.json();
  return data;
}

// -----------------------------
//  MATCH LIST
// -----------------------------
function renderMatches() {
  matchesContainer.innerHTML = "";

  if (matches.length === 0) {
    matchesContainer.textContent = "Maç bulunmuyor.";
    return;
  }

  matches.forEach(match => {
    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-header">
        <span>${match.home_team} vs ${match.away_team}</span>
        <span>${match.time}</span>
      </div>
      <div class="match-meta">
        ${formatMatchDateDisplay(match)} • ${match.field}
      </div>

      <div class="team-buttons">
        <button class="btn-team" data-id="${match.id}" data-side="home">${match.home_team} Kaptanı</button>
        <button class="btn-team" data-id="${match.id}" data-side="away">${match.away_team} Kaptanı</button>
      </div>
    `;

    matchesContainer.appendChild(card);
  });

  matchesContainer.querySelectorAll(".btn-team").forEach(btn => {
    btn.onclick = async () => {
      currentMatch = matches.find(m => m.id == btn.dataset.id);
      currentTeamSide = btn.dataset.side;
      currentTeamName = currentTeamSide === "home" ? currentMatch.home_team : currentMatch.away_team;
      openLineupScreen();
    };
  });
}

// -----------------------------
//  OPEN LINEUP SCREEN
// -----------------------------
async function openLineupScreen() {
  const matchId = currentMatch.id;
  const lineups = await fetchLineups(matchId);

  const existing =
    currentTeamSide === "home"
      ? lineups.home?.players
      : lineups.away?.players;

  playersForm.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const isAs = i < 7;

    let name = "";
    let pos = "";
    let no  = "";

    if (existing) {
      const src = isAs ? existing.as[i] : existing.yedek[i - 7];
      if (src) {
        name = src.name;
        pos  = src.pos;
        no   = src.no || "";
      }
    }

    const div = document.createElement("div");
    div.className = "player-row";
    div.innerHTML = `
      <span class="tag ${isAs ? "tag-as" : "tag-sub"}">
        ${isAs ? "As Oyuncu " + (i + 1) : "Yedek " + (i - 6)}
      </span>

      <label>İsim Soyisim</label>
      <div class="row-inline">
        <input class="p-name" value="${name}">
        <input class="p-no" value="${no}" placeholder="No">
      </div>

      <label>Mevki</label>
      <select class="p-pos">
        <option value="">Mevki seç</option>
        ${positions
          .map(p => `<option value="${p.code}" ${p.code === pos ? "selected" : ""}>${p.code} - ${p.name}</option>`)
          .join("")}
      </select>
    `;

    playersForm.appendChild(div);
  }

  lineupMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  lineupMatchSub.textContent = `${currentTeamName} kadrosu`;

  showScreen("lineup");
}

// -----------------------------
//  GET LINEUP FROM FORM
// -----------------------------
function getLineupFromForm() {
  const rows = playersForm.querySelectorAll(".player-row");

  const as = [];
  const yedek = [];

  let err = false;

  rows.forEach((row, idx) => {
    const name = row.querySelector(".p-name").value.trim();
    const no   = row.querySelector(".p-no").value.trim();
    const pos  = row.querySelector(".p-pos").value;

    const isAs = idx < 7;

    row.style.background = "transparent";

    if (isAs) {
      if (!name || !pos) {
        row.style.background = "#450a0a";
        err = true;
      }
      as.push({ name, pos, no });
    } else {
      if (!name && !pos && !no) return;
      if (!name || !pos) {
        row.style.background = "#450a0a";
        err = true;
      }
      yedek.push({ name, pos, no });
    }
  });

  if (err || as.length < 7) {
    alert("Lütfen kırmızı alanları düzeltin. 7 As oyuncu zorunludur.");
    return null;
  }

  return { as, yedek };
}

// -----------------------------
//  RENDER SINGLE PITCH
// -----------------------------
function renderSinglePitch(lineup) {
  [...pitchSingle.querySelectorAll(".player-dot")].forEach(el => el.remove());
  benchListSingle.innerHTML = "";

  pitchMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  pitchMatchSub.textContent =
    `${currentTeamName} – İlk 7 & Yedekler`;

  lineup.as.forEach(p => {
    const c = positionCoords[p.pos];
    if (!c) return;

    const dot = document.createElement("div");
    dot.className = "player-dot";
    dot.style.left = c.x + "%";
    dot.style.top = c.y + "%";

    dot.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      ${p.no ? `<span class="pd-no">${p.no}</span>` : ""}
      <span class="pd-name">${p.name.toUpperCase()}</span>
    `;
    pitchSingle.appendChild(dot);
  });

  if (lineup.yedek.length === 0) {
    benchListSingle.textContent = "Yedek oyuncu yok.";
  } else {
    lineup.yedek.forEach(p => {
      benchListSingle.innerHTML += `<div>${p.no ? p.no + " | " : ""}${p.pos} - ${p.name.toUpperCase()}</div>`;
    });
  }

  showScreen("pitch");
}

// -----------------------------
//  EVENT LISTENERS
// -----------------------------
saveLineup.onclick = async () => {
  const lineup = getLineupFromForm();
  if (!lineup) return;

  await saveLineupToServer(currentMatch.id, currentTeamSide, currentTeamName, lineup);
  renderSinglePitch(lineup);
};

btnEdit.onclick = () => openLineupScreen();
btnExit.onclick = () => showScreen("home");

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

tabMatchAdmin.onclick = () => {
  showScreen("match-admin");
};

// -----------------------------
//  INITIAL LOAD
// -----------------------------
(async () => {
  await fetchMatches();
  renderMatches();
})();

// -----------------------------
//  KADROLAR LİSTESİ
// -----------------------------
async function renderLineupsList() {
  lineupsList.innerHTML = "";

  for (const m of matches) {
    const lu = await fetchLineups(m.id);

    const hasHome = lu.home && lu.home.players;
    const hasAway = lu.away && lu.away.players;

    if (!hasHome || !hasAway) continue;

    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
      <div class="match-header">
        <span>${m.home_team} vs ${m.away_team}</span>
        <span>${m.time}</span>
      </div>
      <div class="match-meta">${formatMatchDateDisplay(m)} • ${m.field}</div>
      <button class="btn-primary" data-id="${m.id}">Maçı Aç</button>
    `;

    lineupsList.appendChild(div);
  }

  lineupsList.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => openMatchDetail(btn.dataset.id);
  });
}
// -----------------------------
//  MATCH ADMIN LOGIN
// -----------------------------
btnMatchLogin.onclick = () => {
  const u = matchAdminUser.value.trim();
  const p = matchAdminPass.value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    isMatchAdmin = true;
    matchAdminLoginCard.style.display = "none";
    matchAdminPanelCard.style.display = "block";
  } else {
    alert("Hatalı kullanıcı adı veya şifre");
  }
};
