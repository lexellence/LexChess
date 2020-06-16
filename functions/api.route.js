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
//|	 	 getGameList  	   | throws Errors
//\------------------------/
//	
//------------------------------------------------------------
async function getGameList() {
	let gameListSnapshot = await db.ref('games').once('value');
	if (!gameListSnapshot.exists)
		return [];
	let gameList = gameListSnapshot.val();
	if (!gameList)
		return [];
	let convertedGameList = Object.entries(gameList).map((game, i) => {
		return {
			gid: game[0],
			uid_white: game[1].uid_white,
			uid_black: game[1].uid_black,
			display_name_white: game[1].display_name_white,
			display_name_black: game[1].display_name_black,
			moves: game[1].moves
		};
	});
	console.log(convertedGameList);
	return convertedGameList;
}

//+------------------------\----------------------------------
//|	 	   getUser    	   | throws Errors
//\------------------------/
//	If user record not found, it is created with inGame=false
//------------------------------------------------------------
async function getUser(uid) {
	let userRef = db.ref('users/' + uid);
	let snapshot = await userRef.once('value');
	if (snapshot.val() !== null)
		return snapshot.val();
	else {
		let newUser = { inGame: false };
		userRef.set(newUser);
		return newUser;
	}
}

//+------------------------\----------------------------------
//|	  getUserPlayObject    | throws Errors
//\------------------------/
//	Get inGame. 
//		If false, get games[].
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
		userPlayObject.gameList = await getGameList();
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
	let { uid } = req.decodedClaims;

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
	let { uid, name } = req.decodedClaims;
	let gid = req.params.gid;

	try {
		let dbUser = await getUser(uid);

		// Can't join if you're already in a game
		if (dbUser.inGame)
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
				promises.push(gameRef.update({ uid_white: uid, display_name_white: name, moves: moves }));
			else
				promises.push(gameRef.update({ uid_black: uid, display_name_black: name, moves: moves }));

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
//	starts game as black, unless white is specified as :team
//------------------------------------------------------------
router.post("/create-game/:team?", async (req, res) => {
	let { uid, name } = req.decodedClaims;

	let isWhite = (req.params.team === 'white');

	try {
		let dbUser = await getUser(uid);

		if (dbUser.inGame)
			throw new Error('user already in game');

		// New game
		let gameListRef = db.ref('games');
		let game;
		if (isWhite)
			game = {
				uid_white: uid,
				uid_black: 0,
				display_name_white: name,
				display_name_black: '',
				moves: []
			};
		else
			game = {
				uid_white: 0,
				uid_black: uid,
				display_name_white: '',
				display_name_black: name,
				moves: []
			};
		console.log(JSON.stringify(game));
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
	let uid = req.decodedClaims.uid;

});
//+------------------------\----------------------------------
//|	   PUT /leave-game     |
//\------------------------/
//
//------------------------------------------------------------
router.put("/leave-game", async (req, res) => {
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
			// Remove user from game
			if (uid === game.uid_white) {
				if (!game.uid_black)
					promises.push(gameRef.remove());
				else
					promises.push(gameRef.update({ uid_white: 0, display_name_white: '' }));
			}
			else if (uid === game.uid_black) {
				if (!game.uid_white)
					promises.push(gameRef.remove());
				else
					promises.push(gameRef.update({ uid_black: 0, display_name_black: '' }));
			}

			// Remove game from user
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



