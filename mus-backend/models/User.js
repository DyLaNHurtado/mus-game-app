const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 }, // Puntuación total acumulada
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Achievement" }], // Logros desbloqueados
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
