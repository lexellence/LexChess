import React from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import * as constants from '../Constants';
import firebase from 'firebase';
import to from 'await-to-js';

//+----------------------------\------------------------------
//|	      PlayComponent        |
//\----------------------------/------------------------------

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 480;
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

const PieceTypes = {
	EMPTY: 0,
	KING: 1,
	QUEEN: 2,
	BISHOP: 3,
	KNIGHT: 4,
	ROOK: 5,
	PAWN: 6,
};
Object.freeze(PieceTypes);
const TeamNames = {
	WHITE: 1,
	BLACK: 2
};
Object.freeze(TeamNames);

/*class GameRecord {
    constructor(userId1, userId2, moveHistory) {
        userId1: 2,
            userId2: 3,
                moveHistory: ['3233', '3736'];   // 'crcr' 'crcr+' 'crcr#'

    }

}*/
class Game {
	// colRowGrid = new Array(8);
	// history = [];
	// captured = [];

	constructor() {
		// this.colRowGrid.forEach(col => col = new Array(8));

		// for (let col = 0; col < 8; col++)
		// 	this.colRowGrid[col] = new Array(8);

		this.colRowGrid = new Array(8);
		for (let col = 0; col < 8; col++) {
			this.colRowGrid[col] = new Array(8);
			for (let row = 0; row < 8; row++)
				this.colRowGrid[col][row] = { team: TeamNames.WHITE, type: PieceTypes.EMPTY };
		}


		// 	this.begin();
		// }
		// begin = () => {
		this.turnTeam = TeamNames.WHITE;
		this.history = [];
		this.captured = [];

		// // Create 8x8 matrix
		// this.colRowGrid = new Array(8);
		// for (let col = 0; col < 8; col++) {
		// 	this.colRowGrid[col] = new Array(8);
		// 	for (let row = 0; row < 8; row++)
		// 		this.colRowGrid[col][row] = { team: TeamNames.WHITE, type: PieceTypes.EMPTY };
		// }
		// this.colRowGrid.forEach(col => col.forEach(square => square = { team: TeamNames.WHITE, type: PieceTypes.EMPTY }));


		// Place initial pieces
		this.colRowGrid[0][0] = { team: TeamNames.WHITE, type: PieceTypes.ROOK };
		this.colRowGrid[1][0] = { team: TeamNames.WHITE, type: PieceTypes.KNIGHT };
		this.colRowGrid[2][0] = { team: TeamNames.WHITE, type: PieceTypes.BISHOP };
		this.colRowGrid[3][0] = { team: TeamNames.WHITE, type: PieceTypes.QUEEN };
		this.colRowGrid[4][0] = { team: TeamNames.WHITE, type: PieceTypes.KING };
		this.colRowGrid[5][0] = { team: TeamNames.WHITE, type: PieceTypes.BISHOP };
		this.colRowGrid[6][0] = { team: TeamNames.WHITE, type: PieceTypes.KNIGHT };
		this.colRowGrid[7][0] = { team: TeamNames.WHITE, type: PieceTypes.ROOK };

		for (let col = 0; col < 8; col++)
			this.colRowGrid[col][1] = { team: TeamNames.WHITE, type: PieceTypes.PAWN };

		this.colRowGrid[0][7] = { team: TeamNames.BLACK, type: PieceTypes.ROOK };
		this.colRowGrid[1][7] = { team: TeamNames.BLACK, type: PieceTypes.KNIGHT };
		this.colRowGrid[2][7] = { team: TeamNames.BLACK, type: PieceTypes.BISHOP };
		this.colRowGrid[3][7] = { team: TeamNames.BLACK, type: PieceTypes.QUEEN };
		this.colRowGrid[4][7] = { team: TeamNames.BLACK, type: PieceTypes.KING };
		this.colRowGrid[5][7] = { team: TeamNames.BLACK, type: PieceTypes.BISHOP };
		this.colRowGrid[6][7] = { team: TeamNames.BLACK, type: PieceTypes.KNIGHT };
		this.colRowGrid[7][7] = { team: TeamNames.BLACK, type: PieceTypes.ROOK };

		for (let col = 0; col < 8; col++)
			this.colRowGrid[col][6] = { team: TeamNames.BLACK, type: PieceTypes.PAWN };
	};

