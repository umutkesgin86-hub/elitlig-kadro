// ===============================================
// ELİT LİG — KADRO SİSTEMİ (FINAL FULL VERSION)
// ===============================================

// -----------------------------
// GLOBAL STATE
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

let editingMatch = null;

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let isMatchAdmin = false;

// -----------------------------
// DOM ELEMENTS
// -----------------------------
const tabHome = document.getElementById("tabHome");
const tabLineups = document.getElementById("tabLineups");
const tabMatchAdmin = document.getElementById("tabMatchAdmin");

const screenHome = document.getElementById("screen-home");
const screenLineup = document.getElementById("screen-lineup");
const screenPitch = document.getElementById("screen-pitch");
const screenLineupsList = document.getElementById("screen-lineups-list");
const screenLineupsDetail = document.getElementById("screen-lineups-detail");
const screenInstagram = document.getElementById("screen-instagram");
const screenMatchAdmin = document.getElementById("screen-match-admin");

const matchesContainer = document.getElementById("matchesContainer");
const playersForm = document.getElementById("playersForm");

const lineupMatchTitle = document.getElementById("lineupMatchTitle");
const lineupMatchSub = document.getElementById("lineupMatchSub");

const pitchMatchTitle = document.getElementById("pitchMatchTitle");
const pitchMatchSub = document.getElementById("pitchMatchSub");

const backToHome = document.getElementById("backToHome");
const saveLineup = document.getElementById("saveLineup");
const btnEdit = document.getElementById("btnEdit");
const btnExit = document.getElementById("btnExit");

const lineupsList = document.getElementById("lineupsList");
const backToLineups = document.getElementById("backToLineups");

const pitchSingle = document.getElementById("pitchSingle");
const benchListSingle = document.getElementById("benchListSingle");

const detailMatchTitle = document.getElementById("detailMatchTitle");
const detailMatchSub = document.getElementById("detailMatchSub");
const detailHomeTitle = document.getElementById("detailHomeTitle");
const detailAwayTitle = document.getElementById("detailAwayTitle");

const pitchHome = document.getElementById("pitchHome");
const pitchAway = document.getElementById("pitchAway");
const benchHome = document.getElementById("benchHome");
const benchAway = document.getElementById("benchAway");

// Scoreboard
const scoreHomeName = document.getElementById("scoreHomeName");
const scoreAwayName = document.getElementById("scoreAwayName");
const scoreHomeValue = document.getElementById("scoreHomeValue");
const scoreAwayValue = document.getElementById("scoreAwayValue");

// Events
const eventsHomeTitle = document.getElementById("eventsHomeTitle");
const eventsAwayTitle = document.getElementById("eventsAwayTitle");
const eventHomePlayer = document.getElementById("eventHomePlayer");
const eventAwayPlayer = document.getElementById("eventAwayPlayer");

const btnHomeGoal = document.getElementById("btnHomeGoal");
const btnHomeYellow = document.getElementById("btnHomeYellow");
const btnHomeRed = document.getElementById("btnHomeRed");

const btnAwayGoal = document.getElementById("btnAwayGoal");
const btnAwayYellow = document.getElementById("btnAwayYellow");
const btnAwayRed = document.getElementById("btnAwayRed");

const eventsHomeLog = document.getElementById("eventsHomeLog");
const eventsAwayLog = document.getElementById("eventsAwayLog");

// Insta
const btnOpenInstagram = document.getElementById("btnOpenInstagram");
const btnInstaBack = document.getElementById("btnInstaBack");
const btnInstaDownload = document.getElementById("btnInstaDownload");
const instaFrame = document.getElementById("instaFrame");

// Match Admin
const matchAdminLoginCard = document.getElementById("matchAdminLoginCard");
const matchAdminPanelCard = document.getElementById("matchAdminPanelCard");
const matchAdminUser = document.getElementById("matchAdminUser");
const matchAdminPass = document.getElementById("matchAdminPass");

const matchHomeInput = document.getElementById("matchHome");
const matchAwayInput = document.getElementById("matchAway");
const matchDateInput = document.getElementById("matchDate");
const matchTimeInput = document.getElementById("matchTime");
const matchFieldInput = document.getElementById("matchField");
const btnAddMatch = document.getElementById("btnAddMatch");
const matchListAdmin = document.getElementById("matchListAdmin");

// -----------------------------
// POSITIONS
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
// UTILITIES
// -----------------------------
function showScreen(name) {
  [screenHome, screenLineup, screenPitch, screenLineupsList, screenLineupsDetail, screenInstagram, screenMatchAdmin]
    .forEach(s => s.classList.remove("active"));

  document.getElementById(`screen-${name}`).classList.add("active");
}

