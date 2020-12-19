enum PieceType {
	KING,
	QUEEN,
	BISHOP,
	KNIGHT,
	ROOK,
	PAWN,
	NONE,
};
enum Team {
	WHITE,
	BLACK,
	NONE,
};
function otherTeam(team: Team): Team {
	if (team === Team.WHITE)
		return Team.BLACK;
	else if (team === Team.BLACK)
		return Team.WHITE;
	else
		return Team.NONE;
}

function isValidPosition(col: number, row: number) {
	return (col >= 0 && col <= 7 && row >= 0 && row <= 7);
}
class ChessPosition {
	constructor(public col: number, public row: number) {
		if (!isValidPosition(col, row))
			throw new Error('Tried to construct invalid chess position');
	}
}

// Pre-condition: moveString is of format "nnnnx" where n is 0-7 and x is optional 'q','b','k','r','p'
function chessMoveFromString(moveString: string): ChessMove {
	let pieceType: PieceType
	switch (moveString.charAt(4)) {
		case 'p': pieceType = PieceType.PAWN; break;
		case 'r': pieceType = PieceType.ROOK; break;
		case 'k': pieceType = PieceType.KNIGHT; break;
		case 'b': pieceType = PieceType.BISHOP; break;
		case 'q': pieceType = PieceType.QUEEN; break;
		default: pieceType = PieceType.NONE;
	}
	return new ChessMove(
		new ChessPosition(parseInt(moveString[0]), parseInt(moveString[1])),
		new ChessPosition(parseInt(moveString[2]), parseInt(moveString[3])),
		pieceType
	);
}
class ChessMove {
	constructor(public source: ChessPosition, public dest: ChessPosition, public capturedPieceType: PieceType) { }
}

class ChessBoardSquare {
	constructor(public team: Team, public type: PieceType) { }
	copyFrom(other: ChessBoardSquare) {
		this.team = other.team;
		this.type = other.type;
	}
	set(team: Team, type: PieceType) {
		this.team = team;
		this.type = type;
	}
	clear() {
		this.team = Team.NONE;
		this.type = PieceType.NONE;
	}
}
function canLandOnSquare(square: ChessBoardSquare, movingTeam: Team): boolean {
	if (movingTeam === Team.NONE)
		return false;
	if (square.type === PieceType.NONE)
		return true;
	if (square.team === otherTeam(movingTeam))
		return true;
	return false;
}
class ChessGame {
	movesAwayFromPresent: number = 0;
	history: ChessMove[] = [];
	turnTeam: Team = Team.WHITE;
	winnerTeam: Team = Team.NONE;
	colRowGrid: ChessBoardSquare[][] = [];
	constructor() {
		this.start()
	}
	start() {
		this.movesAwayFromPresent = 0;
		this.history = [];
		this.turnTeam = Team.WHITE;
		this.winnerTeam = Team.NONE;

		// Create empty grid
		this.colRowGrid = new Array<Array<ChessBoardSquare>>();
		for (let col = 0; col <= 7; col++) {
			const newCol: ChessBoardSquare[] = new Array<ChessBoardSquare>();
			for (let row = 0; row <= 7; row++)
				newCol.push(new ChessBoardSquare(Team.NONE, PieceType.NONE));
			this.colRowGrid.push(newCol);
		}

		// Place initial white pieces
		this.colRowGrid[0][0].set(Team.WHITE, PieceType.ROOK)
		this.colRowGrid[1][0].set(Team.WHITE, PieceType.KNIGHT)
		this.colRowGrid[2][0].set(Team.WHITE, PieceType.BISHOP)
		this.colRowGrid[3][0].set(Team.WHITE, PieceType.QUEEN)
		this.colRowGrid[4][0].set(Team.WHITE, PieceType.KING)
		this.colRowGrid[5][0].set(Team.WHITE, PieceType.BISHOP)
		this.colRowGrid[6][0].set(Team.WHITE, PieceType.KNIGHT)
		this.colRowGrid[7][0].set(Team.WHITE, PieceType.ROOK)
		for (let col = 0; col <= 7; col++)
			this.colRowGrid[col][1].set(Team.WHITE, PieceType.PAWN)

		// Place initial black pieces
		this.colRowGrid[0][7].set(Team.BLACK, PieceType.ROOK)
		this.colRowGrid[1][7].set(Team.BLACK, PieceType.KNIGHT)
		this.colRowGrid[2][7].set(Team.BLACK, PieceType.BISHOP)
		this.colRowGrid[3][7].set(Team.BLACK, PieceType.QUEEN)
		this.colRowGrid[4][7].set(Team.BLACK, PieceType.KING)
		this.colRowGrid[5][7].set(Team.BLACK, PieceType.BISHOP)
		this.colRowGrid[6][7].set(Team.BLACK, PieceType.KNIGHT)
		this.colRowGrid[7][7].set(Team.BLACK, PieceType.ROOK)
		for (let col = 0; col <= 7; col++)
			this.colRowGrid[col][6].set(Team.BLACK, PieceType.PAWN)
	}
	getSquare(pos: ChessPosition): ChessBoardSquare {
		return this.colRowGrid[pos.col][pos.row];
	}
	hasMoreHistory() {
		return (this.history.length > this.movesAwayFromPresent);
	}
	isOnCurrentMove() {
		return this.movesAwayFromPresent < 1;
	}
	backOneMove() {
		if (this.hasMoreHistory()) {
			this.movesAwayFromPresent++;
			const i = this.history.length - this.movesAwayFromPresent;
			this.moveUndo(this.history[i]);
		}
	}
	forwardOneMove() {
		if (!this.isOnCurrentMove()) {
			const i = this.history.length - this.movesAwayFromPresent;
			this.moveRedo(this.history[i]);
			this.movesAwayFromPresent--;
		}
	}
	jumpToPresent() {
		while (!this.isOnCurrentMove())
			this.forwardOneMove();
	}
	moveUndo(move: ChessMove) {
		// Determine teams
		const movingTeam = this.getSquare(move.dest).team;
		const nonMovingTeam = otherTeam(movingTeam);
		if (nonMovingTeam !== this.turnTeam)
			throw new Error("Tried to undo move for team that did not make the last move");

		// Move piece
		this.getSquare(move.source).copyFrom(this.getSquare(move.dest));

		// Replace captured piece, if there is one
		if (move.capturedPieceType === PieceType.NONE)
			this.getSquare(move.dest).clear();
		else
			this.getSquare(move.dest).set(nonMovingTeam, move.capturedPieceType);

		// Change turn
		this.turnTeam = movingTeam;
	};
	moveRedo(move: ChessMove) {
		// Determine teams
		const movingTeam = this.getSquare(move.source).team;
		if (movingTeam !== this.turnTeam)
			throw new Error("Tried to redo move for team when it's not their turn");

		// Move piece
		this.getSquare(move.dest).copyFrom(this.getSquare(move.source));
		this.getSquare(move.source).clear();

		this.turnTeam = otherTeam(movingTeam);
	};

