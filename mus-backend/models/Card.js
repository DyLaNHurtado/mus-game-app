const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  suit: {
    type: String,
    enum: ["oros", "copas", "espadas", "bastos"],
    required: true,
  }, // Palo de la carta
  rank: {
    type: String,
    enum: ["1", "2", "3", "4", "5", "6", "7", "10", "11", "12"],
    required: true,
  }, // Valor de la carta
  value: { type: Number, required: true }, // Valor numérico de la carta para cálculo
});

module.exports = mongoose.model("Card", cardSchema);
