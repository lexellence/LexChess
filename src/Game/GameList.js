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

const GameTableRow = ({ gid, status, display_name_white, display_name_black, display_name_defer, joinGameCallback }) => {
	let names = '';
	if (!display_name_white && !display_name_black)
		names = display_name_defer;
	else if (display_name_white && display_name_black)
		names = display_name_white + ' vs. ' + display_name_black;
	else {
		if (display_name_white)
			names = display_name_white;
		else
			names = display_name_black;
	}

	let whiteTD = display_name_white ? <td>{display_name_white}</td>
		: <td><Button className="edit-link" onClick={() => joinGameCallback(gid, 'white')}>Play as White</Button></td>;
	let blackTD = display_name_black ? <td>{display_name_black}</td>
		: <td><Button className="edit-link" onClick={() => joinGameCallback(gid, 'black')}>Play as Black</Button></td>;

	return (
		<tr>
			<td>{names}</td>
			<td>{status}</td>
			{whiteTD}
			{blackTD}
			<td>
				<Button className="edit-link" onClick={() => joinGameCallback(gid, 'observe')}>Watch</Button>
			</td>
		</tr >
	);
};

const GameTableRowList = ({ gameList, joinGameCallback }) => (
	gameList.map((game, i) => {
		return <GameTableRow gid={game.gid}
			status={game.status}
			display_name_white={game.display_name_white}
			display_name_black={game.display_name_black}
			display_name_defer={game.display_name_defer}
			joinGameCallback={joinGameCallback} />;
	})
);

const GameList = ({ gameList, joinGameCallback }) => (
	<div>
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
	</div>
);

export default GameList;