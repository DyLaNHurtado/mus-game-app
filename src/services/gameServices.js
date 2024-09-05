import axios from "../axios";

// Crear un nuevo juego
export const createGame = (players) => {
  return axios.post("/games", { players });
};

// Iniciar un juego
export const startGame = (gameId) => {
  return axios.post(`/games/${gameId}/start`);
};

// Hacer una jugada
export const makeMove = (gameId, playerName, move) => {
  return axios.post(`/games/${gameId}/moves`, { playerName, ...move });
};

// Obtener el estado del juego
export const getGameStatus = (gameId) => {
  return axios.get(`/games/${gameId}`);
};
