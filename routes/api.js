const express = require("express");
const router = express.Router();
const db = require("../helpers/db");

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
	// Store for validation errors
	let validationErrors = [];

	// Extracint required values from body object
	const applicationtitle = req.body.applicationtitle;
	const applicationemployer = req.body.applicationemployer;
	const applicationlink = req.body.applicationlink;

	// Validating required fields
	if (applicationtitle === null || applicationtitle === undefined) {
		validationErrors.push(
			"Request body must contain applicationtitle field. Cannot be null"
		);
	}
	if (applicationemployer === null || applicationemployer === undefined) {
		validationErrors.push(
			"Request body must contain applicationemployer field. Cannot be null"
		);
	}
	if (applicationlink === undefined) {
		validationErrors.push(
			"Request body must contain applicationlink field. May be null"
		);
	}

	// Responding with validations errors (if any)
	if (validationErrors.length !== 0) {
		res.status(400).json({ error: validationErrors });
	}

	// Attempting to create record in DB
	db.createApplication(applicationtitle, applicationemployer, applicationlink)
		.then((confirm) => {
			// Returning success if no error
			if (confirm.error === null) {
				res.json({ success: true, applicationid: confirm.app_id });
			} else {
				res.status(500).json({ success: false, error: confirm.error });
			}
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: confirm.error });
		});
});

module.exports = router;
