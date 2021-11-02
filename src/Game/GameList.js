import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ButtonSpinner from '../ButtonSpinner';
import { useJoinAPIContext } from '../API';
import { useFirebaseListenerContext } from '../FirebaseListener';

//+--------------------------------\--------------------------
//|	 	      GameList   	       |
//\--------------------------------/--------------------------
function GameList({ isSignedIn }) {
	const firebaseListener = useFirebaseListenerContext();
	const [userGIDs, setUserGIDs] = useState(null);
	const [gameList, setGameList] = useState(null);
	let unregisterUserListener = useRef(null);
	let unregisterGameListListener = useRef(null);

	// Mount/Unmount
	useEffect(() => {
		function unregisterListeners() {
			if (unregisterUserListener.current)
				unregisterUserListener.current();
			if (unregisterGameListListener.current)
				unregisterGameListListener.current();
		}
		unregisterListeners();
		unregisterUserListener.current =
			firebaseListener.registerUserListener((user) => setUserGIDs(user.gids));
		unregisterGameListListener.current =
			firebaseListener.registerGameListListener((gameList) => setGameList(gameList));

		return unregisterListeners;
	}, [firebaseListener]);

	// Render
	if (!gameList || (isSignedIn && !userGIDs))
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
						if (userGIDs?.includes(game.gid))
							return null;
						return <GameTableRow
							key={i}
							gid={game.gid}
							status={game.status}
							name_w={game.name_w}
							name_b={game.name_b}
							name_d={game.name_d}
							isSignedIn={isSignedIn}
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
	['o', { label: 'Watch', variant: 'secondary', spinnerVariant: 'light' }],
]);
function GameTableRow({ gid, status, name_w, name_b, name_d, isSignedIn }) {
	const { joinGame, joiningGameData } = useJoinAPIContext();

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

	// Status
	let statusText;
	switch (status) {
		case 'wait': statusText = 'Waiting'; break;
		case 'play': statusText = 'Playing'; break;
		case 'draw': statusText = 'Draw'; break;
		case 'stale': statusText = 'Draw (stalemate)'; break;
		case 'ins': statusText = 'Draw (insufficient material)'; break;
		case '3fold': statusText = 'Draw (three-fold repetition)'; break;
		case 'cm_w': statusText = <>Checkmate!<br />{name_w} wins</>; break;
		case 'cm_b': statusText = <>Checkmate!<br />{name_b} wins</>; break;
		case 'con_w': statusText = <>Conceded<br />{name_w} wins</>; break;
		case 'con_b': statusText = <>Conceded<br />{name_b} wins</>; break;
		default:
			statusText = '';
	}

	// Buttons
	const disableButtons = joiningGameData.isJoining || !isSignedIn;
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
			<td>{statusText}</td>
			{Array.from(joinGameButtonMap).map(([team, button]) =>
				<td key={team}>
					{teamNames.get(team) ? teamNames.get(team)
						: <Button className='join-game-button' variant={button.variant} size='sm'
							disabled={disableButtons}
							onClick={!disableButtons ? () => joinGame(gid, team) : null}>
							{/* Button Label */}
							{(joiningThisGame && joiningGameData.team === team) ?
								<>Joining...
									<ButtonSpinner variant={button.spinnerVariant} />
								</>
								: button.label}
						</Button>}
				</td>)}
		</tr >
	);
}

export default GameList;