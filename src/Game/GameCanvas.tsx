import React, { useRef, useEffect } from 'react';
import { PieceType } from 'chess.js';
import { useGameImagesContext } from './GameImagesContext';
import { getPieceImage } from './getPieceImage';

const FILE_CHARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface GameCanvasProps {
	size: number;
	board: Array<Array<{ type: PieceType; color: "w" | "b" } | null>>;
	flip: boolean;
	selectedSquare: string | null;
	onMouseDown: (square: string) => void;
	onMouseUp: (square: string) => void;
}

function clamp(num: number, min: number, max: number) {
	return Math.max(min, Math.min(num, max));
}

function GameCanvas({ size, board, flip, selectedSquare, onMouseDown, onMouseUp }: GameCanvasProps) {
	const canvas = useRef<HTMLCanvasElement | null>(null);
	const gameImages = useGameImagesContext();

	// Calculate sizes
	const boardImageStart = 0;
	const boardImageSize = size;
	const boardMargin = 0.01 * boardImageSize;
	const boardStart = boardImageStart + boardMargin;
	const boardEnd = boardImageStart + boardImageSize - boardMargin;

	const boardSize = boardEnd - boardStart;
	const squareSize = boardSize / 8;
	const squareMargin = 0.15 * squareSize;
	const pieceImageSize = squareSize - 2 * squareMargin;

	//+--------------------------------\--------------------------
	//|	 	   Event Listeners 	   	   |
	//\--------------------------------/--------------------------
	useEffect(() => {
		if (!gameImages.pieces || !gameImages.board)
			return;

		function getFileChar(event: MouseEvent): string {
			const mouseX = flip ? (size - event.offsetX) : event.offsetX;
			const boardOffsetX = mouseX - boardStart;
			let file = Math.floor(boardOffsetX / squareSize);
			clamp(file, 0, 7);
			return FILE_CHARS[file];
		}
		function getRankChar(event: MouseEvent): string {
			const mouseY = flip ? (size - event.offsetY) : event.offsetY;
			const boardOffsetY = mouseY - boardStart;
			let rank = 8 - Math.floor(boardOffsetY / squareSize);
			clamp(rank, 1, 8);
			return rank.toString();
		}
		function handleMouseDown(event: MouseEvent): void {
			const square = getFileChar(event) + getRankChar(event);
			onMouseDown(square);
		}
		function handleMouseUp(event: MouseEvent): void {
			const square = getFileChar(event) + getRankChar(event);
			onMouseUp(square);
		}
		canvas.current?.addEventListener('mousedown', handleMouseDown);
		canvas.current?.addEventListener('mouseup', handleMouseUp);

		const currentCanvas = canvas.current;

		return () => {
			currentCanvas?.removeEventListener('mousedown', handleMouseDown);
			currentCanvas?.removeEventListener('mouseup', handleMouseUp);
		};
	}, [boardStart, onMouseDown, onMouseUp, squareSize, gameImages.pieces, gameImages.board, flip, size]);

	//+--------------------------------\--------------------------
	//|	 	    Canvas Drawing	   	   |
	//\--------------------------------/--------------------------
	function drawSquare(context: CanvasRenderingContext2D, row: number, col: number) {
		const drawRow = flip ? 7 - row : row;
		const drawCol = flip ? 7 - col : col;
		const squareStartX = boardStart + drawCol * squareSize;
		const squareStartY = boardStart + drawRow * squareSize;

		// Shade if it is selected square
		if (selectedSquare)
			if (FILE_CHARS.indexOf(selectedSquare[0]) === col && selectedSquare[1] === (8 - row).toString()) {
				context.fillStyle = "#00CC00";
				context.fillRect(squareStartX, squareStartY, squareSize, squareSize);
			}

		// Draw piece
		const piece = board[row][col];
		if (piece) {
			const image = getPieceImage(gameImages.pieces, piece.color, piece.type);
			if (image) {
				context.drawImage(image,
					squareStartX + squareMargin,
					squareStartY + squareMargin,
					pieceImageSize,
					pieceImageSize);
			}
		}
	}
	function draw() {
		// Save drawing context
		const ctx = canvas.current?.getContext('2d', { alpha: false, willReadFrequently: false });
		if (!ctx)
			return;

		// Draw checkerboard
		if (gameImages.board)
			ctx.drawImage(gameImages.board, boardImageStart, boardImageStart, boardImageSize, boardImageSize);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, size, size);

		// Draw game pieces
		if (gameImages.pieces)
			for (let row = 0; row < 8; row++)
				for (let col = 0; col < 8; col++)
					drawSquare(ctx, row, col);
	}
	useEffect(() => {
		draw();
	});

	//+--------------------------------\--------------------------
	//|	 	        Render   	   	   |
	//\--------------------------------/--------------------------
	return (
		<canvas id='gameBoardCanvas' ref={canvas} width={size} height={size}>
			Canvas tag not supported. Try a different browser.
		</canvas>
	);
}

export { GameCanvas };