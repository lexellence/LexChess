import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const GameTableTitleRow = () => (
	<tr>
		<th>Game</th>
		<th>Status</th>
		<th>White</th>
		<th>Black</th>
		<th>Spectate</th>
	</tr>
);

const GameTableRow = ({ gid, status, name_w, name_b, name_d, joinGameCallback }) => {
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
	let whiteTD = name_w ? <td>{name_w}</td>
		: <td><Button className="edit-link" onClick={() => joinGameCallback(gid, 'w')}>Play as White</Button></td>;
	let blackTD = name_b ? <td>{name_b}</td>
		: <td><Button className="edit-link" onClick={() => joinGameCallback(gid, 'b')}>Play as Black</Button></td>;

	return (
		<tr>
			<td>{names}</td>
			<td>{statusText}</td>
			{whiteTD}
			{blackTD}
			<td>
				<Button className="edit-link" onClick={() => joinGameCallback(gid, 'o')}>Watch</Button>
			</td>
		</tr >
	);
};

const GameTableRowList = ({ gameList, joinGameCallback }) => (
	gameList.map((game, i) => {
		return <GameTableRow gid={game.gid}
			status={game.status}
			name_w={game.name_w}
			name_b={game.name_b}
			name_d={game.name_d}
			joinGameCallback={joinGameCallback} />;
	})
);

const GameList = ({ gameList, joinGameCallback }) => (
	<div className="table-wrapper">
		<Table striped bordered hover>
			<thead>
				<GameTableTitleRow />
			</thead>
			<tbody>
				{gameList ?
					<GameTableRowList gameList={gameList} joinGameCallback={joinGameCallback} />
					:
					<></>
				}
			</tbody>
		</Table>
	</div>
);

export default GameList;