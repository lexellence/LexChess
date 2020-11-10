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
	let convertedGameList = Object.entries(gameList)
		.map((game, i) => {
			return {
				gid: game[0],
				status: game[1].status,
				uid_white: game[1].uid_white,
				uid_black: game[1].uid_black,
				uid_defer: game[1].uid_defer,
				display_name_white: game[1].display_name_white,
				display_name_black: game[1].display_name_black,
				display_name_defer: game[1].display_name_defer
			};
		});
	return convertedGameList;
}
//+------------------------\----------------------------------
//|	 	   getUser    	   |
//\------------------------/
//	If database user record not found, it is created.
// 	Returns { userRef, user }
//------------------------------------------------------------
async function getUser(uid) {
	let userRef = db.ref('users/' + uid);
	let snapshot = await userRef.once('value');
	let user = snapshot.val();
	if (user === null) {
		user = { gid: 0 };
		userRef.set(user);
	}
	return { userRef: userRef, user: user };
}
//+------------------------\----------------------------------
//|	 	   getGame    	   |
//\------------------------/
// 	Returns { gameRef, game }
//------------------------------------------------------------
async function getGame(gid) {
	let gameRef = db.ref('games/' + gid);
	let snapshot = await gameRef.once('value');
	let game = snapshot.val();
	return { gameRef: gameRef, game: game };
}
//+------------------------\----------------------------------
//|	  getUserPlayState     | throws Errors
//\------------------------/
// 	gameList: array of available games
// 	inGame: T/F
//	gameStatus: waiting, playing, draw, checkmate, concede, stalemate
//	team: white, black, defer, observe
//	moves: array of 'nnnnp' formatted moves (if ingame)
//------------------------------------------------------------
async function getUserPlayState(uid) {
	let userPlayObject = {
		gameList: await getGameList(),
		inGame: false,
		gameStatus: '',
		team: '',
		displayNameWhite: '',
		displayNameBlack: '',
		displayNameDefer: '',
		moves: []
	};

	let { userRef, user } = await getUser(uid);
	if (user.gid) {
		let { gameRef, game } = await getGame(user.gid);
		if (game) {
			// Status
			userPlayObject.inGame = true;
			userPlayObject.gameStatus = game.status;

			// User's team
			if (uid === game.uid_white)
				userPlayObject.team = 'white';
			else if (uid === game.uid_black)
				userPlayObject.team = 'black';
			else if (uid === game.uid_defer)
				userPlayObject.team = 'defer';
			else
				userPlayObject.team = 'observe';

			// Names
			userPlayObject.displayNameWhite = game.display_name_white;
			userPlayObject.displayNameBlack = game.display_name_black;
			userPlayObject.displayNameDefer = game.display_name_defer;
			userPlayObject.moves = game.moves ? game.moves : [];
		}
		else {
			// Game not found, reset user's gid
			await userRef.update({ gid: 0 });
		}
	}

	return userPlayObject;
}
//+------------------------------\----------------------------
//|	    GET /get-play-state      |
//\------------------------------/
//	Get inGame. 
//		If false, get openGames[].
//		If true, get isWhite, isWaiting.
//				If !isWaiting, get moves[].
//------------------------------------------------------------
router.get("/get-play-state", async (req, res) => {
	let { uid } = req.decodedClaims;

	try {
		let userPlayState = await getUserPlayState(uid);
		console.log('***** Sending User PlayState *****');
		console.log(userPlayState);
		res.status(httpCodes.OK).json(userPlayState);
		return;
	}
	catch (err) {
		console.log(err.message);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
		return;
	}
});
//+------------------------------\----------------------------
//|	  POST /create-game/:team    | 
//\------------------------------/
//	starts game as :team = 'white' or 'black'
//	Any other values of :team will defer team choice
//------------------------------------------------------------
router.post("/create-game/:team", async (req, res) => {
	let { uid, name } = req.decodedClaims;
	let isWhite = (req.params.team === 'white');
	let isBlack = (req.params.team === 'black');

	try {
		let { userRef, user } = await getUser(uid);
		if (user.gid)
			throw new Error('User already in game');

		// New game
		let game = {
			status: 'waiting',
			uid_white: isWhite ? uid : 0,
			uid_black: isBlack ? uid : 0,
			uid_defer: (!isWhite && !isBlack) ? uid : 0,
			display_name_white: isWhite ? name : '',
			display_name_black: isBlack ? name : '',
			display_name_defer: (!isWhite && !isBlack) ? name : '',
			moves: []
		};

		console.log('***** Game Created *****');
		console.log(game);
		let gameRef = await db.ref('games').push(game);

		// Update user's gid
		let gameSnapshot = await gameRef.once('value');
		await userRef.update({ gid: gameSnapshot.key });

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
//|	    PUT /join-game     |
//\------------------------/
//
//------------------------------------------------------------
router.put("/join-game/:gid/:team", async (req, res) => {
	let { uid, name } = req.decodedClaims;
	let { gid, team } = req.params;
	try {
		let { userRef, user } = await getUser(uid);
		let movesStub = ['3133', '4644', '3344p', '6755', '4455k', '6655p'];

		// Can't join if you're already in a game
		if (user.gid)
			throw new Error('User already in game.');

		// Find game
		let { gameRef, game } = await getGame(gid);
		if (!game)
			throw new Error('Game not found.');

		let promises = [];
		if (game.status === 'waiting') {
			if (team === 'white') {
				if (!game.uid_white) {
					// Join white team
					promises.push(gameRef.update({ status: 'playing', uid_white: uid, display_name_white: name, moves: movesStub }));

					// Move defer player to black
					if (game.uid_defer) {
						promises.push(gameRef.update({
							uid_black: game.uid_defer,
							display_name_black: game.display_name_defer,
							uid_defer: 0,
							display_name_defer: ''
						}));
					}
				}
			}
			else if (team === 'black') {
				if (!game.uid_black) {
					// Join black team
					promises.push(gameRef.update({ status: 'playing', uid_black: uid, display_name_black: name, moves: movesStub }));

					// Move defer player to white
					if (game.uid_defer) {
						promises.push(gameRef.update({
							uid_white: game.uid_defer,
							display_name_white: game.display_name_defer,
							uid_defer: 0,
							display_name_defer: ''
						}));
					}
				}
			}
		}

		// Add game to user
		promises.push(userRef.update({ gid: gid }));

		await Promise.all(promises);
		res.sendStatus(httpCodes.OK);
	}
	catch (err) {
		console.log(err.message);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
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
		let { userRef, user } = await getUser(uid);
		if (!user.gid) {
			res.sendStatus(httpCodes.OK);
			return;
		}

		// Get game
		let { gameRef, game } = await getGame(user.gid);

		// Game not found
		if (!game) {
			await userRef.update({ gid: 0 });
			res.sendStatus(httpCodes.OK);
			return;
		}

		// Leave the game
		let promises = [];
		{
			// Delete game not yet started, if user is a player
			let userIsPlayer = (uid === game.uid_white || uid === game.uid_black || uid === game.uid_defer);
			if (game.status === 'waiting' && userIsPlayer)
				promises.push(gameRef.remove());

			// Concede defeat if user is one of the players
			else if (game.status === 'playing') {
				if (uid === game.uid_white)
					promises.push(gameRef.update({ status: 'concede_white', uid_winner: game.uid_black, display_name_winner: game.display_name_black }));
				else if (uid === game.uid_black)
					promises.push(gameRef.update({ status: 'concede_black', uid_winner: game.uid_white, display_name_winner: game.display_name_white }));
			}

			// Remove game from user
			promises.push(userRef.update({ gid: 0 }));
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



