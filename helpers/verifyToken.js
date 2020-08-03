const jwt = require("jsonwebtoken");
const CONSTANTS = require(".././CONSTANTS");

module.exports = function (req, res, next) {
	// Getting token from req
	const token = req.header("auth-token");

	// Responding with 401 if no token present
	if (token === null || token === undefined) {
		res.status(401).json({ error: "please log in" });
	}

	try {
		const verified = jwt.verify(token, CONSTANTS.auth.JWT_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.status(400).json({ error: `Auth error: ${err}` });
	}
};
