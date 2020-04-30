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

const { Game, PieceTypes, TeamNames } = require('./Game');

//+------------------------\----------------------------------
//|	 	 getOpenGames  	   | throws Errors
//\------------------------/
//	
//------------------------------------------------------------
async function getOpenGames() {
	let gamesRef = db.ref('games');
	let gameListSnapshot = await gamesRef.once('value');
	let gameList = gameListSnapshot.val();
	if (!gameList)
		gameList = [];
	return gameList;
}

//+------------------------\----------------------------------
//|	 	   getUser    	   | throws Errors
//\------------------------/
//	If user record not found, it is created with inGame=false
//------------------------------------------------------------
async function getUser(uid) {
	let userRef = db.ref('users/' + uid);
	let userSnapshot = await userRef.once('value');
	let user = userSnapshot.val();
	if (!user) {
		// New user entry
		user = { inGame: false };
		userRef.set(user);
	}
	return user;
}

//+------------------------\----------------------------------
//|	  getUserPlayObject    | throws Errors
//\------------------------/
//	Get inGame. 
//		If false, get openGames[].
//		If true, get isWhite, isWaiting.
//				If !isWaiting, get moves[].
//------------------------------------------------------------
async function getUserPlayObject(uid) {
	let userPlayObject = {};

	// Get user info
	let gid;
	{
		let user = await getUser(uid);
		userPlayObject.inGame = user.inGame;
		gid = user.gid;
	}

	// User not in game? Return game list
	if (!userPlayObject.inGame) {
		userPlayObject.openGames = await getOpenGames();
		return userPlayObject;
	}

	// User in game -> get game info
	let game;
	{
		if (!gid || gid.length < 1)
			throw new Error('missing gid');

		let gameRef = db.ref('games/' + gid);
		let gameSnapshot = await gameRef.once('value');
		game = gameSnapshot.val();
		if (!game)
			throw new Error('no game found with gid=' + gid);
	}

	// Get isWhite
	if (uid === game.uid_white)
		userPlayObject.isWhite = true;
	else if (uid === game.uid_black)
		userPlayObject.isWhite = false;
	else
		throw new Error("user uid not found in game with gid=" + gid);

	// Get isWaiting, moves
	userPlayObject.isWaiting = (!game.uid_white || !game.uid_black);
	if (!userPlayObject.isWaiting)
		userPlayObject.moves = game.moves ? game.moves : [];

	return userPlayObject;
}
//+------------------------\----------------------------------
//|	    GET /get-play      |
//\------------------------/
//	Get inGame. 
//		If false, get gamesWaiting[].
//		If true, get isWhite, isWaiting.
//				If !isWaiting, get moves[].
//------------------------------------------------------------
router.get("/get-play", async (req, res) => {
	console.log('*****  get-play  *****');
	let uid = req.decodedClaims.uid;

	try {
		let userPlayObject = await getUserPlayObject(uid);
		res.status(httpCodes.OK).json(userPlayObject);
		return;
	}
	catch (err) {
		console.log(err.message);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
		return;
	}
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

	try {
		let user = await getUser(uid);

		// Can't join if you're already in a game
		if (user.inGame)
			throw new Error('user already in game');

		// Find game
		let gameRef = db.ref('games/' + gid);
		let gameSnapshot = await gameRef.once('value');
		let game = gameSnapshot.val();
		if (!game)
			throw new Error('no game found with gid=' + gid);

		// Make sure it's not over
		if (game.uid_winner)
			throw new Error('can not join closed game');

		// Am I already in the game?
		if (uid === game.uid_white || uid === game.uid_black)
			throw new Error('already in that game');

		// Is it already full?
		if (game.uid_white && game.uid_black)
			throw new Error('game is full');

		// Fill a spot
		if (!game.uid_white)
			gameRef.update({ uid_white: uid });
		else
			gameRef.update({ uid_black: uid });
		db.ref('users/' + uid).update({ inGame: true, gid: gid });

		res.sendStatus(httpCodes.OK);
		return;
	}
	catch (err) {
		console.log(err.message);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
		return;
	}
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
router.put("/leave-game", async (req, res) => {
	console.log('*****  leave-game  *****');
	let uid = req.decodedClaims.uid;

	try {
		// Get user info
		let gid = null;
		{
			let user = await getUser(uid);
			if (!user.inGame)
				throw new Error('user not in game');
			gid = user.gid;
		}

		// User in game -> get game info

		if (!gid || gid.length < 1)
			throw new Error('missing gid');

		let gameRef = db.ref('games/' + gid);
		let gameSnapshot = await gameRef.once('value');
		let game = gameSnapshot.val();
		if (!game)
			throw new Error('no game found with gid=' + gid);

		// Remove from game
		if (uid === game.uid_white)
			gameRef.update({ uid_white: null });
		else if (uid === game.uid_black)
			gameRef.update({ uid_black: null });
		else
			throw new Error("user uid not found in game with gid=" + gid);

		db.ref('users/' + uid).update({ inGame: false, gid: null });
		res.sendStatus(httpCodes.OK);
		return;
	}
	catch (err) {
		console.log(err.message);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
		return;
	}


});

module.exports = router;



