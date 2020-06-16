import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const GameTableTitleRow = () => (
	<tr>
		<th>White</th>
		<th>Black</th>
		<th>Join</th>
	</tr>
);

const GameTableRow = ({ gid, display_name_white, display_name_black, joinGameCallback }) => (
	<tr>
		<td>{display_name_white}</td>
		<td>{display_name_black}</td>
		<td> <Button className="edit-link" onClick={() => joinGameCallback(gid)}>Join</Button> </td>
	</tr >
);

const GameTableRowList = ({ gameList, joinGameCallback }) => (
	gameList.map((game, i) => {
		return <GameTableRow gid={game.gid}
			display_name_white={game.display_name_white}
			display_name_black={game.display_name_black}
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