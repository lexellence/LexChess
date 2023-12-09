import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Modal from 'react-bootstrap/Modal';
import { ButtonSpinner } from '../ButtonSpinner';
import { GameCanvas } from './GameCanvas';
import { Chess } from 'chess.js'
import { usePlayAPIContext } from '../API';
import { FaChessPawn } from 'react-icons/fa';
import { IoCaretBack, IoCaretForward, IoPlayBack, IoPlayForward, IoArrowBackCircleSharp } from 'react-icons/io5';
import { historyButtonIconSize, iconSize, iconSize3 } from '../iconSizes';

const DEFAULT_BOARD_SIZE = 360;
const BOARD_SIZE_BUFFER = 20;	// Prevents scrollbar

const defaultPromotionPiece = 'q';
const promotionPieceRadioMap = new Map([
	['q', { label: 'Queen', variant: 'light' }],
	['b', { label: 'Bishop', variant: 'light' }],
	['r', { label: 'Rook', variant: 'light' }],
	['n', { label: 'Knight', variant: 'light' }],
]);
function PromotionPicker({ isActive, selectPiece, handleCancel }) {
	const [pieceSelection, setPieceSelection] = useState(defaultPromotionPiece);

	return (
		<Modal
			show={isActive}
			onHide={handleCancel}
			backdrop="static"
			centered
			size="sm"
		>
			<div style={{ margin: 'auto' }}>
				<Modal.Header closeButton>
					<Modal.Title style={{ margin: 'auto' }}>Pawn Promotion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ToggleButtonGroup type='radio' name='promotionPieceSelection'
						defaultValue={defaultPromotionPiece} onChange={setPieceSelection}>
						{Array.from(promotionPieceRadioMap).map(([piece, radio], i) =>
							<ToggleButton id={`promotion-piece-button-${i}`} key={piece} value={piece}
								variant={pieceSelection === piece ? radio.variant : `${radio.variant}`}
								size='sm'
								className={'promotion-piece-option' + (pieceSelection === piece ? ' promotion-piece-selection' : '')}>
								{radio.label}
							</ToggleButton>)}
					</ToggleButtonGroup>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='primary'
						onClick={() => selectPiece(pieceSelection)} id='promotion-button'>
						Promote to {promotionPieceRadioMap.get(pieceSelection).label}
					</Button>
					<Button variant="secondary" onClick={handleCancel}>Cancel</Button>
				</Modal.Footer>
			</div>
		</Modal >
	);
}

function TurnIcon({ color, visible }) {
	return <FaChessPawn
		size={iconSize3}
		style={{
			transform: 'translateY(-2px)',
			visibility: visible ? 'visible' : 'hidden',
			color: color
		}} />;
}

