//sockets/socket.js
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export const joinGame = (gameId) => {
  socket.emit("joinGame", gameId);
};

export const makeMove = (gameId, playerName, move) => {
  socket.emit("makeMove", { gameId, playerName, move });
};

export const placeBet = (gameId, playerName, betAmount) => {
  socket.emit("bet", { gameId, playerName, betAmount });
};

export const startGame = (gameId) => {
  socket.emit("startGame", { gameId });
};

socket.on("moveMade", (data) => {
  console.log("Move made:", data);
});

socket.on("betPlaced", (data) => {
  console.log("Bet placed:", data);
});

socket.on("gameStarted", (game) => {
  console.log("Game started:", game);
});

socket.on("error", (error) => {
  console.error("Error:", error);
});
