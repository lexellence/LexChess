import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const GameTableRow = ({ gid, status, name_w, name_b, name_d, onJoinGame, userInGame }) => {
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
	let whiteButton = name_w ? <td>{name_w}</td>
		: <td>
			<Button variant='primary'
				disabled={userInGame}
				style={{ visibility: userInGame ? 'hidden' : 'visible' }}
				onClick={userInGame ? () => { } : () => onJoinGame(gid, 'w')}>
				Play as White
			</Button>
		</td>;
	let blackButton = name_b ? <td>{name_b}</td>
		: <td>
			<Button variant='primary'
				disabled={userInGame}
				style={{ visibility: userInGame ? 'hidden' : 'visible' }}
				onClick={userInGame ? () => { } : () => onJoinGame(gid, 'b')}>
				Play as Black
			</Button>
		</td>;
	let watchButton =
		< Button variant={userInGame ? 'outline-secondary' : 'primary'}
			style={{ visibility: 'hidden' }}
			disabled={userInGame}
			onClick={userInGame ? () => { } : () => onJoinGame(gid, 'w')}>
			Play as White
		</Button >;

	return (
		<tr>
			<td>{names}</td>
			<td>{statusText}</td>
			<td>{whiteButton}</td>
			<td>{blackButton}</td>
			<td>{watchButton}</td>
		</tr >
	);
};

const GameTableRowList = ({ gameList, userGIDs, onJoinGame }) => (
	gameList.map((game, i) => {
		return <GameTableRow
			key={i}
			gid={game.gid}
			status={game.status}
			name_w={game.name_w}
			name_b={game.name_b}
			name_d={game.name_d}
			onJoinGame={onJoinGame}
			userInGame={userGIDs.includes(game.gid)} />;
	})
);

const GameList = ({ gameList, userGIDs, onJoinGame }) => (
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
					<GameTableRowList gameList={gameList} userGIDs={userGIDs} onJoinGame={onJoinGame} />
					:
					<></>
				}
			</tbody>
		</Table>
	</div>
);

export default GameList;