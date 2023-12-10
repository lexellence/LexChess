import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { ButtonSpinner } from '../ButtonSpinner';
import { useJoinAPIContext } from '../API';
import { useFirebaseListenerContext } from '../FirebaseListener';
import { getStatusText } from '.';

//+--------------------------------\--------------------------
//|	 	      JoinGameList    	   |
//\--------------------------------/--------------------------
function JoinGameList({ isSignedIn, isUserMaxedOut }) {
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
		<Table id='join-game-table' striped bordered hover>
			<thead>
				<tr>
					<th>Players</th>
					<th>Status</th>
					<th>White</th>
					<th>Black</th>
					<th>Spectate</th>
				</tr>
			</thead>
			<tbody>
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
						isUserMaxedOut={isUserMaxedOut}
					/>;
				})}
			</tbody>
		</Table>
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
function GameTableRow({ gid, status, name_w, name_b, name_d, isSignedIn, inGame, isUserMaxedOut }) {
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
	const disableButtons = (joiningGameData.isJoining || !isSignedIn || isUserMaxedOut);
	const joiningThisGame = joiningGameData.isJoining && joiningGameData.gid === gid;
	const teamNames = new Map([
		['w', name_w],
		['b', name_b],
		['o', null],
	]);

	// Build table data list
	const tableDataList = Array.from(joinGameButtonMap).map(([team, button]) => {
		let cellContent;
		if (teamNames.get(team))
			cellContent = teamNames.get(team);
		else {
			let buttonContent;
			if (joiningThisGame && joiningGameData.team === team)
				buttonContent = <>Joining...<ButtonSpinner variant={button.spinnerVariant} /></>;
			else if (!joiningThisGame && isUserMaxedOut)
				buttonContent = "You're maxed out!";
			else
				buttonContent = button.label;

			cellContent =
				<Button className='game-list-button'
					variant={button.variant}
					size='sm'
					disabled={disableButtons}
					onClick={!disableButtons ? () => joinGame(gid, team) : null}>
					{buttonContent}
				</Button>;
		}

		return (
			<td key={team}>
				{cellContent}
			</td>);
	});


	// Render
	return (
		<tr>
			<td>{gameTitle}</td>
			<td>{getStatusText(status, name_w, name_b)}</td>
			{tableDataList}
		</tr >
	);
}

export { JoinGameList };