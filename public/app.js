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
//  POSITIONS (Mevkiler)
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

// -----------------------------
//  POSITION COORDINATES (Saha dizilimi)
// -----------------------------
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

// Instagram
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
//  UTIL FUNCTIONS
// -----------------------------
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
//  API FUNCTIONS
// -----------------------------
async function fetchMatches() {
  try {
    const res = await fetch("/api/matches");
    matches = await res.json();
  } catch (err) {
    console.error("fetchMatches error:", err);
  }
}

async function fetchLineups(matchId) {
  try {
    const res = await fetch(`/api/matches/${matchId}/lineups`);
    const raw = await res.json();

    const formatted = {
      home:
        raw.find?.(x => x.team_side === "home") ||
        raw.home ||
        null,
      away:
        raw.find?.(x => x.team_side === "away") ||
        raw.away ||
        null
    };

    lineupsCache[matchId] = formatted;
    return formatted;
  } catch (err) {
    console.error("fetchLineups error:", err);
    return {};
  }
}

async function saveLineupToServer(matchId, side, teamName, players) {
  try {
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

    return await res.json();
  } catch (err) {
    console.error("saveLineupToServer error:", err);
  }
}


// -----------------------------
//  MATCH LIST RENDER
// -----------------------------
function renderMatches() {
  matchesContainer.innerHTML = "";

  if (!matches || matches.length === 0) {
    matchesContainer.textContent = "Aktif maç bulunmuyor.";
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
    btn.onclick = () => {
      currentMatch = matches.find(m => m.id == btn.dataset.id);
      currentTeamSide = btn.dataset.side;
      currentTeamName =
        currentTeamSide === "home"
          ? currentMatch.home_team
          : currentMatch.away_team;

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
        <option value="">Mevki seç</option>
        ${positions
          .map(
            p =>
              `<option value="${p.code}" ${
                p.code === pos ? "selected" : ""
              }>${p.code} - ${p.name}</option>`
          )
          .join("")}
      </select>
    `;

    playersForm.appendChild(row);
  }

  lineupMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  lineupMatchSub.textContent = `${currentTeamName} • Kadro Girişi`;

  showScreen("lineup");
}


// -----------------------------
//  GET LINEUP FROM FORM
// -----------------------------
function getLineupFromForm() {
  const rows = playersForm.querySelectorAll(".player-row");

  const as = [];
  const yedek = [];

  let hasError = false;

  rows.forEach((row, idx) => {
    const name = row.querySelector(".p-name").value.trim();
    const no   = row.querySelector(".p-no").value.trim();
    const pos  = row.querySelector(".p-pos").value;
    const isAs = idx < 7;

    row.style.background = "transparent";

    if (isAs) {
      if (!name || !pos) {
        row.style.background = "#450a0a";
        hasError = true;
      }
      as.push({ name, pos, no });
    } else {
      if (!name && !pos && !no) return;
      if (!name || !pos) {
        row.style.background = "#450a0a";
        hasError = true;
      }
      yedek.push({ name, pos, no });
    }
  });

  if (hasError || as.length < 7) {
    alert("Kırmızı satırları düzeltmelisin. 7 As oyuncu zorunludur.");
    return null;
  }

  return { as, yedek };
}
// -----------------------------
//  RENDER PITCH (TEK TAKIM)
// -----------------------------
function renderSinglePitch(lineup) {
  [...pitchSingle.querySelectorAll(".player-dot")].forEach(el => el.remove());
  benchListSingle.innerHTML = "";

  pitchMatchTitle.textContent =
    `${currentMatch.home_team} vs ${currentMatch.away_team}`;
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
//  KADROLAR SAYFASI (LİSTE)
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

      <button class="btn-primary btn-open-detail" data-id="${m.id}">
        Maçı Aç (İki Kadro)
      </button>
    `;

    lineupsList.appendChild(div);
  }

  lineupsList.querySelectorAll(".btn-open-detail").forEach(btn => {
    btn.onclick = () => openMatchDetail(Number(btn.dataset.id));
  });
}


// -----------------------------
//  MAÇ DETAYI AÇ
// -----------------------------
async function openMatchDetail(matchId) {
  currentDetailMatch = matches.find(m => m.id === matchId);
  const lu = await fetchLineups(matchId);

  currentDetailHomeLineup = lu.home?.players || { as: [], yedek: [] };
  currentDetailAwayLineup = lu.away?.players || { as: [], yedek: [] };

  detailMatchTitle.textContent =
    `${currentDetailMatch.home_team} vs ${currentDetailMatch.away_team}`;
  detailMatchSub.textContent =
    `${formatMatchDateDisplay(currentDetailMatch)} • ${currentDetailMatch.time} • ${currentDetailMatch.field}`;

  detailHomeTitle.textContent = currentDetailMatch.home_team;
  detailAwayTitle.textContent = currentDetailMatch.away_team;

  renderPitchSide(pitchHome, benchHome, currentDetailHomeLineup);
  renderPitchSide(pitchAway, benchAway, currentDetailAwayLineup);

  await fetchEvents(matchId);
  updateScoreboard(matchId);
  renderEventsLogs(matchId);

  showScreen("lineups-detail");
}


// -----------------------------
//  SAHA – İKİ TAKIM İÇİN (DETAY)
// -----------------------------
function renderPitchSide(pitchEl, benchEl, lineup) {
  [...pitchEl.querySelectorAll(".player-dot")].forEach(el => el.remove());
  benchEl.innerHTML = "";

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
    benchEl.textContent = "Yedek oyuncu yok.";
  } else {
    lineup.yedek.forEach(p => {
      benchEl.innerHTML += `
        <div>${p.no ? p.no + " | " : ""}${p.pos} - ${p.name.toUpperCase()}</div>
      `;
    });
  }
}


