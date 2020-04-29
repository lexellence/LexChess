import React from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import firebase from 'firebase';
import to from 'await-to-js';
// import * as httpCodes from 'http-status-codes';

import * as constants from '../Constants';
import { PieceTypes, TeamNames, Game } from './Game';
import ViewGamesComponent from "./ViewGamesComponent";

//+----------------------------\------------------------------
//|	      PlayComponent        |
//\----------------------------/------------------------------

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 360;
const BOARD_IMAGE_SIZE = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT);
const BOARD_IMAGE_X = 0;
const BOARD_IMAGE_Y = 0;

const BOARD_MARGIN = 0.01 * BOARD_IMAGE_SIZE;
const BOARD_SIZE = (BOARD_IMAGE_SIZE - 2 * BOARD_MARGIN);
const SQUARE_SIZE = BOARD_SIZE / 8;
const SQUARE_MARGIN = .15 * SQUARE_SIZE;
const PIECE_IMAGE_SIZE = SQUARE_SIZE - 2 * SQUARE_MARGIN;

function getPieceX(col) {
	let boardStartX = BOARD_IMAGE_X + BOARD_MARGIN;
	return boardStartX + col * SQUARE_SIZE + SQUARE_MARGIN;
};
function getPieceY(row) {
	let boardEndY = BOARD_IMAGE_Y + BOARD_IMAGE_SIZE - BOARD_MARGIN;
	return boardEndY - (row + 1) * SQUARE_SIZE + SQUARE_MARGIN;
};

function loadImages(sources, callback) {
	let counter = 0;
	let images = [];
	function onLoad() {
		counter++;
		if (counter === sources.length) callback();
	}
	for (let source of sources) {
		let img = new Image();
		img.onload = img.onerror = onLoad;
		img.src = 'images/' + source;
		images.push(img);
	}
	return images;
};

export default class PlayComponent extends React.Component {
	state = {
		isSignedIn: undefined,
		historyPosition: 0
	};
	idToken = '';
	userPlayObject = undefined;
	game = new Game();
	images = loadImages(['chessboard/chessboard.png',
		'white/white_king.png',
		'white/white_queen.png',
		'white/white_bishop.png',
		'white/white_knight.png',
		'white/white_rook.png',
		'white/white_pawn.png',
		'black/black_king.png',
		'black/black_queen.png',
		'black/black_bishop.png',
		'black/black_knight.png',
		'black/black_rook.png',
		'black/black_pawn.png'], () => this.drawCanvas());

	// Returns null if type == EMPTY
	pieceToImage = (team, type) => {
		switch (type) {
			case PieceTypes.KING:
				return (team === TeamNames.WHITE) ? this.images[1] : this.images[7];
			case PieceTypes.QUEEN:
				return (team === TeamNames.WHITE) ? this.images[2] : this.images[8];
			case PieceTypes.BISHOP:
				return (team === TeamNames.WHITE) ? this.images[3] : this.images[9];
			case PieceTypes.KNIGHT:
				return (team === TeamNames.WHITE) ? this.images[4] : this.images[10];
			case PieceTypes.ROOK:
				return (team === TeamNames.WHITE) ? this.images[5] : this.images[11];
			case PieceTypes.PAWN:
				return (team === TeamNames.WHITE) ? this.images[6] : this.images[12];
			default:
				return null;
		}
	};
	getPlay = () => {
		// axios.get(constants.API_GET_PLAY)
		axios({
			method: 'get',
			url: constants.API_GET_PLAY,
			headers: {
				Authorization: 'Bearer ' + this.idToken
			}
		})
			.then((res) => {
				// Save play state
				alert(JSON.stringify(res.data));
				this.userPlayObject = res.data;

				// Update local game
				if (this.userPlayObject.inGame && !this.userPlayObject.isWaiting) {
					this.game.start();
					this.game.moveStringList(this.userPlayObject.moves);
				}

				// Refresh
				this.forceUpdate();
			})
			.catch((err) => {
				this.userPlayObject = null;
				this.forceUpdate();
				alert('error getting game: ' + err.message.toUpperCase());
			});
	};
	componentDidMount = () => {
		// Setup canvas mouse events
		this.refs.gameBoard.addEventListener('mousedown', this.onClickCanvas, false);

		// Authentication listener
		this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				this.setState({ isSignedIn: false });
				return;
			}

