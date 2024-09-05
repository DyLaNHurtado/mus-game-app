//routes/game.js
const express = require("express");
const gameController = require("../controllers/gameController");
const roundController = require("../controllers/roundController");

const router = express.Router();

router.post("/create", gameController.createGame);
router.post("/:id/start", gameController.startGame);
router.get("/:id", gameController.getGame);
router.post("/:id/move", roundController.makeMove);
router.post("/:id/evaluate", roundController.evaluateHands);

module.exports = router;
