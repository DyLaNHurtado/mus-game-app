// controllers/roundController.js

const Game = require("../models/Game");
const Player = require("../models/Player");
const {
  evaluateGrande,
  evaluateChica,
  evaluatePares,
  evaluateJuego,
  evaluatePunto,
} = require("../utils/deckUtils");

// Evaluar los valores de la mano de cada jugador
const evaluatePlayerHands = async (game) => {
  for (const player of game.players) {
    // Evaluar la mano de cada jugador para los diferentes lances
    player.grandeValue = evaluateGrande(player.hand);
    player.chicaValue = evaluateChica(player.hand);
    player.paresValue = evaluatePares(player.hand);
    player.juegoValue = evaluateJuego(player.hand);
    player.puntoValue = evaluatePunto(player.hand);

    // Calcular el valor total de la mano
    player.handValue =
      player.grandeValue +
      player.chicaValue +
      player.paresValue +
      player.juegoValue +
      player.puntoValue;

    // Guardar la información actualizada del jugador en la base de datos
    await Player.findByIdAndUpdate(player._id, player);
  }
};

// Determinar el ganador de la ronda
const determineRondaWinner = (players, lanceType) => {
  let bestPlayer = null;
  let bestValue = -1;

  players.forEach((player) => {
    let currentValue;

    switch (lanceType) {
      case "grande":
        currentValue = player.grandeValue;
        break;
      case "chica":
        currentValue = player.chicaValue;
        break;
      case "pares":
        currentValue = player.paresValue;
        break;
      case "juego":
        currentValue = player.juegoValue;
        break;
      case "punto":
        currentValue = player.puntoValue;
        break;
      default:
        throw new Error("Unknown lance type");
    }

    if (currentValue > bestValue) {
      bestValue = currentValue;
      bestPlayer = player;
    }
  });

  return bestPlayer;
};

// Manejar el lance actual
const handleLance = async (game, lanceType) => {
  const winner = determineRondaWinner(game.players, lanceType);

  if (winner) {
    // Actualizar el estado del juego y las puntuaciones
    game.state =
      lanceType === "punto"
        ? "finished"
        : `decide${lanceType.charAt(0).toUpperCase() + lanceType.slice(1)}`;
    game.winners = [winner._id];
    winner.points += 1; // Añadir 1 punto al ganador

    // Actualizar la puntuación de los jugadores en la base de datos
    await Player.findByIdAndUpdate(winner._id, { points: winner.points });

    // Guardar el estado del juego
    await Game.findByIdAndUpdate(game._id, game);
  } else {
    // Si no hay ganador, actualizar el estado para pasar al siguiente lance
    game.state = `decide${
      lanceType.charAt(0).toUpperCase() + lanceType.slice(1)
    }`;
    await Game.findByIdAndUpdate(game._id, game);
  }
};

// Evaluar y manejar los lances
exports.evaluateAndHandleLances = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate("players hand");
    if (!game) return res.status(404).json({ error: "Game not found" });

    // Evaluar las manos de los jugadores
    await evaluatePlayerHands(game);

    // Manejar el lance actual basado en el estado del juego
    const currentLance =
      game.state.split("decide")[1]?.toLowerCase() || "grande";
    await handleLance(game, currentLance);

    // Responder al cliente con el resultado
    res.status(200).json({
      message: "Hands evaluated and lance handled successfully",
      winners: game.winners,
      gameState: game.state,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manejar el "mus" (descartar y robar cartas)
exports.handleMus = async (req, res) => {
  try {
    const { gameId, playerId, action, cardsToDiscard } = req.body; // `action` es "mus" o "no mus"
    const game = await Game.findById(gameId).populate("players hand");

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const player = game.players.find((p) => p._id.toString() === playerId);

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (action === "no mus") {
      game.state = "decideGrande"; // Cambiamos el estado del juego para comenzar el primer lance
      await game.save();
      return res
        .status(200)
        .json({ message: "Mus stopped, game proceeds to lances." });
    }

    // Si el jugador elige "mus", permite descartar y robar nuevas cartas
    if (action === "mus") {
      // Eliminar las cartas descartadas de la mano del jugador
      player.hand = player.hand.filter(
        (card) => !cardsToDiscard.includes(card._id.toString())
      );

      // Robar nuevas cartas del mazo
      const newCards = Deck.drawCards(cardsToDiscard.length);
      player.hand.push(...newCards);

      await player.save();

      // Actualizamos el estado del juego
      const allPlayersWantMus = game.players.every(
        (p) => p.isTurn && !p.hasFolded
      );

      if (allPlayersWantMus) {
        // Todos los jugadores han pedido "mus", se reparten nuevas cartas
        return res
          .status(200)
          .json({ message: "All players chose mus, new cards drawn." });
      } else {
        return res
          .status(200)
          .json({ message: "Player chose mus, waiting for other players." });
      }
    }

    res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manejar apuestas
exports.handleBetting = async (req, res) => {
  try {
    const { gameId, playerId, action, betAmount } = req.body; // `action` puede ser "envido", "quiero", "no quiero", "órdago"
    const game = await Game.findById(gameId).populate("players");

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const player = game.players.find((p) => p._id.toString() === playerId);

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    switch (action) {
      case "envido":
        player.bet += betAmount;
        await player.save();
        return res.status(200).json({
          message: `Player ${player.name} envido ${betAmount} stones.`,
        });

      case "quiero":
        // Continuamos el juego y determinamos el ganador en el siguiente lance
        return res
          .status(200)
          .json({ message: "Bet accepted, continuing the game." });

      case "no quiero":
        // El jugador que apostó gana las piedras apostadas
        const opponent = game.players.find(
          (p) => p._id.toString() !== playerId
        );
        opponent.points += player.bet;
        await opponent.save();

        return res
          .status(200)
          .json({ message: "Bet rejected, opponent wins the bet." });

      case "órdago":
        // Manejar el órdago
        const opponentPlayer = game.players.find(
          (p) => p._id.toString() !== playerId
        );

        if (opponentPlayer) {
          opponentPlayer.points += 40; // Si el órdago es aceptado y perdido, el oponente gana las 40 piedras
          await opponentPlayer.save();
        }

        game.state = "finished"; // El juego se termina si alguien acepta un órdago
        await game.save();

        return res
          .status(200)
          .json({ message: "Órdago accepted, game finished." });

      default:
        return res.status(400).json({ error: "Invalid betting action." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
