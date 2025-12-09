/* ---------------------------------------------------
   TEMEL AYARLAR
--------------------------------------------------- */
const API = ""; // aynı origin kullanıyoruz (Render'da zorunlu)

/* EKRAN GEÇİŞLERİ */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  if (id === "screen-home") tabHome.classList.add("active");
  if (id === "screen-lineups-list") tabLineups.classList.add("active");
  if (id === "screen-match-admin") tabMatchAdmin.classList.add("active");
}

/* ---------------------------------------------------
   ELEMENTLER
--------------------------------------------------- */
const tabHome = document.getElementById("tabHome");
const tabLineups = document.getElementById("tabLineups");
const tabMatchAdmin = document.getElementById("tabMatchAdmin");

/* NAV TIKLAMALARI */
tabHome.onclick = () => showScreen("screen-home");
tabLineups.onclick = () => {
  loadLineupsList();
  showScreen("screen-lineups-list");
};
tabMatchAdmin.onclick = () => showScreen("screen-match-admin");

/* ---------------------------------------------------
   ANA SAYFA – MAÇLARI ÇEK
--------------------------------------------------- */
async function loadMatches() {
  const res = await fetch(`/matches`);
  const matches = await res.json();

  const container = document.getElementById("matchesContainer");
  container.innerHTML = "";

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
      <div class="match-header">${match.home_team} - ${match.away_team}</div>
      <div class="match-meta">${match.date} • ${match.time} • ${match.field}</div>
      <div class="team-buttons">
        <button class="btn-team" onclick="openLineup(${match.id}, 'home', '${match.home_team}', '${match.date}', '${match.time}')">
          ${match.home_team}
        </button>
        <button class="btn-team" onclick="openLineup(${match.id}, 'away', '${match.away_team}', '${match.date}', '${match.time}')">
          ${match.away_team}
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

loadMatches();

/* ---------------------------------------------------
   KAPTAN KADRO GİRİŞİ
--------------------------------------------------- */
let currentMatchId = null;
let currentTeamSide = null;
let currentTeamName = null;
let currentMatchDate = "";
let currentMatchTime = "";

/* Kadro ekranını aç */
function openLineup(id, side, teamName, date, time) {
  currentMatchId = id;
  currentTeamSide = side;
  currentTeamName = teamName;
  currentMatchDate = date;
  currentMatchTime = time;

  document.getElementById("lineupMatchTitle").innerText = teamName;
  document.getElementById("lineupMatchSub").innerText = `${date} • ${time}`;

  generatePlayersForm();

  showScreen("screen-lineup");
}

/* 7 ilk + 7 yedek alanı */
function generatePlayersForm() {
  const wrapper = document.getElementById("playersForm");
  wrapper.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    wrapper.innerHTML += playerRow("as", i);
  }
  for (let i = 0; i < 7; i++) {
    wrapper.innerHTML += playerRow("yedek", i);
  }
}

function playerRow(type, index) {
  const tag = type === "as" ? "AS" : "Yedek";
  const tagClass = type === "as" ? "tag-as" : "tag-sub";

  return `
    <div class="player-row">
      <span class="tag ${tagClass}">${tag}</span>
      <div class="row-inline">
        <input class="p-name" id="${type}_name_${index}" placeholder="Oyuncu adı">
        <input class="p-no" id="${type}_no_${index}" placeholder="No">
      </div>
    </div>
  `;
}

