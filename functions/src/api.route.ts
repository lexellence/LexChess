import express from 'express';
import httpCodes from 'http-status-codes';
// import { validateBody, schemas } from './validator';
import admin from 'firebase-admin';

// import Chess from 'chess.js'
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
async function getGameList() {
	const gameListSnapshot = await db.ref('games').once('value');
	if (!gameListSnapshot.exists())
		return [];
	const gameList = gameListSnapshot.val();
	if (!gameList)
		return [];
	const convertedGameList = Object.entries(gameList)
		.map((game: any, i) => {
			return {
				gid: game[0],
				status: game[1].core.status,
				name_w: game[1].names.w,
				name_b: game[1].names.b,
				name_d: game[1].names.d,
			};
		});
	return convertedGameList;
}
//+------------------------\----------------------------------
//|	 	   getGame  	   |
//\------------------------/
//	Returns game object, or null if game does not exist.
//	If includeBoard is set to false, the moves/fen will be omitted.
//------------------------------------------------------------
async function getGame(gid: string, includeBoard: boolean = true): Promise<any> {
	const gameRef = db.ref('games').child(gid);
	if (includeBoard) {
		const gameSnapshot = await gameRef.once('value');
		if (!gameSnapshot.exists())
			return null;
		else {
			const game = gameSnapshot.val();
			game.board.moves = game.board.moves ? Object.values(game.board.moves) : [];
			return game;
		}
	}
	else {
		// Don't include board
		const snapshots = await Promise.all([
			gameRef.child('core').once('value'),
			gameRef.child('names').once('value'),
		]);
		if ((!snapshots[0].exists && snapshots[1].exists) ||
			(snapshots[0].exists && !snapshots[1].exists)) {
			console.error('Game ' + gid + ' is missing a component');
			return null;
		}
		else if (!snapshots[0].exists) {
			console.error('Game ' + gid + ' does not exist');
			return null;
		}
		else {
			return {
				core: snapshots[0].val(),
				names: snapshots[1].val(),
			}
		}
	}
}
//+------------------------\----------------------------------
//|	 	 getUserGame  	   |
//\------------------------/
//	Returns { game, gid } object for game that user is in, or { null, null } if user not in a game.
//	If includeBoard is set to false, the moves/fen will be omitted.
//------------------------------------------------------------
async function getUserGame(uid: string, includeBoard: boolean = true): Promise<any> {
	let game = null;
	let gid = null;

	const user = await getUser(uid);
	if (user.gid) {
		gid = user.gid;
		game = await getGame(gid, includeBoard);
		if (game === null) {
			// Game not found, remove from user
			console.error('Game ID ' + user.gid + ' refers to nonexistent game. User = ' + uid);
			await db.ref('users').child(uid).update({ gid: 0 });
		}
	}
	return { game, gid };
}
//+------------------------\----------------------------------
//|	 	   getUser    	   |
//\------------------------/
// 	Returns user db object, creating one if none exists.
//------------------------------------------------------------
async function getUser(uid: string) {
	const userRef = db.ref('users/' + uid);
	let user = (await userRef.once('value')).val();
	if (user === null) {
		user = { gid: 0 };
		await userRef.set(user);
	}
	return user;
}
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
async function getPlayState(uid: string) {
	const playState: any = {};
	const { game } = await getUserGame(uid, true)

	// Not in game
	if (!game) {
		// Game list
		playState.inGame = false;
		playState.gameList = await getGameList();
	}
	// In game
	else {
		// Status
		playState.inGame = true;
		playState.status = game.core.status;

		// User's team
		if (uid === game.core.uid_w)
			playState.team = 'w';
		else if (uid === game.core.uid_b)
			playState.team = 'b';
		else if (uid === game.core.uid_d)
			playState.team = 'd';
		else
			playState.team = 'o';

		// Names
		playState.name_w = game.names.w;
		playState.name_b = game.names.b;
		playState.name_d = game.names.d;

		// Board
		playState.moves = (game.board.moves ? game.board.moves : []);
		playState.fen = game.board.fen;
	}
	return playState;
}
//+------------------------------\----------------------------
//|	    GET /get-play-state      |
//\------------------------------/
//
//------------------------------------------------------------
apiRouter.get("/get-play-state", async (req: any, res: any) => {
	try {
		const { uid } = req.decodedClaims;

		console.log('***** Getting User PlayState *****');
		const playState = await getPlayState(uid);
		console.log(playState);
		res.status(httpCodes.OK).json(playState);
		return;
	} catch (error) {
		console.log('/get-play-state', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
		return;
	}
});
//+------------------------------\----------------------------
//|	          newGame   		 |
//\------------------------------/
//	Returns an initialized game object.
//	Values of team other than {'w','b'} will defer team choice.
//------------------------------------------------------------
const newGame = (uid: string, name: string, team: string) => {
	const isWhite = (team === 'w');
	const isBlack = (team === 'b');
	const isDefer = (!isWhite && !isBlack);

	return {
		core: {
			status: 'wait',
			uid_w: isWhite ? uid : 0,
			uid_b: isBlack ? uid : 0,
			uid_d: isDefer ? uid : 0,
		},
		names: {
			w: isWhite ? name : '',
			b: isBlack ? name : '',
			d: isDefer ? name : '',
		},
		board: {
			// moves: [],
			fen: (new Chess()).fen(),
		},
	}
};
//+------------------------------\----------------------------
//|	  POST /create-game/:team    | 
//\------------------------------/
//	starts game as :team = 'w' or 'b'
//	Any other values of :team will defer team choice.
//------------------------------------------------------------
apiRouter.post("/create-game/:team", async (req: any, res: any) => {
	try {
		const { uid, name } = req.decodedClaims;
		const team = req.params.team;

		const user = await getUser(uid);
		if (user.gid) {
			console.log('User ' + uid + ' tried to create a game but is already in a game');
			res.status(httpCodes.FORBIDDEN).send('create-game: User already in a game');
			return;
		}

		// New game
		const game = newGame(uid, name, team);

		// Save game to database
		console.log('***** Game Created *****');
		console.log(game);
		const gameRef = await db.ref('games').push(game);

		// Update user's gid
		const gameSnapshot = await gameRef.once('value');
		await db.ref('users/' + uid).update({ gid: gameSnapshot.key });

		res.status(httpCodes.OK).json(await getPlayState(uid));
		return;
	} catch (error) {
		console.log('/create-game', error);
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

		// Can't join if you're already in a game
		let { game } = await getUserGame(uid, false);
		if (game) {
			console.log('User ' + uid + ' tried to join a game but is already in a game');
			res.status(httpCodes.FORBIDDEN).send('join-game: You are already in a game');
			return;
		}

		// Find game to join
		game = await getGame(gid, false);
		if (!game) {
			console.log('User ' + uid + ' tried to join game ' + gid + ' but it does not exist');
			res.status(httpCodes.FORBIDDEN).send('Game does not exist');
			return;
		}

		// Add game to user
		const databaseUpdate: any = {};
		{
			databaseUpdate['users/' + uid + '/gid'] = gid;

			// If game is not in 'wait' mode, or client tries to join unavailable team,
			//	then user becomes a spectator and not added to game data
			const isTeamAvailable = (team === 'w' && !game.core.uid_w) || (team === 'b' && !game.core.uid_b);
			if (isTeamAvailable && game.core.status === 'wait') {
				// Start game
				databaseUpdate['games/' + gid + '/core/status'] = 'play';

				// Join team
				databaseUpdate['games/' + gid + '/core/uid_' + team] = uid;
				databaseUpdate['games/' + gid + '/names/' + team] = name;

				// Move defer player to their team
				if (game.core.uid_d) {
					const otherTeam = (team === 'w') ? 'b' : 'w';
					databaseUpdate['games/' + gid + '/core/uid_' + otherTeam] = game.core.uid_d;
					databaseUpdate['games/' + gid + '/core/uid_d'] = 0;
					databaseUpdate['games/' + gid + '/names/' + otherTeam] = game.names.d;
					databaseUpdate['games/' + gid + '/names/d'] = 0;
				}
			}
		}
		// Save changes to database
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).json(await getPlayState(uid));
		return;
	} catch (error) {
		console.log('/join-game', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});
//+------------------------\----------------------------------
//|	   PUT /leave-game     |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/leave-game", async (req: any, res: any) => {
	try {
		const { uid } = req.decodedClaims;

		// Can't leave if you're not in a game
		const { game, gid } = await getUserGame(uid, false);
		if (!game) {
			console.log('User ' + uid + ' tried to leave game but is not in one');
			res.status(httpCodes.FORBIDDEN).send('You are not in a game');
			return;
		}

		// Construct database update
		const databaseUpdate: any = {};
		{
			const userIsPlayer = (uid === game.core.uid_w || uid === game.core.uid_b || uid === game.core.uid_d);
			if (userIsPlayer) {
				if (game.core.status === 'wait') {
					// Delete game not yet started			
					// databaseUpdate.games[gid] = null;
					databaseUpdate['games/' + gid] = null;
				}
				else if (game.core.status === 'play') {
					// Concede defeat
					if (uid === game.core.uid_w)
						databaseUpdate['games/' + gid + '/core/status'] = 'con_b';
					else if (uid === game.core.uid_b)
						databaseUpdate['games/' + gid + '/core/status'] = 'con_w';
				}
			}

			// Remove game from user
			databaseUpdate['users/' + uid + '/gid'] = 0;
		}
		// Save changes to database
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).json(await getPlayState(uid));
		return;
	} catch (error) {
		console.log('/leave-game', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});
//+------------------------\----------------------------------
//|	      PUT /move        |
//\------------------------/
//
//------------------------------------------------------------
apiRouter.put("/move/:move", async (req: any, res: any) => {
	try {
		const { uid } = req.decodedClaims;
		const move = req.params.move;

		// User must be in a game
		const { game, gid } = await getUserGame(uid, true);
		if (!game) {
			console.log('User ' + uid + ' tried to move but is not in a game');
			res.status(httpCodes.FORBIDDEN).send('move: You are not in a game');
			return;
		}

		// Game must be in 'play' mode
		if (game.core.status !== 'play') {
			console.log('User ' + uid + ' tried to move but game status is ' + game.core.status);
			res.status(httpCodes.FORBIDDEN).send('move: Your game is not in progress');
			return;
		}

		// Redo all chess moves (constructing from fen would not detect three-fold repetition, for example)
		const chess = new Chess();
		console.log('game:', game);
		console.log('moves:', game.board.moves);
		if (game.board.moves)
			// Object.values(game.board.moves).forEach(m => {
			game.board.moves.forEach((m: string) => {
				console.log('move:', m);
				if (!chess.move(m))
					throw new Error('move: Invalid list of previous moves');
			});

		// TODO: Do I really need to validate this?
		// Validate fen string
		if (game.board.fen !== chess.fen())
			throw new Error('move: Moves list and board do not match');

		// Determine user's team
		let team: string;
		if (uid === game.core.uid_w)
			team = 'w';
		else if (uid === game.core.uid_b)
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
			const moveKey = db.ref('games').child(gid).child('board').child('moves').push().key;
			databaseUpdate['games/' + gid + '/board/moves/' + moveKey] = move;
			databaseUpdate['games/' + gid + '/board/fen'] = chess.fen();

			if (chess.game_over()) {
				if (chess.in_checkmate()) {
					databaseUpdate['games/' + gid + '/core/status'] = 'cm_' + team;
				}
				else if (chess.insufficient_material()) {
					databaseUpdate['games/' + gid + '/core/status'] = 'ins';
				}
				else if (chess.in_draw()) {
					databaseUpdate['games/' + gid + '/core/status'] = 'draw';
				}
				else if (chess.in_stalemate()) {
					databaseUpdate['games/' + gid + '/core/status'] = 'stale';
				}
				// TODO: Give player the option to draw on three fold repetition
				else if (chess.in_threefold_repetition()) {
					databaseUpdate['games/' + gid + '/core/status'] = '3fold';
				}
			}
		}
		// Save changes to database
		await db.ref().update(databaseUpdate);

		res.status(httpCodes.OK).json(await getPlayState(uid));
		return;
	} catch (error) {
		console.log('/move', error);
		res.status(httpCodes.INTERNAL_SERVER_ERROR).send(error);
	}
});

module.exports = apiRouter;
