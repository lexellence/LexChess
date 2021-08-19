import React from 'react';
import GameImages from './GameImages';
import { ChessInstance } from 'chess.js';

interface GameCanvasProps {
	width: number;
	height: number;
	chess: ChessInstance;
	onClick: () => void;
}

interface GameCanvasState {
	loading: boolean;
}

const INITIAL_STATE = {
	loading: true
};

class GameCanvas extends React.Component<GameCanvasProps, GameCanvasState> {
	readonly state = { ...INITIAL_STATE };
	private canvas = React.createRef<HTMLCanvasElement>();
	images: GameImages = new GameImages(() => {
		this.setState({ loading: false });
	});
	componentDidMount() {
		// this.canvas.current!.addEventListener('mousedown', this.props.onClick, false);
		this.draw();
	};
	componentDidUpdate() {
		this.draw();
	};
	private draw = () => {
		if (!this.canvas || !this.canvas.current || !this.canvas.current.getContext)
			return;

		// Save drawing context
		const ctx = this.canvas.current.getContext('2d', { alpha: true });
		if (!ctx)
			return;

		// Calculate sizes
		const canvasWidth = this.props.width;
		const canvasHeight = this.props.height;
		const boardImageSize = Math.min(canvasWidth, canvasHeight);
		const boardImageX = 0;
		const boardImageY = 0;

		const boardMargin = 0.01 * boardImageSize;
		const boardSize = (boardImageSize - 2 * boardMargin);
		const squareSize = boardSize / 8;
		const squareMargin = .15 * squareSize;
		const pieceImageSize = squareSize - 2 * squareMargin;

		// Background
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillStyle = "#CCCCCC";
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Draw checkerboard
		const boardImage = this.images.getBoardImage();
		if (boardImage)
			ctx.drawImage(boardImage, boardImageX, boardImageY, boardImageSize, boardImageSize);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

		if (this.state.loading)
			return;

		// Draw game pieces
		const board = this.props.chess.board();
		for (let rank = 0; rank < 8; rank++)
			for (let file = 0; file < 8; file++) {
				const piece = board[rank][file];
				if (piece) {
					const image = this.images.getPieceImage(piece.color, piece.type);
					if (image) {
						// Calculate position
						const boardStartX = boardImageX + boardMargin;
						const x = boardStartX + file * squareSize + squareMargin;
						const boardEndY = boardImageY + boardImageSize - boardMargin;
						const y = boardEndY - (rank + 1) * squareSize + squareMargin;

						// Draw piece
						ctx.drawImage(image, x, y, pieceImageSize, pieceImageSize);
					}
				}
			};
	}
	render() {
		const { width, height } = this.props;
		return (
			<canvas ref={this.canvas} width={width} height={height}>Canvas tag not supported. Try a different browser.</canvas>
		);
	}
}

export default GameCanvas;