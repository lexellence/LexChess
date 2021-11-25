import React, { useRef, useEffect } from 'react';
import { PieceType } from 'chess.js';
import { SVGRoundedRect } from './SVGRoundedRect';

const FILE_CHARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const MIN_BOARD_SIZE = 5;
const BOARD_MARGIN_FACTOR = 0;
const PIECE_MARGIN_FACTOR = 0.0;
const PIECE_OFFSET_X_FACTOR = 0.0;
const PIECE_OFFSET_Y_FACTOR = -0.025;
const COLOR_LIGHT = '#99ff85ff';
const COLOR_DARK = '#168500ff';
const COLOR_SELECTED = '#00CC00';
// const COLOR_MARGIN = 'black';
const CORNER_ROUNDING_RADIUS = 7;

//+--------------------------------\--------------------------
//|	 	     Game Canvas	   	   |
//\--------------------------------/--------------------------
type BoardState = Array<Array<{ type: PieceType; color: 'w' | 'b' } | null>>;
interface GameCanvasProps {
	size: number;
	board: BoardState;
	flip: boolean;
	selectedSquare: string | null;
	onMouseDown: (square: string) => void;
	onMouseUp: (square: string) => void;
}
function GameCanvas({ size, board, flip, selectedSquare, onMouseDown, onMouseUp }: GameCanvasProps) {
	if (size < MIN_BOARD_SIZE)
		size = MIN_BOARD_SIZE;

	const svg = useRef<SVGSVGElement | null>(null);

	// Calculate sizes
	const boardImageSize = size;
	const boardMargin = BOARD_MARGIN_FACTOR * boardImageSize;
	const boardStart = boardMargin;
	const boardEnd = boardImageSize - boardMargin;

	const boardSize = boardEnd - boardStart;
	const squareSize = boardSize / 8.0;
	const squareMargin = PIECE_MARGIN_FACTOR * squareSize;
	const pieceImageSize = squareSize - 2.0 * squareMargin;
	const pieceOffsetX = PIECE_OFFSET_X_FACTOR * squareSize;
	const pieceOffsetY = PIECE_OFFSET_Y_FACTOR * squareSize;

	//+--------------------------------\--------------------------
	//|	 	   Event Listeners 	   	   |
	//\--------------------------------/--------------------------
	useEffect(() => {
		const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(num, max));
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
		svg.current?.addEventListener('mousedown', handleMouseDown);
		svg.current?.addEventListener('mouseup', handleMouseUp);

		const currentSVG = svg.current;

		return () => {
			currentSVG?.removeEventListener('mousedown', handleMouseDown);
			currentSVG?.removeEventListener('mouseup', handleMouseUp);
		};
	}, [boardStart, onMouseDown, onMouseUp, squareSize, flip, size]);

	//+--------------------------------\--------------------------
	//|	 	        Render   	   	   |
	//\--------------------------------/--------------------------
	let nextKey = 0;
	function getDrawRowOrCol(rowOrCol: number) {
		return flip ? 7 - rowOrCol : rowOrCol;
	}
	function getSVGBoardSquares() {
		let squares = [];
		for (let row = 0; row < 8; row++)
			for (let col = 0; col < 8; col++) {
				const drawRow = getDrawRowOrCol(row);
				const drawCol = getDrawRowOrCol(col);
				const squareDrawX = boardStart + drawCol * squareSize;
				const squareDrawY = boardStart + drawRow * squareSize;

				let fillColor = COLOR_LIGHT;
				let thisSquareSelected = false;
				if (selectedSquare &&
					FILE_CHARS.indexOf(selectedSquare[0]) === col &&
					selectedSquare[1] === (8 - row).toString()) {
					fillColor = COLOR_SELECTED;
					thisSquareSelected = true;
				}

				if (thisSquareSelected ||
					(row % 2 === 0 && col % 2 === 0) ||
					(row % 2 === 1 && col % 2 === 1)) {
					const roundTL = (drawRow === 0 && drawCol === 0);
					const roundTR = (drawRow === 0 && drawCol === 7);
					const roundBR = (drawRow === 7 && drawCol === 7);
					const roundBL = (drawRow === 7 && drawCol === 0);
					if (roundTL || roundTR || roundBR || roundBL)
						squares.push(<SVGRoundedRect key={nextKey++}
							x={squareDrawX} y={squareDrawY}
							w={squareSize} h={squareSize}
							rx={CORNER_ROUNDING_RADIUS} ry={CORNER_ROUNDING_RADIUS} fill={fillColor}
							roundTL={roundTL} roundTR={roundTR} roundBR={roundBR} roundBL={roundBL} />);
					else
						squares.push(
							<rect key={nextKey++} fill={fillColor}
								x={squareDrawX} y={squareDrawY}
								width={squareSize} height={squareSize} />
						);
				}
			}
		return squares;
	}
	function getSVGPieces() {
		function getSVGPiece(row: number, col: number) {
			const squareStartX = boardStart + getDrawRowOrCol(col) * squareSize;
			const squareStartY = boardStart + getDrawRowOrCol(row) * squareSize;
			const piece = board[row][col];
			if (!piece)
				return null;
			else {
				const imagePath = '/images/maestro/' + piece.color + piece.type + '.svg';
				return <image key={nextKey++} href={imagePath}
					x={squareStartX + squareMargin + pieceOffsetX}
					y={squareStartY + squareMargin + pieceOffsetY}
					width={pieceImageSize}
					height={pieceImageSize} />;
			}
		}

		let pieces = [];
		for (let row = 0; row < 8; row++)
			for (let col = 0; col < 8; col++) {
				const piece = getSVGPiece(row, col);
				if (piece)
					pieces.push(piece);
			}
		return pieces;
	}
	return (
		<div id='game-board'>
			<svg ref={svg} width={size} height={size} xmlns='http://www.w3.org/2000/svg'>
				<rect x={boardStart} y={boardStart} width={boardSize} height={boardSize} rx={CORNER_ROUNDING_RADIUS.toString()} fill={COLOR_DARK} />
				{getSVGBoardSquares()}
				{/* <rect width={size} height={size} rx={CORNER_ROUNDING_RADIUS.toString()} fillOpacity='0' stroke='black' strokeWidth='2' strokeOpacity='1' /> */}
				{getSVGPieces()}
			</svg>
		</div>
	);
}

export { GameCanvas };