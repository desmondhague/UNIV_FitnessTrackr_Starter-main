const express = require("express");
const activitiesRouter = express.Router();

const {
	createActivity,
	getAllActivities,
	getActivityById,
	getActivityByName,
	attachActivitiesToRoutines,
	updateActivity,
	getPublicRoutinesByActivity,
} = require("../db");

const { ActivityExistsError } = require("../errors");

const { requireUser } = require("./utils");

// GET /api/activities/:activityId/routines

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
	const { activityId } = req.params;
	try {
		const activities = await getPublicRoutinesByActivity({ id: activityId });
		if (!activities.length) {
			next({
				name: "ActivityDoesNotExistError",
				message: `Activity ${activityId} not found`,
			});
		} else {
			res.send(activities);
		}
	} catch (error) {
		next(error);
	}
});

// GET /api/activities

activitiesRouter.get("/", async (req, res) => {
	const activities = await getAllActivities();
	// console.log("HERE DEM ACTIVITIES", activities);
	res.send(activities);
});

// POST /api/activities

activitiesRouter.post("/", requireUser, async (req, res, next) => {
	const { name, description } = req.body;

	// console.log("REQ USER", req.user);
	// console.log("NAME HERE", name);
	try {
		const namedActivity = await getActivityByName(name);

		// console.log("NEW ACTIVITIES HERE", newActivity);
		// console.log("NAMED ACTIVITIES HERE", namedActivity);

		if (namedActivity) {
			next({
				name: "ActivityExistError",
				message: ActivityExistsError(name),
			});
		} else {
			const newActivity = await createActivity(req.body);
			res.send(newActivity);
		}
	} catch (error) {
		next(error);
	}
});

// PATCH /api/activities/:activityId

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
	const { name, description } = req.body;
	const id = req.params.activityId;

	// console.log("REQ PARAMS", req.params);

	try {
		const originalActivity = await getActivityById(id);
		const activityName = await getActivityByName(name);

		// console.log("ACTIVITY", activityName);

		if (!originalActivity) {
			next({
				name: "NoActivityFoundError",
				message: `Activity ${id} not found`,
			});
		} else if (activityName && activityName.name == req.body.name) {
			next({
				error: "DuplicateActivityError",
				name: "Duplicate Activity Error!",
				message: `An activity with name ${activityName.name} already exists`,
			});
		} else {
			const updatedActivity = await updateActivity({
				id,
				name,
				description,
			});

			// console.log("UPDATED ACTIVITY", updatedActivity);

			res.send(updatedActivity);
		}
	} catch (error) {
		next(error);
	}
});

module.exports = activitiesRouter;