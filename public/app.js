/* ---------------------------------------------------
    BÖLÜM 1 — GLOBAL STATE + DOM + POZİSYONLAR
----------------------------------------------------*/

// GLOBAL STATE
let matches = [];
const lineupsCache = {};
const eventsCache = {};

let currentMatch = null;
let currentTeamSide = null;
let currentTeamName = null;

let currentDetailMatch = null;
let currentDetailHomeLineup = null;
let currentDetailAwayLineup = null;

let isMatchAdmin = false;
let editingMatch = null;

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// DOM ELEMENTLERİ
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

const matchesContainer = document.getElementById("matchesContainer");

const playersForm      = document.getElementById("playersForm");
const lineupMatchTitle = document.getElementById("lineupMatchTitle");
const lineupMatchSub   = document.getElementById("lineupMatchSub");

const pitchMatchTitle  = document.getElementById("pitchMatchTitle");
const pitchMatchSub    = document.getElementById("pitchMatchSub");

const saveLineup = document.getElementById("saveLineup");
const btnEdit    = document.getElementById("btnEdit");
const btnExit    = document.getElementById("btnExit");

const lineupsList   = document.getElementById("lineupsList");
const backToLineups = document.getElementById("backToLineups");

const pitchSingle     = document.getElementById("pitchSingle");
const benchListSingle = document.getElementById("benchListSingle");

const detailMatchTitle = document.getElementById("detailMatchTitle");
const detailMatchSub   = document.getElementById("detailMatchSub");
const detailHomeTitle  = document.getElementById("detailHomeTitle");
const detailAwayTitle  = document.getElementById("detailAwayTitle");

const pitchHome = document.getElementById("pitchHome");
const pitchAway = document.getElementById("pitchAway");
const benchHome = document.getElementById("benchHome");
const benchAway = document.getElementById("benchAway");

// SKORBOARD
const scoreHomeName  = document.getElementById("scoreHomeName");
const scoreAwayName  = document.getElementById("scoreAwayName");
const scoreHomeValue = document.getElementById("scoreHomeValue");
const scoreAwayValue = document.getElementById("scoreAwayValue");

// EVENTS
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

// INSTAGRAM
const btnOpenInstagram = document.getElementById("btnOpenInstagram");
const btnInstaBack     = document.getElementById("btnInstaBack");
const btnInstaDownload = document.getElementById("btnInstaDownload");
const instaFrame       = document.getElementById("instaFrame");

// MATCH ADMIN
const matchAdminLoginCard = document.getElementById("matchAdminLoginCard");
const matchAdminPanelCard = document.getElementById("matchAdminPanelCard");
const matchAdminUser      = document.getElementById("matchAdminUser");
const matchAdminPass      = document.getElementById("matchAdminPass");

const matchDateInput  = document.getElementById("matchDate");
const matchTimeInput  = document.getElementById("matchTime");
const matchHomeInput  = document.getElementById("matchHome");
const matchAwayInput  = document.getElementById("matchAway");
const matchFieldInput = document.getElementById("matchField");

const btnAddMatch    = document.getElementById("btnAddMatch");
const matchListAdmin = document.getElementById("matchListAdmin");

/* ---------------------------------------------------
    POZİSYON HARİTALARI (HATASIZ SÜRÜM)
----------------------------------------------------*/
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
/* ---------------------------------------------------
    BÖLÜM 2 — UTILS + API FONKSİYONLARI
----------------------------------------------------*/

// EKRAN DEĞİŞTİR
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

  document.getElementById(`screen-${name}`)?.classList.add("active");
}

// TARİH FORMATLAYICI
function formatMatchDateDisplay(match) {
  if (!match.date) return "";

  const [y, m, d] = match.date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);

  const dd = String(d).padStart(2, "0");
  const MM = String(m).padStart(2, "0");

  const gunler = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi"
  ];

  return `${dd}.${MM}.${y} ${gunler[dt.getDay()]}`;
}

/* ---------------------------------------------------
    API: MAÇLARI GETİR
----------------------------------------------------*/
async function fetchMatches() {
  try {
    const res = await fetch("/api/matches");
    if (!res.ok) throw new Error("Maç listesi çekilemedi");
    matches = await res.json();
  } catch (err) {
    console.error("fetchMatches ERROR:", err);
    matches = [];
  }
}

