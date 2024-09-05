//controllers/playerController.js
const Game = require("../models/Game");

exports.joinGame = async (req, res) => {
  try {
    const { gameId, playerName } = req.body;
    const game = await Game.findById(gameId);

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.players.length >= 4) {
      return res.status(400).json({ error: "Game is full" });
    }

    const playerExists = game.players.some((p) => p.name === playerName);
    if (playerExists) {
      return res.status(400).json({ error: "Player already in game" });
    }

    game.players.push({
      name: playerName,
      hand: [],
      bet: 0,
      isTurn: false,
      hasFolded: false,
      handValue: 0,
    });

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
