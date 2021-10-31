import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ButtonSpinner from '../ButtonSpinner';
import { useJoinAPIContext } from '../API';

const joinGameButtonMap = new Map([
	['w', { label: 'Play', variant: 'light', spinnerVariant: 'dark' }],
	['b', { label: 'Play', variant: 'dark', spinnerVariant: 'light' }],
	['o', { label: 'Watch', variant: 'secondary', spinnerVariant: 'light' }],
]);

function GameTableRow({ gid, status, name_w, name_b, name_d, hideButtons }) {
	const { joinGame, joiningGameData } = useJoinAPIContext();

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

	const disableButtons = joiningGameData.isJoining || hideButtons;
	const joiningThisGame = joiningGameData.isJoining && joiningGameData.gid === gid;
	const teamNames = new Map([
		['w', name_w],
		['b', name_b],
		['o', null],
	]);
	return (
		<tr>
			<td>{gameTitle}</td>
			<td>{statusText}</td>
			{Array.from(joinGameButtonMap).map(([team, button]) =>
				<td key={team}>
					{teamNames.get(team) ? teamNames.get(team)
						: <Button className='join-game-button' variant={button.variant} size='sm'
							disabled={disableButtons}
							style={{ visibility: hideButtons ? 'hidden' : 'visible' }}
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

function GameTableRowList({ gameList, userGIDs }) {
	return gameList.map((game, i) => {
		return <GameTableRow
			key={i}
			gid={game.gid}
			status={game.status}
			name_w={game.name_w}
			name_b={game.name_b}
			name_d={game.name_d}
			hideButtons={userGIDs.includes(game.gid)}
		/>;
	});
}

function GameList({ gameList, userGIDs }) {
	return (
		<div>
			<h1>Join a game</h1>
			<div className='table-wrapper'>
				<Table striped bordered hover>
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
						{gameList ?
							<GameTableRowList gameList={gameList} userGIDs={userGIDs} />
							:
							<></>}
					</tbody>
				</Table>
			</div>
		</div>

	);
}

export default GameList;