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
		this.start();
	}
	start = () => {
		this.movesAwayFromPresent = 0;
		this.history = [];
		this.captured = [];
		this.turnTeam = TeamNames.WHITE;
		this.winnerTeam = null;

		// Make piece grid
		this.colRowGrid = new Array(8);
		for (let col = 0; col < 8; col++)
			this.colRowGrid[col] = new Array(8);

		for (let col = 0; col < 8; col++) {
			this.colRowGrid[col] = new Array(8);
			for (let row = 0; row < 8; row++)
				this.colRowGrid[col][row] = { team: TeamNames.WHITE, type: PieceTypes.EMPTY };
		}

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

	hasMoreHistory = () => {
		return this.history.length > this.movesAwayFromPresent;
	};
	isOnCurrentMove = () => {
		return this.movesAwayFromPresent < 1;
	};
	backOneMove = () => {
		if (this.hasMoreHistory()) {
			this.movesAwayFromPresent++;
			let i = this.history.length - this.movesAwayFromPresent;
			this.moveStringUndo(this.history[i]);
		}
	};
	forwardOneMove = () => {
		if (!this.isOnCurrentMove()) {
			let i = this.history.length - this.movesAwayFromPresent;
			this.moveStringUndo(this.history[i]);
			this.movesAwayFromPresent--;
		}
	};
	jumpToPresent = () => {

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

		if (this.getPieceTeam(fromCol, fromRow) !== this.turnTeam)
			return false;

		if (this.moveExposesKing(fromCol, fromRow, toCol, toRow))
			return false;

		return true;
	};
	capture = (col, row) => {
		if (this.getPieceType(col, row) !== PieceTypes.EMPTY) {
			this.captured.push(this.colRowGrid[col][row]);
			this.colRowGrid[col][row].type = PieceTypes.EMPTY;
		}
	};
	parseMoveString = (move) => {
		return {
			fromCol: parseInt(move[0], 10),
			fromRow: parseInt(move[1], 10),
			toCol: parseInt(move[2], 10),
			toRow: parseInt(move[3], 10)
		};
	};
	moveStringUndo = (move) => {
		// let { fromCol, fromRow, toCol, toRow } = this.parseMoveString(move);

		// TODO: implement reversing moves
	};
	move = (move) => {
		let { fromCol, fromRow, toCol, toRow } = this.parseMoveString(move);
		if (!this.isValidMove(fromCol, fromRow, toCol, toRow))
			return false;

		let toType = this.getPieceType(toCol, toRow);
		if (toType !== PieceTypes.EMPTY) {
			this.capture(toCol, toRow);
		}
		this.colRowGrid[toCol][toRow] = Object.assign({}, this.colRowGrid[fromCol][fromRow]);;
		this.colRowGrid[fromCol][fromRow].type = PieceTypes.EMPTY;

		// this.history.push({ fromCol, fromRow, toCol, toRow });
		this.history.push(move);
		if (this.turnTeam === TeamNames.BLACK)
			this.turnTeam = TeamNames.WHITE;
		else
			this.turnTeam = TeamNames.BLACK;
		return true;
	};
	doMoves = (moves) => {
		if (!Array.isArray(moves))
			return false;
		moves.forEach(m => {
			if (!this.move(m))
				return false;
		});
		return true;
	};
}

module.exports = { Game: Game, PieceTypes: PieceTypes, TeamNames: TeamNames };