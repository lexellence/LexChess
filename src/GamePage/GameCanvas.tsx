import React from 'react';

import GameImages from './GameImages';
import { PieceType } from 'chess.js';

class Square {
	file: number;
	rank: number;
	constructor(file: number, rank: number) {
		this.file = file;
		this.rank = rank;
	}
}

interface GameCanvasProps {
	size: number;
	board: Array<Array<{ type: PieceType; color: "w" | "b" } | null>>;
	selectedSquare: Square | null;
	onMouseDown: (file: number, rank: number) => void;
	onMouseUp: (file: number, rank: number) => void;
}

interface GameCanvasState {
	loading: boolean;
	// selectedSquare: Square;
}

const INITIAL_STATE = {
	loading: true,
	// selectedSquare: null
};

class GameCanvas extends React.Component<GameCanvasProps, GameCanvasState> {
	readonly state = { ...INITIAL_STATE };
	canvas = React.createRef<HTMLCanvasElement>();
	images: GameImages = new GameImages(() => {
		this.setState({ loading: false });
	});
	// Calculate sizes
	boardImageStart = 0;
	boardImageSize = this.props.size;
	boardMargin = 0.01 * this.boardImageSize;
	boardStart = this.boardImageStart + this.boardMargin;
	boardEnd = this.boardImageStart + this.boardImageSize - this.boardMargin;

	boardSize = this.boardEnd - this.boardStart;
	squareSize = this.boardSize / 8;
	squareMargin = 0.15 * this.squareSize;
	pieceImageSize = this.squareSize - 2 * this.squareMargin;

	componentDidMount() {
		this.canvas.current?.addEventListener('mousedown', this.handleMouseDown);
		this.canvas.current?.addEventListener('mouseup', this.handleMouseUp);

		// Stop canvas double-click from selecting text outside canvas
		document.getElementById('gameBoardCanvas').onselectstart = () => false;

		this.draw();
	};
	componentDidUpdate() {
		this.draw();
	};
	componentDidUnmount() {
		this.canvas.current?.removeEventListener('mousedown', this.handleMouseDown);
		this.canvas.current?.removeEventListener('mouseup', this.handleMouseUp);
	}

	getFile = (event: MouseEvent): number => Math.floor((event.offsetX - this.boardStart) / this.squareSize);
	getRank = (event: MouseEvent): number => (7 - Math.floor((event.offsetY - this.boardStart) / this.squareSize));
	handleMouseDown = (event: MouseEvent): void => this.props.onMouseDown(this.getFile(event), this.getRank(event));
	handleMouseUp = (event: MouseEvent): void => this.props.onMouseUp(this.getFile(event), this.getRank(event));

	private draw = () => {
		// Save drawing context
		const ctx = this.canvas.current?.getContext('2d', { alpha: true });
		if (!ctx)
			return;

		// Background
		ctx.clearRect(0, 0, this.props.size, this.props.size);
		ctx.fillStyle = "#CCCCCC";
		ctx.fillRect(0, 0, this.props.size, this.props.size);

		// Draw checkerboard
		const boardImage = this.images.getBoardImage();
		if (boardImage)
			ctx.drawImage(boardImage, this.boardImageStart, this.boardImageStart, this.boardImageSize, this.boardImageSize);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, this.props.size, this.props.size);

		if (this.state.loading)
			return;

		// Draw game pieces
		for (let rank = 0; rank < 8; rank++)
			for (let file = 0; file < 8; file++) {
				const squareStartX = this.boardStart + file * this.squareSize;
				const squareStartY = this.boardEnd - (rank + 1) * this.squareSize;

				// Shade selected square
				if (this.props.selectedSquare?.file === file && this.props.selectedSquare?.rank === rank) {
					ctx.fillStyle = "#00CC00";
					ctx.fillRect(squareStartX, squareStartY, this.squareSize, this.squareSize);
				}

				// Draw piece
				const piece = this.props.board[rank][file];
				if (piece) {
					const image = this.images.getPieceImage(piece.color, piece.type);
					if (image) {
						ctx.drawImage(image,
							squareStartX + this.squareMargin,
							squareStartY + this.squareMargin,
							this.pieceImageSize,
							this.pieceImageSize);
					}
				}
			};
	}
	render() {
		return (
			<canvas id='gameBoardCanvas' ref={this.canvas} width={this.props.size} height={this.props.size}>
				Canvas tag not supported. Try a different browser.
			</canvas>
		);
	}
}

export { Square };
export default GameCanvas;