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

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 360;

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
};

class GamePageBase extends React.Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
		this.user = null;
		this.chess = null;
	}

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
	}
	componentWillUnmount() {
		this.unregisterAuthListener();
	}

	// componentDidUpdate() {
	// if (this.gameCanvas)
	// this.gameCanvas.draw(this.game);
	// };

	setPlayState = (playState) => {
		let stateUpdate = { loadingPlay: false };
		if (playState) {
			stateUpdate.playState = playState;

			if (playState.inGame)
				this.chess = new Chess(playState.fen);
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

	canGoBackInHistory = () => (this.state.historyPosition < (this.state.playState.moves ? this.state.playState.moves.length : 0));
	canGoForwardInHistory = () => (this.state.historyPosition > 0);

	showPrevious = () => {
		if (this.canGoBackInHistory())
			if (this.chess.undo())
				this.setState((state) => ({ historyPosition: state.historyPosition + 1 }));
		// TODO: Error handling
	};
	showNext = () => {
		if (this.canGoForwardInHistory())
			if (this.chess.move(this.state.playState.moves[this.state.playState.moves.length - this.state.historyPosition]))
				this.setState((state) => ({ historyPosition: state.historyPosition - 1 }));
		// TODO: Error handling
	};
	showPresent = () => {
		if (this.canGoForwardInHistory())
			if (this.chess.load(this.state.playState.fen))
				this.setState({ historyPosition: 0 });
	};
	// TODO: Error handling

	onClickCanvas = () => {
		// Is it user's turn?

		// Do they already have a piece chosen?
		// Did they click somewhere that's valid to move?
		// Move

		// Did they click on a piece?

		// Did they click on a piece that has valid moves?
		// Indicate no moves, or highlight all possible moves 
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

			const isWaiting = (ps.status === 'wait');
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
				case 'con_w': gameTitleText = ps.name_b + ' concedes. ' + ps.name_w + ' wins!'; break;
				case 'con_b': gameTitleText = ps.name_w + ' concedes. ' + ps.name_b + ' wins!'; break;
				default: gameTitleText = ''; break;
			}
			const gameTitleVisibility = 'visible';
			const gameControlsVisibility = !isWaiting ? 'visible' : 'hidden';

			const blackTurnTextVisibility = ps.status === 'play' && this.chess.turn() === 'b' ? 'visible' : 'hidden';
			const whiteTurnTextVisibility = this.state.gameStatus === 'play' && this.chess.turn() === 'w' ? 'visible' : 'hidden';
			const lastMoveVisibility = this.canGoBackInHistory() ? 'visible' : 'hidden';
			const nextMoveVisibility = this.canGoForwardInHistory() ? 'visible' : 'hidden';

			return (
				<div align='center' style={{ display: 'block' }}>
					<h4 style={{ visibility: gameTitleVisibility }}>{gameTitleText}</h4>

					<p style={{ visibility: blackTurnTextVisibility }}>{blackMoveText}</p>
					{/* <GameCanvas ref={this.gameCanvas} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} chess={this.onClick = { this.onClickCanvas() } /> */}
					<GameCanvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} chess={this.chess} onClick={this.onClickCanvas()} />
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
