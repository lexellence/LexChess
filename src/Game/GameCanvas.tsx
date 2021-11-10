import React from 'react';

import GameImages from './GameImages';
import { PieceType } from 'chess.js';

const FILE_CHARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface GameCanvasProps {
	size: number;
	board: Array<Array<{ type: PieceType; color: "w" | "b" } | null>>;
	selectedSquare: string | null;
	onMouseDown: (square: string) => void;
	onMouseUp: (square: string) => void;
}

interface GameCanvasState {
	loading: boolean;
}

function clamp(num: number, min: number, max: number) {
	return Math.max(min, Math.min(num, max));
}

class GameCanvas extends React.Component<GameCanvasProps, GameCanvasState> {
	canvas = React.createRef<HTMLCanvasElement>();
	images: any = null;

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
		this.images = new GameImages(() => {
			this.draw();
		});

		this.canvas.current?.addEventListener('mousedown', this.handleMouseDown);
		this.canvas.current?.addEventListener('mouseup', this.handleMouseUp);
	};
	componentDidUpdate() {
		this.draw();
	};
	componentWillUnmount() {
		this.canvas.current?.removeEventListener('mousedown', this.handleMouseDown);
		this.canvas.current?.removeEventListener('mouseup', this.handleMouseUp);
	}

	getFileChar = (event: MouseEvent): string => {
		const boardOffsetX = event.offsetX - this.boardStart;
		let file = Math.floor(boardOffsetX / this.squareSize);
		clamp(file, 0, 7);
		return FILE_CHARS[file];
	}
	getRankChar = (event: MouseEvent): string => {
		const boardOffsetY = event.offsetY - this.boardStart;
		let rank = 8 - Math.floor(boardOffsetY / this.squareSize);
		clamp(rank, 1, 8);
		return rank.toString();
	}

	handleMouseDown = (event: MouseEvent): void => {
		const square = this.getFileChar(event) + this.getRankChar(event);
		this.props.onMouseDown(square);
	}
	handleMouseUp = (event: MouseEvent): void => {
		const square = this.getFileChar(event) + this.getRankChar(event);
		this.props.onMouseUp(square);
	}

	private draw = () => {
		if (!this.images)
			return;

		// Save drawing context
		const ctx = this.canvas.current?.getContext('2d', { alpha: false, willReadFrequently: false });
		if (!ctx)
			return;

		// Draw checkerboard
		const boardImage = this.images.getBoardImage();
		if (boardImage)
			ctx.drawImage(boardImage, this.boardImageStart, this.boardImageStart, this.boardImageSize, this.boardImageSize);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, this.props.size, this.props.size);

		// Draw game pieces
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const squareStartX = this.boardStart + col * this.squareSize;
				const squareStartY = this.boardStart + row * this.squareSize;

				// Shade selected square
				if (this.props.selectedSquare)
					if (FILE_CHARS.indexOf(this.props.selectedSquare[0]) === col && this.props.selectedSquare[1] === (8 - row).toString()) {
						ctx.fillStyle = "#00CC00";
						ctx.fillRect(squareStartX, squareStartY, this.squareSize, this.squareSize);
					}

				// Draw piece
				const piece = this.props.board[row][col];
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
			}
		}
	}
	render() {
		return (
			<canvas id='gameBoardCanvas' ref={this.canvas} width={this.props.size} height={this.props.size}>
				Canvas tag not supported. Try a different browser.
			</canvas>
		);
	}
}

export default GameCanvas;