// -----------------------------
//  OLAYLARI ÇEK
// -----------------------------
async function fetchEvents(matchId) {
  const res = await fetch(`/api/events/${matchId}`);
  const list = await res.json();

  eventsCache[matchId] = {
    home: list.filter(x => x.team_side === "home"),
    away: list.filter(x => x.team_side === "away")
  };

  return eventsCache[matchId];
}


// -----------------------------
//  SKORBOARD GÜNCELLE
// -----------------------------
function updateScoreboard(matchId) {
  const cache = eventsCache[matchId] || { home: [], away: [] };

  const homeGoals = cache.home.filter(e => e.event_type === "goal").length;
  const awayGoals = cache.away.filter(e => e.event_type === "goal").length;

  scoreHomeName.textContent = currentDetailMatch.home_team;
  scoreAwayName.textContent = currentDetailMatch.away_team;

  scoreHomeValue.textContent = homeGoals;
  scoreAwayValue.textContent = awayGoals;
}


// -----------------------------
//  OLAY LİSTESİ GÖSTER
// -----------------------------
function renderEventsLogs(matchId) {
  const cache = eventsCache[matchId];

  eventsHomeLog.innerHTML = "";
  eventsAwayLog.innerHTML = "";

  cache.home.forEach(ev => {
    const p =
      ev.player_group === "as"
        ? currentDetailHomeLineup.as[ev.player_index]
        : currentDetailHomeLineup.yedek[ev.player_index];

    eventsHomeLog.innerHTML += `
      <div class="event-row">
        <div class="event-text">${p.name.toUpperCase()} - ${formatEvent(ev.event_type)}</div>
      </div>
    `;
  });

  cache.away.forEach(ev => {
    const p =
      ev.player_group === "as"
        ? currentDetailAwayLineup.as[ev.player_index]
        : currentDetailAwayLineup.yedek[ev.player_index];

    eventsAwayLog.innerHTML += `
      <div class="event-row">
        <div class="event-text">${p.name.toUpperCase()} - ${formatEvent(ev.event_type)}</div>
      </div>
    `;
  });
}

function formatEvent(type) {
  if (type === "goal") return "GOL";
  if (type === "yellow") return "SARI KART";
  if (type === "red") return "KIRMIZI KART";
  return type;
}
// -----------------------------
//  OLAY EKLEME
// -----------------------------
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

  return await res.json();
}

async function addEvent(side, type) {
  if (!currentDetailMatch) return;

  const matchId = currentDetailMatch.id;
  const isHome = side === "home";
  const selectEl = isHome ? eventHomePlayer : eventAwayPlayer;
  const lineup   = isHome ? currentDetailHomeLineup : currentDetailAwayLineup;

  const val = selectEl.value;
  if (!val) {
    alert("Lütfen oyuncu seç.");
    return;
  }

  const [group, idx] = val.split("-");
  const playerIndex = Number(idx);

  await addEventToServer(matchId, side, type, group, playerIndex);

  await fetchEvents(matchId);
  updateScoreboard(matchId);
  renderEventsLogs(matchId);
}


// -----------------------------
//  INSTAGRAM – FOTOĞRAF YÜKLEME
// -----------------------------
const instaPhotoInput = document.getElementById("instaPhotoInput");
const instaPhoto = document.getElementById("instaPhoto");

instaPhotoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const rd = new FileReader();
  rd.onload = () => {
    instaPhoto.src = rd.result;
    instaPhoto.style.display = "block";
  };
  rd.readAsDataURL(file);
});