/* ---------------------------------------------------
   KADROYU KAYDET
--------------------------------------------------- */
document.getElementById("saveLineup").onclick = async () => {
  const players = {
    as: [],
    yedek: []
  };

  for (let i = 0; i < 7; i++) {
    const name = document.getElementById(`as_name_${i}`).value.trim();
    const no = document.getElementById(`as_no_${i}`).value.trim();

    if (!name) {
      alert("AS oyuncular boş olamaz!");
      return;
    }

    players.as.push({ name, no });
  }

  for (let i = 0; i < 7; i++) {
    const name = document.getElementById(`yedek_name_${i}`).value.trim();
    const no = document.getElementById(`yedek_no_${i}`).value.trim();

    if (name) players.yedek.push({ name, no });
  }

  const payload = {
    match_id: currentMatchId,
    team_side: currentTeamSide,
    team_name: currentTeamName,
    players
  };

  const res = await fetch(`/lineups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await res.json();

  if (json.error) {
    alert("Kadro kaydedilirken hata: " + json.error.message);
    return;
  }

  drawSinglePitch(players);
  showScreen("screen-pitch");
};

/* ---------------------------------------------------
   TEK TAKIM SAHA DİZİLİŞİ
--------------------------------------------------- */
function drawSinglePitch(players) {
  const pitch = document.getElementById("pitchSingle");
  const bench = document.getElementById("benchListSingle");

  pitch.innerHTML = `<div class="pitch-line"></div>`;
  bench.innerHTML = "";

  const positions = [
    { x: 50, y: 85 },
    { x: 25, y: 70 },
    { x: 75, y: 70 },
    { x: 15, y: 50 },
    { x: 85, y: 50 },
    { x: 35, y: 30 },
    { x: 65, y: 30 }
  ];

  players.as.forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "player-dot";
    d.style.left = positions[i].x + "%";
    d.style.top = positions[i].y + "%";

    d.innerHTML = `
      <span class="pd-no">${p.no || ""}</span>
      <span class="pd-name">${p.name}</span>
    `;
    pitch.appendChild(d);
  });

  players.yedek.forEach(p => {
    bench.innerHTML += `${p.no || ""} - ${p.name}<br>`;
  });
}

document.getElementById("btnEdit").onclick = () => showScreen("screen-lineup");
document.getElementById("btnExit").onclick = () => {
  loadLineupsList();
  showScreen("screen-lineups-list");
};

/* ---------------------------------------------------
   KADROLAR LİSTESİ
--------------------------------------------------- */
async function loadLineupsList() {
  const resMatches = await fetch(`/matches`);
  const allMatches = await resMatches.json();

  const listDiv = document.getElementById("lineupsList");
  listDiv.innerHTML = "";

  for (let m of allMatches) {
    const resLine = await fetch(`/lineups/${m.id}`);
    const line = await resLine.json();

    if (line.length < 2) continue; // iki takım da girmediyse

    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
      <div class="match-header">${m.home_team} - ${m.away_team}</div>
      <div class="match-meta">${m.date} • ${m.time}</div>
      <button class="btn-team" onclick="openMatchDetail(${m.id})">Detay</button>
    `;
    listDiv.appendChild(div);
  }
}

/* ---------------------------------------------------
   MAÇ DETAY EKRANI
--------------------------------------------------- */
let detailMatchId = null;

async function openMatchDetail(id) {
  detailMatchId = id;

  const matchRes = await fetch(`/match/${id}`);
  const match = await matchRes.json();

  const lineupRes = await fetch(`/lineups/${id}`);
  const lineups = await lineupRes.json();

  const home = lineups.find(l => l.team_side === "home");
  const away = lineups.find(l => l.team_side === "away");

  document.getElementById("detailMatchTitle").innerText =
    `${match.home_team} - ${match.away_team}`;
  document.getElementById("detailMatchSub").innerText =
    `${match.date} • ${match.time} • ${match.field}`;

  document.getElementById("scoreHomeName").innerText = match.home_team;
  document.getElementById("scoreAwayName").innerText = match.away_team;

  drawDetailPitch(home.players, "Home");
  drawDetailPitch(away.players, "Away");

  loadEvents();

  showScreen("screen-lineups-detail");
}

function drawDetailPitch(players, side) {
  const pitch = document.getElementById(`pitch${side}`);
  const bench = document.getElementById(`bench${side}`);

  pitch.innerHTML = `<div class="pitch-line"></div>`;
  bench.innerHTML = "";

  const pos = [
    { x: 50, y: 85 },
    { x: 25, y: 70 },
    { x: 75, y: 70 },
    { x: 15, y: 50 },
    { x: 85, y: 50 },
    { x: 35, y: 30 },
    { x: 65, y: 30 }
  ];

  players.as.forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "player-dot";
    d.style.left = pos[i].x + "%";
    d.style.top = pos[i].y + "%";
    d.innerHTML = `
      <span class="pd-no">${p.no || ""}</span>
      <span class="pd-name">${p.name}</span>
    `;
    pitch.appendChild(d);
  });

  players.yedek.forEach(p => {
    bench.innerHTML += `${p.no || ""} - ${p.name}<br>`;
  });
}

