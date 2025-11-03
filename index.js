import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Allow requests from your frontend
app.use(cors());
app.use(express.json());

// Simple route to verify Render is working
app.get("/", (req, res) => {
  res.send("✅ Chess AI Server is running!");
});

app.post("/move", async (req, res) => {
  const { fen, level } = req.body;

  try {
    const response = await fetch(
      `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${level * 2}`
    );

    const data = await response.json();

    // Extract only the move (e.g. "d2d4" from "bestmove d2d4 ponder e7e6")
    let move = null;
    if (data.bestmove) {
      const parts = data.bestmove.split(" ");
      if (parts.length >= 2) move = parts[1];
    }

    res.json({ bestmove: move || "unknown" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get move." });
  }
});

const PORT = process.env.PORT || 10000;

// Bind to 0.0.0.0 — required by Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
