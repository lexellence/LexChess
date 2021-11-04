// TODO: convert to TS
import React, { useState, useEffect, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonSpinner from '../ButtonSpinner';

import { useFirebaseListenerContext } from '../FirebaseListener';
import GameCanvas from './GameCanvas';
import * as Chess from 'chess.js';
import { usePlayAPIContext } from '../API';

const CANVAS_SIZE = 360;

function Game({ gid, uid }) {
	const firebaseListener = useFirebaseListenerContext();
	const playAPI = usePlayAPIContext();

	const [historyPosition, setHistoryPosition] = useState(0);
	const [selectedSquare, setSelectedSquare] = useState(null);
	const [game, setGame] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);

	const chess = useMemo(() => new Chess(), []);

	// Mount/Unmount
	useEffect(() => {
		const handleGameUpdate = (game) => {
			if (game) {
				// Apply previous moves
				chess.reset();
				if (game.moves.length > 0)
					for (let i = 0; i < game.moves.length; i++)
						if (!chess.move(game.moves[i])) {
							setErrorMessage('Invalid list of previous moves');
							return;
						}
			}
			setGame(game);
			setHistoryPosition(0);
			setSelectedSquare(null);
		};
		return firebaseListener.registerGameListener(handleGameUpdate, gid);
	}, [firebaseListener, gid, chess]);

	const canGoBackInHistory = () => {
		return (game?.moves?.length &&
			historyPosition < game.moves.length);
	};
	const canGoForwardInHistory = () => {
		return (game?.moves?.length &&
			historyPosition > 0);
	};

	const undoMove = () => {
		return chess.undo() ? true : false;
	};
	const showPrevious = () => {
		if (canGoBackInHistory()) {
			if (undoMove())
				setHistoryPosition(historyPosition + 1);
			// TODO: Error handling
		}
	};
	const redoMove = (moveIndex) => {
		const move = game.moves[moveIndex];
		return chess.move(move) ? true : false;
	};
	const showNext = () => {
		if (canGoForwardInHistory()) {
			const moveIndex = game.moves.length - historyPosition;
			if (redoMove(moveIndex))
				setHistoryPosition(historyPosition - 1);
			// TODO: Error handling
		}
	};
	const showPresent = () => {
		if (canGoForwardInHistory()) {
			let tempHistoryPosition = historyPosition;
			while (tempHistoryPosition > 0) {
				const moveIndex = game.moves.length - tempHistoryPosition;
				if (this.redoMove(moveIndex))
					tempHistoryPosition--;
				else
					break;
				// TODO: Error handling
			}
			setHistoryPosition(tempHistoryPosition);
		}
	};

	const getTeam = () => {
		// Determine user's team
		if (game.uid_w === uid)
			return 'w';
		else if (game.uid_b === uid)
			return 'b';
		else if (game.uid_d === uid)
			return 'd';
		else
			return 'o';
	};
	const move = (moveString) => {
		playAPI.move(gid, moveString);
	};
	const handleMouseDownCanvas = (square) => {
		// Is game in progress?
		if (game.status !== 'play')
			return;

		// Is it user's turn?
		const team = getTeam();
		if (chess.turn() !== team)
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
				const nextMove = chess.move({ from: selectedSquare, to: square });
				if (nextMove) {
					move(nextMove.san);
					setSelectedSquare(null);
				}
				return;
			}
		}

		// Did they click on one of their pieces?
		const piece = chess.get(square);
		if (piece) {
			if (piece.color === team) {
				setSelectedSquare(square);
			}
		}

		// Did they click on a piece that has valid moves?
		// Indicate no moves, or highlight all possible moves 

	};
	const handleMouseUpCanvas = (square) => {

	};

	const leaveGame = () => {
		playAPI.leaveGame(gid);
	};

	// Render
	const { isMovingTable, isQuittingTable } = playAPI;
	const isMoving = isMovingTable[gid];
	const isQuitting = isQuittingTable[gid];

	// Error
	if (errorMessage)
		return <div align='center'>Something happened: {errorMessage}</div>;

	// Loading
	if (!game)
		return <div align='center'>Loading...</div>;

	// Determine user's team
	const team = getTeam();

	const blackPossessiveName = (team === 'b') ? 'Your' : game.name_b + '\'s';
	const whitePossessiveName = (team === 'w') ? 'Your' : game.name_w + '\'s';
	const blackMoveText = blackPossessiveName + ' move';
	const whiteMoveText = whitePossessiveName + ' move';

	const inCheck = chess.in_check();
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
	const historyControlsVisibility = (game.status === 'wait' || game.status === 'play') ? 'hidden' : 'visible';
	const timerVisibility = (game.status === 'play') ? 'visible' : 'hidden';

	const blackTurnTextVisibility = (game.status === 'play' && chess.turn() === 'b') ? 'visible' : 'hidden';
	const whiteTurnTextVisibility = (game.status === 'play' && chess.turn() === 'w') ? 'visible' : 'hidden';
	const lastMoveVisibility = canGoBackInHistory() ? 'visible' : 'hidden';
	const nextMoveVisibility = canGoForwardInHistory() ? 'visible' : 'hidden';

	const buttonsDisabled = isMoving || isQuitting;
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
				board={chess.board()}
				selectedSquare={selectedSquare}
				onMouseDown={handleMouseDownCanvas}
				onMouseUp={handleMouseUpCanvas} />
			<p style={{ visibility: whiteTurnTextVisibility }}>{whiteMoveText}</p>

			<div style={{ visibility: historyControlsVisibility }}>
				<Button disabled={buttonsDisabled} onClick={!buttonsDisabled ? showPrevious : null} style={{ visibility: lastMoveVisibility }}>Back</Button>
				<Button disabled={buttonsDisabled} onClick={!buttonsDisabled ? showNext : null} style={{ visibility: nextMoveVisibility }}>Forward</Button>
				<Button disabled={buttonsDisabled} onClick={!buttonsDisabled ? showPresent : null} style={{ visibility: nextMoveVisibility }}>Last</Button>
				<br />
				<p style={{ visibility: nextMoveVisibility }}>Moves back: {historyPosition}</p>
			</div>
			<div style={{ visibility: timerVisibility }}>
				<table style={{ width: '300px' }}>
					<tbody>
						<tr><th>Your time</th><th>Their time</th></tr>
						<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
					</tbody>
				</table>
			</div>

			<p>My team: {team}</p>

			<Button className='game-button' disabled={buttonsDisabled} onClick={!buttonsDisabled ? leaveGame : null}>
				{quitButtonContent}
			</Button>
		</div >
	);
};

export default Game;
