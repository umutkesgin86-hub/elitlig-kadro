// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Yardımcı promise fonksiyonları
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // this.lastID, this.changes
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Orta katmanlar
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ---------- API: Maçlar ----------

// Tüm maçlar
app.get("/api/matches", async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, home_team, away_team, date, time, field
       FROM matches
       ORDER BY date DESC, time DESC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/matches hata:", err);
    res.status(500).json({ error: "Maçlar alınamadı." });
  }
});

// Yeni maç ekle
app.post("/api/matches", async (req, res) => {
  try {
    const { home_team, away_team, date, time, field } = req.body || {};
    if (!home_team || !away_team || !date || !time) {
      return res.status(400).json({ error: "Eksik alanlar var." });
    }

    const result = await run(
      `INSERT INTO matches (home_team, away_team, date, time, field)
       VALUES (?, ?, ?, ?, ?)`,
      [home_team, away_team, date, time, field || "Elit Lig Arena"]
    );

    const match = await get(
      `SELECT id, home_team, away_team, date, time, field
       FROM matches WHERE id = ?`,
      [result.lastID]
    );
    res.json(match);
  } catch (err) {
    console.error("POST /api/matches hata:", err);
    res.status(500).json({ error: "Maç eklenemedi." });
  }
});

// Maç güncelle
app.put("/api/matches/:id", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const { home_team, away_team, date, time, field } = req.body || {};
    if (!home_team || !away_team || !date || !time) {
      return res.status(400).json({ error: "Eksik alanlar var." });
    }

    await run(
      `UPDATE matches
       SET home_team = ?, away_team = ?, date = ?, time = ?, field = ?
       WHERE id = ?`,
      [home_team, away_team, date, time, field || "Elit Lig Arena", matchId]
    );

    const match = await get(
      `SELECT id, home_team, away_team, date, time, field
       FROM matches WHERE id = ?`,
      [matchId]
    );
    res.json(match);
  } catch (err) {
    console.error("PUT /api/matches/:id hata:", err);
    res.status(500).json({ error: "Maç güncellenemedi." });
  }
});


// ---------- API: Kadrolar ----------

// Bir maç için iki takım kadrosu
app.get("/api/matches/:id/lineups", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const rows = await all(
      `SELECT id, match_id, team_side, team_name, players_json
       FROM lineups WHERE match_id = ?`,
      [matchId]
    );

    const result = { home: null, away: null };

    rows.forEach((row) => {
      const obj = {
        id: row.id,
        match_id: row.match_id,
        team_side: row.team_side,
        team_name: row.team_name,
        players: JSON.parse(row.players_json || "{}")
      };
      if (row.team_side === "home") result.home = obj;
      if (row.team_side === "away") result.away = obj;
    });

    res.json(result);
  } catch (err) {
    console.error("GET /api/matches/:id/lineups hata:", err);
    res.status(500).json({ error: "Kadrolar alınamadı." });
  }
});

// Kadro kaydet / güncelle (upsert)
app.post("/api/matches/:id/lineups", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const { team_side, team_name, players } = req.body || {};

    if (!team_side || !team_name || !players) {
      return res.status(400).json({ error: "Eksik alanlar var." });
    }

    const playersJson = JSON.stringify(players);
    const existing = await get(
      `SELECT id FROM lineups WHERE match_id = ? AND team_side = ?`,
      [matchId, team_side]
    );

    if (existing) {
      await run(
        `UPDATE lineups
         SET team_name = ?, players_json = ?
         WHERE id = ?`,
        [team_name, playersJson, existing.id]
      );
    } else {
      await run(
        `INSERT INTO lineups (match_id, team_side, team_name, players_json)
         VALUES (?, ?, ?, ?)`,
        [matchId, team_side, team_name, playersJson]
      );
    }

    const rows = await all(
      `SELECT id, match_id, team_side, team_name, players_json
       FROM lineups WHERE match_id = ?`,
      [matchId]
    );

    const result = { home: null, away: null };
    rows.forEach((row) => {
      const obj = {
        id: row.id,
        match_id: row.match_id,
        team_side: row.team_side,
        team_name: row.team_name,
        players: JSON.parse(row.players_json || "{}")
      };
      if (row.team_side === "home") result.home = obj;
      if (row.team_side === "away") result.away = obj;
    });

    res.json(result);
  } catch (err) {
    console.error("POST /api/matches/:id/lineups hata:", err);
    res.status(500).json({ error: "Kadro kaydedilemedi." });
  }
});


// ---------- API: Olaylar (gol / kart) ----------

// Bir maçın tüm olayları
app.get("/api/matches/:id/events", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const rows = await all(
      `SELECT id, match_id, team_side, event_type, player_group, player_index, created_at
       FROM events WHERE match_id = ?
       ORDER BY id ASC`,
      [matchId]
    );

    const result = { home: [], away: [] };
    rows.forEach((row) => {
      const obj = {
        id: row.id,
        team_side: row.team_side,
        event_type: row.event_type,
        player_group: row.player_group,
        player_index: row.player_index,
        created_at: row.created_at
      };
      if (row.team_side === "home") result.home.push(obj);
      if (row.team_side === "away") result.away.push(obj);
    });

    res.json(result);
  } catch (err) {
    console.error("GET /api/matches/:id/events hata:", err);
    res.status(500).json({ error: "Olaylar alınamadı." });
  }
});

// Yeni olay ekle
app.post("/api/matches/:id/events", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const { team_side, event_type, player_group, player_index } = req.body || {};

    if (!team_side || !event_type || !player_group || typeof player_index !== "number") {
      return res.status(400).json({ error: "Eksik alanlar var." });
    }

    const createdAt = new Date().toISOString();

    const result = await run(
      `INSERT INTO events (match_id, team_side, event_type, player_group, player_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [matchId, team_side, event_type, player_group, player_index, createdAt]
    );

    const row = await get(
      `SELECT id, match_id, team_side, event_type, player_group, player_index, created_at
       FROM events WHERE id = ?`,
      [result.lastID]
    );

    res.json(row);
  } catch (err) {
    console.error("POST /api/matches/:id/events hata:", err);
    res.status(500).json({ error: "Olay eklenemedi." });
  }
});

// Olay sil
app.delete("/api/matches/:id/events/:eventId", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const eventId = Number(req.params.eventId);

    await run(
      `DELETE FROM events WHERE id = ? AND match_id = ?`,
      [eventId, matchId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/matches/:id/events/:eventId hata:", err);
    res.status(500).json({ error: "Olay silinemedi." });
  }
});


// ---------- Sunucuyu çalıştır ----------
app.listen(PORT, () => {
  console.log(`Elit Lig sunucu çalışıyor: http://localhost:${PORT}`);
});
