// TODO: convert to TS
import React from 'react';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router-dom';

import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { withFirebaseListener } from '../FirebaseListener';
import GameCanvas from './GameCanvas';
import * as Chess from 'chess.js';
import { withPlayAPI } from '../API';
import * as ROUTES from '../constants/routes';

const CANVAS_SIZE = 360;

const INITIAL_GAME_STATE = {
	historyPosition: 0,
	selectedSquare: null,
	game: null,
	errorMessage: null,
};
const INITIAL_STATE = {
	...INITIAL_GAME_STATE,
	authUser: null,
};

class GamePageBase extends React.Component {
	state = { ...INITIAL_STATE };
	chess = new Chess();
	gid = this.props.gid;

	componentDidMount() {
		this.registerAuthListener();
	};
	componentWillUnmount() {
		if (this.unregisterGameListener)
			this.unregisterGameListener();

		this.unregisterAuthListener();
	}
	registerAuthListener = () => {
		const onSignIn = (authUser) => {
			this.setState({ authUser });
			this.registerGameListener();
		};
		const onSignOut = () => {
			this.unregisterGameListener();
			this.setState({ authUser: null });
		};
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	};
	registerGameListener = () => {
		const handleGameUpdate = (game) => {
			if (!game) {
				// Game does not exist
				this.props.history.push(ROUTES.GAME_LIST);
				return;
			}

			// Apply previous moves
			this.chess.reset();
			if (game.moves.length)
				for (let i = 0; i < game.moves.length; i++)
					if (!this.chess.move(game.moves[i])) {
						this.setState({ ...INITIAL_GAME_STATE, errorMessage: 'Invalid list of previous moves' });
						return;
					}
			this.setState({ ...INITIAL_GAME_STATE, game });
		};
		this.unregisterGameListener = this.props.firebaseListener.registerGameListener(handleGameUpdate, this.gid);
	};
	canGoBackInHistory = () => {
		return (this.state.game?.moves?.length &&
			this.state.historyPosition < this.state.game.moves.length);
	};
	canGoForwardInHistory = () => {
		return (this.state.game?.moves?.length &&
			this.state.historyPosition > 0);
	};

	undoMove = () => {
		return this.chess.undo() ? true : false;
	};
	showPrevious = () => {
		if (this.canGoBackInHistory()) {
			if (this.undoMove())
				this.setState((prev) => ({ historyPosition: prev.historyPosition + 1 }));
			// TODO: Error handling
		}
	};
	redoMove = (moveIndex) => {
		const move = this.state.game.moves[moveIndex];
		return this.chess.move(move) ? true : false;
	};
	showNext = () => {
		if (this.canGoForwardInHistory()) {
			const moveIndex = this.state.game.moves.length - this.state.historyPosition;
			if (this.redoMove(moveIndex))
				this.setState((prev) => ({ historyPosition: prev.historyPosition - 1 }));
			// TODO: Error handling
		}
	};
	showPresent = () => {
		if (this.canGoForwardInHistory()) {
			let historyPosition = this.state.historyPosition;
			while (historyPosition > 0) {
				const moveIndex = this.state.game.moves.length - historyPosition;
				if (this.redoMove(moveIndex))
					historyPosition--;
				else
					break;
				// TODO: Error handling
			}
			this.setState((prev) => ({ historyPosition }));
		}
	};

