const express = require("express");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post("/api/search", async (req, res) => {
  const { city, latitude, longitude, variable, date_start, date_end } =
    req.body;

  try {
    const { error } = await supabase.from("user_searches").insert([
      {
        city,
        latitude,
        longitude,
        variable,
        date_range_start: date_start,
        date_range_end: date_end,
      },
    ]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Supabase insert error:", err);
    res.status(500).json({ error: "Failed to save search" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
