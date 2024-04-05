import express from 'express';
import httpCodes from 'http-status-codes';
import admin from 'firebase-admin';

import * as ChessJS from "chess.js";
const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

const apiRouter = express.Router();
const db = admin.database();

const MAX_CONCURRENT_GAMES = 3;
async function HasRoomForAnotherGame(uid: string): Promise<boolean> {
	const hasRoom: boolean = (await db.ref(`users/${uid}/play`).once('value')).numChildren() < MAX_CONCURRENT_GAMES;
	return hasRoom;
}

//+-----------------------------------------------\-----------
//|	  POST /create-game/:team/:time/:increment    |
//\-----------------------------------------------/
//	starts game as :team = 'w' or 'b'.
//		Any other values will defer team choice.
//	:time (minutes per player) >= '1' enables time.
//		Any other values will disable time.
//	:increment (seconds per turn) >= '1' enables increments.
//		Any other values will disable increments.
//		If :time is disabled, this value is ignored
//			and increments are disabled.
//------------------------------------------------------------
apiRouter.post("/create-game/:team/:time/:increment", async (req: any, res: any) => {
	try {
		const { uid, name } = req.decodedClaims;
		const { team } = req.params;

		const userMaxedOut = !(await HasRoomForAnotherGame(uid));
		if (userMaxedOut) {
			console.log('User ' + uid + ' tried to create a new game but already has the maximum number of games.');
			res.status(httpCodes.FORBIDDEN).send('User already in the maximum number of concurrent games');
			return;
		}

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
		databaseUpdate[`users/${uid}/play/${gid}`] = { myTurn: false, visited: false };
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

		const userMaxedOut = !(await HasRoomForAnotherGame(uid));
		if (userMaxedOut) {
			console.log('User ' + uid + ' tried to join game ' + gid + ' but already has the maximum number of games.');
			res.status(httpCodes.FORBIDDEN).send('User already in the maximum number of concurrent games');
			return;
		}

		// Can't join game you're already in
		if ((await db.ref(`users/${uid}/play/${gid}`).once('value')).exists()) {
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

		const databaseUpdate: any = {};
		{
			// Add game to user
			databaseUpdate[`users/${uid}/play/${gid}/myTurn`] = false;
			databaseUpdate[`users/${uid}/play/${gid}/visited`] = false;

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
				let opponentUID: string;
				const opponentTeam = (team === 'w') ? 'b' : 'w';
				if (game.uid_d) {
					opponentUID = game.uid_d;
					databaseUpdate[`games/${gid}/uid_${opponentTeam}`] = game.uid_d;
					databaseUpdate[`games/${gid}/uid_d`] = 0;

					databaseUpdate[`games/${gid}/name_${opponentTeam}`] = game.name_d;
					databaseUpdate[`gameList/${gid}/name_${opponentTeam}`] = game.name_d;

					databaseUpdate[`games/${gid}/name_d`] = 0;
					databaseUpdate[`gameList/${gid}/name_d`] = 0;
				}
				else
					opponentUID = game[`uid_${opponentTeam}`];

				// Update users
				databaseUpdate[`users/${uid}/play/${gid}/myTurn`] = (team === 'w');
				databaseUpdate[`users/${opponentUID}/play/${gid}/myTurn`] = (opponentTeam === 'w');
			}
		}
		// Save changes to database
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('Error in /join-game:', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});
//+------------------------\----------------------------------
//|	   PUT /visit-game     |
//\------------------------/
//	
//------------------------------------------------------------
apiRouter.put("/visit-game/:gid", async (req: any, res: any) => {
	try {
		const { uid } = req.decodedClaims;
		const { gid } = req.params;

		const ref = db.ref(`users/${uid}/play/${gid}`);
		if ((await ref.once('value')).exists())
			await ref.update({ visited: true });

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('Error in /visit-game:', error);
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
		const isUserPlaying = (await db.ref(`users/${uid}/play/${gid}`).once('value')).exists();
		const game = (await db.ref(`games/${gid}`).once('value')).val();
		if (!isUserPlaying || !game) {
			console.log(`User tried to leave game but is not in it (uid=${uid} gid=${gid})`);
			res.status(httpCodes.FORBIDDEN).send('You are not in that game');
			return;
		}

		// Construct database update
		const databaseUpdate: any = {};
		if (game.status === 'play' && (uid === game.uid_w || uid === game.uid_b)) {
			// Concede defeat
			let opponentUID: string;
			if (uid === game.uid_w) {
				opponentUID = game.uid_b;
				databaseUpdate[`games/${gid}/status`] = 'con_b';
				databaseUpdate[`gameList/${gid}/status`] = 'con_b';
			}
			else {
				opponentUID = game.uid_w;
				databaseUpdate[`games/${gid}/status`] = 'con_w';
				databaseUpdate[`gameList/${gid}/status`] = 'con_w';
			}

			// Add game to users' histories
			databaseUpdate[`users/${uid}/past/${gid}`] = true;
			databaseUpdate[`users/${opponentUID}/past/${gid}`] = true;

			// Update users
			databaseUpdate[`users/${uid}/play/${gid}/myTurn`] = false;
			databaseUpdate[`users/${opponentUID}/play/${gid}/myTurn`] = false;
		}
		else {
			if (game.status === 'wait' && uid === game.uid_d) {
				// Delete game not yet started			
				databaseUpdate[`games/${gid}`] = null;
				databaseUpdate[`gameList/${gid}`] = null;
			}
			// Remove game from user's playing list
			databaseUpdate[`users/${uid}/play/${gid}`] = null;
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
		const isUserTurn = (await db.ref(`users/${uid}/play/${gid}/myTurn`).once('value')).val();
		const game = (await db.ref(`games/${gid}`).once('value')).val();
		if (isUserTurn === null || !game) {
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

		// Must be user's turn
		if (!isUserTurn) {
			console.log('User ' + uid + ' tried to move out of turn');
			res.status(httpCodes.FORBIDDEN).send('move: Not user\'s turn');
			return;
		}

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

		// Redo all chess moves (constructing from fen would not detect three-fold repetition, for example)
		const chess = new Chess();
		if (game.moves)
			Object.values(game.moves).forEach(value => {
				if (typeof (value) !== 'string' || !chess.move(value))
					throw new Error('move: Invalid list of previous moves');
			});

		// Try move
		if (!chess.move(move)) {
			// Illegal move
			console.log('User ' + uid + ' tried to move out of turn');
			res.status(httpCodes.FORBIDDEN).send('move: Invalid move');
			return;
		}

		// Update database
		const opponentUID = team === 'w' ? game.uid_b : game.uid_w;
		const databaseUpdate: any = {};
		const moveKey = (await db.ref('games').child(gid).child('board').child('moves').push()).key;
		databaseUpdate['games/' + gid + '/moves/' + moveKey] = move;
		if (chess.isGameOver()) {
			let newStatus: string = '';
			if (chess.isCheckmate())
				newStatus = 'cm_' + team;
			else if (chess.isInsufficientMaterial())
				newStatus = 'ins';
			else if (chess.isDraw())
				newStatus = 'draw';
			else if (chess.isStalemate())
				newStatus = 'stale';
			// TODO: Give player the option to draw on three fold repetition
			else if (chess.isThreefoldRepetition())
				newStatus = '3fold';

			if (newStatus) {
				databaseUpdate['games/' + gid + '/status'] = newStatus;
				databaseUpdate['gameList/' + gid + '/status'] = newStatus;
			}

			// Update users - game over
			databaseUpdate[`users/${uid}/play/${gid}/myTurn`] = false;
			databaseUpdate[`users/${opponentUID}/play/${gid}/myTurn`] = false;
		}
		else {
			// Update users - next turn
			databaseUpdate[`users/${uid}/play/${gid}/myTurn`] = false;
			databaseUpdate[`users/${opponentUID}/play/${gid}/myTurn`] = true;
		}
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).send();
		return;
	} catch (error) {
		console.log('/move', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});

module.exports = apiRouter;