function formatMatchDateDisplay(m) {
  const [Y, M, D] = m.date.split("-");
  return `${D}.${M}.${Y}`;
}

// -----------------------------
// API FUNCTIONS
// -----------------------------
async function fetchMatches() {
  const res = await fetch("/api/matches");
  matches = await res.json();
}

async function fetchLineups(matchId) {
  const res = await fetch(`/api/matches/${matchId}/lineups`);
  const raw = await res.json();

  const output = {
    home: raw.find(x => x.team_side === "home") || null,
    away: raw.find(x => x.team_side === "away") || null
  };

  if (output.home) output.home.players = JSON.parse(output.home.players_json);
  if (output.away) output.away.players = JSON.parse(output.away.players_json);

  lineupsCache[matchId] = output;
  return output;
}

async function saveLineupToServer(matchId, side, teamName, players) {
  await fetch("/api/lineups", {
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

// -----------------------------
// RENDER MATCH LIST
// -----------------------------
function renderMatches() {
  matchesContainer.innerHTML = "";

  matches.forEach(m => {
    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-header">
        <span>${m.home_team} vs ${m.away_team}</span>
        <span>${m.time}</span>
      </div>
      <div class="match-meta">${formatMatchDateDisplay(m)} • ${m.field}</div>
      <div class="team-buttons">
        <button class="btn-team" data-side="home" data-id="${m.id}">
          ${m.home_team} Kaptanı
        </button>
        <button class="btn-team" data-side="away" data-id="${m.id}">
          ${m.away_team} Kaptanı
        </button>
      </div>
    `;

    matchesContainer.appendChild(card);
  });

  matchesContainer.querySelectorAll(".btn-team").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      currentMatch = matches.find(x => x.id == id);
      currentTeamSide = btn.dataset.side;
      currentTeamName = currentTeamSide === "home" ? currentMatch.home_team : currentMatch.away_team;
      openLineupScreen();
    };
  });
}

// -----------------------------
// OPEN LINEUP SCREEN
// -----------------------------
async function openLineupScreen() {
  const lu = await fetchLineups(currentMatch.id);

  const existing =
    currentTeamSide === "home" ? lu.home?.players : lu.away?.players;

  lineupMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  lineupMatchSub.textContent = `${currentTeamName} kadrosu`;

  playersForm.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const isAs = i < 7;

    let name = "", pos = "", no = "";

    if (existing) {
      const src = isAs ? existing.as[i] : existing.yedek[i - 7];
      if (src) {
        name = src.name;
        pos = src.pos;
        no = src.no || "";
      }
    }

    const row = document.createElement("div");
    row.className = "player-row";

    row.innerHTML = `
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
        <option value="">Seç</option>
        ${positions.map(p => `
          <option value="${p.code}" ${p.code === pos ? "selected" : ""}>
            ${p.code} - ${p.name}
          </option>`).join("")}
      </select>
    `;

    playersForm.appendChild(row);
  }

  showScreen("lineup");
}

// -----------------------------
// GET LINEUP FROM FORM
// -----------------------------
function getLineupFromForm() {
  const rows = document.querySelectorAll(".player-row");

  const as = [];
  const yedek = [];
  let err = false;

  rows.forEach((row, idx) => {
    const name = row.querySelector(".p-name").value.trim();
    const no = row.querySelector(".p-no").value.trim();
    const pos = row.querySelector(".p-pos").value;

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
    alert("7 As oyuncu zorunludur. Kırmızı alanları düzeltin.");
    return null;
  }

  return { as, yedek };
}

// -----------------------------
// RENDER SINGLE PITCH
// -----------------------------
function renderSinglePitch(lineup) {
  pitchSingle.querySelectorAll(".player-dot").forEach(el => el.remove());
  benchListSingle.innerHTML = "";

  pitchMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  pitchMatchSub.textContent = `${currentTeamName} – İlk 7 & Yedekler`;

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
      benchListSingle.innerHTML += `
        <div>${p.no ? p.no + " | " : ""}${p.pos} - ${p.name.toUpperCase()}</div>
      `;
    });
  }

  showScreen("pitch");
}

// -----------------------------
// SAVE LINEUP BUTTON
// -----------------------------
saveLineup.onclick = async () => {
  const data = getLineupFromForm();
  if (!data) return;

  await saveLineupToServer(currentMatch.id, currentTeamSide, currentTeamName, data);
  renderSinglePitch(data);
};

// -----------------------------
// BACK BUTTON
// -----------------------------
backToHome.onclick = () => showScreen("home");
btnEdit.onclick = () => openLineupScreen();
btnExit.onclick = () => showScreen("home");

// -----------------------------
// TAB: HOME
// -----------------------------
tabHome.onclick = async () => {
  await fetchMatches();
  renderMatches();
  showScreen("home");
};

// -----------------------------
// TAB: KADROLAR
// -----------------------------
tabLineups.onclick = async () => {
  await fetchMatches();
  await renderLineupsList();
  showScreen("lineups-list");
};

// -----------------------------
// RENDER LINEUPS LIST
-----------------------------
async function renderLineupsList() {
  lineupsList.innerHTML = "";

  for (const m of matches) {
    const lu = await fetchLineups(m.id);

    if (!lu.home?.players || !lu.away?.players) continue;

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
// OPEN MATCH DETAIL (2 SAHA YAN YANA)
// -----------------------------
async function openMatchDetail(id) {
  const match = matches.find(x => x.id == id);
  currentDetailMatch = match;

  const lu = await fetchLineups(id);

  currentDetailHomeLineup = lu.home.players;
  currentDetailAwayLineup = lu.away.players;

  detailMatchTitle.textContent = `${match.home_team} vs ${match.away_team}`;
  detailMatchSub.textContent = `${formatMatchDateDisplay(match)} • ${match.time} • ${match.field}`;

  detailHomeTitle.textContent = match.home_team;
  detailAwayTitle.textContent = match.away_team;

  pitchHome.innerHTML = "";
  pitchAway.innerHTML = "";
  benchHome.innerHTML = "";
  benchAway.innerHTML = "";

  renderPitchSide(currentDetailHomeLineup, pitchHome, benchHome);
  renderPitchSide(currentDetailAwayLineup, pitchAway, benchAway);

  await loadEvents(id);
  updateScoreboard(id);
  renderInstagramCard();

  showScreen("lineups-detail");
}

// -----------------------------
// RENDER PITCH SIDE
// -----------------------------
function renderPitchSide(lineup, pitchEl, benchEl) {
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

    pitchEl.appendChild(dot);
  });

  if (!lineup.yedek.length) {
    benchEl.textContent = "Yedek yok";
  } else {
    lineup.yedek.forEach(p => {
      benchEl.innerHTML += `
        <div>${p.no ? p.no + " | " : ""}${p.pos} - ${p.name.toUpperCase()}</div>
      `;
    });
  }
}

// -----------------------------
// LOAD EVENTS
// -----------------------------
async function loadEvents(matchId) {
  const res = await fetch(`/api/events/${matchId}`);
  const rows = await res.json();

  eventsCache[matchId] = {
    home: rows.filter(x => x.team_side === "home"),
    away: rows.filter(x => x.team_side === "away"),
  };

  renderEvents();
}

// -----------------------------
// RENDER EVENTS
// -----------------------------
function renderEvents() {
  const matchId = currentDetailMatch.id;

  const cache = eventsCache[matchId];

  renderEventsSide(cache.home, eventsHomeLog, currentDetailHomeLineup);
  renderEventsSide(cache.away, eventsAwayLog, currentDetailAwayLineup);
}

function renderEventsSide(list, container, lineup) {
  container.innerHTML = "";

  list.forEach(ev => {
    const arr = ev.player_group === "as" ? lineup.as : lineup.yedek;
    const p = arr[ev.player_index];

    if (!p) return;

    let icon = ev.event_type === "goal" ? "⚽" :
               ev.event_type === "yellow" ? "🟨" : "🟥";

    const row = document.createElement("div");
    row.className = "event-row";

    row.innerHTML = `
      <span>${icon} ${p.name.toUpperCase()}</span>
    `;

    container.appendChild(row);
  });
}

// -----------------------------
// ADD EVENT
// -----------------------------
async function addEvent(side, type) {
  const matchId = currentDetailMatch.id;

  const select = side === "home" ? eventHomePlayer : eventAwayPlayer;
  const lineup = side === "home" ? currentDetailHomeLineup : currentDetailAwayLineup;

  const val = select.value;
  if (!val) return alert("Oyuncu seçin");

  const [group, index] = val.split("-");

  await fetch(`/api/events`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      match_id: matchId,
      team_side: side,
      event_type: type,
      player_group: group,
      player_index: Number(index)
    })
  });

  await loadEvents(matchId);
  updateScoreboard(matchId);
  renderInstagramCard();
}

btnHomeGoal.onclick   = () => addEvent("home", "goal");
btnHomeYellow.onclick = () => addEvent("home", "yellow");
btnHomeRed.onclick    = () => addEvent("home", "red");

btnAwayGoal.onclick   = () => addEvent("away", "goal");
btnAwayYellow.onclick = () => addEvent("away", "yellow");
btnAwayRed.onclick    = () => addEvent("away", "red");

// -----------------------------
// SCOREBOARD
// -----------------------------
function updateScoreboard(matchId) {
  const cache = eventsCache[matchId] || { home: [], away: [] };

  const h = cache.home.filter(x => x.event_type === "goal").length;
  const a = cache.away.filter(x => x.event_type === "goal").length;

  scoreHomeValue.textContent = h;
  scoreAwayValue.textContent = a;
}

// -----------------------------
// INSTAGRAM CARD BUILDER
// -----------------------------
function renderInstagramCard() {
  const m = currentDetailMatch;
  const cache = eventsCache[m.id];

  const hGoals = cache.home.filter(x => x.event_type === "goal").length;
  const aGoals = cache.away.filter(x => x.event_type === "goal").length;

  document.getElementById("instaHomeName").textContent = m.home_team.toUpperCase();
  document.getElementById("instaAwayName").textContent = m.away_team.toUpperCase();
  document.getElementById("instaScore").textContent = `${hGoals} - ${aGoals}`;
  document.getElementById("instaBottomInfo").textContent =
    `${formatMatchDateDisplay(m)} • ${m.field.toUpperCase()} • ${m.time}`;

  const homeEl = document.getElementById("instaHomeEvents");
  const awayEl = document.getElementById("instaAwayEvents");
  homeEl.innerHTML = "";
  awayEl.innerHTML = "";

  cache.home.forEach(ev => {
    const p = (ev.player_group === "as" ? currentDetailHomeLineup.as : currentDetailHomeLineup.yedek)[ev.player_index];
    if (!p) return;
    const icon = ev.event_type === "goal" ? "⚽" : ev.event_type === "yellow" ? "🟨" : "🟥";
    homeEl.innerHTML += `<div>${icon} ${p.name.toUpperCase()}</div>`;
  });

  cache.away.forEach(ev => {
    const p = (ev.player_group === "as" ? currentDetailAwayLineup.as : currentDetailAwayLineup.yedek)[ev.player_index];
    if (!p) return;
    const icon = ev.event_type === "goal" ? "⚽" : ev.event_type === "yellow" ? "🟨" : "🟥";
    awayEl.innerHTML += `<div>${icon} ${p.name.toUpperCase()}</div>`;
  });
}

// -----------------------------
// INSTAGRAM SCREEN BUTTONS
// -----------------------------
btnOpenInstagram.onclick = () => {
  renderInstagramCard();
  showScreen("instagram");
};

btnInstaBack.onclick = () => showScreen("lineups-detail");

btnInstaDownload.onclick = async () => {
  const canvas = await html2canvas(instaFrame, { scale: 2 });
  const link = document.createElement("a");
  link.download = "mac-sonucu.jpg";
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
};

// -----------------------------
// ADMIN LOGIN
// -----------------------------
btnMatchLogin.onclick = () => {
  const u = matchAdminUser.value.trim();
  const p = matchAdminPass.value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    isMatchAdmin = true;
    matchAdminLoginCard.style.display = "none";
    matchAdminPanelCard.style.display = "block";
    renderMatchAdminList();
  } else {
    alert("Hatalı giriş!");
  }
};

// -----------------------------
// MATCH ADMIN LIST
// -----------------------------
async function renderMatchAdminList() {
  await fetchMatches();
  matchListAdmin.innerHTML = "";

  matches.forEach(m => {
    const row = document.createElement("div");
    row.style.marginBottom = "6px";

    row.innerHTML = `
      <span>#${m.id} – ${m.home_team} vs ${m.away_team} • ${formatMatchDateDisplay(m)} • ${m.time}</span>
    `;

    matchListAdmin.appendChild(row);
  });
}

// -----------------------------
// ADD MATCH (ADMIN)
// -----------------------------
btnAddMatch.onclick = async () => {
  const date = matchDateInput.value;
  const time = matchTimeInput.value;
  const home = matchHomeInput.value.trim();
  const away = matchAwayInput.value.trim();
  const field = matchFieldInput.value.trim() || "Elit Lig Arena";

  if (!date || !time || !home || !away) {
    alert("Tüm zorunlu alanları doldurun.");
    return;
  }

  await fetch("/api/matches", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ home_team: home, away_team: away, date, time, field })
  });

  alert("Maç eklendi!");

  matchHomeInput.value = "";
  matchAwayInput.value = "";
  matchDateInput.value = "";
  matchTimeInput.value = "";
  matchFieldInput.value = "";

  await renderMatchAdminList();
};

// -----------------------------
// STARTUP
// -----------------------------
(async () => {
  await fetchMatches();
  renderMatches();
})();
