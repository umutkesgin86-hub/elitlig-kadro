const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const supabase = require("./db"); // Supabase client

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* ---------------------------------------------------
   1) TÜM MAÇLARI GETİR
--------------------------------------------------- */
app.get("/matches", async (req, res) => {
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
app.post("/matches", async (req, res) => {
  const { home_team, away_team, date, time, field } = req.body;

  const { data, error } = await supabase.from("matches").insert([
    { home_team, away_team, date, time, field }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true, match: data[0] });
});

/* ---------------------------------------------------
   3) KADRO KAYDET
--------------------------------------------------- */
app.post("/lineups", async (req, res) => {
  const { match_id, team_side, team_name, players } = req.body;

  const { data, error } = await supabase.from("lineups").upsert([
    {
      match_id,
      team_side,
      team_name,
      players_json: JSON.stringify(players)
    }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

/* ---------------------------------------------------
   4) MAÇA AİT KADROLARI GETİR
--------------------------------------------------- */
app.get("/lineups/:match_id", async (req, res) => {
  const { match_id } = req.params;

  const { data, error } = await supabase
    .from("lineups")
    .select("*")
    .eq("match_id", match_id);

  if (error) return res.status(500).json({ error });

  const formatted = data.map(l => ({
    ...l,
    players: JSON.parse(l.players_json)
  }));

  res.json(formatted);
});

/* ---------------------------------------------------
   5) OLAY EKLE (Gol / Sarı / Kırmızı)
--------------------------------------------------- */
app.post("/events", async (req, res) => {
  const { match_id, team_side, event_type, player_group, player_index } =
    req.body;

  const { error } = await supabase.from("events").insert([
    {
      match_id,
      team_side,
      event_type,
      player_group,
      player_index
    }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

/* ---------------------------------------------------
   6) MAÇA AİT OLAYLARI GETİR
--------------------------------------------------- */
app.get("/events/:match_id", async (req, res) => {
  const { match_id } = req.params;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("match_id", match_id)
    .order("id", { ascending: true });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

/* ---------------------------------------------------
   7) TEK MAÇ DETAYINI GETİR
--------------------------------------------------- */
app.get("/match/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
});

/* ---------------------------------------------------
   SERVER ÇALIŞTIR
--------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Supabase bağlı! Sunucu çalışıyor: ${PORT}`);
});
