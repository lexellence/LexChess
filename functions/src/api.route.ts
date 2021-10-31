import express from 'express';
import httpCodes from 'http-status-codes';
// import { validateBody, schemas } from './validator';
import admin from 'firebase-admin';

import * as ChessJS from "chess.js";
const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

const apiRouter = express.Router();
const db = admin.database();

// TODO: Test handling of database read/write erros and data not found.
// TODO: Store display names in db user and not in games? 
// 		Would need to retrieve name automatically instead of having 
//		client send name to create-game or join-game.
//		Wouldn't need to update game data when user changes name.
//		But maybe it's better to keep names permanent in past games to avoid confusion.

//+------------------------\----------------------------------
//|	 	 getGameList  	   | 
//\------------------------/
//	Returns array of games, not including board data
//------------------------------------------------------------
// async function getGameList() {
// 	const gameListSnapshot = await db.ref('games').once('value');
// 	if (!gameListSnapshot.exists())
// 		return [];
// 	const gameList = gameListSnapshot.val();
// 	if (!gameList)
// 		return [];
// 	const convertedGameList = Object.entries(gameList)
// 		.map((game: any, i) => {
// 			return {
// 				gid: game[0],
// 				status: game[1].core.status,
// 				name_w: game[1].names.w,
// 				name_b: game[1].names.b,
// 				name_d: game[1].names.d,
// 			};
// 		});
// 	return convertedGameList;
// }
//+------------------------\----------------------------------
//|	 	   getGame  	   |
//\------------------------/
//	Returns game object, or null if game does not exist.
//	If includeBoard is set to false, the moves/fen will be omitted.
//------------------------------------------------------------
// async function getGame(gid: string, includeBoard: boolean = true): Promise<any> {
// 	const gameRef = db.ref('games').child(gid);
// 	if (includeBoard) {
// 		const gameSnapshot = await gameRef.once('value');
// 		if (!gameSnapshot.exists())
// 			return null;
// 		else {
// 			const game = gameSnapshot.val();
// 			game.board.moves = game.board.moves ? Object.values(game.board.moves) : [];
// 			return game;
// 		}
// 	}
// 	else {
// 		// Don't include board
// 		const snapshots = await Promise.all([
// 			gameRef.child('core').once('value'),
// 			gameRef.child('names').once('value'),
// 		]);
// 		if ((!snapshots[0].exists && snapshots[1].exists) ||
// 			(snapshots[0].exists && !snapshots[1].exists)) {
// 			console.error('Game ' + gid + ' is missing a component');
// 			return null;
// 		}
// 		else if (!snapshots[0].exists) {
// 			console.error('Game ' + gid + ' does not exist');
// 			return null;
// 		}
// 		else {
// 			return {
// 				core: snapshots[0].val(),
// 				names: snapshots[1].val(),
// 			}
// 		}
// 	}
// }
//+------------------------\----------------------------------
//|	 	 getUserGame  	   |
//\------------------------/
//	Returns { game, gid } object for game that user is in, or { null, null } if user not in a game.
//	If includeBoard is set to false, the moves/fen will be omitted.
//------------------------------------------------------------
// async function getUserGame(uid: string, includeBoard: boolean = true): Promise<any> {
// 	let game = null;
// 	let gid = null;

// 	const user = await getUser(uid);
// 	if (user.gid) {
// 		gid = user.gid;
// 		game = await getGame(gid, includeBoard);
// 		if (game === null) {
// 			// Game not found, remove from user
// 			console.error('Game ID ' + user.gid + ' refers to nonexistent game. User = ' + uid);
// 			await db.ref('users').child(uid).update({ gid: 0 });
// 		}
// 	}
// 	return { game, gid };
// }
//+------------------------\----------------------------------
//|	 	   getUser    	   |
//\------------------------/
// 	Returns user db object, creating one if none exists.
//------------------------------------------------------------
// async function getUser(uid: string) {
// 	const userRef = db.ref('users/' + uid);
// 	let user = (await userRef.once('value')).val();
// 	if (user === null) {
// 		user = { gids: [] };
// 		await userRef.set(user);
// 	}
// 	return user;
// }
//+------------------------\----------------------------------
//|	  getPlayState     |
//\------------------------/
// 	gameList: array of available games
// 	inGame: T/F
//	status: wait, play, draw, stale, 3fold, ins_mat, cm_w, cm_b, con_w, con_b
//	team: w, b, d, o
//	moves: array of move strings
//	fen: string representing current board configuration
//------------------------------------------------------------
// async function getPlayState(uid: string) {
// 	const playState: any = {};
// 	const { game } = await getUserGame(uid, true)

// 	// Not in game
// 	if (!game) {
// 		// Game list
// 		playState.inGame = false;
// 		playState.gameList = await getGameList();
// 	}
// 	// In game
// 	else {
// 		// Status
// 		playState.inGame = true;
// 		playState.status = game.core.status;

