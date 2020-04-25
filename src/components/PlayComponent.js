import React from 'react';
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	      PlayComponent        |
//\----------------------------/------------------------------
import Button from 'react-bootstrap/Button';
// import { FirebaseAuthConsumer } from "@react-firebase/auth";
// import firebase from "firebase/app";

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
	constructor() {
		// Clear IDs
		this.colRowGrid = new Array(8);

		for (let col = 0; col < 8; col++) {
			this.colRowGrid[col] = new Array(8);
			for (let row = 0; row < 8; row++)
				this.colRowGrid[col][row] = { team: TeamNames.WHITE, type: PieceTypes.EMPTY };
		}

		// Clear history
		this.history = [];

		// Clear captured pieces
		this.captured = [];

		// Build board
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

		// Bring up to speed
        /* let gameObject = {
             userId1: 2,
             userId2: 3,
             moveHistory: ['3233', '3736']
         };*/


	}
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
		return true;
	};
	capture = (col, row) => {
		if (this.getPieceType(col, row) !== PieceTypes.EMPTY) {
			this.captured.push(this.colRowGrid[col][row]);
			this.colRowGrid[col][row].type = PieceTypes.EMPTY;
		}
	};
	move = (fromCol, fromRow, toCol, toRow) => {
		if (!this.isValidMove(fromCol, fromRow, toCol, toRow))
			return false;

		let toType = this.getPieceType(toCol, toRow);
		if (toType !== PieceTypes.EMPTY) {
			this.capture(toCol, toRow);
		}
		this.colRowGrid[toCol][toRow] = Object.assign({}, this.colRowGrid[fromCol][fromRow]);;
		this.colRowGrid[fromCol][fromRow].type = PieceTypes.EMPTY;
		return true;
	};

}

function getImage(path) {
	let newImage = new Image();
	newImage.src = 'images/' + path;
	return newImage;
};

export default class PlayComponent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: '-',
			historyPosition: 0
		};


		this.game = new Game();
		if (!this.game.move(3, 1, 3, 3))
			alert("bad move");
		if (!this.game.move(3, 6, 3, 4))
			alert("bad move");
	}

	recordGame = () => {
		let gameObject = {
			userId1: 2,
			userId2: 3,
			moveHistory: ['3233', '3736']   // 'crcr' 'crcr+' 'crcr#'
		};

		const endpointURL = constants.API_BASE_URL + constants.API_ADD_GAME;
		axios.post(endpointURL, gameObject)
			.then(res => {
				this.refs.newGame.innerHTML = `<br />Success: ` + JSON.stringify(gameObject);
			})
			.catch(error => {
				this.refs.newGame.innerHTML = `<br />Failure: ` + JSON.stringify(gameObject);
			});
	};

	/*
	signIn = () => {
		let auth = {
			email: 'a@a.com',
			password: 'aaaaaaaa'
		};
		// const endpointURL = constants.API_BASE_URL + constants.API_SIGNIN;
		// axios.post(endpointURL, auth)
		// 	.then(res => {
		// 		alert('success');
		// 	})
		// 	.catch(error => {
		// 		alert('fail');
		// 	});

		
		firebase
			.auth()
			.signInWithEmailAndPassword(auth.email, auth.password)
			.then(() => {
				this.setState({ email: 'signed in' });
				return;
			})
			.catch((error) => {
				// var errorCode = error.code;
				// var errorMessage = error.message;
				this.setState({ email: 'error' });
				return;
			});
		};
			*/

	onNewGame = () => {
		this.recordGame();
		this.setState({ historyPosition: 0 });
		// this.signIn();
	};

	componentDidMount = () => {
		/*
		// Listen for auth state changes
		// firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				// User is signed in.
	
				// var displayName = user.displayName;
				// var email = user.email;
				// var emailVerified = user.emailVerified;
				// var photoURL = user.photoURL;
				// var isAnonymous = user.isAnonymous;
				// var uid = user.uid;
				// var providerData = user.providerData;
	
				this.setState({ email: user.email });
			}
			else {
				// User is signed out.
				this.setState({ email: 'please sign in' });
			}
		});
	*/

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
	};
	componentWillUnmount = () => {
		clearInterval(this.timerID);
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
				{/* <FirebaseAuthConsumer>
					{({ isSignedIn, user, providerId }) => {
						return JSON.stringify({ isSignedIn, user, providerId }, null, 2);
					}}
				</FirebaseAuthConsumer>
				<br /> */}

				<canvas ref='gameBoard' width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>Canvas tag not supported.</canvas><br />

				<Button onClick={this.onShowPrevious}>Last Move</Button>
				<Button onClick={this.onShowNext}>Next Move</Button>
				<Button onClick={this.onShowPresent}>Present</Button><br />
				<Button onClick={this.onNewGame}>New Game</Button><span ref='newGame'></span>
				<p>History position: {this.state.historyPosition}</p>
				{/* <p>Email: {this.state.email}</p> */}

				<table style={{ width: '300px' }}>
					<tr><th>Your time</th><th>Their time</th></tr>
					<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
				</table>
			</div >
		);
	};
};