	// moveExposesKing(fromCol, fromRow, toCol, toRow) {
	// 	return false;
	// }
	wasLastMovePawnDoubleStepTo(position: ChessPosition): boolean {
		if (this.history.length === 0)
			return false;
		// const lastMove: ChessMove = this.history[this.history.length - 1];


		return false;
	}

	getReachableDestinations(sourcePosition: ChessPosition): ChessPosition[] {
		let reachableDestinations: ChessPosition[] = [];
		let potentialDestinations: ChessPosition[] = [];

		const sourcePiece: ChessBoardSquare = this.getSquare(sourcePosition);
		const sourceTeam: Team = sourcePiece.team;
		const sourceType: PieceType = sourcePiece.type;
		if (sourceTeam === Team.NONE || sourceType === PieceType.NONE)
			return reachableDestinations;

		const sourceCol = sourcePosition.col;
		const sourceRow = sourcePosition.row;
		let col: number;
		let row: number;
		const ONE_ROW_FORWARD = (sourceTeam === Team.WHITE) ? 1 : -1;
		const ONE_COL_RIGHT = (sourceTeam === Team.WHITE) ? 1 : -1;

		switch (sourceType) {
			case PieceType.PAWN:

				// Move forward
				col = sourceCol;
				row = sourceRow + ONE_ROW_FORWARD;
				if (isValidPosition(col, row)) {
					const dest = new ChessPosition(col, row);
					if (canLandOnSquare(this.getSquare(dest), sourceTeam))
						potentialDestinations.push();
				}

				// Capture right
				col = sourceCol + ONE_COL_RIGHT;
				row = sourceRow + ONE_ROW_FORWARD;
				if (isValidPosition(col, row)) {
					const dest = new ChessPosition(col, row);
					if (canLandOnSquare(this.getSquare(dest), sourceTeam))
						potentialDestinations.push();
				}

				// Capture left
				col = sourceCol - ONE_COL_RIGHT;
				row = sourceRow + ONE_ROW_FORWARD;
				if (isValidPosition(col, row)) {
					const dest = new ChessPosition(col, row);
					if (canLandOnSquare(this.getSquare(dest), sourceTeam))
						potentialDestinations.push();
				}


				break;
			case PieceType.ROOK:
				break;
			case PieceType.KNIGHT:
				break;
			case PieceType.BISHOP:
				break;
			case PieceType.QUEEN:
				break;
			case PieceType.KING:
				break;
			default:
				break;
		}


		return reachableDestinations;
	}

	isValidMove(move: ChessMove): boolean {
		if (this.getSquare(move.source).type === PieceType.NONE) {
			// Empty source square
			return false;
		}

		if (this.getSquare(move.source).team !== this.turnTeam) {
			// It's not this piece's team's turn
			return false;
		}

		if (this.getSquare(move.dest).type !== move.capturedPieceType) {
			// Captured piece is not on destination square
			return false;
		}

		// Piece can't move there
		// if (!this.getValidMoves(move.source).includes(move.dest))
		// 	return false;

		return true;
	}
	// Post-condition: returns false if move is not legal, otherwise updates game and returns true
	move(move: ChessMove): boolean {
		this.jumpToPresent();

		if (!this.isValidMove(move))
			return false;

		// Move
		this.getSquare(move.dest).copyFrom(this.getSquare(move.source));
		this.getSquare(move.source).clear();

		// Record
		this.history.push(move);

		// Other team's turn
		this.turnTeam = otherTeam(this.turnTeam);
		return true;
	}
	// Post-condition: throws Error if any moves are not legal
	doMoveHistory(moveHistory: string[]): void {
		moveHistory.forEach((moveString, i) => {
			if (!this.move(chessMoveFromString(moveString)))
				throw Error('Illegal move in history[' + i + ']: ' + moveString);
		});
	}
}

// Pre-condition: nextMove is of format "nnnnx" where n is 0-7 and x is optional 'q','b','k','r','p'
// Post-condition: throws Error if any previousMoves not legal
// Post-condition: returns true if nextMove is legal, otherwise returns false
// function isValidChessMove(nextMove: string, previousMoves: string[]): boolean {
// 	const game = new ChessGameBackend();
// 	game.doMoveHistory(previousMoves);
// 	return game.isValidMove(chessMoveFromString(nextMove));
// }

export { ChessGame, Team, PieceType, ChessBoardSquare as ChessPiece, ChessPosition, chessMoveFromString };
