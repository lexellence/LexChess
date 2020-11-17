import { PieceTypes, TeamNames } from './ChessGameFrontend';
const dir = 'images/';
const imageSources = [
	dir + 'chessboard/chessboard.png',
	dir + 'white/white_king.png',
	dir + 'white/white_queen.png',
	dir + 'white/white_bishop.png',
	dir + 'white/white_knight.png',
	dir + 'white/white_rook.png',
	dir + 'white/white_pawn.png',
	dir + 'black/black_king.png',
	dir + 'black/black_queen.png',
	dir + 'black/black_bishop.png',
	dir + 'black/black_knight.png',
	dir + 'black/black_rook.png',
	dir + 'black/black_pawn.png'
];

function loadImagesThen(sources, callback) {
	let counter = 0;
	let images = [];
	function onLoad() {
		counter++;
		if (counter === sources.length) callback();
	}
	for (let source of sources) {
		let img = new Image();
		img.onload = img.onerror = onLoad;
		img.src = source;
		images.push(img);
	}
	return images;
};

class GameImages {
	constructor(callback) {
		this.loading = true;
		this.images = loadImagesThen(imageSources, () => {
			this.loading = false;
			callback();
		});
	}
	getBoardImage = () => {
		if (this.loading)
			return null;
		return this.images[0];
	};
	getPieceImage = (team, type) => {
		if (this.loading)
			return null;
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
}
export default GameImages;
