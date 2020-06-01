import React from 'react';
import Button from 'react-bootstrap/Button';

import { compose } from 'recompose';
import {
	withAuthUser,
	withAuthorization,
	withEmailVerification,
} from './Session';
import Game, { PieceTypes, TeamNames } from './Game';
import GameCanvas from './GameCanvas';
import GameList from './GameList';
import * as api from './api';

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
	}

	componentDidMount = () => this.getPlay();
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
	onLeaveGame = () =>
		api.leaveGame(this.props.authUser.idToken)
			.then((res) => this.getPlay())
			.catch((err) => alert(err.message));

	getPlay = () => {
		this.setState({ ...INITIAL_STATE });
		api.getPlay(this.props.authUser.idToken)
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
	};

	onCreateGame = () =>
		api.createGame(this.props.authUser.idToken)
			.then((res) => this.getPlay())
			.catch((err) => alert(err.message));

	onJoinButton = (gid) =>
		api.joinGame(this.props.authUser.idToken, gid)
			.then((res) => this.getPlay())
			.catch((err) => alert(err.message));

	render() {
		// Loading
		if (this.state.loadingPlay)
			return <div align='center'>Loading...</div>;

		// Game list
		// if (!this.userPlayObject.inGame)
		// 	return (
		// 		<div align='center'>
		// 			<h1>Open Games List</h1>
		// 			<Button onClick={this.onCreateGame}>Create Game</Button>
		// 			<GameList openGames={this.userPlayObject.openGames}
		// 				joinGameCallback={(gid) => this.onJoinButton(gid)} />
		// 		</div>
		// 	);
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
						joinGameCallback={(gid) => this.onJoinButton(gid)} />
				</div>
				<div style={{ display: gameDisplay }}>
					<h4 style={{ visibility: waitingVisibility }}>Waiting for opponent...</h4>
					<p style={{ visibility: winnerVisibility }}> {winnerText} is the winner!</p>

					<p style={{ visibility: blackTurnTextVisibility }}>{blackText}</p>
					<GameCanvas ref='gameCanvas' width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
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
	withAuthUser
)(GamePage);