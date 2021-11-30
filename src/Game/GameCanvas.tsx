import React, { useRef, useEffect } from 'react';
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
interface GameCanvasProps {
	size: number;
	fen: string;
	flip: boolean;
	selectedSquare: string | null;
	onMouseDown: (square: string) => void;
	onMouseUp: (square: string) => void;
}
function GameCanvas({ size, fen, flip, selectedSquare, onMouseDown, onMouseUp }: GameCanvasProps) {

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
		function getSVGPiece(row: number, col: number, pieceName: string) {
			const squareStartX = boardStart + getDrawRowOrCol(col) * squareSize;
			const squareStartY = boardStart + getDrawRowOrCol(row) * squareSize;
			return <use key={nextKey++} xlinkHref={`#svg-${pieceName}`}
				x={squareStartX + squareMargin + pieceOffsetX}
				y={squareStartY + squareMargin + pieceOffsetY} />;
		}
		let pieces = [];
		let i = 0;	// Character index
		let row = 0;
		while (row < 8) {
			let col = 0;
			while (col < 8) {
				const char = fen.charAt(i);
				const charAsInt = parseInt(char, 10);
				if (!isNaN(charAsInt)) {
					// Skip some columns
					col += charAsInt;
				}
				else {
					// Add piece here
					const charLowerCase = char.toLowerCase();
					const color = (charLowerCase === char) ? 'b' : 'w';
					const pieceName = color + charLowerCase;
					pieces.push(getSVGPiece(row, col, pieceName));
					col++;
				}
				// Next char
				i++;
			}
			// Skip slash, next row
			i++;
			row++;
		}
		return pieces;
	}
	return (
		<div id='game-board'>
			<svg ref={svg} width={size} height={size}
				viewBox={`0 0 ${size} ${size}`}
				xmlns='http://www.w3.org/2000/svg'
				xmlnsXlink='http://www.w3.org/1999/xlink'>
				{/* Pre-define graphical elements */}
				<defs>
					{/* White pieces */}
					<image id='svg-wr' href={'/images/maestro/wr.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-wn' href={'/images/maestro/wn.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-wb' href={'/images/maestro/wb.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-wq' href={'/images/maestro/wq.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-wk' href={'/images/maestro/wk.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-wp' href={'/images/maestro/wp.svg'} width={pieceImageSize} height={pieceImageSize} />

					{/* Black pieces */}
					<image id='svg-br' href={'/images/maestro/br.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-bn' href={'/images/maestro/bn.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-bb' href={'/images/maestro/bb.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-bq' href={'/images/maestro/bq.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-bk' href={'/images/maestro/bk.svg'} width={pieceImageSize} height={pieceImageSize} />
					<image id='svg-bp' href={'/images/maestro/bp.svg'} width={pieceImageSize} height={pieceImageSize} />
				</defs>

				{/* Draw */}
				<rect x={boardStart} y={boardStart} width={boardSize} height={boardSize} rx={CORNER_ROUNDING_RADIUS.toString()} fill={COLOR_DARK} />
				{getSVGBoardSquares()}
				{getSVGPieces()}
			</svg>
		</div>
	);
}

export { GameCanvas };