const express = require("express");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  createRoutine,
  getRoutinesWithoutActivities,
  getRoutineById,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByActivity,
  getPublicRoutinesByUser,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  getActivityById,
} = require("../db");
const activitiesRouter = require("./activities");
const { DuplicateRoutineActivityError } = require("../errors");

// GET /api/routines

routinesRouter.get("/", async (req, res) => {
  const routines = await getAllRoutines();
  res.send(routines);
});

// POST /api/routines

routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { creatorId, isPublic, name, goal } = req.body;

  try {
    if (req.user) {
      req.body.creatorId = req.user.id;
      //   console.log("CREATOR ID", routineData.creatorId);
    }
    const newRoutine = await createRoutine(req.body);
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
  const id = req.params.routineId;
  // console.log("REQ PARAMS", req.params);

  try {
    const originalRoutine = await getRoutineById(id);
    // console.log("ORIGINAL ROUTINE ID", originalRoutine);

    if (!originalRoutine) {
      next({
        error: "error",
        name: "NoRoutineFoundError",
        message: `Routine ${id} not found`,
      });
    } else if (req.user && originalRoutine.creatorId !== req.user.id) {
      next(
        res.status(403).send({
          error: "",
          message: `User ${req.user.username} is not allowed to update Every day`,
          name: "",
        })
      );
    } else {
      const updatedRoutine = await updateRoutine({
        id,
        isPublic,
        name,
        goal,
      });
      // console.log("UPDATED ROUTINE", updatedRoutine);
      res.send(updatedRoutine);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId

routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  const id = req.params.routineId;

  //   console.log("ID OF ROUTINE TO BE DELETED", id);
  try {
    const originalRoutine = await getRoutineById(id);

    if (originalRoutine && originalRoutine.creatorId !== req.user.id) {
      next(
        res.status(403).send({
          error: "",
          message: `User ${req.user.username} is not allowed to delete On even days`,
          name: "",
        })
      );
    } else {
      const deletedRoutine = await destroyRoutine(id);

      res.send(deletedRoutine);
    }
  } catch (error) {
    error;
  }
});

// POST /api/routines/:routineId/activities

/* NOT SURE WHICH FUNC TO CALL TO CHECK DUPLICATES D: */
routinesRouter.post("/:routineId/activities", requireUser, async (req, res, next) => {
  // const activity = await getActivityById(activityId);
  const routineId = req.params.routineId;
  console.log("this is req.params.routineID", req.params.routineId);
  
  const activities = await getRoutineActivitiesByRoutine({ id: routineId });
  const { activityId, count, duration } = req.body;
  
  const routine = await getRoutineById(routineId);
  try {
    console.log("this is activities", activities);
    const filteredActivities = activities.filter(
      (activity) => activity.id === activityId
    );
    console.log("this is filteredActivities", filteredActivities);
    if (filteredActivities && filteredActivities.length) {
      next({
        error: "",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
        name: "",
      });
    } else if (req.user) {
      const routineWithActivity = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      });
      res.send(routineWithActivity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = routinesRouter;