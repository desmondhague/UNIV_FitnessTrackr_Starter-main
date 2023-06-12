const express = require("express");
const routineActivitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
	getRoutineActivityById,
	updateRoutineActivity,
	getRoutineById,
	destroyRoutineActivity,
} = require("../db");

// PATCH /api/routine_activities/:routineActivityId

routineActivitiesRouter.patch(
	"/:routineActivityId",
	requireUser,
	async (req, res, next) => {
		const { count, duration } = req.body;
		const id = req.params.routineActivityId;
		// console.log("REQ PARAMS FOR ROUTINE ACTIVITY", req.params);

		try {
			const originalRoutineActivity = await getRoutineActivityById(id);
			const routine = await getRoutineById(originalRoutineActivity.routineId)
			// console.log("ORIGINAL ROUTINE ACTIVITY ID", originalRoutineActivity);

			if (!originalRoutineActivity) {
				next({
					error: "error",
					name: "NoRoutineFoundError",
					message: `Routine ${id} not found`,
				});
			} else if (req.user && routine.creatorId !== req.user.id) {
				next({
					error: "",
					message: `User ${req.user.username} is not allowed to update In the evening`,
					name: "",
				});
			} else {
				const updatedRoutineActivity = await updateRoutineActivity({
					id,
					count,
					duration,
				});
				// console.log("UPDATED ROUTINE", updatedRoutineActivity);
				res.send(updatedRoutineActivity);
			}
		} catch (error) {
			next(error);
		}
	}
);

// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete(
	"/:routineActivityId",
	requireUser,
	async (req, res, next) => {
		const id = req.params.routineActivityId;
		console.log("ID OF ROUTINE ACTIVITY TO BE DELETED", id);

		try {
			const originalRoutineActivity = await getRoutineActivityById(id);
			const originalRoutine = await getRoutineById(id);
			// console.log("ORIGINAL ROUTINE ACTIVITY:", originalRoutineActivity);
			// console.log("ORIGINAL ROUTINE:", originalRoutine);
			// console.log("ACTIVE USER:", req.user);

			if (!originalRoutineActivity) {
				next({
					error: "error",
					name: "No routine activity",
					message: `Routine activity ${id} not found`,
				});
			} else if (req.user && originalRoutine.creatorId == req.user.id) {
				const deletedRoutineActivity = await destroyRoutineActivity(id);

				res.send(deletedRoutineActivity);
			} else {
				next(
					res.status(403).send({
						error: "",
						message: `User ${req.user.username} is not allowed to delete In the afternoon`,
						name: "",
					})
				);
			}
		} catch (error) {
			error;
		}
	}
);

module.exports = routineActivitiesRouter;