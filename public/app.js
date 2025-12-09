// app.js — Frontend mantığı (API ile çalışır)

// GLOBAL DURUMLAR
let matches = [];
const lineupsCache = {}; // matchId -> { home, away }
const eventsCache = {};  // matchId -> { home:[], away:[] }

let currentMatch = null;
let currentTeamSide = null;  // 'home' | 'away'
let currentTeamName = null;

let currentDetailMatch = null;
let currentDetailHomeLineup = null;
let currentDetailAwayLineup = null;

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let isMatchAdmin = false;
let editingMatch = null;


// DOM KISMI
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

// Olay alanı
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

// Instagram ekranı
const btnOpenInstagram = document.getElementById("btnOpenInstagram");
const btnInstaBack     = document.getElementById("btnInstaBack");
const btnInstaDownload = document.getElementById("btnInstaDownload");
const instaFrame       = document.getElementById("instaFrame");

// Admin giriş
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


// Pozisyonlar ve saha koordinatları
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


// ------------------ GENEL FONKSİYONLAR ------------------

function setActiveTab(tab) {
  tabHome.classList.remove("active");
  tabLineups.classList.remove("active");
  tabMatchAdmin.classList.remove("active");
  if (tab === "home") tabHome.classList.add("active");
  if (tab === "lineups") tabLineups.classList.add("active");
  if (tab === "match-admin") tabMatchAdmin.classList.add("active");
}

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

function getTurkishDayName(idx) {
  const names = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return names[idx] || "";
}

function formatMatchDateDisplay(match) {
  if (!match.date) return "";
  const [year, month, day] = match.date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dd = String(day).padStart(2, "0");
  const MM = String(month).padStart(2, "0");
  const gun = getTurkishDayName(d.getDay());
  return `${dd}.${MM}.${year} ${gun}`;
}

function getMatchStartTime(match) {
  try {
    const [year, month, day] = match.date.split("-").map(Number);
    const [hour, minute] = match.time.split(":").map(Number);
    const d = new Date(year, month - 1, day, hour, minute);
    return d.getTime();
  } catch {
    return null;
  }
}

// Maç saatinden 1 saat sonrasına kadar ana sayfada gözüksün
function isMatchActive(match) {
  const start = getMatchStartTime(match);
  if (!start) return true;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  return now <= start + oneHour;
}


// ------------------ API FONKSİYONLARI ------------------

async function fetchMatches() {
  const res = await fetch("/api/matches");
  matches = await res.json();
}

async function fetchLineups(matchId) {
  if (lineupsCache[matchId]) return lineupsCache[matchId];
  const res = await fetch(`/api/matches/${matchId}/lineups`);
  const data = await res.json();
  lineupsCache[matchId] = data;
  return data;
}

async function fetchEvents(matchId) {
  const res = await fetch(`/api/matches/${matchId}/events`);
  const data = await res.json();
  eventsCache[matchId] = {
    home: (data.home || []).map(ev => ({
      id: ev.id,
      type: ev.event_type,
      group: ev.player_group,
      index: ev.player_index
    })),
    away: (data.away || []).map(ev => ({
      id: ev.id,
      type: ev.event_type,
      group: ev.player_group,
      index: ev.player_index
    }))
  };
  return eventsCache[matchId];
}

async function saveLineupToServer(matchId, teamSide, teamName, players) {
  const res = await fetch(`/api/matches/${matchId}/lineups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_side: teamSide,
      team_name: teamName,
      players
    })
  });
  const data = await res.json();
  lineupsCache[matchId] = data;
  return data;
}

async function addEventToServer(matchId, side, type, group, index) {
  const res = await fetch(`/api/matches/${matchId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_side: side,
      event_type: type,
      player_group: group,
      player_index: index
    })
  });
  const ev = await res.json();
  if (!eventsCache[matchId]) {
    eventsCache[matchId] = { home: [], away: [] };
  }
  const arr = side === "home" ? eventsCache[matchId].home : eventsCache[matchId].away;
  arr.push({
    id: ev.id,
    type: ev.event_type,
    group: ev.player_group,
    index: ev.player_index
  });
}

