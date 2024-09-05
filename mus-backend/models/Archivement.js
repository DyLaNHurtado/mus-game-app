const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  criteria: { type: String, required: true }, // Descripción de cómo se desbloquea el logro
  unlockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Usuarios que han desbloqueado este logro
  points: { type: Number, default: 0 }, // Puntos otorgados por desbloquear
});

module.exports = mongoose.model("Achievement", achievementSchema);
