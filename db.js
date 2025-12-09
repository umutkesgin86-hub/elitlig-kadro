// db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "elitlig.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Maçlar
  db.run(
    `CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      date TEXT NOT NULL,   -- YYYY-MM-DD
      time TEXT NOT NULL,   -- HH:MM
      field TEXT NOT NULL
    )`
  );

  // Kadrolar
  db.run(
    `CREATE TABLE IF NOT EXISTS lineups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      team_side TEXT NOT NULL,      -- 'home' | 'away'
      team_name TEXT NOT NULL,
      players_json TEXT NOT NULL,   -- { as: [...], yedek: [...] }
      FOREIGN KEY (match_id) REFERENCES matches(id)
    )`
  );

  // Olaylar
  db.run(
    `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      team_side TEXT NOT NULL,      -- 'home' | 'away'
      event_type TEXT NOT NULL,     -- 'goal' | 'yellow' | 'red'
      player_group TEXT NOT NULL,   -- 'as' | 'yedek'
      player_index INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (match_id) REFERENCES matches(id)
    )`
  );

  // ÖRNEK MAÇLAR (sadece tablo boşsa)
  db.get("SELECT COUNT(*) AS c FROM matches", (err, row) => {
    if (err) {
      console.error("matches sayılırken hata:", err);
      return;
    }
    if (row.c === 0) {
      const stmt = db.prepare(
        "INSERT INTO matches (home_team, away_team, date, time, field) VALUES (?, ?, ?, ?, ?)"
      );
      stmt.run(
        "Kozluca",
        "Legends",
        "2025-12-08",
        "22:00",
        "Elit Lig Arena"
      );
      stmt.run(
        "Samandıra Gücü",
        "Anadolu United",
        "2025-12-08",
        "21:00",
        "Samandıra City Arena"
      );
      stmt.finalize();
      console.log("Örnek maçlar eklendi.");
    }
  });
});

module.exports = db;