	getTeam = () => {
		// Determine user's team
		if (this.state.game.uid_w === this.state.authUser.uid)
			return 'w';
		else if (this.state.game.uid_b === this.state.authUser.uid)
			return 'b';
		else if (this.state.game.uid_d === this.state.authUser.uid)
			return 'd';
		else
			return 'o';
	};
	handleMouseDownCanvas = (square) => {
		// Is user logged in?
		if (!this.state.authUser)
			return;

		// Is game in progress?
		if (this.state.game.status !== 'play')
			return;

		// Is it user's turn?
		const team = this.getTeam();
		if (this.chess.turn() !== team)
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
				const move = this.chess.move({ from: this.state.selectedSquare, to: square });
				if (move) {
					this.move(move.san);
					this.setState((prev) => ({ selectedSquare: null }));
				}
				return;
			}
		}

		// Did they click on one of their pieces?
		const piece = this.chess.get(square);
		if (piece) {
			if (piece.color === team) {
				this.setState({ selectedSquare: square });
			}
		}

		// Did they click on a piece that has valid moves?
		// Indicate no moves, or highlight all possible moves 

	};
	handleMouseUpCanvas = (square) => {

	};

	leaveGame = () => {
		this.props.playAPI.leaveGame(this.gid);
	};
	move = (moveString) => {
		this.props.playAPI.move(this.gid, moveString);
	};

	render() {
		const { historyPosition, selectedSquare, game, errorMessage } = this.state;
		const { isWaitingForMoveTable, isWaitingForQuitTable } = this.props.playAPI;

		// Error
		if (errorMessage)
			return <div align='center'>Something happened: {errorMessage}</div>;

		// Loading
		if (!game)
			return <div align='center'>Loading...</div>;

		// Determine user's team
		const team = this.getTeam();

		const blackPossessiveName = (team === 'b') ? 'Your' : game.name_b + '\'s';
		const whitePossessiveName = (team === 'w') ? 'Your' : game.name_w + '\'s';
		const blackMoveText = blackPossessiveName + ' move';
		const whiteMoveText = whitePossessiveName + ' move';

		const inCheck = this.chess.in_check();
		let gameTitleVisibility = 'visible';
		let gameTitleText;
		switch (game.status) {
			case 'wait': gameTitleText = 'Waiting for another player to join...'; break;
			case 'play': gameTitleText = inCheck ? 'Check!' : 'invisible'; break;
			case 'draw': gameTitleText = 'Game ended in a draw.'; break;
			case 'stale': gameTitleText = 'Game ended in a draw due to stalemate.'; break;
			case 'ins': gameTitleText = 'Game ended in a draw due to insufficient material.'; break;
			case '3fold': gameTitleText = 'Game ended in a draw due to three-fold repetition.'; break;
			case 'cm_w': gameTitleText = 'Checkmate! ' + game.name_w + ' wins.'; break;
			case 'cm_b': gameTitleText = 'Checkmate! ' + game.name_b + ' wins.'; break;
			case 'con_w': gameTitleText = game.name_b + ' conceded. ' + game.name_w + ' wins!'; break;
			case 'con_b': gameTitleText = game.name_w + ' conceded. ' + game.name_b + ' wins!'; break;
			default: gameTitleText = 'invisible'; break;
		}
		if (gameTitleText === 'invisible')
			gameTitleVisibility = 'hidden';
		const gameControlsVisibility = (game.status === 'wait') ? 'hidden' : 'visible';

		const blackTurnTextVisibility = (game.status === 'play' && this.chess.turn() === 'b') ? 'visible' : 'hidden';
		const whiteTurnTextVisibility = (game.status === 'play' && this.chess.turn() === 'w') ? 'visible' : 'hidden';
		const lastMoveVisibility = this.canGoBackInHistory() ? 'visible' : 'hidden';
		const nextMoveVisibility = this.canGoForwardInHistory() ? 'visible' : 'hidden';

		return (
			<div align='center' style={{ display: 'block' }}>
				<h4 style={{ visibility: gameTitleVisibility, display: 'block' }}>{gameTitleText}</h4>

				<p style={{ visibility: blackTurnTextVisibility }}>{blackMoveText}</p>
				<GameCanvas size={CANVAS_SIZE}
					board={this.chess.board()}
					selectedSquare={selectedSquare}
					onMouseDown={this.handleMouseDownCanvas}
					onMouseUp={this.handleMouseUpCanvas} />
				<p style={{ visibility: whiteTurnTextVisibility }}>{whiteMoveText}</p>

				<div style={{ visibility: gameControlsVisibility }}>
					<Button onClick={this.showPrevious} style={{ visibility: lastMoveVisibility }}>Back</Button>
					<Button onClick={this.showNext} style={{ visibility: nextMoveVisibility }}>Forward</Button>
					<Button onClick={this.showPresent} style={{ visibility: nextMoveVisibility }}>Now</Button><br />
					<p style={{ visibility: nextMoveVisibility }}>Moves back: {historyPosition}</p>
					<table style={{ width: '300px' }}>
						<tbody>
							<tr><th>Your time</th><th>Their time</th></tr>
							<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
						</tbody>
					</table>
					<p>My team: {team}</p>
				</div>

				<Button onClick={this.leaveGame}>Quit</Button>
			</div >
		);
	}
};

const conditionFunc = function (authUser) {
	return !!authUser;
};

const GamePage =
	withRouter(
		withFirebaseListener(
			withPlayAPI(
				withEmailVerification(
					withAuthorization(conditionFunc)(
						GamePageBase)))));

export default GamePage;
