import express from 'express';
import httpCodes from 'http-status-codes';
import { validateBody, schemas } from './validator';
// import Joi from '@hapi/joi';
// import to = require('await-to-js').default ;
import admin from 'firebase-admin';
import { ChessGameBackend, Team, chessMoveFromString } from './ChessGameBackend';

const apiRouter = express.Router();
const db = admin.database();

//+------------------------\----------------------------------
//|	 	 getGameList  	   | throws Errors
//\------------------------/
//	
//------------------------------------------------------------
async function getGameList() {
	const gameListSnapshot = await db.ref('games').once('value');
	if (!gameListSnapshot.exists)
		return [];
	const gameList = gameListSnapshot.val();
	if (!gameList)
		return [];
	const convertedGameList = Object.entries(gameList)
		.map((game: any, i) => {
			return {
				gid: game[0],
				status: game[1].status,
				uid_white: game[1].uid_white,
				uid_black: game[1].uid_black,
				uid_defer: game[1].uid_defer,
				display_name_white: game[1].display_name_white,
				display_name_black: game[1].display_name_black,
				display_name_defer: game[1].display_name_defer,
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
async function getUser(uid: string) {
	const userRef = db.ref('users/' + uid);
	const snapshot = await userRef.once('value');
	let user = snapshot.val();
	if (user === null) {
		user = { gid: 0 };
		await userRef.set(user);
	}
	return { userRef: userRef, user: user };
}
//+------------------------\----------------------------------
//|	 	   getGame    	   |
//\------------------------/
// 	Returns { gameRef, game }
//------------------------------------------------------------
async function getGame(gid: string) {
	const gameRef = db.ref('games/' + gid);
	const snapshot = await gameRef.once('value');
	const game = snapshot.val();
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
async function getUserPlayState(uid: string) {
	const userPlayObject = {
		gameList: await getGameList(),
		inGame: false,
		gameStatus: '',
		team: '',
		displayNameWhite: '',
		displayNameBlack: '',
		displayNameDefer: '',
		moves: [],
	};

	const { userRef, user } = await getUser(uid);
	if (user.gid) {
		const { game } = await getGame(user.gid);
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
apiRouter.get("/get-play-state", async (req: any, res: any) => {
	const { uid } = req.decodedClaims;

	console.log('***** Getting User PlayState *****');
	const userPlayState = await getUserPlayState(uid);
	console.log(userPlayState);
	res.status(httpCodes.OK).json(userPlayState);
	return;
});
//+------------------------------\----------------------------
//|	  POST /create-game/:team    | 
//\------------------------------/
//	starts game as :team = 'white' or 'black'
//	Any other values of :team will defer team choice
//------------------------------------------------------------
apiRouter.post("/create-game/:team", async (req: any, res: any) => {
	const { uid, name } = req.decodedClaims;
	const isWhite = (req.params.team === 'white');
	const isBlack = (req.params.team === 'black');

	try {
		const { userRef, user } = await getUser(uid);
		if (user.gid)
			throw new Error('User already in game');

		// New game
		const game = {
			status: 'waiting',
			uid_white: isWhite ? uid : 0,
			uid_black: isBlack ? uid : 0,
			uid_defer: (!isWhite && !isBlack) ? uid : 0,
			display_name_white: isWhite ? name : '',
			display_name_black: isBlack ? name : '',
			display_name_defer: (!isWhite && !isBlack) ? name : '',
			moves: [],
		};

		console.log('***** Game Created *****');
		console.log(game);
		const gameRef = await db.ref('games').push(game);

		// Update user's gid
		const gameSnapshot = await gameRef.once('value');
		await userRef.update({ gid: gameSnapshot.key });

		res.status(httpCodes.OK).json(await getUserPlayState(uid));
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
apiRouter.put("/join-game/:gid/:team", async (req: any, res: any) => {
	const { uid, name } = req.decodedClaims;
	const { gid, team } = req.params;
	try {
		const { userRef, user } = await getUser(uid);

		// Can't join if you're already in a game
		if (user.gid)
			throw new Error('User already in game.');

		// Find game
		const { gameRef, game } = await getGame(gid);
		if (!game)
			throw new Error('Game not found.');

		// Add game to user
		const promises = [];
		promises.push(userRef.update({ gid: gid }));

		// Add user to game
		if (game.status === 'waiting') {
			if (team === 'white') {
				if (!game.uid_white) {
					// Join white team
					promises.push(gameRef.update({ status: 'playing', uid_white: uid, display_name_white: name }));

					// Move defer player to black
					if (game.uid_defer) {
						promises.push(gameRef.update({
							uid_black: game.uid_defer,
							display_name_black: game.display_name_defer,
							uid_defer: 0,
							display_name_defer: '',
						}));
					}
				}
			}
			else if (team === 'black') {
				if (!game.uid_black) {
					// Join black team
					promises.push(gameRef.update({ status: 'playing', uid_black: uid, display_name_black: name }));

					// Move defer player to white
					if (game.uid_defer) {
						promises.push(gameRef.update({
							uid_white: game.uid_defer,
							display_name_white: game.display_name_defer,
							uid_defer: 0,
							display_name_defer: '',
						}));
					}
				}
			}
		}
		await Promise.all(promises);

		res.status(httpCodes.OK).json(await getUserPlayState(uid));
	}
	catch (err) {
		console.log(err.message);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
	}
});
//+------------------------\----------------------------------
//|	   PUT /leave-game     |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/leave-game", async (req: any, res: any) => {
	const { uid } = req.decodedClaims;

	// Get user info
	const { userRef, user } = await getUser(uid);

	// If user in a game
	if (user.gid) {
		// Get game
		const { gameRef, game } = await getGame(user.gid);

		// Game not found
		if (!game)
			await userRef.update({ gid: 0 });
		else {
			// Game found, leave game
			const promises = [];
			{
				// Delete game not yet started, if user is a player
				const userIsPlayer = (uid === game.uid_white || uid === game.uid_black || uid === game.uid_defer);
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
		}
	}

	res.status(httpCodes.OK).json(await getUserPlayState(uid));
	return;
});
//+------------------------\----------------------------------
//|	      PUT /move        |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/move", validateBody(schemas.move), async (req: any, res: any) => {
	const { uid } = req.decodedClaims;
	const move = req.body;
	// Get user info
	const { userRef, user } = await getUser(uid);

	// If user in a game
	if (user.gid) {
		// Get game
		const { gameRef, game } = await getGame(user.gid);

		if (!game) {
			// Game not found
			await userRef.update({ gid: 0 });
			res.status(httpCodes.CONFLICT).send("Cannot move: game not found -- removing game reference from user");
			return;
		}

		if (game.status !== 'playing') {
			// Game over
			res.status(httpCodes.CONFLICT).send("Cannot move: game finished");
			return;
		}

		// Determine user's team
		let team = Team.NONE;
		if (uid === game.uid_white)
			team = Team.WHITE;
		else if (uid === game.uid_black)
			team = Team.BLACK;
		else {
			// Not playing
			res.status(httpCodes.CONFLICT).send("Cannot move: user not playing");
			return;
		}

		const chessGame = new ChessGameBackend();
		chessGame.doMoveHistory(game.moves);
		if (team !== game.turnTeam) {
			// Not user's turn
			res.status(httpCodes.CONFLICT).send("Cannot move: not user's turn");
			return;
		}

		if (!chessGame.isValidMove(chessMoveFromString(move))) {
			// Illegal move
			res.status(httpCodes.CONFLICT).send("Illegal move: " + move);
			return;
		}

		// Make move
		gameRef.child('moves').push(move, async (err) => {
			if (err) {
				// Move failed
				console.log(err.message);
				res.status(httpCodes.INTERNAL_SERVER_ERROR).send(err);
				return;
			}
			else {
				// Move successful
				res.status(httpCodes.OK).json(await getUserPlayState(uid));
				return;
			}
		});
	}
});

module.exports = apiRouter;
