"use strict";
const firebase = require("firebase");
require("firebase/auth");
require("firebase/firestore");
const firebaseConfig = {
	apiKey: "AIzaSyB8hSrh3MzpM_VxuKLDvrwGnDkpSJHBaUU",
	authDomain: "chessfighter-b3ba9.firebaseapp.com",
	databaseURL: "https://chessfighter-b3ba9.firebaseio.com",
	projectId: "chessfighter-b3ba9",
	storageBucket: "chessfighter-b3ba9.appspot.com",
	messagingSenderId: "571875242130",
	appId: "1:571875242130:web:96b940de11853db0a6364b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const express = require("express");
const router = express.Router();
const httpCodes = require("http-status-codes");

const { validateBody, schemas } = require("./validator");
const Joi = require("@hapi/joi");

//+------------------------\----------------------------------
//|	       Signup          |
//\------------------------/----------------------------------
//	Responds with
//------------------------------------------------------------
function signUp(req, res) {
	const auth = req.value.body;
	firebase
		.auth()
		.createUserWithEmailAndPassword(auth.email, auth.password)
		.then(() => {
			res.status(httpCodes.OK).json({ email: auth.email });
			return;
		})
		.catch((error) => {
			// var errorCode = error.code;
			// var errorMessage = error.message;
			res.status(httpCodes.BAD_REQUEST).json(error);
			return;
		});
}
router.post("/signup", validateBody(schemas.auth), signUp);

//+------------------------\----------------------------------
//|	       Signin          |
//\------------------------/----------------------------------
//	Responds with
//------------------------------------------------------------
function signIn(req, res) {
	const auth = req.value.body;
	firebase
		.auth()
		.signInWithEmailAndPassword(auth.email, auth.password)
		.then(() => {
			res.status(httpCodes.OK).json(auth);
			return;
		})
		.catch((error) => {
			// var errorCode = error.code;
			// var errorMessage = error.message;
			res.status(httpCodes.BAD_REQUEST).json(error);
			return;
		});
}
router.post("/signin", validateBody(schemas.auth), signIn);

//+------------------------\----------------------------------
//|	       Add game        |
//\------------------------/----------------------------------
//	Responds with
//------------------------------------------------------------
function addGame(req, res) {
	const game = req.value.body;
	game.lastActive = firebase.firestore.FieldValue.serverTimestamp();
	db.collection("games").add(game)
		.then((docRef) => {
			res.sendStatus(httpCodes.CREATED);
			return;
		})
		.catch((error) => {
			res.sendStatus(httpCodes.INTERNAL_SERVER_ERROR);
			return;
		});
}
router.post("/add-game", validateBody(schemas.game), addGame);

//+------------------------\----------------------------------
//|	     How is today      |
//\------------------------/----------------------------------
//	Responds with
//------------------------------------------------------------
router.get("/how-is-today", (req, res) => {
	var homeCollectionRef = db.collection("home");
	var todayDocRef = homeCollectionRef.doc("todayDoc");

	todayDocRef.get()
		.then((doc) => {
			if (!doc.exists) res.sendStatus(httpCodes.NOT_FOUND);
			else {
				if (!doc.data().howIsToday) res.sendStatus(httpCodes.NOT_FOUND);
				else res.status(httpCodes.OK).send(doc.data().howIsToday);
			}
			return;
		})
		.catch((error) => {
			res.sendStatus(httpCodes.INTERNAL_SERVER_ERROR);
			return;
		});
});

// User List API
const userObject = {
	name: "name1",
	email: "email1@mail.com",
	rollno: 1,
};
const userObject2 = {
	name: "name2",
	email: "email2@mail.com",
	rollno: 2,
};
const userObject3 = {
	name: "name3",
	email: "email3@mail.com",
	rollno: 3,
};
const userObjectList = [userObject, userObject2, userObject3];

router.post("/create-user", (req, res) => {
	res.sendStatus(201); // 201 = created
});

router.get("/get-user-list", (req, res) => {
	res.status(200).json(userObjectList); // 200 = OK
});

router.get("/get-user/:id", (req, res) => {
	res.status(200).json(userObject); // 200 = OK
});
router.put("/update-user/:id", (req, res) => {
	res.sendStatus(200);
});
router.delete("/delete-user/:id", (req, res) => {
	res.sendStatus(200);
});

module.exports = router;
