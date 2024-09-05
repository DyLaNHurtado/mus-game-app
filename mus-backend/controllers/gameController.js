//controllers/gameController.js
const Game = require("../models/Game");
const { shuffleDeck, getCardDeck, dealCards } = require("../utils/deckUtils");

exports.createGame = async (req, res) => {
  try {
    const { players } = req.body;

    const newGame = new Game({
      players: players.map((player) => ({
        name: player,
        hand: [],
        bet: 0,
        isTurn: false,
        hasFolded: false,
        handValue: 0,
      })),
      state: "waiting",
      pot: 0,
      round: 0,
      currentTurn: null,
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.startGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (game.state !== "waiting") {
      return res.status(400).json({ error: "Game already started" });
    }

    const deck = shuffleDeck(getCardDeck());
    dealCards(game.players, deck);

    game.state = "dealing";
    game.currentTurn = game.players[0].name; // El primer jugador toma el turno
    game.round = 1;

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
