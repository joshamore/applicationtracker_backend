const jwt = require("jsonwebtoken");
const CONSTANTS = require(".././CONSTANTS");

/**
 * Verifies a JWT token
 */

module.exports = function (req, res, next) {
	// Getting token from req
	const token = req.header("auth-token");

	// Responding with 401 if no token present
	if (token === null || token === undefined) {
		res.status(400).json({ error: "not logged in" });
	}

	try {
		// If verification possible, adding to req and calling next middleware
		const verified = jwt.verify(token, CONSTANTS.auth.JWT_SECRET);
		req.user = verified;
	} catch (err) {
		// If token can't be verified, responding with error
		res.status(400).json({ error: `Auth error: ${err}` });
	}

	next();
};
