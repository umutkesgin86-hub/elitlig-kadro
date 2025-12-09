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
   HANDLER FONKSİYONLARI
--------------------------------------------------- */

// 1) Tüm maçları getir
const getMatches = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("id", { ascending: false });

    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    console.error("GET matches hata:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2) Maç ekle
const addMatch = async (req, res) => {
  try {
    const { home_team, away_team, date, time, field } = req.body;

    const { data, error } = await supabase.from("matches").insert([
      { home_team, away_team, date, time, field }
    ]);

    if (error) return res.status(500).json({ error });
    res.json({ success: true, match: data[0] });
  } catch (err) {
    console.error("POST matches hata:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------------
   3) KADRO KAYDET  (GÜNCEL)
--------------------------------------------------- */
const saveLineup = async (req, res) => {
  try {
    // Hem eski hem yeni frontend isimlerini yakalar
    const matchId =
      req.body.match_id ??
      req.body.matchId ??
      req.body.match_id?.toString();

    const teamSide = req.body.team_side ?? req.body.teamSide;
    const teamName = req.body.team_name ?? req.body.teamName;
    const players =
      req.body.players ?? req.body.kadro ?? req.body.lineup ?? null;

    if (!matchId || !teamSide || !teamName || !players) {
      return res.status(400).json({
        error:
          "Eksik veri: matchId/match_id, teamSide/team_side, teamName/team_name veya players eksik."
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

    if (error) {
      console.error("Supabase lineups insert hata:", error);
      return res.status(500).json({ error });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Genel lineups hata:", err);
    res.status(500).json({ error: err.message });
  }
};


// 4) Maça ait kadroları getir
// 3) Kadro kaydet  (GÜNCEL VERSİYON)
const saveLineup = async (req, res) => {
  try {
    // Hem eski hem yeni isimleri yakala
    const matchId =
      req.body.match_id ?? req.body.matchId ?? req.body.match_id?.toString();
    const teamSide = req.body.team_side ?? req.body.teamSide;
    const teamName = req.body.team_name ?? req.body.teamName;
    const players =
      req.body.players ?? req.body.kadro ?? req.body.lineup ?? null;

    if (!matchId || !teamSide || !teamName || !players) {
      return res.status(400).json({
        error: "Eksik veri: matchId/match_id, teamSide/team_side, teamName/team_name veya players eksik."
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

    if (error) {
      console.error("Supabase lineups insert/upsert hata:", error);
      return res.status(500).json({ error });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("POST lineups genel hata:", err);
    res.status(500).json({ error: err.message });
  }
};


// 5) Olay ekle
const addEvent = async (req, res) => {
  try {
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
  } catch (err) {
    console.error("POST events hata:", err);
    res.status(500).json({ error: err.message });
  }
};

// 6) Maça ait olayları getir
const getEvents = async (req, res) => {
  try {
    const { match_id } = req.params;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("match_id", match_id)
      .order("id", { ascending: true });

    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    console.error("GET events hata:", err);
    res.status(500).json({ error: err.message });
  }
};

// 7) Tek maç detayını getir
const getMatchDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    console.error("GET match detail hata:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------------
   ROUTELAR
--------------------------------------------------- */

// Eski /api/... rotaları ile yeni rotaları aynı handler'a bağlıyoruz

// Maç listesi
app.get("/matches", getMatches);
app.get("/api/matches", getMatches);

// Maç ekle
app.post("/matches", addMatch);
app.post("/api/matches", addMatch);

// Kadro kaydet
app.post("/lineups", saveLineup);
app.post("/api/lineups", saveLineup);

// Kadroları getir
app.get("/lineups/:match_id", getLineups);
app.get("/api/lineups/:match_id", getLineups);

// Olay ekle
app.post("/events", addEvent);
app.post("/api/events", addEvent);

// Olayları getir
app.get("/events/:match_id", getEvents);
app.get("/api/events/:match_id", getEvents);

// Maç detayı
app.get("/match/:id", getMatchDetail);
app.get("/api/match/:id", getMatchDetail);

// en alta yakın bir yerde
app.post("/lineups", saveLineup);
app.post("/api/lineups", saveLineup);

/* ---------------------------------------------------
   SERVER ÇALIŞTIR
--------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Supabase bağlı! Sunucu çalışıyor: ${PORT}`);
});



