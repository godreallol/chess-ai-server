import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Simple route to verify the server is working
app.get("/", (req, res) => {
  res.send("✅ Chess AI Server is running!");
});

app.post("/move", async (req, res) => {
  const { fen, level } = req.body;

  // Map levels to realistic difficulty
  const depthMap = {
    1: 1,   // Easy — shallow, random mistakes
    2: 6,   // Medium — decent, makes some errors
    3: 20,  // Hard — very strong
  };
  const depth = depthMap[level] || 6;

  try {
    // Ask Stockfish API for a move at the chosen depth
    const response = await fetch(
      `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`
    );

    const data = await response.json();
    let move = null;

    // Extract the bestmove (e.g., "bestmove d2d4 ponder e7e6")
    if (data.bestmove) {
      const parts = data.bestmove.split(" ");
      if (parts.length >= 2) move = parts[1];
    }

    // Add some random blunders for Level 1
    if (level === 1 && data.moves && Math.random() < 0.6) {
      const moves = data.moves.split(" ");
      move = moves[Math.floor(Math.random() * moves.length)];
    }

    res.json({ bestmove: move || "unknown" });
  } catch (err) {
    console.error("Error in /move:", err);
    res.status(500).json({ error: "Failed to get move." });
  }
});

// Server setup
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
