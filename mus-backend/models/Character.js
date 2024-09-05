const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  atrevido: { type: Number, min: 1, max: 5, default: 3 }, // Nivel de atrevimiento
  faroleo: { type: Number, min: 1, max: 5, default: 3 }, // Capacidad de farolear
  cazaSeñas: { type: Number, min: 1, max: 5, default: 3 }, // Capacidad para captar señas
  cortaMus: { type: Number, min: 1, max: 5, default: 3 }, // Frecuencia con la que corta el mus
  descartes: { type: Number, min: 1, max: 5, default: 3 }, // Inteligencia al descartar cartas
  interactividad: { type: Number, min: 1, max: 5, default: 3 }, // Nivel de interacción con otros jugadores
});

module.exports = mongoose.model("Character", characterSchema);
