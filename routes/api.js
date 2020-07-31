const express = require("express");
const router = express.Router();

/**
 * Ping route to check connecton with backend
 */

router.get("/ping", (req, res) => {
	res.json({ success: "Pong" });
});

/**
 * Create application route
 */

router.post("/create/application", (req, res) => {
	// TODO
});

module.exports = router;
