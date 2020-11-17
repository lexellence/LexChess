import React from 'react';
import Button from 'react-bootstrap/Button';

import { compose } from 'recompose';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import Game, { /*PieceTypes,*/ TeamNames } from './ChessGameFrontend';
import GameCanvas from './GameCanvas';
import GameList from './GameList';
import * as api from '../api';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 360;

const INITIAL_STATE = {
	loadingPlay: true,
	gameList: [],
	inGame: false,
	gameStatus: '',
	team: '',
	displayNameWhite: '',
	displayNameBlack: '',
	displayNameDefer: '',
	historyPosition: 0,
};

class GamePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
		this.game = new Game();
		this.user = null;
	}

	componentDidMount = () => {
		const onSignIn = authUser => {
			this.user = authUser;
			this.getPlayState();
		};
		const onSignOut = () => {
			this.user = null;
			this.setState({ ...INITIAL_STATE });
		};
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	};
	componentWillUnmount = () => this.unregisterAuthListener();

	componentDidUpdate = () => {
		if (this.refs.gameCanvas)
			this.refs.gameCanvas.draw(this.game);
	};

	setPlayState = (playState) => {
		if (playState) {
			// Start game
			if (playState.inGame) {
				this.game.start();
				this.game.doMoves(playState.moves);
			}

			// Update state
			this.setState({
				gameList: playState.gameList,
				inGame: playState.inGame,
				gameStatus: playState.gameStatus,
				team: playState.team,
				displayNameWhite: playState.displayNameWhite,
				displayNameBlack: playState.displayNameBlack,
				displayNameDefer: playState.displayNameDefer
			});
		}
	};
	getPlayState = () => {
		if (this.user) {
			this.setState({ ...INITIAL_STATE });
			this.user.getIdToken()
				.then((token) =>
					api.getPlayState(token)
						.then((res) => this.setPlayState(res.data))
						.catch((err) => alert(err.message))
						.finally(() => this.setState({ loadingPlay: false })));
		}
	};
	createGame = (team = 'defer') => {
		if (this.user) {
			this.setState({ ...INITIAL_STATE });
			this.user.getIdToken()
				.then((token) =>
					api.createGame(token, team)
						.then((res) => this.setPlayState(res.data))
						.catch((err) => alert(err.message))
						.finally(() => this.setState({ loadingPlay: false })));
		}
	};
	joinGame = (gid, team) => {
		if (this.user) {
			this.setState({ ...INITIAL_STATE });
			this.user.getIdToken()
				.then((token) =>
					api.joinGame(token, gid, team)
						.then((res) => this.setPlayState(res.data))
						.catch((err) => alert(err.message))
						.finally(() => this.setState({ loadingPlay: false })));
		}
	};
	leaveGame = () => {
		if (this.user) {
			this.setState({ ...INITIAL_STATE });
			this.user.getIdToken()
				.then(token =>
					api.leaveGame(token)
						.then((res) => this.setPlayState(res.data))
						.catch((err) => alert(err.message))
						.finally(() => this.setState({ loadingPlay: false })));
		}
	};

	setHistoryState = () => this.setState({ historyPosition: this.game.movesAwayFromPresent });
	showPrevious = () => {
		this.game.backOneMove();
		this.setHistoryState();
	};
	showNext = () => {
		this.game.forwardOneMove();
		this.setHistoryState();
	};
	showPresent = () => {
		this.game.jumpToPresent();
		this.setHistoryState();
	};

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

		const displayGameList = !this.state.inGame ? 'block' : 'none';
		const displayGame = this.state.inGame ? 'block' : 'none';

		const myTeamText = this.state.team;
		const blackPossessiveName = (this.state.team === 'observe' || this.state.team === 'white') ? this.state.displayNameBlack + '\'s' : 'Your';
		const whitePossessiveName = (this.state.team === 'observe' || this.state.team === 'black') ? this.state.displayNameBlack + '\'s' : 'Your';
		const blackMoveText = blackPossessiveName + ' move';
		const whiteMoveText = whitePossessiveName + ' move';

		const isWaiting = (this.state.gameStatus === 'waiting');
		let gameTitleText;
		switch (this.state.gameStatus) {
			case 'waiting': gameTitleText = 'Waiting for another player to join...'; break;;
			case 'playing': gameTitleText = 'Game in progress.'; break;
			case 'draw': gameTitleText = 'Game ended in a draw.'; break;
			case 'checkmate_white': gameTitleText = 'Checkmate! ' + this.state.displayNameWhite + ' wins.'; break;
			case 'checkmate_black': gameTitleText = 'Checkmate! ' + this.state.displayNameBlack + ' wins.'; break;
			case 'concede_white': gameTitleText = this.state.displayNameWhite + ' concedes. ' + this.state.displayNameBlack + ' wins!'; break;
			case 'concede_black': gameTitleText = this.state.displayNameBlack + ' concedes. ' + this.state.displayNameWhite + ' wins!'; break;
			default: gameTitleText = ''; break;
		}
		const gameTitleVisibility = 'visible';
		const gameControlsVisibility = !isWaiting ? 'visible' : 'hidden';

		const blackTurnTextVisibility = this.state.gameStatus === 'playing' && this.game.turnTeam === TeamNames.BLACK ? 'visible' : 'hidden';
		const whiteTurnTextVisibility = this.state.gameStatus === 'playing' && this.game.turnTeam === TeamNames.WHITE ? 'visible' : 'hidden';
		const lastMoveVisibility = this.game.hasMoreHistory() ? 'visible' : 'hidden';
		const nextMoveVisibility = !this.game.isOnCurrentMove() ? 'visible' : 'hidden';

		return (
			<div align='center'>
				<div style={{ display: displayGameList }}>
					<h1>Game List</h1>
					<Button onClick={() => this.createGame('white')}>Create game as white</Button>
					<Button onClick={() => this.createGame('black')}>Create game as black</Button>
					<Button onClick={() => this.createGame('defer')}>Create game and defer</Button>
					<GameList gameList={this.state.gameList}
						joinGameCallback={this.joinGame} />
				</div>
				<div style={{ display: displayGame }}>
					<h4 style={{ visibility: gameTitleVisibility }}>{gameTitleText}</h4>

					<p style={{ visibility: blackTurnTextVisibility }}>{blackMoveText}</p>
					<GameCanvas ref='gameCanvas' width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={this.onClickCanvas()} />
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
				</div>
			</div >
		);
	}
};

const condition = authUser => !!authUser;
export default compose(
	withEmailVerification,
	withAuthorization(condition),
)(GamePage);
