import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const GameTableRow = ({ gid, uid_white, uid_black, joinGameCallback }) => (
	<tr>
		<td>{gid}</td>
		<td>{uid_white}</td>
		<td>{uid_black}</td>
		<td> <Button className="edit-link" onClick={() => joinGameCallback(gid)}>Join</Button> </td>
	</tr >
);

// Create an array of GameTableRows out of the array of users
// const getTableRowsFromGameList = () => {
// 	if (!openGames)
// 		return <></>;

// 	return openGames.map((game, i) => {
// 		return <GameTableRow gid={game[0]}
// 			uid_white={game[1].uid_white}
// 			uid_black={game[1].uid_black}
// 			joinGameCallback={joinGameCallback} />;
// 	});
// };
const GameTableRowList = ({ openGames, joinGameCallback }) => (
	openGames.map((game, i) => {
		return <GameTableRow gid={game[0]}
			uid_white={game[1].uid_white}
			uid_black={game[1].uid_black}
			joinGameCallback={joinGameCallback} />;
	})
);


const GameList = ({ openGames, joinGameCallback }) => (
	<div>
		<div className="table-wrapper">
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>gid</th>
						<th>uid_white</th>
						<th>uid_black</th>
						<th>Join</th>
					</tr>
				</thead>
				<tbody>
					{/* {getTableRowsFromGameList(openGames, joinGameCallback)} */}
					{openGames ?
						<GameTableRowList openGames={openGames} joinGameCallback={joinGameCallback} />
						:
						<></>
					}
				</tbody>
			</Table>
		</div>
	</div>
);

export default GameList;