	getPieceType = (col, row) => {
		return this.colRowGrid[col][row].type;
	};
	getPieceTeam = (col, row) => {
		return this.colRowGrid[col][row].team;
	};

	moveExposesKing = (fromCol, fromRow, toCol, toRow) => {
		return false;
	};
	isValidMove = (fromCol, fromRow, toCol, toRow) => {
		if (typeof fromCol !== 'number' || typeof fromRow !== 'number' || typeof toCol !== 'number' || typeof toRow !== 'number')
			return false;
		if (isNaN(fromCol) || isNaN(fromRow) || isNaN(toCol) || isNaN(toRow))
			return false;

		if (fromCol < 0 || fromCol > 7 ||
			fromRow < 0 || fromRow > 7 ||
			toCol < 0 || toCol > 7 ||
			toRow < 0 || toRow > 7)
			return false;

		if (this.getPieceType(fromCol, fromRow) === PieceTypes.EMPTY)
			return false;
		if (this.getPieceType(toCol, toRow) !== PieceTypes.EMPTY)
			return false;

		// if (this.getPieceTeam(fromCol, fromRow) !== this.turnTeam)
		// 	return false;

		return true;
	};
	capture = (col, row) => {
		if (this.getPieceType(col, row) !== PieceTypes.EMPTY) {
			this.captured.push(this.colRowGrid[col][row]);
			this.colRowGrid[col][row].type = PieceTypes.EMPTY;
		}
	};
	moveString = (move) => {
		if (typeof move !== 'string' || move.length < 4)
			return false;
		var fromCol = parseInt(move[0], 10);
		var fromRow = parseInt(move[1], 10);
		var toCol = parseInt(move[2], 10);
		var toRow = parseInt(move[3], 10);
		return this.moveInt(fromCol, fromRow, toCol, toRow);
	};
	moveInt = (fromCol, fromRow, toCol, toRow) => {
		if (!this.isValidMove(fromCol, fromRow, toCol, toRow))
			return false;

		let toType = this.getPieceType(toCol, toRow);
		if (toType !== PieceTypes.EMPTY) {
			this.capture(toCol, toRow);
		}
		this.colRowGrid[toCol][toRow] = Object.assign({}, this.colRowGrid[fromCol][fromRow]);;
		this.colRowGrid[fromCol][fromRow].type = PieceTypes.EMPTY;

		this.history.push({ fromCol, fromRow, toCol, toRow });
		if (this.turnTeam === TeamNames.BLACK)
			this.turnTeam = TeamNames.WHITE;
		else
			this.turnTeam = TeamNames.BLACK;
		return true;
	};
	moveStringList = (moves) => {
		if (!Array.isArray(moves))
			return false;
		moves.forEach(nextMove => {
			if (!this.moveString(nextMove))
				return false;
		});
		return true;
	};

}

function getImage(path) {
	let newImage = new Image();
	newImage.src = 'images/' + path;
	return newImage;
};

export default class PlayComponent extends React.Component {
	state = {
		isSignedIn: false,
		historyPosition: 0
	};
	game = new Game();

	// TODO: Make this save the actual game
	recordGame = async () => {
		let gameObject = {
			moveHistory: ['3233', '3736']   // 'crcr' 'crcr+' 'crcr#'
		};

		if (this.state.isSignedIn && firebase.auth().currentUser) {
			const FORCE_REFRESH = true;
			let [err, idToken] = await to(firebase.auth().currentUser.getIdToken(FORCE_REFRESH));
			if (err)
				alert('Error getting user id token');
			else
				gameObject.userIdToken = idToken;
		}

		this.refs.newGame.innerHTML = `<br />Sending...`;
		const endpointURL = constants.API_BASE_URL + constants.API_ADD_GAME;
		axios.post(endpointURL, gameObject)
			.then(res => {
				this.refs.newGame.innerHTML = `<br />Success: ` + JSON.stringify(gameObject);
			})
			.catch(error => {
				this.refs.newGame.innerHTML = `<br />Failure: ` + JSON.stringify(gameObject);
			});
	};

	onNewGame = () => {
		this.recordGame();
		this.setState({ historyPosition: 0 });
		this.game = new Game();
	};