async function deleteEventFromServer(matchId, side, eventIdx) {
  const cache = eventsCache[matchId];
  if (!cache) return;
  const arr = side === "home" ? cache.home : cache.away;
  const ev = arr[eventIdx];
  if (!ev) return;

  await fetch(`/api/matches/${matchId}/events/${ev.id}`, {
    method: "DELETE"
  });

  arr.splice(eventIdx, 1);
}


// ------------------ ANA SAYFA ------------------

function renderMatches() {
  matchesContainer.innerHTML = "";

  let active = matches.filter(isMatchActive);
  active = active.sort((a, b) => {
    const sa = getMatchStartTime(a) || 0;
    const sb = getMatchStartTime(b) || 0;
    if (sa !== sb) return sb - sa;
    return (b.id || 0) - (a.id || 0);
  });

  const limited = active.slice(0, 10);

  if (limited.length === 0) {
    matchesContainer.textContent = "Aktif maç bulunmuyor.";
    return;
  }

  limited.forEach(match => {
    const card = document.createElement("div");
    card.className = "match-card";
    const dateDisplay = formatMatchDateDisplay(match);

    card.innerHTML = `
      <div class="match-header">
        <span>${match.home_team} vs ${match.away_team}</span>
        <span>${match.time}</span>
      </div>
      <div class="match-meta">
        ${dateDisplay} • ${match.field}
      </div>
      <div class="team-buttons">
        <button class="btn-team" data-match="${match.id}" data-side="home">
          ${match.home_team} kaptanı olarak kadro gir
        </button>
        <button class="btn-team" data-match="${match.id}" data-side="away">
          ${match.away_team} kaptanı olarak kadro gir
        </button>
      </div>
    `;
    matchesContainer.appendChild(card);
  });

  matchesContainer.querySelectorAll(".btn-team").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-match"));
      const side = btn.getAttribute("data-side");
      currentMatch = matches.find(m => m.id === id);
      currentTeamSide = side;
      currentTeamName = side === "home" ? currentMatch.home_team : currentMatch.away_team;
      await openLineupScreen();
    });
  });
}


// ------------------ KADRO GİRİŞ EKRANI ------------------

async function openLineupScreen() {
  if (!currentMatch || !currentTeamSide) return;

  const dateDisplay = formatMatchDateDisplay(currentMatch);

  lineupMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  lineupMatchSub.textContent   = `${dateDisplay} • ${currentMatch.time} • ${currentMatch.field} • ${currentTeamName} kadrosu`;

  const lineups = await fetchLineups(currentMatch.id);
  const existing =
    currentTeamSide === "home" ? lineups.home?.players : lineups.away?.players;

  playersForm.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const row = document.createElement("div");
    row.className = "player-row";
    const isAs = i < 7;
    const tagText = isAs ? `As Oyuncu ${i + 1}` : `Yedek ${i - 6}`;

    let nameVal = "";
    let posVal  = "";
    let noVal   = "";

    if (existing) {
      if (isAs && existing.as[i]) {
        nameVal = existing.as[i].name;
        posVal  = existing.as[i].pos;
        noVal   = existing.as[i].no || "";
      }
      if (!isAs && existing.yedek[i - 7]) {
        nameVal = existing.yedek[i - 7].name;
        posVal  = existing.yedek[i - 7].pos;
        noVal   = existing.yedek[i - 7].no || "";
      }
    }

    row.innerHTML = `
      <span class="tag ${isAs ? "tag-as" : "tag-sub"}">${tagText}</span>
      <label>İsim Soyisim</label>
      <div class="row-inline">
        <input type="text" class="p-name" placeholder="Oyuncu adı soyadı" value="${nameVal}">
        <input type="text" class="p-no" placeholder="No" value="${noVal}">
      </div>
      <label>Mevki</label>
      <select class="p-pos">
        <option value="">Mevki seç</option>
        ${positions
          .map(
            p =>
              `<option value="${p.code}" ${p.code === posVal ? "selected" : ""}>
                 ${p.code} - ${p.name}
               </option>`
          )
          .join("")}
      </select>
    `;
    playersForm.appendChild(row);
  }

  setActiveTab("home");
  showScreen("lineup");
}

