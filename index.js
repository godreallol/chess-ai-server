import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/move", async (req, res) => {
  const { fen, level } = req.body;

  try {
    const response = await fetch(
      `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${level * 2}`
    );

    const data = await response.json();

    // Extract only the move, e.g. "d2d4" from "bestmove d2d4 ponder e7e6"
    let move = null;
    if (data.bestmove) {
      const parts = data.bestmove.split(" ");
      if (parts.length >= 2) move = parts[1];
    }

    return res.json({ bestmove: move || "unknown" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get move." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