			// Get id token to send with api requests
			user.getIdToken()
				.then(idToken => {
					this.idToken = idToken;
					this.setState({ isSignedIn: true });

					// Get play object from server
					this.getPlay();
				})
				.catch(err => {
					this.setState({ isSignedIn: false });
					alert('error getting user id token from firebase');
					firebase.auth().signOut();
				});
		});
	};
	componentWillUnmount = () => {
		this.unregisterFirebaseAuthObserver();
	};

	onShowPrevious = () => {
		this.setState(state => ({ historyPosition: state.historyPosition + 1 }));
	};
	onShowNext = () => {
		if (this.state.historyPosition > 0)
			this.setState(state => ({ historyPosition: state.historyPosition - 1 }));
	};
	onShowPresent = () => {
		this.setState({
			historyPosition: 0
		});
	};
	onClickCanvas = () => {
		this.onShowPrevious();
	};

	drawPiece = (canvasContext, col, row, team, type) => {
		let pieceImage = this.pieceToImage(team, type);
		if (pieceImage)
			canvasContext.drawImage(pieceImage, getPieceX(col), getPieceY(row), PIECE_IMAGE_SIZE, PIECE_IMAGE_SIZE);
	};

	drawCanvas = () => {
		if (!this.isGameVisible())
			return;

		if (!this.refs.gameBoard || !this.refs.gameBoard.getContext)
			return;

		// Save drawing context
		let ctx = this.refs.gameBoard.getContext('2d', { alpha: true });
		if (!ctx)
			return;

		// Background
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.fillStyle = "#CCCCCC";
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw checkerboard
		ctx.drawImage(this.images[0], BOARD_IMAGE_X, BOARD_IMAGE_Y, BOARD_IMAGE_SIZE, BOARD_IMAGE_SIZE);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw game pieces
		if (this.isGameVisible())
			for (let col = 0; col < 8; col++)
				for (let row = 0; row < 8; row++)
					this.drawPiece(ctx, col, row, this.game.getPieceTeam(col, row), this.game.getPieceType(col, row));
	};

	isBoardVisible = () => {
		return (this.userPlayObject && this.userPlayObject.inGame);
	};
	isGameVisible = () => {
		return (this.isBoardVisible() && !this.userPlayObject.isWaiting);
	};
	isMovesBackVisible = () => {
		return (this.isGameVisible() && this.state.historyPosition > 0);
	};
	isLastMoveVisible = () => {
		return (this.isGameVisible() && this.state.historyPosition < this.game.history.length);
	};
	isNextMoveVisible = () => {
		return this.isMovesBackVisible();
	};
	isResumeVisible = () => {
		return this.isMovesBackVisible();
	};

	render = () => {
		this.drawCanvas();
		return (
			<div align='center'>
				{this.userPlayObject && this.userPlayObject.inGame && this.userPlayObject.isWaiting &&
					<p>Waiting for opponent...</p>
				}
				{this.userPlayObject && !this.userPlayObject.inGame &&
					<p>Open Games List</p>
				}
				{this.state.isSignedIn !== undefined && !this.state.isSignedIn &&
					<p>Please sign in</p>
				}
				{this.state.isSignedIn && this.userPlayObject === undefined &&
					<div align='center'>Getting data from server...</div>
				}
				{this.userPlayObject === null &&
					<div align='center'>Getting data from server... FAILED</div>
				}
				<div style={{ visibility: this.isBoardVisible() ? 'visible' : 'hidden' }}>
					<canvas ref='gameBoard' width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>Canvas tag not supported.</canvas><br />

					<div style={{ visibility: this.isGameVisible() ? 'visible' : 'hidden' }}>
						<Button onClick={this.onShowPrevious} style={{ visibility: this.isLastMoveVisible() ? 'visible' : 'hidden' }}>Last Move</Button>
						<Button onClick={this.onShowNext} style={{ visibility: this.isNextMoveVisible() ? 'visible' : 'hidden' }}>Next Move</Button>
						<Button onClick={this.onShowPresent} style={{ visibility: this.isResumeVisible() ? 'visible' : 'hidden' }}>Present</Button><br />
						<p style={{ visibility: this.isMovesBackVisible() ? 'visible' : 'hidden' }}>Moves back: {this.state.historyPosition}</p>
						<table style={{ width: '300px' }}>
							<tr><th>Your time</th><th>Their time</th></tr>
							<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
						</table>
					</div>
				</div>
			</div >
		);
	};
};