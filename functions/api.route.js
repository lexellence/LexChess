"use strict";
const express = require("express");
const router = express.Router();
const httpCodes = require("http-status-codes");

const { validateBody, schemas } = require("./validator");
const Joi = require("@hapi/joi");
const to = require('await-to-js').default;

// const firebase = require("firebase");
// require("firebase/auth");
// require("firebase/firestore");
// require("firebase/database");
// const firebaseConfig = require('./firebaseConfig.json');
// const firebaseProject = firebase.initializeApp(firebaseConfig);
// const firebaseDB = firebase.database();
var admin = require("firebase-admin");
var db = admin.database();

//+------------------------\----------------------------------
//|	    GET /get-play      |
//\------------------------/
//	Get inGame. 
//		If false, get openGames[].
//		If true, get isWhite, isWaiting.
//				If isWaiting, get moves[].
//------------------------------------------------------------
router.get("/get-play", async (req, res) => {
	console.log('*****  get-play  *****');
	let uid = req.decodedClaims.uid;

	let [err, userSnapshot] = await to(db.ref('users/' + uid).once('value'));
	if (err) {
		console.log("Couldn't find user with uid=" + uid);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
		return;
	}
	let user = userSnapshot.val();

	// User not in game -> get games to join.
	let userPlayObject = { inGame: user.inGame };
	if (!userPlayObject.inGame) {
		let [err, gameListSnapshot] = await to(db.ref('games').once('value'));
		if (err) {
			console.log("Couldn't find game list");
			res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
			return;
		}
		userPlayObject.openGames = gameListSnapshot.val();
		res.status(httpCodes.OK).json(userPlayObject);
		return;
	}
	// User in game -> get game info
	else {
		let [err, gameSnapshot] = await to(db.ref('games/' + user.gid).once('value'));
		if (err) {
			console.log("Couldn't find game with gid=" + user.gid);
			res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
			return;
		}
		let game = gameSnapshot.val();

		// Set user's team
		if (uid === game.uid_white)
			userPlayObject.isWhite = true;
		else if (uid === game.uid_black)
			userPlayObject.isWhite = false;
		else {
			// User not found in game
			console.log("Couldn't find uid=" + uid + " in game with gid=" + user.gid);
			res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
			return;
		}

		// No opponent yet?
		if (!game.uid_white || !game.uid_black) {
			userPlayObject.isWaiting = true;
		}
		else {
			// Game has started, get moves.
			userPlayObject.isWaiting = false;
			userPlayObject.moves = [];
		}
		res.status(httpCodes.OK).json(userPlayObject);
		return;
	}


	// var gameRef = db.ref('games/1');
	// gameRef.once('value')
	// 	.then(snapshot => {
	// 		res.status(httpCodes.OK).json(snapshot.val());
	// 		return;
	// 	})
	// 	.catch(err => {
	// 		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
	// 	});
});
//+------------------------\----------------------------------
//|	    PUT /join-game     |
//\------------------------/
//
//------------------------------------------------------------
router.put("/join-game/:gid", async (req, res) => {
	console.log('*****  join-game  *****');
	let uid = req.decodedClaims.uid;
	let gid = req.params.gid;
});
//+------------------------\----------------------------------
//|	  POST /create-game    |
//\------------------------/
//
//------------------------------------------------------------
router.post("/create-game", async (req, res) => {
	console.log('*****  create-game  *****');
	let uid = req.decodedClaims.uid;

});
//+------------------------\----------------------------------
//|	      PUT /move        |
//\------------------------/
//
//------------------------------------------------------------
router.put("/move", validateBody(schemas.move), async (req, res) => {
	console.log('*****  move  *****');
	let uid = req.decodedClaims.uid;

});
//+------------------------\----------------------------------
//|	   PUT /leave-game     |
//\------------------------/
//
//------------------------------------------------------------
router.put("/leave-game", validateBody(schemas.move), async (req, res) => {
	console.log('*****  leave-game  *****');
	let uid = req.decodedClaims.uid;

});

module.exports = router;



