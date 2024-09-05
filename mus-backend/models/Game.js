const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // Jugadores en la partida
  state: {
    type: String,
    enum: [
      "waiting",
      "dealing",
      "mus",
      "grande",
      "chica",
      "decidePares",
      "pares",
      "decideJuego",
      "juego",
      "punto",
      "finished",
    ],
    default: "waiting",
  },
  pot: { type: Number, default: 0 }, //Total de puntos acumulados o opostados durante la ronda para repartir
  totalSets: { type: Number, default: 0 }, //Numero de rondas para ganar
  currentTurn: { type: String }, // Nombre del jugador con el turno actual
  deck: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }], // Cartas restantes en el mazo
  settings: {
    allowSeñas: { type: Boolean, default: true }, // Configuración de señas
    reactionSpeed: { type: Number, default: 1 }, // Velocidad de reacción (1 a 5)
  },
  gameMode: {
    type: String,
    enum: ["quickMatch", "multiplayer", "singleplayer"],
    required: true,
  },
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // Ganador de la partida
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Game", gameSchema);