function getLineupFromForm() {
  const rows = playersForm.querySelectorAll(".player-row");
  const playersAs = [];
  const playersYedek = [];
  let hasError = false;

  rows.forEach((row, index) => {
    const nameInput = row.querySelector(".p-name");
    const noInput   = row.querySelector(".p-no");
    const posSelect = row.querySelector(".p-pos");

    const name = nameInput.value.trim();
    const no   = noInput.value.trim();
    const pos  = posSelect.value;
    const isAs = index < 7;

    row.style.background = "transparent";

    if (isAs) {
      if (!name || !pos) {
        row.style.background = "#450a0a";
        hasError = true;
        return;
      }
      playersAs.push({ name, pos, no });
    } else {
      if (!name && !pos && !no) return;
      if ((name && !pos) || (!name && pos)) {
        row.style.background = "#450a0a";
        hasError = true;
        return;
      }
      if (!name && !pos && no) return;
      playersYedek.push({ name, pos, no });
    }
  });

  if (hasError) {
    alert(
      "Lütfen kırmızı işaretli satırlardaki bilgileri tamamlayın.\nAs oyuncular için isim ve mevki zorunlu; yedekler isteğe bağlı ama isim+mevki birlikte girilmeli."
    );
    return null;
  }

  if (playersAs.length < 7) {
    alert("7 as oyuncunun tamamını doldurmanız gerekiyor.");
    return null;
  }

  return { as: playersAs, yedek: playersYedek };
}

function renderSinglePitch(lineup) {
  [...pitchSingle.querySelectorAll(".player-dot")].forEach(el => el.remove());
  benchListSingle.innerHTML = "";

  const dateDisplay = formatMatchDateDisplay(currentMatch);
  pitchMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  pitchMatchSub.textContent   = `${dateDisplay} • ${currentMatch.time} • ${currentMatch.field} • ${currentTeamName} - İlk 7 & Yedekler`;

  lineup.as.forEach(player => {
    const coord = positionCoords[player.pos];
    if (!coord) return;
    const el = document.createElement("div");
    el.className = "player-dot";
    el.style.left = coord.x + "%";
    el.style.top  = coord.y + "%";

    const nameUpper = (player.name || "").toUpperCase();
    const noSpan = player.no
      ? `<span class="pd-no"><span class="shirt-icon">🎽</span>${player.no}</span>`
      : "";

    el.innerHTML = `
      <span class="pd-pos">${player.pos}</span>
      ${noSpan}
      <span class="pd-name">${nameUpper}</span>
    `;
    pitchSingle.appendChild(el);
  });

  if (!lineup.yedek || lineup.yedek.length === 0) {
    benchListSingle.textContent = "Yedek oyuncu girilmemiş.";
  } else {
    lineup.yedek.forEach(p => {
      const prefix = p.no ? `${p.no} | ` : "";
      const nameUpper = (p.name || "").toUpperCase();
      const div = document.createElement("div");
      div.textContent = `${prefix}${p.pos} - ${nameUpper}`;
      benchListSingle.appendChild(div);
    });
  }

  setActiveTab("home");
  showScreen("pitch");
}


// ------------------ KADROLAR LİSTESİ & DETAY ------------------

