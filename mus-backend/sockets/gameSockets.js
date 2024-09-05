//sockets/gameSockets.js
const Game = require("../models/Game");
const { shuffleDeck, getCardDeck, dealCards } = require("../utils/deckUtils");

const handleMove = async (io, { gameId, playerName, move }) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) return io.to(gameId).emit("error", "Game not found");

    const player = game.players.find((p) => p.name === playerName);
    if (!player) return io.to(gameId).emit("error", "Player not found");

    if (game.currentTurn !== playerName) {
      return io.to(gameId).emit("error", "Not your turn");
    }

    // Manejar el movimiento
    game.currentTurn = getNextPlayer(game.players, playerName);
    await game.save();

    io.to(gameId).emit("moveMade", { playerName, move });
  } catch (err) {
    io.to(gameId).emit("error", err.message);
  }
};

const handleBet = async (io, { gameId, playerName, betAmount }) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) return io.to(gameId).emit("error", "Game not found");

    const player = game.players.find((p) => p.name === playerName);
    if (!player) return io.to(gameId).emit("error", "Player not found");

    player.bet += betAmount;
    game.pot += betAmount;

    const nextPlayer = getNextPlayer(game.players, playerName);
    if (nextPlayer) {
      game.currentTurn = nextPlayer.name;
    } else {
      game.state = "roundComplete";
    }

    await game.save();
    io.to(gameId).emit("betPlaced", { playerName, betAmount });
  } catch (err) {
    io.to(gameId).emit("error", err.message);
  }
};

const handleGameStart = async (io, { gameId }) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) return io.to(gameId).emit("error", "Game not found");

    game.state = "dealing";
    game.currentTurn = game.players[0].name;

    const deck = shuffleDeck(getCardDeck());
    dealCards(game.players, deck);

    await game.save();
    io.to(gameId).emit("gameStarted", game);
  } catch (err) {
    io.to(gameId).emit("error", err.message);
  }
};

const getNextPlayer = (players, currentPlayerName) => {
  const currentIndex = players.findIndex((p) => p.name === currentPlayerName);
  return players[(currentIndex + 1) % players.length];
};

module.exports = { handleMove, handleBet, handleGameStart };
