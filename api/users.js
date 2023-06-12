/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt");
const { requireUser } = require("./utils");
const { getPublicRoutinesByUser, getAllRoutinesByUser } = require("../db");

const {
	getUser,
	getUserByUsername,
	createUser,
	getUserById,
} = require("../db");

usersRouter.use((req, res, next) => {
	console.log("A request is being made to /users");

	next();
});

usersRouter.get("/", async (req, res) => {
	const users = await getUser();
	// console.log("USERS HERE", users);
	res.send({
		users,
	});
});

// POST /api/users/register

usersRouter.post("/register", async (req, res, next) => {
	const { username, password } = req.body;

	try {
		const _user = await getUserByUsername(username);

		if (_user) {
			next({
				name: "UserExistsError",
				message: `User ${username} is already taken.`,
			});
		} else if (password.length < 8) {
			next({
				name: "PasswordLengthError!",
				message: "Password Too Short!",
			});
		} else {
			const user = await createUser({
				username,
				password,
			});
			if (!user) {
				next({
					name: "NoUserExistsError",
					message: "that username is taken. and you're still single..",
				});
			} else {
				const token = jwt.sign(
					{
						id: user.id,
						username: user.username,
					},
					process.env.JWT_SECRET,
					{
						expiresIn: "1w",
					}
				);

				res.send({
					message: "hey, u signed up! thanks!",
					user,
					token,
				});
			}
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

// POST /api/users/login

usersRouter.post("/login", async (req, res, next) => {
	const { username, password } = req.body;
	if (!username || !password) {
		next({
			name: "MissingCredentialError",
			message: "Pls gib both name and password",
		});
	}
	try {
		const user = await getUserByUsername(username);
		const hashedPassword = user.password;
		const match = await bcrypt.compare(password, hashedPassword);

		if (user && match) {
			const token = jwt.sign(
				{
					id: user.id,
					username,
				},
				process.env.JWT_SECRET
			);
			res.send({
				message: "you're logged in!",
				user,
				token,
			});
		} else {
			next({
				name: "IncorrectCredentialsError",
				message: "something is wrong here...",
			});
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
});

// GET /api/users/me

usersRouter.get("/me", requireUser, async (req, res, next) => {
	try {
		const me = req.user;
		// console.log("THIS IS USER", me);

		res.send(me);
	} catch (error) {
		throw error;
	}
});

// GET /api/users/:username/routines

usersRouter.get("/:username/routines", async (req, res, next) => {
	try {
		// console.log("THIS IS REQ.USER", req.user);
		// console.log("THESE ARE THE PARAMS:", req.params);
		//const me = req.user
		const me = req.params.username;
		// console.log("THIS IS ME:", me);

		const user = await getUserByUsername(me);
		// console.log("THIS IS MY USER FOR ROUTINES:", user.id);

		if (req.user && req.user.id === user.id) {
			const userRoutines = await getAllRoutinesByUser(req.params);
			res.send(userRoutines);

			// console.log("USER ROUTINES", userRoutines);
		} else {
			const userPublicRoutines = await getPublicRoutinesByUser(req.params);
			// console.log("THESE ARE MY USER PUBLIC ROUTINES", userPublicRoutines);
			res.send(userPublicRoutines);
		}
	} catch (error) {
		throw error;
	}
});

module.exports = usersRouter;