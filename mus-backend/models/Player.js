const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hand: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }], // Referencia a cartas en mano
  bet: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  isTurn: { type: Boolean, default: false },
  hasFolded: { type: Boolean, default: false }, //Ha pasado y no juega
  handValue: { type: Number, default: 0 },
  grandeValue: { type: Number, default: 0 },
  chicaValue: { type: Number, default: 0 },
  paresValue: { type: Number, default: 0 },
  juegoValue: { type: Number, default: 0 },
  puntoValue: { type: Number, default: 0 },
  character: { type: mongoose.Schema.Types.ObjectId, ref: "Character" }, // En caso de ser IA
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // En caso de ser un jugador humano
  score: { type: Number, default: 0 }, // Puntuación en la partida actual
});

module.exports = mongoose.model("Player", playerSchema);