async function renderLineupsList() {
  lineupsList.textContent = "Yükleniyor...";
  await fetchMatches();

  lineupsList.innerHTML = "";
  let any = false;

  for (const match of matches) {
    const lineups = await fetchLineups(match.id);
    if (!lineups.home || !lineups.away) continue;

    any = true;
    const card = document.createElement("div");
    card.className = "match-card";

    const homeAs = lineups.home.players.as || [];
    const awayAs = lineups.away.players.as || [];
    const homeSummary = homeAs
      .map(p => {
        const prefix = p.no ? `${p.no} | ` : "";
        const nameUpper = (p.name || "").toUpperCase();
        return `${prefix}${p.pos}-${nameUpper}`;
      })
      .join(", ");
    const awaySummary = awayAs
      .map(p => {
        const prefix = p.no ? `${p.no} | ` : "";
        const nameUpper = (p.name || "").toUpperCase();
        return `${prefix}${p.pos}-${nameUpper}`;
      })
      .join(", ");

    const dateDisplay = formatMatchDateDisplay(match);

    card.innerHTML = `
      <div class="match-header">
        <span>${match.home_team} vs ${match.away_team}</span>
        <span>${match.time}</span>
      </div>
      <div class="match-meta">
        ${dateDisplay} • ${match.field}
      </div>
      <div style="font-size:11px; margin-top:4px;">
        <strong>${match.home_team} As:</strong> ${homeSummary}
      </div>
      <div style="font-size:11px; margin-top:2px;">
        <strong>${match.away_team} As:</strong> ${awaySummary}
      </div>
    `;

    const btn = document.createElement("button");
    btn.className = "btn-small";
    btn.textContent = "Maçı Aç (İki Kadro)";
    btn.addEventListener("click", () => {
      renderTwoPitches(match, lineups.home.players, lineups.away.players);
    });

    card.appendChild(btn);
    lineupsList.appendChild(card);
  }

  if (!any) {
    lineupsList.textContent = "Henüz her iki takımıyla birlikte kadro girilmiş maç yok.";
  }
}

function updateScoreboard(matchId) {
  if (!currentDetailMatch) return;
  const cache = eventsCache[matchId] || { home: [], away: [] };
  const homeGoals = cache.home.filter(ev => ev.type === "goal").length;
  const awayGoals = cache.away.filter(ev => ev.type === "goal").length;

  scoreHomeName.textContent  = currentDetailMatch.home_team;
  scoreAwayName.textContent  = currentDetailMatch.away_team;
  scoreHomeValue.textContent = homeGoals;
  scoreAwayValue.textContent = awayGoals;

  renderInstagramCard(); // skor değiştikçe insta görselini de güncelle
}

