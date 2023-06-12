const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
    INSERT INTO routine_activities
    ("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;`,
      [routineId, activityId, count, duration]
    );
    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
    SELECT *
    FROM routine_activities
    WHERE id = ${id}
    ;`
    );

    // console.log("I AM ROUTINE ACTIVITY", routine_activity);
    return routine_activity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId" = ${id}
    ;`);
    // console.log("I AM ROUTINE ACTIVITY", rows);
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  console.log("these are the update fields:", fields);

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
    UPDATE routine_activities SET ${setString} WHERE id=${id} RETURNING *;
    `,
      Object.values(fields)
    );

    return routine_activity;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(`
    DELETE FROM routine_activities
    WHERE id = ${id}
    RETURNING *;
    `);
    return routine_activity;
  } catch (error) {
    console.error(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {
      rows: [editableRoutineActivity],
    } = await client.query(
      `
		SELECT routine_activities.*
		FROM routine_activities
		JOIN routines ON routines.id = routine_activities."routineId"
		WHERE routines."creatorId" = $1 AND routine_activities.id = $2
		`,
      [userId, routineActivityId]
    );

    return editableRoutineActivity;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};