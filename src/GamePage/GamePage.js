// TODO: convert to TS
import React from 'react';
import Button from 'react-bootstrap/Button';

import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import GameCanvas from './GameCanvas';
import GameList from './GameList';
import * as api from '../api';
// import { Chess } from 'chess.js';
import * as Chess from 'chess.js';

const CANVAS_SIZE = 360;

// const MODE_LOADING = 0;
// const MODE_LIST = 1;
// const MODE_PLAYING = 2;
// const MODE_ERROR = 3;


const INITIAL_STATE = {
	// mode: MODE_LOADING,
	loadingPlay: true,
	errorMessage: '',
	playState: {
		inGame: false,
		gameList: []
	},
	historyPosition: 0,
	// board: null,
	selectedSquare: null,
	// possibleDestinationSquares: null,
};

class GamePageBase extends React.Component {
	state = { ...INITIAL_STATE };
	user = null;
	chess = null;

	componentDidMount() {
		const onSignIn = (authUser) => {
			this.user = authUser;
			this.start();
		};
		const onSignOut = () => {
			this.user = null;
			this.setState({ ...INITIAL_STATE });
		};
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);

		// Stop double-click from selecting text outside canvas
		// document.getElementById('gamePage').onselectstart = () => false;
	}
	componentWillUnmount() {
		this.unregisterAuthListener();
	}

	// componentDidUpdate() {
	// };

	setPlayState = (playState) => {
		let stateUpdate = { loadingPlay: false };
		if (playState) {
			stateUpdate.playState = playState;

			if (playState.inGame) {
				// this.chess = new Chess(playState.fen);
				this.chess = new Chess();
				playState.moves.forEach(m => {
					if (!this.chess.move(m))
						throw new Error('Invalid list of previous moves');
				});

				// stateUpdate.board = this.chess.board();
			}
			else {
				this.chess = null;
				// stateUpdate.board = null;
				stateUpdate.selectedSquare = null;
				// stateUpdate.possibleDestinationSquares = null;
			}
		}
		this.setState(stateUpdate);
	};

	getToken = async () => {
		if (!this.user) {
			alert("Cannot get token: user not logged in.");
			return null;
		}
		try {
			return await this.user.getIdToken();
		}
		catch (error) {
			// TODO: error mode in render()
			console.log(error);
			alert('Failed to get auth token');
			return null;
		};
	};

	start = async () => {
		const token = await this.getToken();
		if (token) {
			try {
				this.setPlayState(await api.getPlayState(token));
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};
	createGame = async (team) => {
		const token = await this.getToken();
		if (token) {
			try {
				this.setPlayState(await api.createGame(token, team));
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};
	joinGame = async (gid, team) => {
		const token = await this.getToken();
		if (token) {
			try {
				this.setPlayState(await api.joinGame(token, gid, team));
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};
	leaveGame = async () => {
		const token = await this.getToken();
		if (token) {
			try {
				this.setPlayState(await api.leaveGame(token));
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};
	move = async (moveString) => {
		const token = await this.getToken();
		if (token) {
			try {
				this.setPlayState(await api.move(token, moveString));
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};

	canGoBackInHistory = () => {
		console.log('moves', this.state.playState.moves);
		console.log('historyPosition', this.state.historyPosition);
		return (this.state.historyPosition < this.state.playState.moves.length);
	};
	canGoForwardInHistory = () => {
		return (this.state.historyPosition > 0);
	};

	undoMove = () => {
		return this.chess.undo() ? true : false;
	};
	showPrevious = () => {
		if (this.canGoBackInHistory()) {
			if (this.undoMove())
				this.setState((prev) => ({ historyPosition: prev.historyPosition + 1 }));
		}
		// TODO: Error handling
	};
	redoMove = (moveIndex) => {
		const move = this.state.playState.moves[moveIndex];
		return this.chess.move(move) ? true : false;
	};
	showNext = () => {
		if (this.canGoForwardInHistory()) {
			const moveIndex = this.state.playState.moves.length - this.state.historyPosition;
			if (this.redoMove(moveIndex))
				this.setState((prev) => ({ historyPosition: prev.historyPosition - 1 }));
		}
		// TODO: Error handling
	};
	showPresent = () => {
		if (this.canGoForwardInHistory()) {
			let historyPosition = this.state.historyPosition;
			while (historyPosition > 0) {
				const moveIndex = this.state.playState.moves.length - historyPosition;
				if (this.redoMove(moveIndex))
					historyPosition--;
				else
					break;
			}
			this.setState((prev) => ({ historyPosition: historyPosition }));
		}
	};
	// TODO: Error handling

	handleMouseDownCanvas = (square) => {
		console.log('square ' + square);

		// if (!square.isValid())
		// 	this.setState((prev) => {
		// 		if (prev.selectedSquare)
		// 			return { selectedSquare: null };
		// 		else
		// 			return null;
		// 	});

		// Is game in progress?
		if (this.state.playState.status !== 'play')
			return;

		// Is it user's turn?
		if (this.state.playState.team !== this.chess.turn())
			return;

		// Do they already have a piece chosen?
		if (this.state.selectedSquare) {
			// Did they cancel their selection?
			if (this.state.selectedSquare === square) {
				this.setState((prev) => ({ selectedSquare: null }));
				return;
			}
			else {
				// Can they move their selected piece here?
				// if (this.chess.moves({ square: this.state.selectedSquare }).includes(square)) {
				console.log('from ' + this.state.selectedSquare + ' to ' + square);
				const move = this.chess.move({ from: this.state.selectedSquare, to: square });
				if (move) {
					this.move(move.san);
					this.setState((prev) => ({ selectedSquare: null }));
				}
				// }
				return;

			}
		}

		// Did they click on one of their pieces?
		const piece = this.chess.get(square);
		console.log('piece: ', piece);

		if (piece) {
			if (piece.color === this.state.playState.team) {
				console.log('moves', this.chess.moves({ square: square }));
				this.setState({ selectedSquare: square });
			}
		}

		// Did they click on a piece that has valid moves?
		// Indicate no moves, or highlight all possible moves 

	};
	handleMouseUpCanvas = (square) => {

	};
	render() {
		// Loading
		if (this.state.loadingPlay)
			return <div align='center'>Loading...</div>;

		const ps = this.state.playState;
		if (ps.inGame) {
			const myTeamText = ps.team;
			const blackPossessiveName = (ps.team === 'o' || ps.team === 'w') ? ps.name_b + '\'s' : 'Your';
			const whitePossessiveName = (ps.team === 'o' || ps.team === 'b') ? ps.name_w + '\'s' : 'Your';
			const blackMoveText = blackPossessiveName + ' move';
			const whiteMoveText = whitePossessiveName + ' move';

			let gameTitleText;
			switch (ps.status) {
				case 'wait': gameTitleText = 'Waiting for another player to join...'; break;;
				case 'play': gameTitleText = 'Game in progress.'; break;
				case 'draw': gameTitleText = 'Game ended in a draw.'; break;
				case 'stale': gameTitleText = 'Game ended in a draw due to stalemate.'; break;
				case 'ins': gameTitleText = 'Game ended in a draw due to insufficient material.'; break;
				case '3fold': gameTitleText = 'Game ended in a draw due to three-fold repetition.'; break;
				case 'cm_w': gameTitleText = 'Checkmate! ' + ps.name_w + ' wins.'; break;
				case 'cm_b': gameTitleText = 'Checkmate! ' + ps.name_b + ' wins.'; break;
				case 'con_w': gameTitleText = ps.name_b + ' conceded. ' + ps.name_w + ' wins!'; break;
				case 'con_b': gameTitleText = ps.name_w + ' conceded. ' + ps.name_b + ' wins!'; break;
				default: gameTitleText = ''; break;
			}
			const gameTitleVisibility = 'visible';
			const gameControlsVisibility = (ps.status === 'wait') ? 'hidden' : 'visible';

			const blackTurnTextVisibility = (ps.status === 'play' && this.chess.turn() === 'b') ? 'visible' : 'hidden';
			const whiteTurnTextVisibility = (ps.status === 'play' && this.chess.turn() === 'w') ? 'visible' : 'hidden';
			const lastMoveVisibility = this.canGoBackInHistory() ? 'visible' : 'hidden';
			const nextMoveVisibility = this.canGoForwardInHistory() ? 'visible' : 'hidden';

			return (
				<div align='center' style={{ display: 'block' }}>
					<h4 style={{ visibility: gameTitleVisibility }}>{gameTitleText}</h4>

					<p style={{ visibility: blackTurnTextVisibility }}>{blackMoveText}</p>
					<GameCanvas size={CANVAS_SIZE}
						board={this.chess.board()}
						selectedSquare={this.state.selectedSquare}
						onMouseDown={this.handleMouseDownCanvas}
						onMouseUp={this.handleMouseUpCanvas} />
					<p style={{ visibility: whiteTurnTextVisibility }}>{whiteMoveText}</p>

					<div style={{ visibility: gameControlsVisibility }}>
						<Button onClick={this.showPrevious} style={{ visibility: lastMoveVisibility }}>Back</Button>
						<Button onClick={this.showNext} style={{ visibility: nextMoveVisibility }}>Forward</Button>
						<Button onClick={this.showPresent} style={{ visibility: nextMoveVisibility }}>Now</Button><br />
						<p style={{ visibility: nextMoveVisibility }}>Moves back: {this.state.historyPosition}</p>
						<table style={{ width: '300px' }}>
							<tr><th>Your time</th><th>Their time</th></tr>
							<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
						</table>
						<p>My team: {myTeamText}</p>
					</div>

					<Button onClick={this.leaveGame}>Quit</Button>
				</div >
			);
		}
		else {
			// !inGame
			return (
				<div align='center' style={{ display: 'block' }}>
					<h1>Game List</h1>
					<Button onClick={() => this.createGame('w')}>Create game as white</Button>
					<Button onClick={() => this.createGame('b')}>Create game as black</Button>
					<Button onClick={() => this.createGame('d')}>Create game and defer</Button>
					<GameList gameList={this.state.playState.gameList}
						joinGameCallback={this.joinGame} />
				</div >
			);
		}
	}
};

const conditionFunc = authUser => !!authUser;

const GamePage =
	withEmailVerification(
		withAuthorization(conditionFunc)(
			GamePageBase));

export default GamePage;