async function renderTwoPitches(match, homePlayers, awayPlayers) {
  currentDetailMatch = match;
  currentDetailHomeLineup = homePlayers;
  currentDetailAwayLineup = awayPlayers;

  const dateDisplay = formatMatchDateDisplay(match);

  detailMatchTitle.textContent = `${match.home_team} vs ${match.away_team}`;
  detailMatchSub.textContent   = `${dateDisplay} • ${match.time} • ${match.field}`;
  detailHomeTitle.textContent  = match.home_team;
  detailAwayTitle.textContent  = match.away_team;

  [...pitchHome.querySelectorAll(".player-dot")].forEach(el => el.remove());
  [...pitchAway.querySelectorAll(".player-dot")].forEach(el => el.remove());
  benchHome.innerHTML = "";
  benchAway.innerHTML = "";

  // Home
  (homePlayers.as || []).forEach(p => {
    const coord = positionCoords[p.pos];
    if (!coord) return;
    const el = document.createElement("div");
    el.className = "player-dot";
    el.style.left = coord.x + "%";
    el.style.top  = coord.y + "%";
    const nameUpper = (p.name || "").toUpperCase();
    const noSpan = p.no
      ? `<span class="pd-no"><span class="shirt-icon">🎽</span>${p.no}</span>`
      : "";
    el.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      ${noSpan}
      <span class="pd-name">${nameUpper}</span>
    `;
    pitchHome.appendChild(el);
  });
  if (!homePlayers.yedek || homePlayers.yedek.length === 0) {
    benchHome.textContent = "Yedek oyuncu girilmemiş.";
  } else {
    homePlayers.yedek.forEach(p => {
      const prefix = p.no ? `${p.no} | ` : "";
      const nameUpper = (p.name || "").toUpperCase();
      const div = document.createElement("div");
      div.textContent = `${prefix}${p.pos} - ${nameUpper}`;
      benchHome.appendChild(div);
    });
  }

  // Away
  (awayPlayers.as || []).forEach(p => {
    const coord = positionCoords[p.pos];
    if (!coord) return;
    const el = document.createElement("div");
    el.className = "player-dot";
    el.style.left = coord.x + "%";
    el.style.top  = coord.y + "%";
    const nameUpper = (p.name || "").toUpperCase();
    const noSpan = p.no
      ? `<span class="pd-no"><span class="shirt-icon">🎽</span>${p.no}</span>`
      : "";
    el.innerHTML = `
      <span class="pd-pos">${p.pos}</span>
      ${noSpan}
      <span class="pd-name">${nameUpper}</span>
    `;
    pitchAway.appendChild(el);
  });
  if (!awayPlayers.yedek || awayPlayers.yedek.length === 0) {
    benchAway.textContent = "Yedek oyuncu girilmemiş.";
  } else {
    awayPlayers.yedek.forEach(p => {
      const prefix = p.no ? `${p.no} | ` : "";
      const nameUpper = (p.name || "").toUpperCase();
      const div = document.createElement("div");
      div.textContent = `${prefix}${p.pos} - ${nameUpper}`;
      benchAway.appendChild(div);
    });
  }

  // Olay alanı + skor + insta tasarım
  eventsHomeTitle.textContent = `${match.home_team} Olaylar`;
  eventsAwayTitle.textContent = `${match.away_team} Olaylar`;

  fillPlayerSelect(eventHomePlayer, homePlayers);
  fillPlayerSelect(eventAwayPlayer, awayPlayers);

  await fetchEvents(match.id);
  renderEventsLog("home", match.id, homePlayers, eventsHomeLog);
  renderEventsLog("away", match.id, awayPlayers, eventsAwayLog);
  updateScoreboard(match.id);
  renderInstagramCard();

  setActiveTab("lineups");
  showScreen("lineups-detail");
}

function fillPlayerSelect(selectEl, lineup) {
  selectEl.innerHTML = '<option value="">Oyuncu seç</option>';
  (lineup.as || []).forEach((p, idx) => {
    const nameUpper = (p.name || "").toUpperCase();
    const noText = p.no ? `${p.no} | ` : "";
    const opt = document.createElement("option");
    opt.value = `as-${idx}`;
    opt.textContent = `${noText}${nameUpper} (${p.pos})`;
    selectEl.appendChild(opt);
  });
  (lineup.yedek || []).forEach((p, idx) => {
    const nameUpper = (p.name || "").toUpperCase();
    const noText = p.no ? `${p.no} | ` : "";
    const opt = document.createElement("option");
    opt.value = `yedek-${idx}`;
    opt.textContent = `[Yedek] ${noText}${nameUpper} (${p.pos})`;
    selectEl.appendChild(opt);
  });
}

function renderEventsLog(side, matchId, lineup, container) {
  const cache = eventsCache[matchId] || { home: [], away: [] };
  const list = side === "home" ? cache.home : cache.away;

  container.innerHTML = "";
  if (!list.length) {
    container.textContent = "Henüz olay eklenmemiş.";
    updateScoreboard(matchId);
    return;
  }

  list.forEach((ev, idx) => {
    const srcArr = ev.group === "as" ? lineup.as : lineup.yedek;
    const player = srcArr?.[ev.index];
    if (!player) return;

    const nameUpper = (player.name || "").toUpperCase();
    const noText = player.no ? `${player.no} | ` : "";
    let typeText = "";
    if (ev.type === "goal") typeText = "GOL";
    if (ev.type === "yellow") typeText = "SARI KART";
    if (ev.type === "red") typeText = "KIRMIZI KART";

    const row = document.createElement("div");
    row.className = "event-row";

    const textDiv = document.createElement("div");
    textDiv.className = "event-text";
    textDiv.textContent = `${noText}${nameUpper} - ${typeText}`;

    const delBtn = document.createElement("button");
    delBtn.className = "event-delete-btn";
    delBtn.textContent = "×";
    delBtn.addEventListener("click", async () => {
      await deleteEventFromServer(matchId, side, idx);
      renderEventsLog(side, matchId, lineup, container);
      updateScoreboard(matchId);
    });

    row.appendChild(textDiv);
    row.appendChild(delBtn);
    container.appendChild(row);
  });

  updateScoreboard(matchId);
}

async function addEvent(side, type) {
  if (!currentDetailMatch) return;
  const matchId = currentDetailMatch.id;
  const isHome = side === "home";
  const selectEl = isHome ? eventHomePlayer : eventAwayPlayer;
  const lineup   = isHome ? currentDetailHomeLineup : currentDetailAwayLineup;
  const logEl    = isHome ? eventsHomeLog : eventsAwayLog;

  const val = selectEl.value;
  if (!val) {
    alert("Lütfen önce oyuncu seç.");
    return;
  }
  const [group, idxStr] = val.split("-");
  const idx = Number(idxStr);

  await addEventToServer(matchId, side, type, group, idx);
  renderEventsLog(side, matchId, lineup, logEl);
  updateScoreboard(matchId);
}


// ------------------ INSTAGRAM GÖRSELİ ------------------

function renderInstagramCard() {
  if (!currentDetailMatch || !instaFrame) return;

  const match = currentDetailMatch;
  const [year, month, day] = match.date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dd = String(day).padStart(2, "0");
  const MM = String(month).padStart(2, "0");
  const gun = getTurkishDayName(d.getDay()).toUpperCase();

  const cache = eventsCache[match.id] || { home: [], away: [] };
  const homeGoals = cache.home.filter(ev => ev.type === "goal").length;
  const awayGoals = cache.away.filter(ev => ev.type === "goal").length;

  const dateTop = `${dd}.${MM}.${year}`;
  const homeName = match.home_team.toUpperCase();
  const awayName = match.away_team.toUpperCase();
  const fieldUpper = (match.field || "").toUpperCase();
// Fotoğraf yükleme
const instaPhotoInput = document.getElementById("instaPhotoInput");
const instaPhoto      = document.getElementById("instaPhoto");

instaPhotoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    instaPhoto.src = reader.result;
    instaPhoto.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Instagram kartını dolduran fonksiyon
function renderInstagramCard() {
  if (!currentDetailMatch) return;

  const match = currentDetailMatch;

  document.getElementById("instaHomeName").textContent = match.home_team.toUpperCase();
  document.getElementById("instaAwayName").textContent = match.away_team.toUpperCase();

  const cache = eventsCache[match.id] || { home: [], away: [] };
  const homeGoals = cache.home.filter(ev => ev.type === "goal").length;
  const awayGoals = cache.away.filter(ev => ev.type === "goal").length;
  document.getElementById("instaScore").textContent = `${homeGoals} - ${awayGoals}`;

  // Olaylar
  const homeEl = document.getElementById("instaHomeEvents");
  const awayEl = document.getElementById("instaAwayEvents");
  homeEl.innerHTML = "";
  awayEl.innerHTML = "";

  function renderSide(list, target, lineup) {
    list.forEach(ev => {
      const p = ev.group === "as" ? lineup.as[ev.index] : lineup.yedek[ev.index];
      if (!p) return;

      const name = p.name.toUpperCase();
      let icon = "⚽";
      if (ev.type === "yellow") icon = "🟨";
      if (ev.type === "red") icon = "🟥";

      const div = document.createElement("div");
      div.textContent = `${icon} ${name}`;
      target.appendChild(div);
    });
  }

  renderSide(cache.home, homeEl, currentDetailHomeLineup);
  renderSide(cache.away, awayEl, currentDetailAwayLineup);

  // Tarih + saha + saat
  const [year, month, day] = match.date.split("-").map(Number);
  const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const d = new Date(year, month - 1, day);
  const tarih = `${day}.${month}.${year} • ${gunler[d.getDay()].toUpperCase()}`;
  document.getElementById("instaBottomInfo").textContent =
    `${tarih} • ${match.field.toUpperCase()} • ${match.time}`;
}

// Instagram ekranına geçiş butonu
btnOpenInstagram.addEventListener("click", () => {
  renderInstagramCard();
  showScreen("instagram");
});

// JPEG çıktı indir
btnInstaDownload.addEventListener("click", async () => {
  const canvas = await html2canvas(instaFrame, { scale: 2 });
  const link = document.createElement("a");
  link.download = "mac-sonucu.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.75); // MB düşürülmüş JPEG
  link.click();
});

  instaFrame.innerHTML = `
    <div class="insta-top">
      <div class="insta-league">ELİT LİG</div>
      <div class="insta-date">${dateTop} · ${gun}</div>
    </div>
    <div class="insta-middle">
      <div class="insta-team insta-team-home">
        <div class="insta-team-label">EV SAHİBİ</div>
        <div class="insta-team-name">${homeName}</div>
      </div>
      <div class="insta-score-block">
        <div class="insta-score">${homeGoals} - ${awayGoals}</div>
        <div class="insta-vs">MAÇ SONU</div>
      </div>
      <div class="insta-team insta-team-away">
        <div class="insta-team-label">DEPLASMAN</div>
        <div class="insta-team-name">${awayName}</div>
      </div>
    </div>
    <div class="insta-bottom">
      <div class="insta-field">${fieldUpper}</div>
      <div class="insta-time">${match.time}</div>
    </div>
  `;
}


// ------------------ MAÇ GİRİŞİ (ADMIN) ------------------

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
  if (!matches.length) {
    matchListAdmin.textContent = "Hiç maç yok.";
    return;
  }
  matchListAdmin.innerHTML = "";

  const sorted = [...matches].sort((a, b) => {
    const sa = getMatchStartTime(a) || 0;
    const sb = getMatchStartTime(b) || 0;
    return sb - sa || (b.id || 0) - (a.id || 0);
  });

  for (const m of sorted) {
    const row = document.createElement("div");
    row.style.marginBottom = "4px";

    const textSpan = document.createElement("span");
    const dateDisplay = formatMatchDateDisplay(m);
    textSpan.textContent = `#${m.id} - ${m.home_team} vs ${m.away_team} • ${dateDisplay} • ${m.time} • ${m.field}`;

    const btnDetail = document.createElement("button");
    btnDetail.className = "btn-small";
    btnDetail.textContent = "Detay";
    btnDetail.addEventListener("click", async () => {
      const lineups = await fetchLineups(m.id);
      if (!lineups.home || !lineups.away) {
        alert("Bu maç için henüz her iki takım kadrosu girilmemiş.");
        return;
      }
      renderTwoPitches(m, lineups.home.players, lineups.away.players);
    });

    const btnEditMatch = document.createElement("button");
    btnEditMatch.className = "btn-small";
    btnEditMatch.textContent = "Güncelle";
    btnEditMatch.addEventListener("click", () => {
      const start = getMatchStartTime(m);
      if (start) {
        const d = new Date(start);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        matchDateInput.value = `${yyyy}-${mm}-${dd}`;
      } else {
        matchDateInput.value = "";
      }
      matchTimeInput.value = m.time || "";
      matchHomeInput.value = m.home_team || "";
      matchAwayInput.value = m.away_team || "";
      matchFieldInput.value = m.field || "";

      editingMatch = m;
      btnAddMatch.textContent = "Maçı Güncelle";

      setActiveTab("match-admin");
      showScreen("match-admin");
    });

    row.appendChild(textSpan);
    row.appendChild(btnDetail);
    row.appendChild(btnEditMatch);
    matchListAdmin.appendChild(row);
  }
}


// ------------------ EVENT LISTENERS ------------------

tabHome.addEventListener("click", async () => {
  setActiveTab("home");
  showScreen("home");
  await fetchMatches();
  renderMatches();
});

tabLineups.addEventListener("click", async () => {
  setActiveTab("lineups");
  await renderLineupsList();
  showScreen("lineups-list");
});

tabMatchAdmin.addEventListener("click", () => {
  setActiveTab("match-admin");
  renderMatchAdminView();
  showScreen("match-admin");
});

backToHome.addEventListener("click", () => {
  setActiveTab("home");
  showScreen("home");
});

saveLineup.addEventListener("click", async () => {
  const lineup = getLineupFromForm();
  if (!lineup) return;

  await saveLineupToServer(currentMatch.id, currentTeamSide, currentTeamName, lineup);
  renderSinglePitch(lineup);
});

btnEdit.addEventListener("click", async () => {
  await openLineupScreen();
});

btnExit.addEventListener("click", () => {
  setActiveTab("home");
  showScreen("home");
});

backToLineups.addEventListener("click", async () => {
  setActiveTab("lineups");
  await renderLineupsList();
  showScreen("lineups-list");
});

// Gol / kart butonları
btnHomeGoal.addEventListener("click", () => addEvent("home", "goal"));
btnHomeYellow.addEventListener("click", () => addEvent("home", "yellow"));
btnHomeRed.addEventListener("click", () => addEvent("home", "red"));
btnAwayGoal.addEventListener("click", () => addEvent("away", "goal"));
btnAwayYellow.addEventListener("click", () => addEvent("away", "yellow"));
btnAwayRed.addEventListener("click", () => addEvent("away", "red"));

// Admin login
btnMatchLogin.addEventListener("click", () => {
  const u = matchAdminUser.value.trim();
  const p = matchAdminPass.value.trim();
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    isMatchAdmin = true;
    renderMatchAdminView();
  } else {
    alert("Kullanıcı adı veya şifre hatalı.");
  }
});

