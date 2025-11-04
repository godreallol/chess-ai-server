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

  // Define difficulty levels
  const depthMap = {
    1: 4,   // Easy — makes random-ish moves
    2: 8,   // Medium — reasonable play
    3: 14,  // Hard — strong but fast enough
  };

  const depth = depthMap[level] || 8; // default medium

  try {
    const response = await fetch(
      `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`
    );

    const data = await response.json();
    let move = null;

    // Extract best move
    if (data.bestmove) {
      const parts = data.bestmove.split(" ");
      if (parts.length >= 2) move = parts[1];
    }

    // Add randomness for easy level (simulates mistakes)
    if (level === 1 && data.moves && Math.random() < 0.6) {
      const moves = data.moves.split(" ");
      move = moves[Math.floor(Math.random() * moves.length)];
    }

    // Safety fallback: if bestmove missing, pick any legal move
    if (!move && data.moves) {
      const moves = data.moves.split(" ");
      move = moves[Math.floor(Math.random() * moves.length)];
    }

    res.json({ bestmove: move || "unknown" });
  } catch (err) {
    console.error("Error in /move:", err);
    res.status(500).json({ error: "Failed to get move." });
  }
});

const PORT = process.env.PORT || 10000;

// Bind to 0.0.0.0 — required by Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
