const { Pool } = require("pg");
const CONSTANTS = require("../CONSTANTS");

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
	 * Delete an application for a user
	 */
	// TODO
};
