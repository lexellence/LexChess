import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const GameTableRow = ({ gid, status, name_w, name_b, name_d, onJoinGame, userInGame, buttonsDisabled }) => {
	let names = '';
	if (!name_w && !name_b)
		names = name_d;
	else if (name_w && name_b)
		names = name_w + ' vs. ' + name_b;
	else {
		if (name_w)
			names = name_w;
		else
			names = name_b;
	}

	let statusText;
	switch (status) {
		case 'wait': statusText = 'Waiting for opponent'; break;
		case 'play': statusText = 'Game in progress'; break;
		case 'draw': statusText = 'Draw'; break;
		case 'stale': statusText = 'Draw (stalemate)'; break;
		case 'ins': statusText = 'Draw (insufficient material)'; break;
		case '3fold': statusText = 'Draw (three-fold repetition)'; break;
		case 'cm_w': statusText = name_w + ' (white) won by checkmate'; break;
		case 'cm_b': statusText = name_b + ' (black) won by checkmate'; break;
		case 'con_w': statusText = name_w + ' (white) won by concession'; break;
		case 'con_b': statusText = name_b + ' (black) won by concession'; break;
		default:
			statusText = '';
	}
	let white = name_w ? name_w
		: <Button variant='primary'
			disabled={buttonsDisabled}
			style={{ visibility: userInGame ? 'hidden' : 'visible' }}
			onClick={userInGame ? () => { } : () => onJoinGame(gid, 'w')}>
			Play as White
		</Button>;
	let black = name_b ? name_b
		: <Button variant='primary'
			disabled={buttonsDisabled}
			style={{ visibility: userInGame ? 'hidden' : 'visible' }}
			onClick={userInGame ? () => { } : () => onJoinGame(gid, 'b')}>
			Play as Black
		</Button>;
	let watch =
		< Button variant={userInGame ? 'outline-secondary' : 'primary'}
			disabled={buttonsDisabled}
			style={{ visibility: userInGame ? 'hidden' : 'visible' }}
			onClick={userInGame ? () => { } : () => onJoinGame(gid, 'w')}>
			Watch
		</Button >;

	return (
		<tr>
			<td>{names}</td>
			<td>{statusText}</td>
			<td>{white}</td>
			<td>{black}</td>
			<td>{watch}</td>
		</tr >
	);
};

const GameTableRowList = ({ gameList, userGIDs, onJoinGame, buttonsDisabled }) => (
	gameList.map((game, i) => {
		return <GameTableRow
			key={i}
			gid={game.gid}
			status={game.status}
			name_w={game.name_w}
			name_b={game.name_b}
			name_d={game.name_d}
			onJoinGame={onJoinGame}
			userInGame={userGIDs.includes(game.gid)}
			buttonsDisabled={buttonsDisabled} />;
	})
);

const GameList = ({ gameList, userGIDs, onJoinGame, buttonsDisabled }) => (
	<div className="table-wrapper">
		<Table striped bordered hover>
			<thead>
				<tr>
					<th>Game</th>
					<th>Status</th>
					<th>White</th>
					<th>Black</th>
					<th>Spectate</th>
				</tr>
			</thead>
			<tbody>
				{gameList ?
					<GameTableRowList gameList={gameList} userGIDs={userGIDs} onJoinGame={onJoinGame} buttonsDisabled={buttonsDisabled} />
					:
					<></>
				}
			</tbody>
		</Table>
	</div>
);

export default GameList;