import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { ButtonSpinner } from '../ButtonSpinner';
import { useJoinAPIContext } from '../API';
import { useFirebaseListenerContext } from '../FirebaseListener';
import { getStatusText } from '.';

//+--------------------------------\--------------------------
//|	 	      JoinGameList    	   |
//\--------------------------------/--------------------------
function JoinGameList({ isSignedIn }) {
	const firebaseListener = useFirebaseListenerContext();
	const [playingGIDs, setPlayingGIDs] = useState(null);
	const [gameList, setGameList] = useState(null);

	// Mount/Unmount
	useEffect(() => {
		const unregisterUserListener =
			firebaseListener.registerUserListener((user) => {
				setPlayingGIDs(Object.keys(user.play));
			});
		const unregisterGameListListener =
			firebaseListener.registerGameListListener((gameList) => setGameList(gameList));

		return () => {
			unregisterUserListener();
			unregisterGameListListener();
		};
	}, [firebaseListener]);

	// Render
	if (!gameList || (isSignedIn && !playingGIDs))
		return <div align='center'>Loading game list...<ButtonSpinner variant={'dark'} /></div>;

	return (
		<div className='table-wrapper'>
			<Table striped bordered hover>
				<thead>
					<tr>
						{/* Game list headers */}
						<th>Players</th>
						<th>Status</th>
						<th>White</th>
						<th>Black</th>
						<th>Spectate</th>
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
							isSignedIn={isSignedIn}
							inGame={playingGIDs?.includes(game.gid)}
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
const joinGameButtonMap = new Map([
	['w', { label: 'Play', variant: 'light', spinnerVariant: 'dark' }],
	['b', { label: 'Play', variant: 'dark', spinnerVariant: 'light' }],
	['o', { label: 'Spectate', variant: 'secondary', spinnerVariant: 'light' }],
]);
function GameTableRow({ gid, status, name_w, name_b, name_d, isSignedIn, inGame }) {
	const { joinGame, joiningGameData } = useJoinAPIContext();

	// Only include joinable games in join-game list
	const gameCompleted = (status !== 'wait' && status !== 'play');
	if (gameCompleted || inGame)
		return null;

	// Title
	let gameTitle = '';
	if (!name_w && !name_b)
		gameTitle = name_d;
	else if (name_w && name_b)
		gameTitle = name_w + ' vs. ' + name_b;
	else {
		if (name_w)
			gameTitle = name_w;
		else
			gameTitle = name_b;
	}

	// Buttons
	const disableButtons = (joiningGameData.isJoining || !isSignedIn);
	const joiningThisGame = joiningGameData.isJoining && joiningGameData.gid === gid;
	const teamNames = new Map([
		['w', name_w],
		['b', name_b],
		['o', null],
	]);

	// Render
	return (
		<tr>
			<td>{gameTitle}</td>
			<td>{getStatusText(status, name_w, name_b)}</td>
			{Array.from(joinGameButtonMap).map(([team, button]) =>
				<td key={team}>
					{teamNames.get(team) ? teamNames.get(team)
						: <Button className='join-game-button' variant={button.variant} size='sm'
							disabled={disableButtons}
							onClick={!disableButtons ? () => joinGame(gid, team) : null}>
							{/* Button Label */}
							{(joiningThisGame && joiningGameData.team === team) ?
								<>Joining...<ButtonSpinner variant={button.spinnerVariant} /></>
								: button.label}
						</Button>}
				</td>)}
		</tr >
	);
}

export { JoinGameList };