/* ---------------------------------------------------
   OLAYLAR (GOL – KART)
--------------------------------------------------- */
async function loadEvents() {
  const res = await fetch(`/events/${detailMatchId}`);
  const events = await res.json();

  const resLine = await fetch(`/lineups/${detailMatchId}`);
  const L = await resLine.json();

  const home = L.find(l => l.team_side === "home");
  const away = L.find(l => l.team_side === "away");

  document.getElementById("eventsHomeTitle").innerText = home.team_name;
  document.getElementById("eventsAwayTitle").innerText = away.team_name;

  const homeSel = document.getElementById("eventHomePlayer");
  const awaySel = document.getElementById("eventAwayPlayer");
  homeSel.innerHTML = `<option value="">Oyuncu seç</option>`;
  awaySel.innerHTML = `<option value="">Oyuncu seç</option>`;

  home.players.as.forEach((p, i) => {
    homeSel.innerHTML += `<option value="as-${i}">${p.name}</option>`;
  });
  home.players.yedek.forEach((p, i) => {
    homeSel.innerHTML += `<option value="yedek-${i}">${p.name}</option>`;
  });

  away.players.as.forEach((p, i) => {
    awaySel.innerHTML += `<option value="as-${i}">${p.name}</option>`;
  });
  away.players.yedek.forEach((p, i) => {
    awaySel.innerHTML += `<option value="yedek-${i}">${p.name}</option>`;
  });

  document.getElementById("eventsHomeLog").innerHTML = "";
  document.getElementById("eventsAwayLog").innerHTML = "";

  let homeScore = 0;
  let awayScore = 0;

  events.forEach(ev => {
    const isHome = ev.team_side === "home";

    if (ev.event_type === "goal") {
      if (isHome) homeScore++;
      else awayScore++;
    }

    const log = document.createElement("div");
    log.className = "event-row";
    log.innerHTML = `
      <span class="event-text">${ev.event_type.toUpperCase()} • ${ev.player_group} #${ev.player_index}</span>
    `;

    if (isHome)
      document.getElementById("eventsHomeLog").appendChild(log);
    else
      document.getElementById("eventsAwayLog").appendChild(log);
  });

  document.getElementById("scoreHomeValue").innerText = homeScore;
  document.getElementById("scoreAwayValue").innerText = awayScore;
}

/* Event Buttons */
function addEvent(side, type) {
  const select = document.getElementById(
    side === "home" ? "eventHomePlayer" : "eventAwayPlayer"
  );
  const val = select.value;
  if (!val) return;

  const [group, index] = val.split("-");

  fetch(`/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: detailMatchId,
      team_side: side,
      event_type: type,
      player_group: group,
      player_index: Number(index)
    })
  }).then(() => loadEvents());
}

document.getElementById("btnHomeGoal").onclick = () =>
  addEvent("home", "goal");
document.getElementById("btnHomeYellow").onclick = () =>
  addEvent("home", "yellow");
document.getElementById("btnHomeRed").onclick = () =>
  addEvent("home", "red");

document.getElementById("btnAwayGoal").onclick = () =>
  addEvent("away", "goal");
document.getElementById("btnAwayYellow").onclick = () =>
  addEvent("away", "yellow");
document.getElementById("btnAwayRed").onclick = () =>
  addEvent("away", "red");

/* ---------------------------------------------------
   INSTAGRAM GÖRSELİ
--------------------------------------------------- */
document.getElementById("btnOpenInstagram").onclick = () =>
  showScreen("screen-instagram");

document.getElementById("btnInstaBack").onclick = () =>
  showScreen("screen-lineups-detail");

/* ---------------------------------------------------
   ADMIN PANEL
--------------------------------------------------- */
document.getElementById("btnMatchLogin").onclick = () => {
  const u = document.getElementById("matchAdminUser").value.trim();
  const p = document.getElementById("matchAdminPass").value.trim();

  if (u === "admin" && p === "1907") {
    document.getElementById("matchAdminLoginCard").style.display = "none";
    document.getElementById("matchAdminPanelCard").style.display = "block";
    loadAdminMatchList();
  } else {
    alert("Hatalı giriş!");
  }
};

document.getElementById("btnAddMatch").onclick = async () => {
  const payload = {
    date: document.getElementById("matchDate").value,
    time: document.getElementById("matchTime").value,
    home_team: document.getElementById("matchHome").value,
    away_team: document.getElementById("matchAway").value,
    field: document.getElementById("matchField").value
  };

  const res = await fetch(`/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await res.json();
  loadAdminMatchList();
  loadMatches();
  alert("Maç eklendi!");
};

async function loadAdminMatchList() {
  const res = await fetch(`/matches`);
  const matches = await res.json();

  const div = document.getElementById("matchListAdmin");
  div.innerHTML = "";

  matches.forEach(m => {
    div.innerHTML += `${m.id}) ${m.home_team} - ${m.away_team}<br>`;
  });
}