// Maç ekle / güncelle
btnAddMatch.addEventListener("click", async () => {
  const dateVal = matchDateInput.value.trim();
  const timeVal = matchTimeInput.value.trim();
  const home = matchHomeInput.value.trim();
  const away = matchAwayInput.value.trim();
  const field = matchFieldInput.value.trim() || "Elit Lig Arena";

  if (!dateVal || !timeVal || !home || !away) {
    alert("Tarih, saat, ev sahibi ve deplasman zorunlu.");
    return;
  }

  if (editingMatch) {
    // update
    await fetch(`/api/matches/${editingMatch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        home_team: home,
        away_team: away,
        date: dateVal,
        time: timeVal,
        field
      })
    });
    alert("Maç güncellendi.");
    editingMatch = null;
    btnAddMatch.textContent = "Maçı Ekle";
  } else {
    // new
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
    alert("Maç eklendi.");
  }

  matchHomeInput.value = "";
  matchAwayInput.value = "";
  matchDateInput.value = "";
  matchTimeInput.value = "";
  matchFieldInput.value = "";

  await fetchMatches();
  renderMatches();
  renderMatchAdminList();
});

// Instagram butonları
btnOpenInstagram.addEventListener("click", () => {
  if (!currentDetailMatch) {
    alert("Önce bir maç detayı açmalısın.");
    return;
  }
  renderInstagramCard();
  showScreen("instagram");
});

btnInstaBack.addEventListener("click", () => {
  showScreen("lineups-detail");
});

btnInstaDownload.addEventListener("click", async () => {
  if (!window.html2canvas) {
    alert("Görsel alma kütüphanesi yüklenemedi.");
    return;
  }
  if (!instaFrame) return;
  const canvas = await window.html2canvas(instaFrame, { scale: 2 });
  const link = document.createElement("a");
  const id = currentDetailMatch ? currentDetailMatch.id : "mac";
  link.download = `elitlig-mac-${id}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// Başlangıç
(async () => {
  await fetchMatches();
  renderMatches();
  // Her dakika ana sayfa güncellensin
  setInterval(async () => {
    await fetchMatches();
    renderMatches();
  }, 60 * 1000);
})();
