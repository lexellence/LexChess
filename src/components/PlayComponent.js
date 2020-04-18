import React from 'react';
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	      PlayComponent        |
//\----------------------------/------------------------------
import Button from 'react-bootstrap/Button';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 480;
const BOARD_IMAGE_SIZE = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT);
const BOARD_IMAGE_X = 0;
const BOARD_IMAGE_Y = 0;
//const SQUARE_SIZE = BOARD_SIZE / 8;

const BOARD_IMAGE_OFFSET_X_PERCENT = 0.01;
const BOARD_IMAGE_OFFSET_Y_PERCENT = 0.01;
const BOARD_IMAGE_SIZE_PERCENT = 0.98;

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
        return false;
    };
    move = (fromCol, fromRow, toCol, toRow) => {

    };

}

export default class PlayComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            historyPosition: 0
        };
        this.game = new Game();
    }

    recordGame = () => {
        let gameObject = {
            userId1: 2,
            userId2: 3,
            moveHistory: ['3233', '3736']
        };
        const endpointURL = constants.API_BASE_URL + constants.API_ADD_GAME;
        axios.post(endpointURL, gameObject)
            .then(res => {
                this.refs.newGame.innerText = `Success: ` + JSON.stringify(gameObject);
            })
            .catch(error => {
                this.refs.newGame.innerText = `Failure: ` + JSON.stringify(gameObject);
            });
    };

    start = () => {
        this.setState({
            historyPosition: 0,
        });
    };

    onNewGame = () => {
        this.recordGame();
        this.start();
    };

    componentDidMount = () => {
        this.boardImage = new Image(1024, 1024);
        this.boardImage.src = 'images/chessboard/chessboard.png';

        this.whiteKingImage = new Image(512, 512);
        this.whiteKingImage.src = 'images/white/white_king.png';
        this.whiteQueenImage = new Image();
        this.whiteQueenImage.src = 'images/white/white_queen.png';
        this.whiteBishopImage = new Image();
        this.whiteBishopImage.src = 'images/white/white_bishop.png';
        this.whiteKnightImage = new Image();
        this.whiteKnightImage.src = 'images/white/white_knight.png';
        this.whiteRookImage = new Image();
        this.whiteRookImage.src = 'images/white/white_rook.png';
        this.whitePawnImage = new Image();
        this.whitePawnImage.src = 'images/white/white_pawn.png';

        this.blackKingImage = new Image();
        this.blackKingImage.src = 'images/black/black_king.png';
        this.blackQueenImage = new Image();
        this.blackQueenImage.src = 'images/black/black_queen.png';
        this.blackBishopImage = new Image();
        this.blackBishopImage.src = 'images/black/black_bishop.png';
        this.blackKnightImage = new Image();
        this.blackKnightImage.src = 'images/black/black_knight.png';
        this.blackRookImage = new Image();
        this.blackRookImage.src = 'images/black/black_rook.png';
        this.blackPawnImage = new Image();
        this.blackPawnImage.src = 'images/black/black_pawn.png';

        this.timerID = setInterval(this.update, 17); // milliseconds

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
    update = () => {
        if (!this.refs.gameBoard.getContext) {
            // Canvas not supported
            return;
        }

        const gameCanvasContext = this.refs.gameBoard.getContext('2d', { alpha: false });
        gameCanvasContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gameCanvasContext.fillStyle = "#CCCCCC";
        gameCanvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


        // Draw checkerboard
        /*for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                gameCanvasContext.fillStyle = ((i + j) % 2 === 0) ? "white" : "black";
                let x = boardX + j * squareSize;
                let y = boardY + i * squareSize;
                gameCanvasContext.fillRect(x, y, squareSize, squareSize);
            }
        }*/
        // if (this.boardImageLoaded)
        gameCanvasContext.drawImage(this.boardImage, BOARD_IMAGE_X, BOARD_IMAGE_Y, BOARD_IMAGE_SIZE, BOARD_IMAGE_SIZE);

        // Draw canvas border
        gameCanvasContext.strokeStyle = "black";
        gameCanvasContext.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw game pieces
        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 8; row++) {
                let pieceImage = null;
                let pieceType = this.game.getPieceType(col, row);
                if (pieceType !== PieceTypes.EMPTY) {
                    let team = this.game.getPieceTeam(col, row);
                    switch (pieceType) {
                        case PieceTypes.KING:
                            pieceImage = team == TeamNames.WHITE ? this.whiteKingImage : this.blackKingImage;
                            break;
                        case PieceTypes.QUEEN:
                            pieceImage = team == TeamNames.WHITE ? this.whiteQueenImage : this.blackQueenImage;
                            break;
                        case PieceTypes.BISHOP:
                            pieceImage = team == TeamNames.WHITE ? this.whiteBishopImage : this.blackBishopImage;
                            break;
                        case PieceTypes.KNIGHT:
                            pieceImage = team == TeamNames.WHITE ? this.whiteKnightImage : this.blackKnightImage;
                            break;
                        case PieceTypes.ROOK:
                            pieceImage = team == TeamNames.WHITE ? this.whiteRookImage : this.blackRookImage;
                            break;
                        case PieceTypes.PAWN:
                            pieceImage = team == TeamNames.WHITE ? this.whitePawnImage : this.blackPawnImage;
                            break;
                    }
                }
                if (pieceImage) {
                    let boardActualX = BOARD_IMAGE_X + BOARD_IMAGE_OFFSET_X_PERCENT * BOARD_IMAGE_SIZE;
                    let boardActualY = BOARD_IMAGE_Y + BOARD_IMAGE_OFFSET_Y_PERCENT * BOARD_IMAGE_SIZE;
                    let boardActualSize = BOARD_IMAGE_SIZE_PERCENT * BOARD_IMAGE_SIZE;
                    let squareActualSize = boardActualSize / 8;

                    let pieceMargin = squareActualSize * 0.1;
                    let x = boardActualX + col * squareActualSize + pieceMargin;
                    let y = boardActualY + row * squareActualSize + pieceMargin;
                    gameCanvasContext.drawImage(pieceImage, x, y, squareActualSize - 2 * pieceMargin, squareActualSize - 2 * pieceMargin);
                }
            }
        }

    };

    render = () => {
        return (
            <div align='center'>
                <canvas ref='gameBoard' width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>Canvas displays here.</canvas><br />

                <Button onClick={this.onShowPrevious}>Last Move</Button>
                <Button onClick={this.onShowNext}>Next Move</Button>
                <Button onClick={this.onShowPresent}>Present</Button><br />
                <Button onClick={this.onNewGame}>New Game</Button><span ref='newGame'></span>
                <p>History position: {this.state.historyPosition}</p>

                <p>Your time: <div id="yourTime">0</div></p>
                <p>Their time: <div id="theirTime">0</div></p>
            </div>
        );
    };
};