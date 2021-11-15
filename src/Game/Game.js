import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { ButtonSpinner } from '../ButtonSpinner';

import { GameCanvas } from './GameCanvas';
import * as Chess from 'chess.js';
import { usePlayAPIContext } from '../API';

const CANVAS_SIZE = 360;

// Reset game and apply moves
function applyMoves(chess, moves, historyPosition) {
	console.log('applyMoves');
	if (!historyPosition)
		historyPosition = 0;

	chess.reset();
	if (moves.length > 0)
		for (let i = 0; i < moves.length - historyPosition; i++)
			if (!chess.move(moves[i]))
				return false;
	return true;
}

function Game({ game, leaveGame, historyPosition, setHistoryPosition }) {
	const playAPI = usePlayAPIContext();

	const [selectedSquare, setSelectedSquare] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);

	const chess = useRef(new Chess());
	const [board, setBoard] = useState(chess.current.board());

	// Re-render after chess moves
	const refreshBoard = useCallback(() => {
		setBoard([...chess.current.board()]);
	}, [chess]);

	// Re-apply all moves
	useEffect(() => {
		const chessHistory = chess.current.history();
		const shouldApplyMoves = () => {
			const histPos = historyPosition ? historyPosition : 0;
			if (histPos === 0 && chessHistory.length !== game.moves.length)
				return true;
			return !game.moves.every((move, i) => (i >= (game.moves.length - histPos)) || move === chessHistory[i]);
		};

		if (shouldApplyMoves())
			if (applyMoves(chess.current, game.moves, historyPosition))
				refreshBoard();
			else
				setErrorMessage('Invalid list of previous moves');
	}, [game.moves, historyPosition, refreshBoard]);

	//+----------------------------------\------------------------
	//|	  	 		Back				 |
	//\----------------------------------/------------------------
	const canGoBackInHistory = () => {
		return (game?.moves?.length &&
			historyPosition < game.moves.length);
	};
	const undoMove = () => {
		return Boolean(chess.current.undo());
	};
	const showPrevious = () => {
		if (canGoBackInHistory())
			if (undoMove()) {
				refreshBoard();
				setHistoryPosition(historyPosition + 1);
			}
	};
	const showStart = () => {
		if (canGoBackInHistory()) {
			let tempHistoryPosition = historyPosition;
			while (tempHistoryPosition < game.moves.length) {
				if (undoMove())
					tempHistoryPosition++;
				else
					break;
			}
			refreshBoard();
			setHistoryPosition(tempHistoryPosition);
		}
	};

	//+----------------------------------\------------------------
	//|	  	 		Forward				 |
	//\----------------------------------/------------------------
	const canGoForwardInHistory = () => {
		return (game?.moves?.length &&
			historyPosition > 0);
	};
	const redoMove = (moveIndex) => {
		const move = game.moves[moveIndex];
		return Boolean(chess.current.move(move));
	};
	const showNext = () => {
		if (canGoForwardInHistory()) {
			const moveIndex = game.moves.length - historyPosition;
			if (redoMove(moveIndex)) {
				refreshBoard();
				setHistoryPosition(historyPosition - 1);
			}
		}
	};
	const showPresent = () => {
		if (canGoForwardInHistory()) {
			let tempHistoryPosition = historyPosition;
			while (tempHistoryPosition > 0) {
				const moveIndex = game.moves.length - tempHistoryPosition;
				if (redoMove(moveIndex))
					tempHistoryPosition--;
				else
					break;
			}
			refreshBoard();
			setHistoryPosition(tempHistoryPosition);
		}
	};

	//+----------------------------------\------------------------
	//|	  	 	 Mouse Clicks			 |
	//\----------------------------------/------------------------
	const handleMouseDownCanvas = (square) => {
		// Is game in progress?
		if (game.status !== 'play')
			return;

		// Is it user's turn?
		if (chess.current.turn() !== game.team)
			return;

		// Do they already have a piece chosen?
		if (selectedSquare) {
			// Did they cancel their selection?
			if (selectedSquare === square) {
				setSelectedSquare(null);
				return;
			}
			else {
				// Can they move their selected piece here?
				const nextMove = chess.current.move({ from: selectedSquare, to: square });
				if (nextMove) {
					refreshBoard();
					playAPI.move(game.gid, nextMove.san);
					setSelectedSquare(null);
				}
				return;
			}
		}

		// Did they click on one of their pieces?
		const piece = chess.current.get(square);
		if (piece) {
			if (piece.color === game.team) {
				setSelectedSquare(square);
			}
		}

		// Did they click on a piece that has valid moves?
		// Indicate no moves, or highlight all possible moves 

	};
	const handleMouseUpCanvas = (square) => {

	};

	//+----------------------------------\------------------------
	//|	  	 		Render				 |
	//\----------------------------------/------------------------
	if (errorMessage)
		return <div align='center'>Something happened: {errorMessage}</div>;
	if (!game)
		return <div align='center'>Loading...</div>;

	const { isMovingTable, isQuittingTable } = playAPI;
	const isMoving = isMovingTable[game.gid];
	const isQuitting = isQuittingTable[game.gid];

	// Player turn text
	const blackPossessiveName = (game.team === 'b') ? 'Your' : game.name_b + '\'s';
	const whitePossessiveName = (game.team === 'w') ? 'Your' : game.name_w + '\'s';
	const blackMoveText = blackPossessiveName + ' move';
	const whiteMoveText = whitePossessiveName + ' move';

	const inCheck = chess.current.in_check();
	let gameTitleVisibility = 'visible';
	let gameTitleText;
	switch (game.status) {
		case 'wait': gameTitleText = 'Waiting for another player to join...'; break;
		case 'play': gameTitleText = inCheck ? 'Check!' : 'invisible'; break;
		case 'draw': gameTitleText = 'Game ended in a draw.'; break;
		case 'stale': gameTitleText = 'Game ended in a draw due to stalemate.'; break;
		case 'ins': gameTitleText = 'Game ended in a draw due to insufficient material.'; break;
		case '3fold': gameTitleText = 'Game ended in a draw due to three-fold repetition.'; break;
		case 'cm_w': gameTitleText = 'Checkmate! ' + game.name_w + ' wins.'; break;
		case 'cm_b': gameTitleText = 'Checkmate! ' + game.name_b + ' wins.'; break;
		case 'con_w': gameTitleText = game.name_b + ' conceded. ' + game.name_w + ' wins!'; break;
		case 'con_b': gameTitleText = game.name_w + ' conceded. ' + game.name_b + ' wins!'; break;
		default: gameTitleText = 'invisible'; break;
	}
	if (gameTitleText === 'invisible')
		gameTitleVisibility = 'hidden';

	const blackTurnTextVisibility = (game.status === 'play' && chess.current.turn() === 'b') ? 'visible' : 'hidden';
	const whiteTurnTextVisibility = (game.status === 'play' && chess.current.turn() === 'w') ? 'visible' : 'hidden';

	const buttonsDisabled = isMoving || isQuitting;
	const historyControlsDisplay = (game.status === 'wait' || game.status === 'play') ? 'none' : 'block';
	const nextMoveDisabled = buttonsDisabled || !canGoForwardInHistory();
	const lastMoveDisabled = buttonsDisabled || !canGoBackInHistory();

	const timerDisplay = (game.status === 'play') ? 'block' : 'none';

	let quitButtonContent;
	if (game.status === 'play')
		quitButtonContent = isQuitting ? <>Conceding...<ButtonSpinner /></> : 'Concede';
	else
		quitButtonContent = isQuitting ? <>Leaving...<ButtonSpinner /></> : 'Leave';

	return (
		<div align='center' style={{ display: 'block' }}>
			<h4 style={{ visibility: gameTitleVisibility, display: 'block' }}>{gameTitleText}</h4>

			<p style={{ visibility: blackTurnTextVisibility }}>{blackMoveText}</p>
			<GameCanvas size={CANVAS_SIZE}
				board={board}
				selectedSquare={selectedSquare}
				onMouseDown={handleMouseDownCanvas}
				onMouseUp={handleMouseUpCanvas} />
			<p style={{ visibility: whiteTurnTextVisibility }}>{whiteMoveText}</p>

			<div style={{ display: historyControlsDisplay }}>
				<Button className='game-history-button' disabled={lastMoveDisabled} onClick={!lastMoveDisabled ? showStart : null}>{'<<'}</Button>
				<Button className='game-history-button' disabled={lastMoveDisabled} onClick={!lastMoveDisabled ? showPrevious : null}>{'<'}</Button>
				<Button className='game-history-button' disabled={nextMoveDisabled} onClick={!nextMoveDisabled ? showNext : null}>{'>'}</Button>
				<Button className='game-history-button' disabled={nextMoveDisabled} onClick={!nextMoveDisabled ? showPresent : null}>{'>>'}</Button>
				<br />
				<p style={{ visibility: nextMoveDisabled ? 'hidden' : 'visible' }}>Moves left: {historyPosition}</p>
			</div>
			<div style={{ display: timerDisplay }}>
				<table style={{ width: '300px' }}>
					<tbody>
						<tr><th>Your time</th><th>Their time</th></tr>
						<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
					</tbody>
				</table>
			</div>

			<Button className='game-button' disabled={buttonsDisabled} onClick={!buttonsDisabled ? leaveGame : null}>
				{quitButtonContent}
			</Button>
		</div >
	);
};

export { Game };
