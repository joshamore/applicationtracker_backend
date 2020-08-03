const express = require("express");
const router = express.Router();
const db = require("../helpers/db");
const CONSTANTS = require("../CONSTANTS");
const bcrypt = require("bcryptjs");

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
		valErrors.push("firstName field required. This cannot be null");
	}
	if (lastName === null || lastName === undefined) {
		valErrors.push("lastName field required. This cannot be null");
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
		// Getting password has
		let passwordHash = await db.getPasswordHash(email);

		// Responding if email address unknown
		if (passwordHash.unknown === true) {
			res.status(400).json({ error: "email address does not exist" });
		}

		// Checking hash
		const validPassword = await bcrypt.compare(password, passwordHash);

		if (!validPassword) {
			res.status(400).json({ error: "password incorrect" });
		}

		// TODO: JWT stuff from here
		res.send("GOOD! But no auth stuff yet");
	} catch (err) {
		res.status(500).json({ error: err });
	}
});

module.exports = router;
