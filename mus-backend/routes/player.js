const express = require("express");
const playerController = require("../controllers/playerController");

const router = express.Router();

router.post("/join", playerController.joinGame);

module.exports = router;
