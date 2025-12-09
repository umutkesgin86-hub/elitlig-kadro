// server.js — FULL WORKING VERSION
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const supabase = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* ---------------------------------------------------
   1) TÜM MAÇLARI GETİR
--------------------------------------------------- */
const getMatches = async (req, res) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
};

/* ---------------------------------------------------
   2) MAÇ EKLE
--------------------------------------------------- */
const addMatch = async (req, res) => {
  const { home_team, away_team, date, time, field } = req.body;

  const { data, error } = await supabase.from("matches").insert([
    { home_team, away_team, date, time, field }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true, match: data[0] });
};

/* ---------------------------------------------------
   3) KADRO KAYDET — TÜM FRONTENDLERLE UYUMLU
--------------------------------------------------- */
const saveLineup = async (req, res) => {
  const matchId =
    req.params.match_id ||
    req.body.match_id ||
    req.body.matchId;

  const teamSide = req.body.team_side || req.body.teamSide;
  const teamName = req.body.team_name || req.body.teamName;
  const players =
    req.body.players || req.body.kadro || req.body.lineup;

  if (!matchId || !teamSide || !teamName || !players) {
    return res.status(400).json({
      error:
        "Eksik veri: matchId, teamSide, teamName veya players eksik."
    });
  }

  const { error } = await supabase.from("lineups").upsert([
    {
      match_id: Number(matchId),
      team_side: teamSide,
      team_name: teamName,
      players_json: JSON.stringify(players)
    }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
};

/* ---------------------------------------------------
   4) MAÇA AİT KADROLARI GETİR (HER FORMATTA)
--------------------------------------------------- */
const getLineups = async (req, res) => {
  const matchId =
    req.params.match_id ||
    req.params.id ||
    req.query.matchId;

  if (!matchId) {
    return res.status(400).json({ error: "match_id gerekli" });
  }

  const { data, error } = await supabase
    .from("lineups")
    .select("*")
    .eq("match_id", matchId);

  if (error) return res.status(500).json({ error });

  const formatted = {};

  data.forEach((row) => {
    formatted[row.team_side] = {
      team: row.team_name,
      players: JSON.parse(row.players_json)
    };
  });

  res.json(formatted);
};

/* ---------------------------------------------------
   5) OLAY EKLE
--------------------------------------------------- */
const addEvent = async (req, res) => {
  const { match_id, team_side, event_type, player_group, player_index } =
    req.body;

  const { data, error } = await supabase.from("events").insert([
    {
      match_id,
      team_side,
      event_type,
      player_group,
      player_index
    }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true, id: data[0]?.id });
};

/* ---------------------------------------------------
   6) OLAYLARI GETİR
--------------------------------------------------- */
const getEvents = async (req, res) => {
  const { match_id } = req.params;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("match_id", match_id)
    .order("id", { ascending: true });

  if (error) return res.status(500).json({ error });
  res.json(data);
};

/* ---------------------------------------------------
   7) TEK MAÇ DETAYI
--------------------------------------------------- */
const getMatchDetail = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
};

/* ---------------------------------------------------
   ROUTES — TÜM FORMATLARLA UYUMLU
--------------------------------------------------- */

// MATCHES
app.get("/matches", getMatches);
app.get("/api/matches", getMatches);
app.post("/matches", addMatch);
app.post("/api/matches", addMatch);

// LINEUPS — TÜM İHTİYAÇ DUYULAN TÜM YOLLAR
app.post("/lineups", saveLineup);
app.post("/api/lineups", saveLineup);
app.post("/api/matches/:match_id/lineups", saveLineup);

app.get("/lineups/:match_id", getLineups);
app.get("/api/lineups/:match_id", getLineups);
app.get("/api/matches/:match_id/lineups", getLineups);

// EVENTS
app.post("/events", addEvent);
app.post("/api/events", addEvent);
app.get("/events/:match_id", getEvents);
app.get("/api/events/:match_id", getEvents);

// MATCH DETAIL
app.get("/match/:id", getMatchDetail);
app.get("/api/match/:id", getMatchDetail);

/* ---------------------------------------------------
   SERVER START
--------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`✔ Sunucu çalışıyor: PORT ${PORT}`);
});