	componentDidMount = () => {
		this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged(
			(user) => this.setState({ isSignedIn: !!user })
		);

		// Load images
		this.boardImage = getImage('chessboard/chessboard.png');

		this.whiteKingImage = getImage('white/white_king.png');
		this.whiteQueenImage = getImage('white/white_queen.png');
		this.whiteBishopImage = getImage('white/white_bishop.png');
		this.whiteKnightImage = getImage('white/white_knight.png');
		this.whiteRookImage = getImage('white/white_rook.png');
		this.whitePawnImage = getImage('white/white_pawn.png');

		this.blackKingImage = getImage('black/black_king.png');
		this.blackQueenImage = getImage('black/black_queen.png');
		this.blackBishopImage = getImage('black/black_bishop.png');
		this.blackKnightImage = getImage('black/black_knight.png');
		this.blackRookImage = getImage('black/black_rook.png');
		this.blackPawnImage = getImage('black/black_pawn.png');

		if (this.refs.gameBoard.getContext) {
			// Save drawing context
			this.gameCanvasContext = this.refs.gameBoard.getContext('2d', { alpha: true });

			// Setup periodic canvas redrawing
			this.updateCanvas();
			this.timerID = setInterval(this.updateCanvas, 500); // milliseconds
		}
		else {
			this.gameCanvasContext = null;
			alert('Couldn\'t get canvas context');
		}

		// Setup canvas mouse events
		this.refs.gameBoard.addEventListener('mousedown', this.onClickCanvas, false);

		if (!this.game.moveStringList(['3133', '3634']))
			alert("bad move");

	};
	componentWillUnmount = () => {
		clearInterval(this.timerID);

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

	// Returns null if type == EMPTY
	pieceToImage = (team, type) => {
		switch (type) {
			case PieceTypes.KING:
				return (team === TeamNames.WHITE) ? this.whiteKingImage : this.blackKingImage;
			case PieceTypes.QUEEN:
				return (team === TeamNames.WHITE) ? this.whiteQueenImage : this.blackQueenImage;
			case PieceTypes.BISHOP:
				return (team === TeamNames.WHITE) ? this.whiteBishopImage : this.blackBishopImage;
			case PieceTypes.KNIGHT:
				return (team === TeamNames.WHITE) ? this.whiteKnightImage : this.blackKnightImage;
			case PieceTypes.ROOK:
				return (team === TeamNames.WHITE) ? this.whiteRookImage : this.blackRookImage;
			case PieceTypes.PAWN:
				return (team === TeamNames.WHITE) ? this.whitePawnImage : this.blackPawnImage;
			default:
				return null;
		}
	};

	drawPiece = (canvasContext, col, row, team, type) => {
		// Determine which image to draw
		let pieceImage = this.pieceToImage(team, type);

		// Draw piece image (y-axis has zero at the top for canvas but zero at the bottom for chessboard)
		if (pieceImage)
			canvasContext.drawImage(pieceImage, getPieceX(col), getPieceY(row), PIECE_IMAGE_SIZE, PIECE_IMAGE_SIZE);
	};

	updateCanvas = () => {
		if (!this.gameCanvasContext)
			return;

		let ctx = this.gameCanvasContext;
		// Clear canvas
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Canvas background
		ctx.fillStyle = "#CCCCCC";
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw checkerboard
		ctx.drawImage(this.boardImage, BOARD_IMAGE_X, BOARD_IMAGE_Y, BOARD_IMAGE_SIZE, BOARD_IMAGE_SIZE);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw game pieces
		for (let col = 0; col < 8; col++)
			for (let row = 0; row < 8; row++)
				this.drawPiece(ctx, col, row, this.game.getPieceTeam(col, row), this.game.getPieceType(col, row));
	};

	render = () => {
		return (
			<div align='center'>
				{this.state.isSignedIn &&
					<p>email=<pre>{firebase.auth().currentUser.email}</pre></p>
				}
				<canvas ref='gameBoard' width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>Canvas tag not supported.</canvas><br />

				<Button onClick={this.onShowPrevious}>Last Move</Button>
				<Button onClick={this.onShowNext}>Next Move</Button>
				<Button onClick={this.onShowPresent}>Present</Button><br />
				<Button onClick={this.onNewGame}>New Game</Button><span ref='newGame'></span>
				<p>History position: {this.state.historyPosition}</p>

				<table style={{ width: '300px' }}>
					<tr><th>Your time</th><th>Their time</th></tr>
					<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
				</table>
			</div >
		);
	};
};