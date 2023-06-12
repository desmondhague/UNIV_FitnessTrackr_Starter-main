const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
	try {
		const {
			rows: [routine],
		} = await client.query(
			`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `,
			[creatorId, isPublic, name, goal]
		);
		return routine;
	} catch (error) {
		console.error(error);
	}
}

async function getRoutineById(id) {
	try {
		const {
			rows: [routine],
		} = await client.query(`
 SELECT * 
 FROM routines
 WHERE id = ${id};
 `);
		if (!routine) {
			return null;
		}
		return routine;
	} catch (error) {
		console.error(error);
	}
}

async function getRoutinesWithoutActivities() {
	const { rows } = await client.query(`
  SELECT *
  FROM routines;
  `);
	// console.log("I AM ROUTINE ROWS", rows);
	return rows;
}

async function getAllRoutines() {
	try {
		const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id;
    `);
		return attachActivitiesToRoutines(routines);
	} catch (error) {
		console.error(error);
	}
}

async function getAllPublicRoutines() {
	try {
		const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE routines."isPublic" = true;
    `);

		const allRoutines = await attachActivitiesToRoutines(routines);

		return allRoutines;
	} catch (error) {
		console.error(error);
	}
}

async function getAllRoutinesByUser({ username }) {
	try {
		const { rows: routines } = await client.query(
			`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  WHERE users.username = $1 AND routines."creatorId" = users.id 
  `,
			[username]
		);

		const allRoutines = await attachActivitiesToRoutines(routines);

		// console.log("THESE ARE MY ROUTINES", allRoutines);

		return allRoutines;
	} catch (error) {
		console.error(error);
	}
}

async function getPublicRoutinesByUser({ username }) {
	try {
		const { rows: routines } = await client.query(
			`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  WHERE users.username = $1 AND routines."creatorId" = users.id AND routines."isPublic" = true;
  `,
			[username]
		);

		const allRoutines = await attachActivitiesToRoutines(routines);

		// console.log("THESE ARE MY ROUTINES", allRoutines);

		return allRoutines;
	} catch (error) {
		console.error(error);
	}
}

async function getPublicRoutinesByActivity({ id }) {
	try {
		const { rows: routines } = await client.query(
			`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  JOIN routine_activities ON routines.id = routine_activities."routineId" 
  WHERE routine_activities."activityId" = $1 AND routines."isPublic" = true
  `,
			[id]
		);

		const allRoutines = await attachActivitiesToRoutines(routines);

		// console.log("THESE ARE MY ROUTINES ", allRoutines);
		return allRoutines;
	} catch (error) {
		console.error(error);
	}
}

async function updateRoutine({ id, ...fields }) {
	// console.log("these are the update fields:", fields);

	const setString = Object.keys(fields)
		.map((key, index) => `"${key}"=$${index + 1}`)
		.join(", ");

	try {
		const {
			rows: [routine],
		} = await client.query(
			`
    UPDATE routines SET ${setString} WHERE id=${id} RETURNING *;
    `,
			Object.values(fields)
		);

		return routine;
	} catch (error) {
		console.error(error);
	}
}

async function destroyRoutine(id) {
	try {
		await client.query(
			`
    DELETE FROM routine_activities
    WHERE "routineId" = $1;
    `,
			[id]
		);

		const {
			rows: [routine],
		} = await client.query(
			`
    DELETE FROM routines
    WHERE id = $1
    RETURNING *;
    `,
			[id]
		);

		// console.log("THESE ARE MY ROUTINES ", allRoutines);
		return routine;
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	getRoutineById,
	getRoutinesWithoutActivities,
	getAllRoutines,
	getAllPublicRoutines,
	getAllRoutinesByUser,
	getPublicRoutinesByUser,
	getPublicRoutinesByActivity,
	createRoutine,
	updateRoutine,
	destroyRoutine,
};