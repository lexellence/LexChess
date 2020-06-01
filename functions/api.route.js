"use strict";
const express = require("express");
const router = express.Router();
const httpCodes = require("http-status-codes");

const { validateBody, schemas } = require("./validator");
const Joi = require("@hapi/joi");
const to = require('await-to-js').default;

var admin = require("firebase-admin");
var db = admin.database();

const { Game, PieceTypes, TeamNames } = require('./Game');

//+------------------------\----------------------------------
//|	 	 getOpenGames  	   | throws Errors
//\------------------------/
//	
//------------------------------------------------------------
async function getOpenGames() {
	console.log('*****  getOpenGames  *****');
	let gameListSnapshot = await db.ref('games').once('value');
	if (!gameListSnapshot.exists) {
		console.log('*****  !gameListSnapshot.exists  *****');
		return [];
	}
	console.log('*****  Object.entries(gameListSnapshot.val())  *****');
	let gameList = gameListSnapshot.val();
	if (!gameList)
		return [];
	return Object.entries(gameList);
}

//+------------------------\----------------------------------
//|	 	   getUser    	   | throws Errors
//\------------------------/
//	If user record not found, it is created with inGame=false
//------------------------------------------------------------
async function getUser(uid) {
	console.log('*****  getUser  *****');
	let userRef = db.ref('users/' + uid);
	let userSnapshot = await userRef.once('value');
	return userSnapshot.val();
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
	console.log('*****  getUserPlayObject  *****');
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
		console.log('*****  done getOpenGames  *****');
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
//		If false, get openGames[].
//		If true, get isWhite, isWaiting.
//				If !isWaiting, get moves[].
//------------------------------------------------------------
router.get("/get-play", async (req, res) => {
	console.log('*****  get-play  *****');
	let uid = req.decodedClaims.uid;

	try {
		let userPlayObject = await getUserPlayObject(uid);
		console.log('*****  done getUserPlayObject  *****');
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

		let promises = [];
		{
			// Fill a spot
			let moves = ['3133', '4644', '3344p', '6755', '4455k', '6655p'];
			if (!game.uid_white)
				promises.push(gameRef.update({ uid_white: uid, moves: moves }));
			else
				promises.push(gameRef.update({ uid_black: uid, moves: moves }));

			promises.push(db.ref('users/' + uid).update({ inGame: true, gid: gid }));
		}
		await Promise.all(promises);
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
//	starts game as white, unless black is specified as :team
//------------------------------------------------------------
router.post("/create-game/:team?", async (req, res) => {
	console.log('*****  create-game  *****');
	let uid = req.decodedClaims.uid;
	let isWhite = (req.params.team !== 'black');

	try {
		let user = await getUser(uid);

		if (user.inGame)
			throw new Error('user already in game');

		// New game
		let gameListRef = db.ref('games');
		let game = { moves: [] };
		if (isWhite)
			game.uid_white = uid;
		else
			game.uid_black = uid;
		let gameRef = gameListRef.push(game);

		// Get gid
		let gameSnapshot = await gameRef.once('value');
		let gid = gameSnapshot.key;

		// Update user
		await db.ref('users/' + uid).update({ inGame: true, gid: gid });
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

		let promises = [];
		{
			// Remove from game
			if (uid === game.uid_white) {
				if (!game.uid_black)
					promises.push(gameRef.remove());
				else
					promises.push(gameRef.update({ uid_white: null }));
			}
			else if (uid === game.uid_black) {
				if (!game.uid_white)
					promises.push(gameRef.remove());
				else
					promises.push(gameRef.update({ uid_black: null }));
			}

			promises.push(db.ref('users/' + uid).update({ inGame: false, gid: null }));
		}
		await Promise.all(promises);
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



