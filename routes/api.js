const express = require("express");
const router = express.Router();
const db = require("../helpers/db");
const CONSTANTS = require("../CONSTANTS");
const verify = require("../helpers/verifyToken");

/**
 * Ping route to check connecton with backend
 */

router.get("/ping", (req, res) => {
	res.json({ success: "Pong" });
});

/**
 * Privte Ping route to check connecton with backend
 */

router.get("/pping", verify, (req, res) => {
	res.json({ success: "Pong" });
});

/**
 * Create application route
 */

router.post("/application", verify, (req, res) => {
	// Current user ID
	const userID = req.user.id;

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
	db.createApplication(
		userID,
		applicationtitle,
		applicationemployer,
		applicationlink
	)
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

router.put("/application", verify, (req, res) => {
	// Current user
	const userID = req.user.id;

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

	// Performing update
	db.updateApplication(
		userID,
		id,
		applicationtitle,
		applicationemployer,
		applicationlink
	)
		.then((confirm) => {
			if (confirm.error === null || confirm.error === undefined) {
				res.json(confirm);
			} else {
				res.status(500).json({ error: confirm.error });
			}
		})
		.catch((err) => {
			// If update failed, responding with error
			res.status(500).json({ error: err });
		});
});

/**
 * Get a single application for user route
 */

router.get("/application", verify, (req, res) => {
	// Validating that an ID was provided
	if (req.query.id === null || req.query.id === undefined) {
		res.status(400).json({ Error: "id param required" });
	}

	// Current user
	const userID = req.user.id;

	// Backend log
	console.log(`GETTING APPLICATION FOR USER: ${userID}`);

	// Attempting to get applicaton for the user
	db.getSingleApplication(req.query.id, userID)
		.then((application) => {
			if (application.error === null) {
				// If no record found, returning 400
				if (application.length === 0) {
					console.log(
						`APPLICATION ${req.query.id} DOES NOT EXIST FOR ${userID}`
					);
					res.status(400).json({
						success: false,
						error: `Application ${req.query.id} does not exist for this user`,
					});
				}

				// Backend log
				console.log(`GOT APPLICATION FOR USER: ${userID}`);

				// Setting success to true
				application.success = true;

				// Responding with application record
				res.json(application);
			} else {
				// Backend log
				console.log(
					`FAILED TO GET APPLICATION ${req.query.id} FOR USER ${userID}. ERROR: ${application.error}`
				);

				// Responding with 500 and error
				res.status(500).json({ success: false, error: application.error });
			}
		})
		.catch((err) => {
			// Backend log
			console.log(
				`FAILED TO GET APPLICATION ${req.query.id} FOR USER ${userID}. ERROR: ${err}`
			);

			// Responding with error
			res.status(500).json({ success: false, error: err });
		});
});

/**
 * Get applications for user route
 */

router.get("/application/all", verify, (req, res) => {
	// Current user
	const userID = req.user.id;

	// Backend log
	console.log(`GETTING APPLICATIONS FOR USER: ${userID}`);

	// Getting applications for the logged in user
	db.getApplications(userID)
		.then((applications) => {
			if (applications.error === null) {
				// Backend log
				console.log(`GOT APPLICATIONS FOR USER: ${userID}`);

				// Returning applications
				res.json(applications);
			} else {
				// Backend log
				console.log(`UNABLE TO GET APPLICATIONS FOR USER: ${userID}`);

				// Responding with 500 if error getting applications
				res.status(500).json({ success: false, error: applications.error });
			}
		})
		.catch((err) => {
			// Backend log
			console.log(`UNABLE TO GET APPLICATIONS FOR USER: ${userID}`);

			// Responding with 500 if error getting applications
			res.status(500).json({ success: false, error: err });
		});
});

/**
 * Delete an application
 */

router.delete("/application", verify, (req, res) => {
	// Validating ID has been provided
	if (req.query.id === null || req.query.id === undefined) {
		res.status(400).json({ Error: "id param required" });
	}

	// Current user
	const userID = req.user.id;

	// Performing delete (this is a status delete not a true delete)
	db.deleteApplication(userID, req.query.id)
		.then((confirm) => {
			if (confirm === req.query.id) {
				// Backend log
				console.log(
					`SET RECORDSTATE TO DELETED FOR APP: ${req.query.id} USER: ${user}`
				);

				// Respond with success
				res.json({ success: true, error: null });
			} else {
				// Backend log
				console.log(
					`UNABLE TO UPDATE RECORDSTATE TO DELETED FOR APP: ${req.query.id} USER: ${user}`
				);
				res.status(500).json({ success: false, error: confirm.error });
			}
		})
		.catch((err) => {
			// Backend log
			console.log(
				`UNABLE TO UPDATE RECORDSTATE TO DELETED FOR APP: ${req.query.id} USER: ${user}`
			);
			res.status(500).json({ success: false, error: err });
		});
});

/**
 * Get application items for a user route
 */

router.get("/application/item/all", verify, (req, res) => {
	// Current user
	const userID = req.user.id;

	// Storing application ID
	const applicationID = req.query.id;

	// Validating that an ID was provided
	if (req.query.id === null || req.query.id === undefined) {
		res.status(400).json({
			Error:
				"id param required and must contain id of an application for the current user",
		});

		return;
	}

	// Backend log
	console.log(`GETTING APPLICATION ITEMS FOR USER: ${userID}`);

	db.getApplicationItems(userID, applicationID)
		.then((confirm) => {
			if (!confirm) {
				// Backend log
				console.log(
					`NO APPLICATION ITEMS FOR USER: ${userID} APPLICATION: ${applicationID}`
				);

				res.json([]);
				return;
			} else {
				// Backend log
				console.log(
					`GOT APPLICATION ITEMS FOR USER: ${userID} APPLICATION: ${applicationID}`
				);

				res.json(confirm);
				return;
			}
		})
		.catch((err) => {
			// Backend log
			console.log(
				`ERROR GETTING APPLICATION ITEMS FOR USER: ${userID}` +
					`APPLICATION: ${applicationID} ERROR: ${err}`
			);

			res.status(500).json({ success: false, error: err });
			return;
		});
});

/**
 * Create application item for an application route
 */

router.post("/application/item", verify, (req, res) => {
	// Current user
	const userID = req.user.id;

	// Storing application ID
	const applicationID = req.body.applicationID;
	const itemContent = req.body.itemContent;
	const itemTimestamp = null;

	// Backend log
	console.log(`CREATING APPLICATION ITEM FOR USER: ${userID}`);

	db.createApplicationItem(userID, applicationID, itemContent, itemTimestamp)
		.then((confirm) => {
			if (confirm.item_id === null || confirm.item_id === undefined) {
				// Backend log
				console.log(
					`NO APPLICATION ITEMS FOR USER: ${userID} APPLICATION: ${applicationID}`
				);

				res.json(null);
				return;
			} else {
				// Backend log
				console.log(
					`GOT APPLICATION ITEMS FOR USER: ${userID} APPLICATION: ${applicationID}`
				);

				res.json(confirm);
				return;
			}
		})
		.catch((err) => {
			// Backend log
			console.log(
				`ERROR GETTING APPLICATION ITEMS FOR USER: ${userID}` +
					`APPLICATION: ${applicationID} ERROR: ${err}`
			);

			res.status(500).json({ success: false, error: err });
			return;
		});
});

// TODO: update and delete route for applicaion items

module.exports = router;