// -----------------------------
//  INSTAGRAM — KART RENDER
// -----------------------------
function renderInstagramCard() {
  if (!currentDetailMatch) return;

  const match = currentDetailMatch;
  const cache = eventsCache[match.id] || { home: [], away: [] };

  const homeGoals = cache.home.filter(e => e.event_type === "goal").length;
  const awayGoals = cache.away.filter(e => e.event_type === "goal").length;

  // Takım adları
  document.getElementById("instaHomeName").textContent =
    match.home_team.toUpperCase();
  document.getElementById("instaAwayName").textContent =
    match.away_team.toUpperCase();

  // Skor
  document.getElementById("instaScore").textContent =
    `${homeGoals} - ${awayGoals}`;

  // Olaylar
  const homeEl = document.getElementById("instaHomeEvents");
  const awayEl = document.getElementById("instaAwayEvents");

  homeEl.innerHTML = "";
  awayEl.innerHTML = "";

  function renderSide(list, target, lineup) {
    list.forEach(ev => {
      const p =
        ev.player_group === "as"
          ? lineup.as[ev.player_index]
          : lineup.yedek[ev.player_index];

      if (!p) return;

      let icon = "⚽";
      if (ev.event_type === "yellow") icon = "🟨";
      if (ev.event_type === "red") icon = "🟥";

      const div = document.createElement("div");
      div.textContent = `${icon} ${p.name.toUpperCase()}`;
      target.appendChild(div);
    });
  }

  renderSide(cache.home, homeEl, currentDetailHomeLineup);
  renderSide(cache.away, awayEl, currentDetailAwayLineup);

  // Tarih + Saha
  const [y, m, d] = match.date.split("-").map(Number);
  const days = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  const dt = new Date(y, m - 1, d);

  document.getElementById("instaBottomInfo").textContent =
    `${d}.${m}.${y} • ${days[dt.getDay()].toUpperCase()} • ${match.field.toUpperCase()} • ${match.time}`;
}


// -----------------------------
//  INSTAGRAM — JPG İNDİR
// -----------------------------
btnInstaDownload.addEventListener("click", async () => {
  const canvas = await html2canvas(instaFrame, { scale: 2 });

  const link = document.createElement("a");
  link.download = `mac-${currentDetailMatch.id}.jpg`;
  link.href = canvas.toDataURL("image/jpeg", 0.85);
  link.click();
});

btnOpenInstagram.addEventListener("click", () => {
  renderInstagramCard();
  showScreen("instagram");
});

btnInstaBack.addEventListener("click", () => {
  showScreen("lineups-detail");
});


// -----------------------------
//  ADMIN — LOGIN
// -----------------------------
btnMatchLogin.onclick = () => {
  const u = matchAdminUser.value.trim();
  const p = matchAdminPass.value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    matchAdminLoginCard.style.display = "none";
    matchAdminPanelCard.style.display = "block";
  } else {
    alert("Hatalı kullanıcı adı veya şifre");
  }
};


// -----------------------------
//  ADMIN — MAÇ EKLE / GÜNCELLE
// -----------------------------
btnAddMatch.onclick = async () => {
  const dateVal = matchDateInput.value;
  const timeVal = matchTimeInput.value;
  const home    = matchHomeInput.value.trim();
  const away    = matchAwayInput.value.trim();
  const field   = matchFieldInput.value.trim();

  if (!dateVal || !timeVal || !home || !away) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      home_team: home,
      away_team: away,
      date: dateVal,
      time: timeVal,
      field
    })
  });

  alert("Maç eklendi");
  await fetchMatches();
  renderMatches();
};


// -----------------------------
//  BUTON EVENTLERİ – KADRO, ANA SAYFA, ÇIKIŞ
// -----------------------------
btnEdit.onclick = () => openLineupScreen();

btnExit.onclick = () => {
  showScreen("home");
};

backToLineups.onclick = async () => {
  await renderLineupsList();
  showScreen("lineups-list");
};

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
//  EVENT BUTTONS
// -----------------------------
btnHomeGoal.onclick   = () => addEvent("home", "goal");
btnHomeYellow.onclick = () => addEvent("home", "yellow");
btnHomeRed.onclick    = () => addEvent("home", "red");

btnAwayGoal.onclick   = () => addEvent("away", "goal");
btnAwayYellow.onclick = () => addEvent("away", "yellow");
btnAwayRed.onclick    = () => addEvent("away", "red");


// -----------------------------
//  INITIAL LOAD
// -----------------------------
(async () => {
  await fetchMatches();
  renderMatches();
})();

