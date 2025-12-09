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
app.get("/api/matches", async (req, res) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

/* ---------------------------------------------------
   2) MAÇ EKLE
--------------------------------------------------- */
app.post("/api/matches", async (req, res) => {
  const { home_team, away_team, date, time, field } = req.body;

  const { data, error } = await supabase.from("matches").insert([
    { home_team, away_team, date, time, field }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true, match: data[0] });
});

/* ---------------------------------------------------
   3) KADRO KAYDET (FRONTEND İLE TAM UYUMLU)
   POST /api/matches/:id/lineups
--------------------------------------------------- */
app.post("/api/matches/:match_id/lineups", async (req, res) => {
  try {
    const match_id = Number(req.params.match_id);

    const team_side = req.body.team_side;
    const team_name = req.body.team_name;
    const players = req.body.players;

    if (!match_id || !team_side || !team_name || !players) {
      return res.status(400).json({ error: "Eksik bilgi gönderildi" });
    }

    const { error } = await supabase.from("lineups").upsert([
      {
        match_id,
        team_side,
        team_name,
        players_json: JSON.stringify(players)
      }
    ]);

    if (error) return res.status(500).json({ error });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------------------------------------------
   4) MAÇA AİT KADROLARI GETİR
   GET /api/matches/:id/lineups
--------------------------------------------------- */
app.get("/api/matches/:match_id/lineups", async (req, res) => {
  try {
    const match_id = Number(req.params.match_id);

    const { data, error } = await supabase
      .from("lineups")
      .select("*")
      .eq("match_id", match_id);

    if (error) return res.status(500).json({ error });

    const response = {
      home: null,
      away: null
    };

    data.forEach(row => {
      const parsed = JSON.parse(row.players_json);
      if (row.team_side === "home") {
        response.home = { players: parsed };
      }
      if (row.team_side === "away") {
        response.away = { players: parsed };
      }
    });

    res.json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------------------------------------------
   5) OLAY EKLE
   POST /api/matches/:id/events
--------------------------------------------------- */
app.post("/api/matches/:match_id/events", async (req, res) => {
  const match_id = Number(req.params.match_id);
  const { team_side, event_type, player_group, player_index } = req.body;

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

  res.json({ success: true, id: data[0].id });
});

/* ---------------------------------------------------
   6) OLAYLARI GETİR
   GET /api/matches/:id/events
--------------------------------------------------- */
app.get("/api/matches/:match_id/events", async (req, res) => {
  const match_id = Number(req.params.match_id);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("match_id", match_id)
    .order("id", { ascending: true });

  if (error) return res.status(500).json({ error });

  const response = {
    home: [],
    away: []
  };

  data.forEach(ev => {
    const item = {
      id: ev.id,
      type: ev.event_type,
      group: ev.player_group,
      index: ev.player_index
    };

    if (ev.team_side === "home") response.home.push(item);
    if (ev.team_side === "away") response.away.push(item);
  });

  res.json(response);
});

/* ---------------------------------------------------
   7) OLAY SİL – FRONTEND DELETE BUTONU İÇİN
   DELETE /api/events/:id
--------------------------------------------------- */
app.delete("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

/* ---------------------------------------------------
   SUNUCU
--------------------------------------------------- */
app.listen(PORT, () => {
  console.log("Supabase bağlı! Sunucu çalışıyor:", PORT);
});
