import React from 'react';
import GameImages from './GameImages';
import { PieceTypes } from './Game';

class GameCanvas extends React.Component {
	loading = true;
	savedDraw = null;
	componentDidMount = () => {
		// Load images
		this.images = new GameImages(() => {
			this.loading = false;
			if (this.savedDraw) {
				this.savedDraw();
				this.savedDraw = null;
			}
		});


		this.refs.gameBoard.addEventListener('mousedown', this.props.onClick, false);
	};
	draw = (game) => {
		if (this.loading) {
			this.savedDraw = () => {
				this.draw(game);
			};
			return;
		}
		if (!this.refs.gameBoard || !this.refs.gameBoard.getContext)
			return;

		// Save drawing context
		const ctx = this.refs.gameBoard.getContext('2d', { alpha: true });
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
		if (!this.loading && !this.images.loading)
			ctx.drawImage(this.images.getBoardImage(), boardImageX, boardImageY, boardImageSize, boardImageSize);

		// Draw canvas border
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

		// Draw game pieces
		if (this.loading || !game)
			return;
		for (let col = 0; col < 8; col++)
			for (let row = 0; row < 8; row++) {
				// If position has a piece
				const type = game.getPieceType(col, row);
				if (type !== PieceTypes.EMPTY) {
					// Get piece image
					const image = this.images.getPieceImage(game.getPieceTeam(col, row), type);
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
		return (
			<canvas ref='gameBoard' width={this.props.width} height={this.props.height}>Canvas tag not supported.</canvas>
		);
	}
}

export default GameCanvas;