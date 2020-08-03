const { Pool } = require("pg");
const CONSTANTS = require("../CONSTANTS");
const bcrypt = require("bcryptjs");

// Setting DB connection string for node-postgres library
const connectionString = CONSTANTS.database.connection_string;

// Setting pool query instance
const pool = new Pool({
	connectionString: connectionString,
});

module.exports = {
	/**
	 * Create a job application record.
	 *
	 * Returns: ID of new applications record.
	 */
	createApplication: async function (apptitle, appemployer, applink) {
		// Setting DB query
		// TODO: Need to use a real auth user in prod
		const query = {
			text: `
                INSERT INTO applications (app_user, app_title, app_employer, app_link)
                VALUES ($1, $2, $3, $4)
                RETURNING app_id
                `,
			values: [
				CONSTANTS.testing.auth_user_uuid,
				apptitle,
				appemployer,
				applink,
			],
		};

		// Creating new record in the applications table
		try {
			const confirm = await pool.query(query);

			// Setting error to null
			let confirmResponse = confirm.rows[0];
			confirmResponse.error = null;

			// Returning first row (contains an object with app_id as key)
			return confirmResponse;
		} catch (err) {
			console.error(`createApplication error: ${err}`);
			// returning error
			return { error: err };
		}
	},

	/**
	 * Update an existing application record
	 */
	updateApplication: async function (appID, appTitle, appEmployer, appLink) {
		try {
			// Getting application original state
			const appOriginal = await this.getSingleApplication(appID);

			// Updating params to original values if null
			appTitle = appTitle === null ? appOriginal.app_title : appTitle;
			appEmployer =
				appEmployer === null ? appOriginal.app_employer : appEmployer;
			appLink = appLink === null ? appOriginal.app_link : appLink;

			// Building query
			const query = {
				text: `
					UPDATE
						applications
					SET
						app_title = $1,
						app_employer = $2,
						app_link = $3
					WHERE
						app_id = $4
					RETURNING
						*
					`,
				values: [appTitle, appEmployer, appLink, appID],
			};

			const record = await pool.query(query);

			// Returning updated record
			return record.rows[0];
		} catch (err) {
			console.error(err);
			return { error: err };
		}
	},

	/**
	 * Get applications for a user
	 */
	getApplications: async function (user) {
		// Setting query
		const query = {
			text: "SELECT * FROM applications WHERE app_user = $1",
			values: [user],
		};

		try {
			// Attempting to get application records for user
			const records = await pool.query(query);

			let applications = records.rows;
			applications.error = null;

			return applications;
		} catch (err) {
			console.error(`getApplications error: ${err}`);
			// returning error
			return { error: err };
		}
	},

	/**
	 * Get a single application based on application ID
	 */
	getSingleApplication: async function (appID) {
		// Setting query
		const query = {
			text: "SELECT * FROM applications WHERE app_id = $1",
			values: [appID],
		};

		try {
			// Attempting to get application record
			const record = await pool.query(query);

			let application = record.rows[0];
			application.error = null;

			return application;
		} catch (err) {
			console.error(`getApplications error: ${err}`);
			// returning error
			return { error: err };
		}
	},

	/**
	 * Delete an application for a user
	 */
	deleteApplication: async function (application) {
		// Setting query
		const query = {
			text:
				"UPDATE applications SET app_recordstate = $1 WHERE app_id = $2 RETURNING app_id",
			values: [CONSTANTS.recordstates.deleted, application],
		};

		try {
			// Attempting DB update
			const confirm = await pool.query(query);

			if (
				confirm.rows[0].app_id !== null ||
				confirm.rows[0].app_id !== undefined
			) {
				return application;
			} else {
				throw Error("Unknown confirmation");
			}
		} catch (err) {
			console.error(`deleteApplication error: ${err}`);
			// returning error
			return { error: err };
		}
	},

	/**
	 * Checking if an email address already exists in DB
	 */
	emailExists: async function (email) {
		// Setting query
		const query = {
			text: "SELECT * FROM users WHERE email=$1",
			values: [email],
		};

		try {
			// Attempting DB update
			const confirm = await pool.query(query);

			if (confirm.rows.length === 0) {
				return false;
			} else {
				return true;
			}
		} catch (err) {
			console.error(`emailExists error: ${err}`);
			// returning error
			return { error: err };
		}
	},

	/**
	 * Create user record in DB
	 */
	createUser: async function (email, password, firstName, lastName) {
		// Hashing password
		const salt = await bcrypt.genSalt(10);
		const paswordHash = await bcrypt.hash(password, salt);

		// Setting query
		const query = {
			text: `
				INSERT INTO users (first_name, last_name, email, password_hash)
				VALUES ($1, $2, $3, $4)
				RETURNING user_id
			`,
			values: [firstName, lastName, email, paswordHash],
		};

		try {
			// Attempting DB update
			const confirm = await pool.query(query);

			// Checking if insertion successful
			if (confirm.rows === null || confirm.rows === undefined) {
				throw Error("Unknown error when creating user");
			} else if (
				confirm.rows[0].user_id === undefined ||
				confirm.rows[0].user_id === null
			) {
				throw Error("Unknown error when creating user");
			} else {
				return confirm.rows[0].user_id;
			}
		} catch (err) {
			console.error(`createUser error: ${err}`);
			// returning error
			return { error: err };
		}
	},

	/**
	 * Get password hash for user
	 */
	getPasswordHash: async function (email) {
		// Setting query
		const query = {
			text: "SELECT password_hash, user_id FROM users WHERE email=$1",
			values: [email],
		};

		try {
			// Attempting DB update
			const confirm = await pool.query(query);

			if (confirm.rows.length === 0) {
				return { unknown: true };
			} else {
				return confirm.rows[0];
			}
		} catch (err) {
			console.error(`deleteApplication error: ${err}`);
			// returning error
			return { error: err };
		}
	},
};
