import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/move", async (req, res) => {
  const { fen, level } = req.body;

  try {
    // Stockfish API (public one)
    const response = await fetch(
      `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${level * 2}`
    );

    const data = await response.json();
    return res.json({ bestmove: data.bestmove });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get move." });
  }
});

app.listen(10000, () => console.log("Server running"));
