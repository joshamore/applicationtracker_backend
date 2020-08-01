const express = require("express");
const router = express.Router();
const db = require("../helpers/db");
const CONSTANTS = require("../CONSTANTS");

/**
 * Ping route to check connecton with backend
 */

router.get("/ping", (req, res) => {
	res.json({ success: "Pong" });
});

/**
 * Create application route
 */

router.post("/application", (req, res) => {
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
			res.status(500).json({ success: false, error: err });
		});
});

/**
 * Update an existing application
 */

router.put("/application", (req, res) => {
	let validationErrors = [];

	// Extracint required values from body object
	const id = req.body.id;
	const applicationtitle = req.body.applicationtitle;
	const applicationemployer = req.body.applicationemployer;
	const applicationlink = req.body.applicationlink;

	// Validating required fields
	if (id === null || id === undefined) {
		validationErrors.push(
			"Request body must contain id field. This cannot be null"
		);
	}
	if (applicationtitle === undefined) {
		validationErrors.push(
			"Request body must contain applicationtitle field. This may be null"
		);
	}
	if (applicationemployer === undefined) {
		validationErrors.push(
			"Request body must contain applicationemployer field. This may be null"
		);
	}
	if (applicationlink === undefined) {
		validationErrors.push(
			"Request body must contain applicationlink field. This may be null"
		);
	}

	// Responding with errors (if any)
	if (validationErrors.length !== 0) {
		res.status(400).json({ error: validationErrors });
	}

	db.updateApplication(
		id,
		applicationtitle,
		applicationemployer,
		applicationlink
	)
		.then((confirm) => {
			res.json(confirm);
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: err });
		});
});

/**
 * Get applications for user route
 */

router.get("/application/all", (req, res) => {
	// TODO: currently using UUID from constants but will come from logged in user
	db.getApplications(CONSTANTS.testing.auth_user_uuid)
		.then((applications) => {
			if (applications.error === null) {
				res.json(applications);
			} else {
				res.status(500).json({ success: false, error: applications.error });
			}
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: err });
		});
});

/**
 * Delete an application
 */

router.delete("/application", (req, res) => {
	// Validating ID has been provided
	if (req.query.id === null || req.query.id === undefined) {
		res.status(400).json({ Error: "id param required" });
	}

	db.deleteApplication(req.query.id)
		.then((confirm) => {
			if (confirm === req.query.id) {
				res.json({ success: true, error: null });
			} else {
				res.status(500).json({ success: false, error: confirm.error });
			}
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: err });
		});
});

module.exports = router;
