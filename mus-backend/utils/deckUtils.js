// utils/deckUtils.js

// Importación de los enums
const {
  DuplexScore,
  MediasScore,
  ParejasScore,
  JuegoScore,
  GrandeScore,
  ChicaScore,
} = require("./score");

// Función para evaluar "Grande"
const evaluateGrande = (hand) => {
  let total = 0;
  hand.forEach((card) => {
    switch (card.rank) {
      case 12:
      case 3:
        total += GrandeScore.GRANDE_REYES;
        break;
      case 11:
        total += GrandeScore.GRANDE_CABALLOS;
        break;
      case 10:
        total += GrandeScore.GRANDE_SOTAS;
        break;
      case 7:
        total += GrandeScore.GRANDE_SIETES;
        break;
      case 6:
        total += GrandeScore.GRANDE_SEISES;
        break;
      case 5:
        total += GrandeScore.GRANDE_CINCOS;
        break;
      case 4:
        total += GrandeScore.GRANDE_CUATROS;
        break;
      case 2:
      case 1:
        total += GrandeScore.GRANDE_PITOS;
        break;
      default:
        total += card.rank;
    }
  });
  return total;
};

// Función para evaluar "Chica"
const evaluateChica = (hand) => {
  let total = 0;
  hand.forEach((card) => {
    switch (card.rank) {
      case 1:
      case 2:
        total += ChicaScore.CHICA_PITOS;
        break;
      case 4:
        total += ChicaScore.CHICA_CUATROS;
        break;
      case 5:
        total += ChicaScore.CHICA_CINCOS;
        break;
      case 6:
        total += ChicaScore.CHICA_SEISES;
        break;
      case 7:
        total += ChicaScore.CHICA_SIETES;
        break;
      case 10:
        total += ChicaScore.CHICA_SOTAS;
        break;
      case 11:
        total += ChicaScore.CHICA_CABALLOS;
        break;
      case 12:
      case 3:
        total += ChicaScore.CHICA_REYES;
        break;
      default:
        total += card.rank;
    }
  });
  return total;
};

