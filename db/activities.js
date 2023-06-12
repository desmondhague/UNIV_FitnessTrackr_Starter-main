const client = require("./client");

// database functions
async function createActivity({ name, description }) {
	try {
		const {
			rows: [activity],
		} = await client.query(
			`
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    RETURNING *;
    `,
			[name, description]
		);
		return activity;
	} catch (error) {
		console.error(error);
	}
}

async function getAllActivities() {
	const { rows } = await client.query(`
  SELECT *
  FROM activities;
  `);
	// console.log("I AM ACTIVITIES", rows);
	return rows;
}

async function getActivityById(id) {
	try {
		const {
			rows: [activity],
		} = await client.query(`
    SELECT * FROM activities WHERE id=${id};
    `);

		return activity;
	} catch (error) {
		console.error(error)
	}
}

async function getActivityByName(name) {
	try {
		const {
			rows: [activity],
		} = await client.query(
			`
    SELECT * FROM activities WHERE name=$1;
    `,
			[name]
		);

		return activity;
	} catch (error) {
		console.error(error)
	}
}

async function attachActivitiesToRoutines(routines) {
	const routinesToReturn = [...routines];

	try {
		const { rows: activities } = await client.query(`
    SELECT activities.*, routine_activities.id AS "routineActivityId", routine_activities."routineId", 
    routine_activities.duration, routine_activities.count
    FROM activities
    JOIN routine_activities ON routine_activities."activityId" = activities.id;
    `);

		for (const routine of routinesToReturn) {
			const activitiesToAdd = activities.filter(
				(activity) => activity.routineId === routine.id
			);
			routine.activities = activitiesToAdd;
		}

		return routinesToReturn;
	} catch (error) {
		console.error(error)
	}
}

async function updateActivity({ id, ...fields }) {
	// console.log("these are the update fields:", fields);
	console.log("ID AND FIELDS HERE", id, fields);
	const setString = Object.keys(fields)
		.map((key, index) => `"${key}"=$${index + 1}`)
		.join(", ");

	try {
		const {
			rows: [activity],
		} = await client.query(
			`
    UPDATE activities SET ${setString} WHERE id=${id} RETURNING *;
    `,
			Object.values(fields)
		);

		return activity;
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	getAllActivities,
	getActivityById,
	getActivityByName,
	attachActivitiesToRoutines,
	createActivity,
	updateActivity,
};