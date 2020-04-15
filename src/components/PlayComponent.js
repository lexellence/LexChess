import React from 'react';
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	      PlayComponent        |
//\----------------------------/------------------------------
import Button from 'react-bootstrap/Button';

const BOARD_SIZE = 8;

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
        // Testing
        this.squarePosition = { x: 20, y: 20 };
        this.timerID = setInterval(this.update, 17); // milliseconds

        // Clear IDs
        this.colRowGrid = new Array(BOARD_SIZE);

        for (let col = 0; col < BOARD_SIZE; col++) {
            this.colRowGrid[col] = new Array(BOARD_SIZE);
            for (let row = 0; row < BOARD_SIZE; row++)
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

        for (let col = 0; col < BOARD_SIZE; col++)
            this.colRowGrid[col][1] = { team: TeamNames.WHITE, type: PieceTypes.PAWN };

        this.colRowGrid[0][7] = { team: TeamNames.BLACK, type: PieceTypes.ROOK };
        this.colRowGrid[1][7] = { team: TeamNames.BLACK, type: PieceTypes.KNIGHT };
        this.colRowGrid[2][7] = { team: TeamNames.BLACK, type: PieceTypes.BISHOP };
        this.colRowGrid[3][7] = { team: TeamNames.BLACK, type: PieceTypes.QUEEN };
        this.colRowGrid[4][7] = { team: TeamNames.BLACK, type: PieceTypes.KING };
        this.colRowGrid[5][7] = { team: TeamNames.BLACK, type: PieceTypes.BISHOP };
        this.colRowGrid[6][7] = { team: TeamNames.BLACK, type: PieceTypes.KNIGHT };
        this.colRowGrid[7][7] = { team: TeamNames.BLACK, type: PieceTypes.ROOK };

        for (let col = 0; col < BOARD_SIZE; col++)
            this.colRowGrid[col][6] = { team: TeamNames.BLACK, type: PieceTypes.PAWN };
    }
    stop = () => {
        clearInterval(this.timerID);
    };
    update = () => {
        this.squarePosition.x += 1;
        this.squarePosition.y += 1;
    };
    hasPiece = (col, row) => {
        if (this.colRowGrid[col][row].type === PieceTypes.EMPTY)
            return false;
        else
            return true;
    };
    getX = () => {
        return this.squarePosition.x;
    };
    getY = () => {
        return this.squarePosition.y;
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
            //moveHistory: '3736'
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
        this.timerID = setInterval(this.update, 17); // milliseconds
    };
    componentWillUnmount = () => {
        clearInterval(this.timerID);
        this.game.stop();
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

    update = () => {
        const ctx = this.refs.gameBoard.getContext('2d');
        ctx.clearRect(0, 0, this.refs.gameBoard.width, this.refs.gameBoard.height);
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(0, 0, this.refs.gameBoard.width, this.refs.gameBoard.height);
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(this.game.getX(), this.game.getY(), 60, 60);
    };

    render = () => {
        return (
            <div>
                <p>Before canvas.</p>
                <canvas ref='gameBoard' width="480" height="480">Canvas displays here.</canvas>
                <p>After canvas.</p>

                <Button onClick={this.onShowPrevious}>Last Move</Button>
                <Button onClick={this.onShowNext}>Next Move</Button>
                <Button onClick={this.onShowPresent}>Present</Button><br />
                <Button onClick={this.onNewGame}>New Game</Button>
                <p><div ref='newGame'></div></p>
                <p>History position: {this.state.historyPosition}</p>

                <p>Your time: <div id="yourTime">0</div></p>
                <p>Their time: <div id="theirTime">0</div></p>

            </div>
        );
    };
}