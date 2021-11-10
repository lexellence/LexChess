import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ButtonSpinner from '../ButtonSpinner';
import { useFirebaseListenerContext } from '../FirebaseListener';
import { getStatusText } from '../GameListPage';
import { useGameHistoryPageContext } from './GameHistoryPageContext';

//+--------------------------------\--------------------------
//|	 	      GameList   	       |
//\--------------------------------/--------------------------
function HistoryGameList() {
	const firebaseListener = useFirebaseListenerContext();
	const [pastGIDs, setPastGIDs] = useState(null);
	const [gameList, setGameList] = useState(null);

	// Mount/Unmount
	useEffect(() => {
		const unregisterUserListener =
			firebaseListener.registerUserListener((user) => setPastGIDs(Object.keys(user.past)));
		const unregisterGameListListener =
			firebaseListener.registerGameListListener((gameList) => setGameList(gameList));
		return () => {
			unregisterUserListener();
			unregisterGameListListener();
		};
	}, [firebaseListener]);

	// Render
	if (!gameList || !pastGIDs)
		return <div align='center'>Loading records...<ButtonSpinner variant={'dark'} /></div>;
	else
		return (
			<div className='table-wrapper'>
				<Table striped bordered hover>
					<thead>
						<tr>
							{/* Game list headers */}
							<th>Result</th>
							<th>White</th>
							<th>Black</th>
							<th>View</th>
						</tr>
					</thead>
					<tbody>
						{/* Game list rows */}
						{gameList.map((game, i) => {
							return <GameTableRow
								key={i}
								gid={game.gid}
								status={game.status}
								name_w={game.name_w}
								name_b={game.name_b}
								name_d={game.name_d}
							/>;
						})}
					</tbody>
				</Table>
			</div>
		);
}

//+--------------------------------\--------------------------
//|	 	    GameTableRow   	       |
//\--------------------------------/--------------------------
function GameTableRow({ gid, status, name_w, name_b, name_d }) {
	const { isLoadingGame, loadingGID, loadGame } = useGameHistoryPageContext();

	// Only include finished games in history list
	if (status === 'wait' || status === 'play')
		return null;

	// Buttons
	const loadingThisGame = isLoadingGame && loadingGID === gid;

	// Render
	return (
		<tr>
			<td>{getStatusText(status, name_w, name_b)}</td>
			<td>{name_w}</td>
			<td>{name_b}</td>
			<td>
				<Button className='join-game-button' variant='primary' size='sm'
					disabled={isLoadingGame}
					onClick={!isLoadingGame ? () => loadGame(gid) : null}>
					{/* Button Label */}
					{(loadingThisGame) ?
						<>Opening...<ButtonSpinner variant='primary' /></>
						: 'View'
					}
				</Button>
			</td>
		</tr >
	);
}

export default HistoryGameList;