/* ---------------------------------------------------
    API: KADROLARI GETİR
----------------------------------------------------*/
async function fetchLineups(matchId) {
  try {
    const res = await fetch(`/api/matches/${matchId}/lineups`);
    if (!res.ok) throw new Error("Lineup JSON okunamadı");

    const raw = await res.json();

    // Supabase → Frontend convert
    const formatted = {
      home: raw.find?.(x => x.team_side === "home") || null,
      away: raw.find?.(x => x.team_side === "away") || null
    };

    if (formatted.home && formatted.home.players_json) {
      formatted.home.players = JSON.parse(formatted.home.players_json);
    }
    if (formatted.away && formatted.away.players_json) {
      formatted.away.players = JSON.parse(formatted.away.players_json);
    }

    lineupsCache[matchId] = formatted;
    return formatted;
  } catch (err) {
    console.error("fetchLineups ERROR:", err);
    return { home: null, away: null };
  }
}

/* ---------------------------------------------------
    API: KADRO KAYDET
----------------------------------------------------*/
async function saveLineupToServer(matchId, side, teamName, players) {
  try {
    const res = await fetch("/api/lineups", {
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
    console.error("saveLineupToServer ERROR:", err);
    return null;
  }
}

/* ---------------------------------------------------
    API: MAÇ OLAYI EKLE
----------------------------------------------------*/
async function addEventToServer(matchId, side, type, group, index) {
  try {
    const res = await fetch("/api/events", {
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
  } catch (err) {
    console.error("addEvent ERROR:", err);
  }
}

/* ---------------------------------------------------
    API: MAÇ OLAYLARINI GETİR
----------------------------------------------------*/
async function fetchEvents(matchId) {
  try {
    const res = await fetch(`/api/events/${matchId}`);
    if (!res.ok) return [];

    const data = await res.json();

    const grouped = {
      home: data.filter(e => e.team_side === "home"),
      away: data.filter(e => e.team_side === "away")
    };

    eventsCache[matchId] = grouped;
    return grouped;
  } catch (err) {
    console.error("fetchEvents ERROR:", err);
    return { home: [], away: [] };
  }
}
/* ---------------------------------------------------
    BÖLÜM 3 — MAÇ LİSTESİ & KADRO GİRİŞİ & SAHA DİZİLİŞ
----------------------------------------------------*/

/* -----------------------------------------------
    ANA SAYFADA MAÇLARI LİSTELE
------------------------------------------------*/
function renderMatches() {
  matchesContainer.innerHTML = "";

  if (!matches || matches.length === 0) {
    matchesContainer.textContent = "Hiç maç bulunamadı.";
    return;
  }

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "match-card";

    div.innerHTML = `
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

    matchesContainer.appendChild(div);
  });

  // Buton clickleri
  matchesContainer.querySelectorAll(".btn-team").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const side = btn.dataset.side;

      currentMatch = matches.find(m => m.id === id);
      currentTeamSide = side;
      currentTeamName = side === "home" ? currentMatch.home_team : currentMatch.away_team;

      openLineupScreen();
    };
  });
}

/* ---------------------------------------------------
    KADRO GİRİŞİ EKRANINI AÇ
----------------------------------------------------*/
async function openLineupScreen() {
  const matchId = currentMatch.id;
  const lineups = await fetchLineups(matchId);

  const existing =
    currentTeamSide === "home"
      ? lineups.home?.players
      : lineups.away?.players;

  playersForm.innerHTML = "";

  // 12 oyuncu alanı oluştur
  for (let i = 0; i < 12; i++) {
    const isAs = i < 7;

    let name = "";
    let pos = "";
    let no = "";

    if (existing) {
      const src = isAs ? existing.as?.[i] : existing.yedek?.[i - 7];
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
        <input class="p-name" value="${name}" placeholder="Oyuncu adı">
        <input class="p-no" value="${no}" placeholder="No">
      </div>

      <label>Mevki</label>
      <select class="p-pos">
        <option value="">Mevki seç</option>
        ${positions
          .map(
            p => `<option value="${p.code}" ${p.code === pos ? "selected" : ""}>
                    ${p.code} - ${p.name}
                  </option>`
          )
          .join("")}
      </select>
    `;

    playersForm.appendChild(row);
  }

  lineupMatchTitle.textContent = `${currentMatch.home_team} vs ${currentMatch.away_team}`;
  lineupMatchSub.textContent = `${currentTeamName} kadro girişi`;

  showScreen("lineup");
}

/* ---------------------------------------------------
    FORM → KADRO VERİSİ AL
----------------------------------------------------*/
function getLineupFromForm() {
  const rows = playersForm.querySelectorAll(".player-row");

  const as = [];
  const yedek = [];
  let hasError = false;

  rows.forEach((row, idx) => {
    const name = row.querySelector(".p-name").value.trim();
    const no = row.querySelector(".p-no").value.trim();
    const pos = row.querySelector(".p-pos").value;
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
    alert("Lütfen kırmızı işaretli alanları düzeltin. En az 7 As oyuncu zorunludur.");
    return null;
  }

  return { as, yedek };
}

/* ---------------------------------------------------
    TEK TAKIM SAHA DİZİLİŞİ
----------------------------------------------------*/
function renderSinglePitch(lineup) {
  [...pitchSingle.querySelectorAll(".player-dot")].forEach(el => el.remove());
  benchListSingle.innerHTML = "";

  pitchMatchTitle.textContent =
    `${currentMatch.home_team} vs ${currentMatch.away_team}`;

  pitchMatchSub.textContent =
    `${currentTeamName} — Sahaya diziliş`;

  // AS oyuncular sahaya dizilir
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

  // Yedekler yazdırılır
  if (!lineup.yedek.length) {
    benchListSingle.textContent = "Yedek oyuncu girilmemiş.";
  } else {
    lineup.yedek.forEach(p => {
      benchListSingle.innerHTML += `
        <div>${p.no ? p.no + " | " : ""}${p.pos} - ${p.name.toUpperCase()}</div>
      `;
    });
  }

  showScreen("pitch");
}

/* ---------------------------------------------------
    SAHAYA DİZ BUTONU
----------------------------------------------------*/
saveLineup.onclick = async () => {
  const lineup = getLineupFromForm();
  if (!lineup) return;

  await saveLineupToServer(currentMatch.id, currentTeamSide, currentTeamName, lineup);

  renderSinglePitch(lineup);
};

btnEdit.onclick = () => openLineupScreen();
btnExit.onclick = () => showScreen("home");
/* ---------------------------------------------------
    BÖLÜM 4 — KADROLAR SEKMESİ + MAÇ DETAYI + OLAY GİRİŞİ
----------------------------------------------------*/

/* ---------------------------------------------------
    KADROLAR SAYFASINI LİSTELE
----------------------------------------------------*/
async function renderLineupsList() {
  lineupsList.innerHTML = "";

  for (const match of matches) {
    const lu = await fetchLineups(match.id);

    const hasHome = lu.home && lu.home.players;
    const hasAway = lu.away && lu.away.players;

    // Her iki takım da kadro girmişse listeye eklenir
    if (!hasHome || !hasAway) continue;

    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-header">
        <span>${match.home_team} vs ${match.away_team}</span>
        <span>${match.time}</span>
      </div>
      <div class="match-meta">${formatMatchDateDisplay(match)} • ${match.field}</div>

      <button class="btn-primary open-detail" data-id="${match.id}">
        Maçı Aç (İki Kadro)
      </button>
    `;

    lineupsList.appendChild(card);
  }

  // Click eventleri bağlanıyor
  lineupsList.querySelectorAll(".open-detail").forEach(btn => {
    btn.onclick = () => openMatchDetail(btn.dataset.id);
  });
}

/* ---------------------------------------------------
    MAÇ DETAYINI AÇ (İKİ SAHA + OLAYLAR)
----------------------------------------------------*/
async function openMatchDetail(matchId) {
  const match = matches.find(m => m.id == matchId);
  currentDetailMatch = match;

  const lu = await fetchLineups(matchId);
  currentDetailHomeLineup = lu.home.players;
  currentDetailAwayLineup = lu.away.players;

  detailMatchTitle.textContent = `${match.home_team} vs ${match.away_team}`;
  detailMatchSub.textContent = `${formatMatchDateDisplay(match)} • ${match.time} • ${match.field}`;

  detailHomeTitle.textContent = match.home_team;
  detailAwayTitle.textContent = match.away_team;

  renderPitchSide(pitchHome, benchHome, currentDetailHomeLineup);
  renderPitchSide(pitchAway, benchAway, currentDetailAwayLineup);

  await loadEvents(matchId);
  showScreen("lineups-detail");
}

/* ---------------------------------------------------
    SAHAYI ÇİZEN FONKSİYON (ORTAK)
----------------------------------------------------*/
function renderPitchSide(pitchEl, benchEl, lineup) {
  [...pitchEl.querySelectorAll(".player-dot")].forEach(e => e.remove());
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

  if (!lineup.yedek || lineup.yedek.length === 0) {
    benchEl.textContent = "Yedek bulunmuyor.";
  } else {
    lineup.yedek.forEach(p => {
      benchEl.innerHTML += `
        <div>${p.no ? p.no + " | " : ""}${p.pos} - ${p.name.toUpperCase()}</div>
      `;
    });
  }
}

/* ---------------------------------------------------
    OLAYLARI YÜKLE
----------------------------------------------------*/
async function loadEvents(matchId) {
  const res = await fetch(`/api/events/${matchId}`);
  const events = await res.json();

  eventsCache[matchId] = {
    home: events.filter(e => e.team_side === "home"),
    away: events.filter(e => e.team_side === "away")
  };

  renderEvents("home");
  renderEvents("away");
  updateScoreboard(matchId);
}

/* ---------------------------------------------------
    OLAY LOGUNU RENDER ET
----------------------------------------------------*/
function renderEvents(side) {
  const matchId = currentDetailMatch.id;
  const cache = eventsCache[matchId];
  const list = cache[side];

  const lineup =
    side === "home" ? currentDetailHomeLineup : currentDetailAwayLineup;

  const container =
    side === "home" ? eventsHomeLog : eventsAwayLog;

  container.innerHTML = "";

  if (!list.length) {
    container.textContent = "Olay yok.";
    return;
  }

  list.forEach((ev, idx) => {
    const targetArr = ev.player_group === "as" ? lineup.as : lineup.yedek;
    const player = targetArr[ev.player_index];

    if (!player) return;

    const row = document.createElement("div");
    row.className = "event-row";

    row.innerHTML = `
      <div class="event-text">
        ${player.no ? player.no + " | " : ""}${player.name.toUpperCase()} - ${
          ev.event_type === "goal" ? "GOL" :
          ev.event_type === "yellow" ? "SARI KART" :
          ev.event_type === "red" ? "KIRMIZI KART" : ""
        }
      </div>
      <button class="event-delete-btn" data-idx="${idx}" data-side="${side}">
        ×
      </button>
    `;

    container.appendChild(row);
  });

  // Silme butonu
  container.querySelectorAll(".event-delete-btn").forEach(btn => {
    btn.onclick = () => deleteEvent(side, Number(btn.dataset.idx));
  });
}

/* ---------------------------------------------------
    OLAY SİL
----------------------------------------------------*/
async function deleteEvent(side, index) {
  const matchId = currentDetailMatch.id;
  const events = eventsCache[matchId][side];
  const ev = events[index];

  await fetch(`/api/events/${ev.id}`, { method: "DELETE" });

  events.splice(index, 1);
  renderEvents(side);
  updateScoreboard(matchId);
}

/* ---------------------------------------------------
    OLAY EKLEME
----------------------------------------------------*/
async function addEvent(side, type) {
  const matchId = currentDetailMatch.id;
  const lineup =
    side === "home" ? currentDetailHomeLineup : currentDetailAwayLineup;

  const select =
    side === "home" ? eventHomePlayer : eventAwayPlayer;

  const value = select.value;

  if (!value) {
    alert("Lütfen oyuncu seç.");
    return;
  }

  const [group, idx] = value.split("-");

  const res = await fetch(`/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      team_side: side,
      event_type: type,
      player_group: group,
      player_index: Number(idx)
    })
  });

  await loadEvents(matchId);
}

/* ---------------------------------------------------
    AÇILABİLİR OYUNCU LİSTESİ (SELECT)
----------------------------------------------------*/
function fillPlayerSelect(selectEl, lineup) {
  selectEl.innerHTML = '<option value="">Oyuncu seç</option>';

  lineup.as.forEach((p, idx) => {
    selectEl.innerHTML += `
      <option value="as-${idx}">
        ${p.no ? p.no + " | " : ""}${p.name.toUpperCase()} (${p.pos})
      </option>
    `;
  });

  lineup.yedek.forEach((p, idx) => {
    selectEl.innerHTML += `
      <option value="yedek-${idx}">
        [Yedek] ${p.no ? p.no + " | " : ""}${p.name.toUpperCase()} (${p.pos})
      </option>
    `;
  });
}

/* ---------------------------------------------------
    SKORBOARD GÜNCELLE
----------------------------------------------------*/
function updateScoreboard(matchId) {
  const ev = eventsCache[matchId];

  const homeScore = ev.home.filter(e => e.event_type === "goal").length;
  const awayScore = ev.away.filter(e => e.event_type === "goal").length;

  scoreHomeName.textContent = currentDetailMatch.home_team;
  scoreAwayName.textContent = currentDetailMatch.away_team;

  scoreHomeValue.textContent = homeScore;
  scoreAwayValue.textContent = awayScore;
}

/* ---------------------------------------------------
    GOL / KART BUTONLARI BAĞLAMA
----------------------------------------------------*/
btnHomeGoal.onclick   = () => addEvent("home", "goal");
btnHomeYellow.onclick = () => addEvent("home", "yellow");
btnHomeRed.onclick    = () => addEvent("home", "red");

btnAwayGoal.onclick   = () => addEvent("away", "goal");
btnAwayYellow.onclick = () => addEvent("away", "yellow");
btnAwayRed.onclick    = () => addEvent("away", "red");

/* ---------------------------------------------------
    GERİ DÖNME BUTONLARI
----------------------------------------------------*/
backToLineups.onclick = () => {
  showScreen("lineups-list");
};
/* ---------------------------------------------------
    BÖLÜM 5 — INSTAGRAM MAÇ GÖRSELİ
----------------------------------------------------*/

// Fotoğraf input
const instaPhotoInput = document.getElementById("instaPhotoInput");
const instaPhoto      = document.getElementById("instaPhoto");

// Foto seçince ekrana ekle
instaPhotoInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    instaPhoto.src = reader.result;
    instaPhoto.style.display = "block";
  };
  reader.readAsDataURL(file);
};

