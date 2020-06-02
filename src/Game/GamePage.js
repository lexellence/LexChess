import React from 'react';
import Button from 'react-bootstrap/Button';

import { compose } from 'recompose';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import Game, { PieceTypes, TeamNames } from './Game';
import GameCanvas from './GameCanvas';
import GameList from './GameList';
import * as api from '../api';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 360;

const INITIAL_STATE = {
	loadingPlay: true,
	inGame: false,
	openGames: [],
	isWaiting: false,
	isWhite: false,
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
			this.getPlay();
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

	setHistoryState = () => this.setState({ historyPosition: this.game.movesAwayFromPresent });
	onShowPrevious = () => {
		this.game.backOneMove();
		this.setHistoryState();
	};
	onShowNext = () => {
		this.game.forwardOneMove();
		this.setHistoryState();
	};
	onShowPresent = () => {
		this.game.jumpToPresent();
		this.setHistoryState();
	};
	onLeaveGame = () => {
		if (this.user)
			this.user.getIdToken()
				.then(token =>
					api.leaveGame(token)
						.then((res) => this.getPlay())
						.catch((err) => alert(err.message))
				);
	};

	getPlay = () => {
		if (this.user) {
			this.setState({ ...INITIAL_STATE });
			this.user.getIdToken()
				.then((token) => {
					api.getPlay(token)
						.then((res) => {
							const userPlayObject = res.data;

							// Game list
							if (!userPlayObject.inGame) {
								this.setState({ openGames: userPlayObject.openGames });
								return;
							}

							// In-game
							this.game.start();
							this.setState({ inGame: true, isWhite: userPlayObject.isWhite, isWaiting: userPlayObject.isWaiting }, () => {
								if (!this.state.isWaiting)
									this.game.doMoves(userPlayObject.moves);
							});
						})
						.catch((err) => alert(err.message))
						.finally(() => this.setState({ loadingPlay: false }));
				});
		}
	};

	onCreateGame = () => {
		if (this.user)
			this.user.getIdToken()
				.then((token) =>
					api.createGame(token)
						.then((res) => this.getPlay())
						.catch((err) => alert(err.message))
				);
	};

	onJoinButton = (gid) =>
		this.props.firebase.auth.currentUser.getIdToken()
			.then((token) =>
				api.joinGame(token, gid)
					.then((res) => this.getPlay())
					.catch((err) => alert(err.message))
			);
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

		const gameMode = !!this.state.inGame;
		const gameListDisplay = !gameMode ? 'block' : 'none';
		const gameDisplay = gameMode ? 'block' : 'none';

		const myTeamText = this.state.isWhite ? 'White' : 'Black';
		const blackText = !this.state.isWhite ? 'Your move' : 'Their move';
		const whiteText = this.state.isWhite ? 'Your move' : 'Their move';

		const isWaiting = this.state.isWaiting;
		const waitingVisibility = isWaiting ? 'visible' : 'hidden';
		const isGameOver = !!this.game.winnerTeam;
		const gameControlsVisibility = !isWaiting ? 'visible' : 'hidden';

		const winnerText = this.game.winnerTeam === TeamNames.WHITE ? 'White' : 'Black';
		const winnerVisibility = isGameOver ? 'visible' : 'hidden';
		const blackTurnTextVisibility = !isGameOver && !isWaiting && this.game.turnTeam === TeamNames.BLACK ? 'visible' : 'hidden';
		const whiteTurnTextVisibility = !isGameOver && !isWaiting && this.game.turnTeam === TeamNames.WHITE ? 'visible' : 'hidden';
		const lastMoveVisibility = this.game.hasMoreHistory() ? 'visible' : 'hidden';
		const nextMoveVisibility = !this.game.isOnCurrentMove() ? 'visible' : 'hidden';

		return (
			<div align='center'>
				<div style={{ display: gameListDisplay }}>
					<h1>Open Games List</h1>
					<Button onClick={this.onCreateGame}>Create Game</Button>
					<GameList openGames={this.state.openGames}
						joinGameCallback={this.onJoinButton} />
				</div>
				<div style={{ display: gameDisplay }}>
					<h4 style={{ visibility: waitingVisibility }}>Waiting for opponent...</h4>
					<p style={{ visibility: winnerVisibility }}> {winnerText} is the winner!</p>

					<p style={{ visibility: blackTurnTextVisibility }}>{blackText}</p>
					<GameCanvas ref='gameCanvas' width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={this.onClickCanvas()} />
					<p style={{ visibility: whiteTurnTextVisibility }}>{whiteText}</p>

					<div style={{ visibility: gameControlsVisibility }}>
						<Button onClick={this.onShowPrevious} style={{ visibility: lastMoveVisibility }}>Back</Button>
						<Button onClick={this.onShowNext} style={{ visibility: nextMoveVisibility }}>Forward</Button>
						<Button onClick={this.onShowPresent} style={{ visibility: nextMoveVisibility }}>Now</Button><br />
						<p style={{ visibility: nextMoveVisibility }}>Moves back: {this.state.historyPosition}</p>
						<table style={{ width: '300px' }}>
							<tr><th>Your time</th><th>Their time</th></tr>
							<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
						</table>
						<p>My team: {myTeamText}</p>
					</div>

					<Button onClick={this.onLeaveGame}>Quit</Button>
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