// Función para evaluar "Pares"
const evaluatePares = (hand) => {
  const cardsRank = hand.map((card) => card.rank).sort((a, b) => a - b);
  const countCardsByNumber = (cards, number) =>
    cards.filter((card) => card === number).length;

  const numReyes =
    countCardsByNumber(cardsRank, 12) + countCardsByNumber(cardsRank, 3);
  const numCaballos = countCardsByNumber(cardsRank, 11);
  const numSotas = countCardsByNumber(cardsRank, 10);
  const numSietes = countCardsByNumber(cardsRank, 7);
  const numSeises = countCardsByNumber(cardsRank, 6);
  const numCincos = countCardsByNumber(cardsRank, 5);
  const numCuatros = countCardsByNumber(cardsRank, 4);
  const numPitos =
    countCardsByNumber(cardsRank, 2) + countCardsByNumber(cardsRank, 1);

  if (numReyes === 4) return DuplexScore.DUPLEX_REYES;
  if (numReyes === 2 && numCaballos === 2)
    return DuplexScore.DUPLEX_REYES_CABALLOS;
  if (numReyes === 2 && numSotas === 2) return DuplexScore.DUPLEX_REYES_SOTAS;
  if (numReyes === 2 && numSietes === 2) return DuplexScore.DUPLEX_REYES_SIETES;
  if (numReyes === 2 && numSeises === 2) return DuplexScore.DUPLEX_REYES_SEISES;
  if (numReyes === 2 && numCincos === 2) return DuplexScore.DUPLEX_REYES_CINCOS;
  if (numReyes === 2 && numCuatros === 2)
    return DuplexScore.DUPLEX_REYES_CUATROS;
  if (numReyes === 2 && numPitos === 2) return DuplexScore.DUPLEX_REYES_PITOS;

  if (numCaballos === 4) return DuplexScore.DUPLEX_CABALLOS;
  if (numCaballos === 2 && numSotas === 2)
    return DuplexScore.DUPLEX_CABALLOS_SOTAS;
  if (numCaballos === 2 && numSietes === 2)
    return DuplexScore.DUPLEX_CABALLOS_SIETES;
  if (numCaballos === 2 && numSeises === 2)
    return DuplexScore.DUPLEX_CABALLOS_SEISES;
  if (numCaballos === 2 && numCincos === 2)
    return DuplexScore.DUPLEX_CABALLOS_CINCOS;
  if (numCaballos === 2 && numCuatros === 2)
    return DuplexScore.DUPLEX_CABALLOS_CUATROS;
  if (numCaballos === 2 && numPitos === 2)
    return DuplexScore.DUPLEX_CABALLOS_PITOS;

  if (numSotas === 4) return DuplexScore.DUPLEX_SOTAS;
  if (numSotas === 2 && numSietes === 2) return DuplexScore.DUPLEX_SOTAS_SIETES;
  if (numSotas === 2 && numSeises === 2) return DuplexScore.DUPLEX_SOTAS_SEISES;
  if (numSotas === 2 && numCincos === 2) return DuplexScore.DUPLEX_SOTAS_CINCOS;
  if (numSotas === 2 && numCuatros === 2)
    return DuplexScore.DUPLEX_SOTAS_CUATROS;
  if (numSotas === 2 && numPitos === 2) return DuplexScore.DUPLEX_SOTAS_PITOS;

  if (numSietes === 4) return DuplexScore.DUPLEX_SIETES;
  if (numSietes === 2 && numSeises === 2)
    return DuplexScore.DUPLEX_SIETES_SEISES;
  if (numSietes === 2 && numCincos === 2)
    return DuplexScore.DUPLEX_SIETES_CINCOS;
  if (numSietes === 2 && numCuatros === 2)
    return DuplexScore.DUPLEX_SIETES_CUATROS;
  if (numSietes === 2 && numPitos === 2) return DuplexScore.DUPLEX_SIETES_PITOS;

  if (numSeises === 4) return DuplexScore.DUPLEX_SEISES;
  if (numSeises === 2 && numCincos === 2)
    return DuplexScore.DUPLEX_SEISES_CINCOS;
  if (numSeises === 2 && numCuatros === 2)
    return DuplexScore.DUPLEX_SEISES_CUATROS;
  if (numSeises === 2 && numPitos === 2) return DuplexScore.DUPLEX_SEISES_PITOS;

  if (numCincos === 4) return DuplexScore.DUPLEX_CINCOS;
  if (numCincos === 2 && numCuatros === 2)
    return DuplexScore.DUPLEX_CINCOS_CUATROS;
  if (numCincos === 2 && numPitos === 2) return DuplexScore.DUPLEX_CINCOS_PITOS;

  if (numCuatros === 4) return DuplexScore.DUPLEX_CUATROS;
  if (numCuatros === 2 && numPitos === 2)
    return DuplexScore.DUPLEX_CUATROS_PITOS;

  if (numPitos === 4) return DuplexScore.DUPLEX_PITOS;

  // Medias o trios
  if (numReyes === 3) return MediasScore.MEDIAS_REYES;
  if (numCaballos === 3) return MediasScore.MEDIAS_CABALLOS;
  if (numSotas === 3) return MediasScore.MEDIAS_SOTAS;
  if (numSietes === 3) return MediasScore.MEDIAS_SIETES;
  if (numSeises === 3) return MediasScore.MEDIAS_SEISES;
  if (numCincos === 3) return MediasScore.MEDIAS_CINCOS;
  if (numCuatros === 3) return MediasScore.MEDIAS_CUATROS;
  if (numPitos === 3) return MediasScore.MEDIAS_PITOS;

  // Pares simples
  if (numReyes === 2) return ParejasScore.PAREJA_REYES;
  if (numCaballos === 2) return ParejasScore.PAREJA_CABALLOS;
  if (numSotas === 2) return ParejasScore.PAREJA_SOTAS;
  if (numSietes === 2) return ParejasScore.PAREJA_SIETES;
  if (numSeises === 2) return ParejasScore.PAREJA_SEISES;
  if (numCincos === 2) return ParejasScore.PAREJA_CINCOS;
  if (numCuatros === 2) return ParejasScore.PAREJA_CUATROS;
  if (numPitos === 2) return ParejasScore.PAREJA_PITOS;

  return 0;
};

// Función para evaluar "Juego"
const evaluateJuego = (hand) => {
  let total = 0;
  let juego = 0;
  hand.forEach((card) => {
    juego += card.value;
  });

  switch (juego) {
    case 31:
      total += ChicaScore.TREINTA_Y_UNO;
      break;
    case 32:
      total += ChicaScore.TREINTA_Y_DOS;
      break;
    case 40:
      total += ChicaScore.CUARENTA;
      break;
    case 39:
      total += ChicaScore.TREINTA_Y_NUEVE;
      break;
    case 38:
      total += ChicaScore.TREINTA_Y_OCHO;
      break;
    case 37:
      total += ChicaScore.TREINTA_Y_SIETE;
      break;
    case 36:
      total += ChicaScore.TREINTA_Y_SEIS;
      break;
    case 35:
      total += ChicaScore.TREINTA_Y_CINCO;
      break;
    case 34:
      total += ChicaScore.TREINTA_Y_CUATRO;
      break;
    case 33:
      total += JuegoScore.TREINTA_Y_TRES;
      break;
    default:
      total += 0;
  }
  return total;
};

const evaluatePunto = (hand) => {
  let punto = 0;
  hand.forEach((card) => {
    punto += card.value;
  });
  return punto;
};

// Exportación de funciones
module.exports = {
  evaluateGrande,
  evaluateChica,
  evaluatePares,
  evaluateJuego,
  evaluatePunto,
};
