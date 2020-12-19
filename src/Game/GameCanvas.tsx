import React from 'react';
import GameImages from './GameImages';
import { ChessGame, ChessPosition, PieceType } from './Chess';

interface GameCanvasProps {
	width: number;
	height: number;
	onClick: () => void;
}

interface GameCanvasState {
	loading: boolean;
}

class GameCanvas extends React.Component<GameCanvasProps, GameCanvasState> {
	state: GameCanvasState = {
		loading: true
	};
	images: GameImages = new GameImages(() => {
		this.setState({ loading: false });
		this.savedDraw();
		this.savedDraw = () => { };

	});
	gameBoard = React.createRef<HTMLCanvasElement>();
	savedDraw = () => { };

	componentDidMount() {
		// Load images

		this.gameBoard.current!.addEventListener('mousedown', this.props.onClick, false);
	};
	draw(game: ChessGame): void {
		if (this.state.loading) {
			this.savedDraw = () => {
				this.draw(game);
			};
			return;
		}
		if (!this.gameBoard.current || !this.gameBoard.current.getContext)
			return;

		// Save drawing context
		const ctx = this.gameBoard.current.getContext('2d', { alpha: true });
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

		// Draw game pieces
		if (this.state.loading || !game)
			return;
		for (let col = 0; col < 8; col++)
			for (let row = 0; row < 8; row++) {
				// If position has a piece
				const position = new ChessPosition(col, row);
				const type = game.getSquare(position).type;
				if (type !== PieceType.NONE) {
					// Get piece image
					const team = game.getSquare(position).team;
					const image = this.images.getPieceImage(team, type);
					if (image) {
						// Calculate position
						const boardStartX = boardImageX + boardMargin;
						const x = boardStartX + col * squareSize + squareMargin;
						const boardEndY = boardImageY + boardImageSize - boardMargin;
						const y = boardEndY - (row + 1) * squareSize + squareMargin;

						// Draw piece
						ctx.drawImage(image, x, y, pieceImageSize, pieceImageSize);
					}
				}
			}
	};
	render() {
		const { width, height } = this.props;
		return (
			<canvas ref={this.gameBoard} width={width} height={height}>Canvas tag not supported.</canvas>
		);
	}
}

export default GameCanvas;