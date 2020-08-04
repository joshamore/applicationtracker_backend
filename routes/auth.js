const express = require("express");
const router = express.Router();
const db = require("../helpers/db");
const CONSTANTS = require("../CONSTANTS");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../helpers/verifyToken");

/**
 * Register Route
 */

router.post("/register", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstname;
	const lastName = req.body.lastname;

	let valErrors = [];

	// Validating provided fields
	if (email === null || email === undefined) {
		valErrors.push("email field required. This cannot be null");
	}
	if (password === null || password === undefined) {
		valErrors.push("password field required. This cannot be null");
	}
	if (firstName === null || firstName === undefined) {
		valErrors.push("firstname field required. This cannot be null");
	}
	if (lastName === null || lastName === undefined) {
		valErrors.push("lastname field required. This cannot be null");
	}
	if (password.length <= 8) {
		valErrors.push("Password must contain at least 9 characters");
	}
	if (!email.includes("@")) {
		valErrors.push("Email address must be valid");
	}

	// Returning with 400 response if errors present
	if (valErrors.length > 0) {
		res.status(400).json({ error: valErrors });
	}

	try {
		// Checking if email already in use
		let emailExists = await db.emailExists(email);

		// If user already exists, returning with 400 error
		if (emailExists) {
			res.status(400).json({ error: "email address already in use" });
		}

		// Attempting to create new user
		let createUser = await db.createUser(email, password, firstName, lastName);

		// If user created, returning with 200
		if (createUser.error === null || createUser.error === undefined) {
			res.json({
				success: true,
				userid: createUser,
			});
		} else {
			res.status(500).json({ error: createUser.error });
		}
	} catch (err) {
		res.status(500).json({ error: err });
	}
});

/**
 * Login Route
 */

router.post("/login", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	let valErrors = [];

	// Validating provided fields
	if (email === null || email === undefined) {
		valErrors.push("email field required. This cannot be null");
	}
	if (password === null || password === undefined) {
		valErrors.push("password field required. This cannot be null");
	}

	// Returning with 400 response if errors present
	if (valErrors.length > 0) {
		res.status(400).json({ error: valErrors });
	}

	try {
		// Getting password hash
		let getPasswordHash = await db.getPasswordHash(email);

		// Responding if email address unknown
		if (getPasswordHash.unknown === true) {
			res.status(400).json({ error: "email address does not exist" });
		}

		// Storing password hash and user ID
		let passwordHash = getPasswordHash.password_hash;
		let userID = getPasswordHash.user_id;

		// Checking hash
		const validPassword = await bcrypt.compare(password, passwordHash);

		// Responding with error is password incorrect
		if (!validPassword) {
			res.status(400).json({ error: "password incorrect" });
		}

		// Creating JSONWEBTOKEN
		const token = jwt.sign({ id: userID }, CONSTANTS.auth.JWT_SECRET, {
			expiresIn: "24h",
		});

		// Returning token
		res.header("auth-token", token).json({ token: token });
	} catch (err) {
		console.error(`login error: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
});

/**
 * Check token validity route
 */
router.get("/check", verify, (req, res) => {
	res.json({ auth: true });
});

module.exports = router;