// Reset game and apply moves
function applyMoves(chess, moves, historyPosition) {
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
	const location = useLocation();

	const [selectedSquare, setSelectedSquare] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);

	const [chess] = useState(new Chess());
	const [fen, setFen] = useState(chess.fen());
	const [boardSize, setBoardSize] = useState(DEFAULT_BOARD_SIZE);


	// Resize board based on game content dimensions
	const outerDiv = useRef();
	const title = useRef();
	const topTeamLabel = useRef();
	const bottomTeamLabel = useRef();
	const historyControls = useRef();
	const timer = useRef();
	const quitButton = useRef();
	useLayoutEffect(() => {
		function resetBoardSize() {
			const gameContentWidth = outerDiv.current.offsetWidth;
			const gameContentHeight = outerDiv.current.offsetHeight;
			if (gameContentWidth && gameContentHeight) {
				const titleHeight = title.current ? title.current.scrollHeight : 0;
				const topTeamLabelHeight = topTeamLabel.current ? topTeamLabel.current.scrollHeight : 0;
				const bottomTeamLabelHeight = bottomTeamLabel.current ? bottomTeamLabel.current.scrollHeight : 0;
				const historyControlsHeight = historyControls.current ? historyControls.current.scrollHeight : 0;
				const timerHeight = timer.current ? timer.current.scrollHeight : 0;
				const quitButtonHeight = quitButton.current ? quitButton.current.scrollHeight : 0;
				const totalNonBoardHeight = titleHeight + topTeamLabelHeight + bottomTeamLabelHeight +
					historyControlsHeight + timerHeight + quitButtonHeight;

				const boardHeight = gameContentHeight - totalNonBoardHeight;
				setBoardSize(Math.min(gameContentWidth, boardHeight) - BOARD_SIZE_BUFFER);
			}
		}
		let resizeID;
		function handleResize() {
			clearTimeout(resizeID);
			resizeID = setTimeout(resetBoardSize, 20);
		}
		window.addEventListener('resize', handleResize);

		resetBoardSize();
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	// Re-render after chess moves
	const refreshBoard = useCallback(() => {
		setFen(chess.fen());
	}, [chess]);

	// Re-apply all moves
	useEffect(() => {
		const chessHistory = chess.history();
		const shouldApplyMoves = () => {
			const histPos = historyPosition ? historyPosition : 0;
			if (histPos === 0 && chessHistory.length !== game.moves.length)
				return true;
			return !game.moves.every((move, i) => (i >= (game.moves.length - histPos)) || move === chessHistory[i]);
		};

		if (shouldApplyMoves())
			if (applyMoves(chess, game.moves, historyPosition))
				refreshBoard();
			else
				setErrorMessage('Invalid list of previous moves');
	}, [game.moves, historyPosition, chess, refreshBoard]);

	//+----------------------------------\------------------------
	//|	  	 		Back				 |
	//\----------------------------------/------------------------
	const canGoBackInHistory = () => {
		return (game?.moves?.length &&
			historyPosition < game.moves.length);
	};
	const undoMove = () => {
		return Boolean(chess.undo());
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
		return Boolean(chess.move(move));
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
	//|	  	 handleMouseDownCanvas		 |
	//\----------------------------------/------------------------
	const handleMouseDownCanvas = (clickedSquare) => {
		const gameIsBeingPlayed = (game.status === 'play' && location.pathname.startsWith(ROUTES.PLAY));
		const itIsOurTurn = chess.turn() === game.team;
		if (!gameIsBeingPlayed || !itIsOurTurn)
			return;

		if (selectedSquare) {
			if (selectedSquare === clickedSquare)
				setSelectedSquare(null);
			else
				attemptMove(clickedSquare);
		}
		else {
			let isUserClickingOnHisPiece;
			{
				const piece = chess.get(clickedSquare);
				isUserClickingOnHisPiece = piece && piece.color === game.team;
			}
			if (isUserClickingOnHisPiece)
				setSelectedSquare(clickedSquare);
		}

		// Did they click on a piece that has valid moves?
		// Indicate no moves, or highlight all possible moves 

	};

	//+----------------------------------\------------------------
	//|	  	 	  attemptMove			 |
	//\----------------------------------/------------------------
	const [showPromotionPicker, setShowPromotionPicker] = useState(false);
	const [selectPromotionPiece, setSelectPromotionPiece] = useState(() => (pieceType) => { });
	const handleCancelPromotion = () => {
		setShowPromotionPicker(false);
		setSelectedSquare(null);
	};
	const attemptMove = (destinationSquare) => {
		let doesMoveTriggerPromotion = false;
		{
			const piece = chess.get(selectedSquare);
			const isPieceAPawn = piece.type === 'p';
			if (isPieceAPawn) {
				const lastRowNum = game.team === 'w' ? '8' : '0';
				const isDestinationInLastRow = (destinationSquare.charAt(1) === lastRowNum);
				if (isDestinationInLastRow)
					doesMoveTriggerPromotion = true;
			}
		}

		if (doesMoveTriggerPromotion) {
			if (isValidPromotionMove(selectedSquare, destinationSquare)) {
				setShowPromotionPicker(true);
				setSelectPromotionPiece(() => (pieceType) => {
					setShowPromotionPicker(false);
					performMove(selectedSquare, destinationSquare, pieceType);
				});
			}
		}
		else
			performMove(selectedSquare, destinationSquare);

		return;
	};

	//+----------------------------------\------------------------
	//|	  	  isValidPromotionMove		 |
	//\----------------------------------/------------------------
	const isValidPromotionMove = (sourceSquare, destinationSquare) => {
		try {
			const thisMove = chess.move({ from: selectedSquare, to: destinationSquare, promotion: 'q' });
			if (thisMove) {
				chess.undo();
				return true;
			}
			else
				return false;
		}
		catch (error) {
			console.log(error.message);
			return false;
		}
	};

	//+----------------------------------\------------------------
	//|	  	 	  performMove			 |
	//\----------------------------------/------------------------
	const performMove = (fromSquare, toSquare, promotionPiece) => {
		try {
			const thisMove = chess.move({ from: fromSquare, to: toSquare, promotion: promotionPiece });
			if (thisMove) {
				refreshBoard();
				playAPI.move(game.gid, thisMove.san);
				setSelectedSquare(null);
			}
		}
		catch (error) {
			console.log(error.message);
		}
	};

	//+----------------------------------\------------------------
	//|	  	 handleMouseUpCanvas		 |
	//\----------------------------------/------------------------
	const handleMouseUpCanvas = (squarePointedTo) => {
	};

	// function handlePieceDrop({ sourceSquare, targetSquare }) {
	// 	console.log(sourceSquare, targetSquare);
	// 	// Try move
	// 	const nextMove = chess.move({ from: sourceSquare, to: targetSquare });
	// 	if (nextMove) {
	// 		playAPI.move(game.gid, nextMove.san);
	// 		refreshBoard();
	// 	}

	// 	// TODO: handle pawn promotion
	// }
	// function allowDrag({ piece, sourceSquare }) {
	// 	// Is game in progress?
	// 	if (game.status !== 'play')
	// 		return false;

	// 	// Is it user's turn?
	// 	if (chess.turn() !== game.team)
	// 		return false;

	// 	// Did they drag one of their pieces?
	// 	const chessPiece = chess.get(sourceSquare);
	// 	if (chessPiece) {
	// 		if (chessPiece.color === game.team) {
	// 			return true;
	// 		}
	// 	}
	// }

	//+----------------------------------\------------------------
	//|	  	 		Render				 |
	//\----------------------------------/------------------------
	const { isMovingTable, isQuittingTable } = playAPI;
	const isMoving = isMovingTable[game.gid];
	const isQuitting = isQuittingTable[game.gid];

	const whiteNoun = (game.team === 'w') ? 'You' : game.name_w;
	const blackNoun = (game.team === 'b') ? 'You' : game.name_b;

	const inCheck = chess.isCheck();
	let gameTitleText;
	switch (game.status) {
		case 'wait': gameTitleText = 'Waiting for another player...'; break;
		case 'play': gameTitleText = inCheck ? 'Check!' : 'invisible'; break;
		case 'draw': gameTitleText = <>Draw</>; break;
		case 'stale': gameTitleText = <>Draw<br />(stalemate)</>; break;
		case 'ins': gameTitleText = <>Draw<br />(insufficient material)</>; break;
		case '3fold': gameTitleText = <>Draw<br />(three-fold repetition)</>; break;
		case 'cm_w': gameTitleText = <>{whiteNoun + ' won'}<br />Checkmate!</>; break;
		case 'cm_b': gameTitleText = <>{blackNoun + ' won'}<br />Checkmate!</>; break;
		case 'con_w': gameTitleText = <>{whiteNoun + ' won'}<br />{blackNoun + ' conceded'}</>; break;
		case 'con_b': gameTitleText = <>{blackNoun + ' won'}<br />{whiteNoun + ' conceded'}</>; break;
		default: gameTitleText = 'invisible'; break;
	}
	let gameTitleVisibility;
	if (gameTitleText === 'invisible')
		gameTitleVisibility = 'hidden';
	else
		gameTitleVisibility = 'visible';

	const blackTurnIconVisible = (chess.turn() === 'b');
	const whiteTurnIconVisible = (chess.turn() === 'w');

	const buttonsDisabled = isMoving || isQuitting;
	const historyControlsDisplay = !setHistoryPosition ? 'none' : 'block';
	const nextMoveDisabled = buttonsDisabled || !canGoForwardInHistory();
	const lastMoveDisabled = buttonsDisabled || !canGoBackInHistory();

	// const timerDisplay = (game.status === 'play') ? 'block' : 'none';
	const timerDisplay = 'none';

	let quitButtonContent;
	if (location.pathname.startsWith(ROUTES.PLAY)) {
		if (game.status === 'play')
			quitButtonContent = isQuitting ? <>Conceding...<ButtonSpinner /></> : 'Concede';
		else
			quitButtonContent = isQuitting ? <>Leaving...<ButtonSpinner /></> : 'Leave';
	}
	else
		quitButtonContent = isQuitting ? <>Loading records...<ButtonSpinner /></> : <><IoArrowBackCircleSharp size={iconSize} />Records</>;

	const whiteTeamLabel = <><TurnIcon color='white' visible={whiteTurnIconVisible} />{' ' + game.name_w}<TurnIcon visible={false} /></>;
	const blackTeamLabel = <><TurnIcon color='black' visible={blackTurnIconVisible} />{' ' + game.name_b}<TurnIcon visible={false} /></>;

	if (errorMessage)
		return <div ref={outerDiv} style={{ textAlign: 'center' }}>Something happened: {errorMessage}</div>;
	if (!game)
		return <div ref={outerDiv} style={{ textAlign: 'center' }}>Loading...</div>;
	return (
		<div id='game' ref={outerDiv}>
			<h4 ref={title} style={{ visibility: gameTitleVisibility }}>{gameTitleText}</h4>

			<div ref={topTeamLabel}>{game.team === 'w' ? blackTeamLabel : whiteTeamLabel}</div>
			<div id='game-board'>
				<GameCanvas size={boardSize}
					fen={fen}
					flip={game.team === 'b'}
					selectedSquare={selectedSquare}
					onMouseDown={handleMouseDownCanvas}
					onMouseUp={handleMouseUpCanvas} />
			</div>
			<div ref={bottomTeamLabel}>{game.team === 'w' ? whiteTeamLabel : blackTeamLabel}</div>

			<div id='game-history-controls' ref={historyControls} style={{ display: historyControlsDisplay }}>
				<Button className='game-history-button' disabled={lastMoveDisabled} onClick={!lastMoveDisabled ? showStart : null}>
					<span style={{ visibility: game.moves.length - historyPosition > 0 ? 'visible' : 'hidden' }}>{game.moves.length - historyPosition}</span>
					<IoPlayBack size={historyButtonIconSize} />
					<span style={{ visibility: 'hidden' }}>{'0'}</span>
				</Button>
				<Button className='game-history-button' disabled={lastMoveDisabled} onClick={!lastMoveDisabled ? showPrevious : null}>
					<IoCaretBack size={historyButtonIconSize} />
				</Button>
				<Button className='game-history-button' disabled={nextMoveDisabled} onClick={!nextMoveDisabled ? showNext : null}>
					<IoCaretForward size={historyButtonIconSize} />
				</Button>
				<Button className='game-history-button' disabled={nextMoveDisabled} onClick={!nextMoveDisabled ? showPresent : null}>
					<span style={{ visibility: 'hidden' }}>{'0'}</span>
					<IoPlayForward size={historyButtonIconSize} />
					<span style={{ visibility: historyPosition > 0 ? 'visible' : 'hidden' }}>{historyPosition}</span>
				</Button>
			</div>

			<div ref={timer} style={{ display: timerDisplay }}>
				<table id='timer-table'>
					<tbody>
						<tr><th>Your time</th><th>Their time</th></tr>
						<tr><td id="yourTime">0</td><td id="theirTime">0</td></tr>
					</tbody>
				</table>
			</div>

			<Button ref={quitButton} className='game-button' disabled={buttonsDisabled} onClick={!buttonsDisabled ? leaveGame : null}>
				{quitButtonContent}
			</Button>

			<PromotionPicker isActive={showPromotionPicker} selectPiece={selectPromotionPiece} handleCancel={handleCancelPromotion} />
		</div>
	);
};
Game.defaultProps = {
	historyPosition: 0,
};
export { Game };
