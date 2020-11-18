import { PieceType, Team } from './Chess';
const dir = 'images/';
const imageSources: string[] = [
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

function loadImages(sources: string[], onLoadCompletion: () => void) {
	let counter = 0;
	let images = [];
	function onLoad() {
		counter++;
		if (counter === sources.length) onLoadCompletion();
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
	loading = true;
	images: HTMLImageElement[] = [];
	constructor(onLoadCompletion: () => void) {
		this.images = loadImages(imageSources, () => {
			this.loading = false;
			onLoadCompletion();
		});
	}
	getBoardImage = (): null | HTMLImageElement => {
		return this.images[0];
	};
	getPieceImage = (team: Team, type: PieceType): null | HTMLImageElement => {
		if (this.loading)
			return null;
		switch (type) {
			case PieceType.KING:
				return (team === Team.WHITE) ? this.images[1] : this.images[7];
			case PieceType.QUEEN:
				return (team === Team.WHITE) ? this.images[2] : this.images[8];
			case PieceType.BISHOP:
				return (team === Team.WHITE) ? this.images[3] : this.images[9];
			case PieceType.KNIGHT:
				return (team === Team.WHITE) ? this.images[4] : this.images[10];
			case PieceType.ROOK:
				return (team === Team.WHITE) ? this.images[5] : this.images[11];
			case PieceType.PAWN:
				return (team === Team.WHITE) ? this.images[6] : this.images[12];
			default:
				return null;
		}
	};
}
export default GameImages;