/* ---------------------------------------------------
    INSTAGRAM KARTINI OLUŞTUR
----------------------------------------------------*/
function renderInstagramCard() {
  if (!currentDetailMatch) return;

  const match = currentDetailMatch;

  // Tarih formatı
  const [y, m, d] = match.date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const tarihYazi = `${d}.${m}.${y} • ${gunler[dateObj.getDay()].toUpperCase()}`;

  // Skor
  const ev = eventsCache[match.id] || { home: [], away: [] };
  const homeScore = ev.home.filter(e => e.event_type === "goal").length;
  const awayScore = ev.away.filter(e => e.event_type === "goal").length;

  document.getElementById("instaHomeName").textContent = match.home_team.toUpperCase();
  document.getElementById("instaAwayName").textContent = match.away_team.toUpperCase();
  document.getElementById("instaScore").textContent = `${homeScore} - ${awayScore}`;
  document.getElementById("instaBottomInfo").textContent =
    `${tarihYazi} • ${match.field.toUpperCase()} • ${match.time}`;

  // Olayları yazdır
  const homeEventsBox = document.getElementById("instaHomeEvents");
  const awayEventsBox = document.getElementById("instaAwayEvents");

  homeEventsBox.innerHTML = "";
  awayEventsBox.innerHTML = "";

  function addEventRows(list, sideBox, lineup) {
    list.forEach(ev => {
      const player =
        ev.player_group === "as"
          ? lineup.as[ev.player_index]
          : lineup.yedek[ev.player_index];

      if (!player) return;

      let icon = "⚽";
      if (ev.event_type === "yellow") icon = "🟨";
      if (ev.event_type === "red") icon = "🟥";

      const div = document.createElement("div");
      div.textContent = `${icon} ${player.name.toUpperCase()}`;
      sideBox.appendChild(div);
    });
  }

  addEventRows(ev.home, homeEventsBox, currentDetailHomeLineup);
  addEventRows(ev.away, awayEventsBox, currentDetailAwayLineup);
}

/* ---------------------------------------------------
    INSTAGRAM EKRANINA GEÇ
----------------------------------------------------*/
btnOpenInstagram.onclick = () => {
  renderInstagramCard();
  showScreen("instagram");
};

/* ---------------------------------------------------
    INSTAGRAM GÖRSELİNİ JPG OLARAK İNDİR
----------------------------------------------------*/
btnInstaDownload.onclick = async () => {
  if (!window.html2canvas) {
    alert("html2canvas yüklenemedi.");
    return;
  }

  const canvas = await window.html2canvas(instaFrame, {
    scale: 2,
    allowTaint: true,
    useCORS: true
  });

  const link = document.createElement("a");
  link.download = `elitlig-mac-${currentDetailMatch.id}.jpg`;
  link.href = canvas.toDataURL("image/jpeg", 0.9);
  link.click();
};

/* ---------------------------------------------------
    INSTAGRAM SAYFASINDAN GERİ DÖN
----------------------------------------------------*/
btnInstaBack.onclick = () => {
  showScreen("lineups-detail");
};
