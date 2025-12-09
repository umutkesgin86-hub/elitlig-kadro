// db.js — JSON tabanlı hafif veri sistemi (Render uyumlu)
// sqlite3 kaldırıldı, JSON dosyaları kullanılacak.

const fs = require("fs");
const path = require("path");

const dbFolder = path.join(__dirname, "db");

// Klasör yoksa oluştur
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder);
}

// JSON dosyalarının yolları
const matchesFile = path.join(dbFolder, "matches.json");
const lineupsFile = path.join(dbFolder, "lineups.json");
const eventsFile = path.join(dbFolder, "events.json");

// Dosya yoksa oluşturan fonksiyon
function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFile(matchesFile, []);
ensureFile(lineupsFile, []);
ensureFile(eventsFile, []);

// JSON okuma/yazma fonksiyonları
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ----------------------------
// MAÇ EKLEME
// ----------------------------
function addMatch(match) {
  const matches = readJSON(matchesFile);
  match.id = matches.length + 1;
  matches.push(match);
  writeJSON(matchesFile, matches);
  return match.id;
}

// TÜM MAÇLARI GETİR
function getMatches() {
  return readJSON(matchesFile);
}

// ----------------------------
// KADRO KAYDETME
// ----------------------------
function saveLineup(lineup) {
  const lineups = readJSON(lineupsFile);

  // Aynı maç + takım tarafı varsa güncelle
  const existing = lineups.find(
    (l) => l.match_id === lineup.match_id && l.team_side === lineup.team_side
  );

  if (existing) {
    existing.players_json = lineup.players_json;
    existing.team_name = lineup.team_name;
  } else {
    lineup.id = lineups.length + 1;
    lineups.push(lineup);
  }

  writeJSON(lineupsFile, lineups);
}

// Kadroları çek
function getLineups(matchId) {
  const all = readJSON(lineupsFile);
  return all.filter((l) => l.match_id === matchId);
}

// ----------------------------
// OLAY EKLEME
// ----------------------------
function addEvent(event) {
  const events = readJSON(eventsFile);
  event.id = events.length + 1;
  event.created_at = new Date().toISOString();
  events.push(event);
  writeJSON(eventsFile, events);
}

// Olayları çek
function getEvents(matchId) {
  const events = readJSON(eventsFile);
  return events.filter((e) => e.match_id === matchId);
}

// ----------------------------
// ORM Benzeri Export
// ----------------------------
module.exports = {
  addMatch,
  getMatches,
  saveLineup,
  getLineups,
  addEvent,
  getEvents,
};

