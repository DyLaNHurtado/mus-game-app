//app.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/games", require("./routes/game"));

// Manejo de errores
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Socket.io para manejo de eventos en tiempo real
const {
  handleMove,
  handleBet,
  handleGameStart,
} = require("./sockets/gameSockets");

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    io.to(gameId).emit("message", "A new player has joined the game");
  });

  socket.on("makeMove", (data) => handleMove(io, data));
  socket.on("bet", (data) => handleBet(io, data));
  socket.on("startGame", (data) => handleGameStart(io, data));

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
