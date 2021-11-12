const dir = '/images/';
const boardImageSource = dir + 'chessboard/chessboard.png';
const pieceImageSources: string[] = [
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

export { boardImageSource, pieceImageSources };