// 		// User's team
// 		if (uid === game.core.uid_w)
// 			playState.team = 'w';
// 		else if (uid === game.core.uid_b)
// 			playState.team = 'b';
// 		else if (uid === game.core.uid_d)
// 			playState.team = 'd';
// 		else
// 			playState.team = 'o';

// 		// Names
// 		playState.name_w = game.names.w;
// 		playState.name_b = game.names.b;
// 		playState.name_d = game.names.d;

// 		// Board
// 		playState.moves = (game.board.moves ? game.board.moves : []);
// 		playState.fen = game.board.fen;
// 	}
// 	return playState;
// }
//+------------------------------\----------------------------
//|	    GET /get-play-state      |
//\------------------------------/
//
//------------------------------------------------------------
// apiRouter.get("/get-play-state", async (req: any, res: any) => {
// 	try {
// 		const { uid } = req.decodedClaims;

// 		console.log('***** Getting User PlayState *****');
// 		const playState = await getPlayState(uid);
// 		console.log(playState);
// 		res.status(httpCodes.OK).json(playState);
// 		return;
// 	} catch (error) {
// 		console.log('/get-play-state', error);
// 		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
// 		return;
// 	}
// });

//+------------------------------\----------------------------
//|	  POST /create-game/:team    | 
//\------------------------------/
//	starts game as :team = 'w' or 'b'
//	Any other values of :team will defer team choice.
//------------------------------------------------------------
apiRouter.post("/create-game/:team", async (req: any, res: any) => {
	try {
		const { uid, name } = req.decodedClaims;
		const { team } = req.params;

		// New game
		const isWhite = (team === 'w');
		const isBlack = (team === 'b');
		const isDefer = (!isWhite && !isBlack);
		const gameListing = {
			status: 'wait',
			name_w: isWhite ? name : '',
			name_b: isBlack ? name : '',
			name_d: isDefer ? name : '',
		};
		const game = {
			...gameListing,
			uid_w: isWhite ? uid : 0,
			uid_b: isBlack ? uid : 0,
			uid_d: isDefer ? uid : 0,
		};

		// Save game to database
		const gid = (await db.ref('games').push()).key;
		if (!gid)
			throw new Error('Database error: game not created');

		const databaseUpdate: any = {};
		databaseUpdate[`gameList/${gid}`] = gameListing;
		databaseUpdate[`games/${gid}`] = game;
		databaseUpdate[`users/${uid}/gids/${gid}`] = true;
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('Error in /create-game:', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});
//+------------------------\----------------------------------
//|	    PUT /join-game     |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/join-game/:gid/:team", async (req: any, res: any) => {
	try {
		const { uid, name } = req.decodedClaims;
		const { gid, team } = req.params;

		// Can't join game you're already in
		const userGIDs = (await db.ref(`users/${uid}/gids`).once('value')).val();
		if (userGIDs && Object.keys(userGIDs).includes(gid)) {
			console.log('User ' + uid + ' tried to join game ' + gid + ' but is already in it.');
			res.status(httpCodes.FORBIDDEN).send('User already playing in that game');
			return;
		}

		// Find game to join
		const game = (await db.ref(`games/${gid}`).once('value')).val();
		if (!game) {
			console.log('User ' + uid + ' tried to join game ' + gid + ' which does not exist');
			res.status(httpCodes.FORBIDDEN).send('Game does not exist');
			return;
		}

		// Add game to user
		const databaseUpdate: any = {};
		{
			databaseUpdate[`users/${uid}/gids/${gid}`] = true;

			// If game is not in 'wait' mode, or client tries to join unavailable team,
			//	then user becomes a spectator and not added to game data
			const isTeamAvailable = (team === 'w' && !game.uid_w) || (team === 'b' && !game.uid_b);
			if (isTeamAvailable && game.status === 'wait') {
				// Start game
				databaseUpdate[`gameList/${gid}/status`] = 'play';
				databaseUpdate[`games/${gid}/status`] = 'play';

				// Join team
				databaseUpdate[`games/${gid}/uid_${team}`] = uid;

				databaseUpdate[`games/${gid}/name_${team}`] = name;
				databaseUpdate[`gameList/${gid}/name_${team}`] = name;

				// Move defer player to their team
				if (game.uid_d) {
					const otherTeam = (team === 'w') ? 'b' : 'w';
					databaseUpdate[`games/${gid}/uid_${otherTeam}`] = game.uid_d;
					databaseUpdate[`games/${gid}/uid_d`] = 0;

					databaseUpdate[`games/${gid}/name_${otherTeam}`] = game.name_d;
					databaseUpdate[`gameList/${gid}/name_${otherTeam}`] = game.name_d;

					databaseUpdate[`games/${gid}/name_d`] = 0;
					databaseUpdate[`gameList/${gid}/name_d`] = 0;
				}
			}
		}
		// Save changes to database
		console.log('databaseUpdate', databaseUpdate);
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('Error in /join-game:', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});
//+------------------------\----------------------------------
//|	   PUT /leave-game     |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/leave-game/:gid", async (req: any, res: any) => {
	try {
		const { uid } = req.decodedClaims;
		const { gid } = req.params;

		// Can't leave if you're not in the game
		const userInGame = (await db.ref(`users/${uid}/gids/${gid}`).once('value')).exists();
		const game = (await db.ref(`games/${gid}`).once('value')).val();
		if (!userInGame || !game) {
			console.log('User ' + uid + ' tried to leave game but is not in one');
			res.status(httpCodes.FORBIDDEN).send('You are not in a game');
			return;
		}

		// Construct database update
		const databaseUpdate: any = {};
		{
			const userIsPlayer = (uid === game.uid_w || uid === game.uid_b || uid === game.uid_d);
			if (userIsPlayer) {
				if (game.status === 'wait') {
					// Delete game not yet started			
					databaseUpdate[`games/${gid}`] = null;
					databaseUpdate[`gameList/${gid}`] = null;

				}
				else if (game.status === 'play') {
					// Concede defeat
					if (uid === game.uid_w) {
						databaseUpdate[`games/${gid}/status`] = 'con_b';
						databaseUpdate[`gameList/${gid}/status`] = 'con_b';
					}
					else if (uid === game.uid_b) {
						databaseUpdate[`games/${gid}/status`] = 'con_w';
						databaseUpdate[`gameList/${gid}/status`] = 'con_w';
					}
				}
			}

			if (game.status !== 'play') {
				// Remove game from user
				databaseUpdate[`users/${uid}/gids/${gid}`] = null;
			}
		}
		// Save changes to database
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('Error in /leave-game:', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});
//+------------------------\----------------------------------
//|	      PUT /move        |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/move/:gid/:move", async (req: any, res: any) => {
	try {
		const { uid } = req.decodedClaims;
		const { gid, move } = req.params;

		// User must be in a game
		const userInGame = (await db.ref(`users/${uid}/gids/${gid}`).once('value')).exists();
		const game = (await db.ref(`games/${gid}`).once('value')).val();
		if (!userInGame || !game) {
			console.log('User ' + uid + ' tried to move in an invalid game');
			res.status(httpCodes.FORBIDDEN).send('move: You are not in this game');
			return;
		}

		// Game must be in 'play' mode
		if (game.status !== 'play') {
			console.log('User ' + uid + ' tried to move but game status is ' + game.core.status);
			res.status(httpCodes.FORBIDDEN).send('move: Your game has not started');
			return;
		}

		// Redo all chess moves (constructing from fen would not detect three-fold repetition, for example)
		const chess = new Chess();
		if (game.moves)
			Object.values(game.moves).forEach(value => {
				if (typeof (value) !== 'string' || !chess.move(value))
					throw new Error('move: Invalid list of previous moves');
			});

		// Determine user's team
		let team: string;
		if (uid === game.uid_w)
			team = 'w';
		else if (uid === game.uid_b)
			team = 'b';
		else {
			// Not playing
			console.log('User ' + uid + ' tried to move but is not one of the players');
			res.status(httpCodes.FORBIDDEN).send('move: User not playing');
			return;
		}

		if (team !== chess.turn()) {
			// Not user's turn
			console.log('User ' + uid + ' tried to move out of turn');
			res.status(httpCodes.FORBIDDEN).send('move: Not user\'s turn');
			return;
		}

		if (!chess.move(move)) {
			// Illegal move
			console.log('User ' + uid + ' tried to move out of turn');
			res.status(httpCodes.FORBIDDEN).send('move: Invalid move');
			return;
		}

		// Construct database update
		const databaseUpdate: any = {};
		{
			const moveKey = (await db.ref('games').child(gid).child('board').child('moves').push()).key;
			databaseUpdate['games/' + gid + '/moves/' + moveKey] = move;

			if (chess.game_over()) {
				let newStatus: string = '';
				if (chess.in_checkmate())
					newStatus = 'cm_' + team;
				else if (chess.insufficient_material())
					newStatus = 'ins';
				else if (chess.in_draw())
					newStatus = 'draw';
				else if (chess.in_stalemate())
					newStatus = 'stale';
				// TODO: Give player the option to draw on three fold repetition
				else if (chess.in_threefold_repetition())
					newStatus = '3fold';

				if (newStatus) {
					databaseUpdate['games/' + gid + '/status'] = newStatus;
					databaseUpdate['gameList/' + gid + '/status'] = newStatus;
				}
			}
		}
		// Save changes to database
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('/move', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});

module.exports = apiRouter;
