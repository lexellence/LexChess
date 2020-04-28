import React from "react";
import axios from 'axios';
import firebase from 'firebase';
import to from 'await-to-js';

import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	  ViewUsersComponent       |
//\----------------------------/------------------------------
import Table from 'react-bootstrap/Table';
import GameTableRowComponent from './GameTableRowComponent';

export default class ViewGamesComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isSignedIn: false,
			gameList: []
		};
	}

	componentDidMount = () => {
		this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged(
			async (user) => {
				this.setState({ isSignedIn: !!user });
				if (!user)
					return;

				let [err, res] = await to(axios.get(constants.API_GET_GAME_LIST));
				if (err) {
					alert('error getting game list): ' + err.message.toUpperCase());
					return;
				}
				if (!Array.isArray(res.data)) {
					alert(JSON.stringify(res.data));
					return;
				}
				this.setState({
					gameList: res.data
				});

			});
	};
	componentWillUnmount() {
		this.unregisterFirebaseAuthObserver();
	}

	// Create an array of RowComponents out of the array of users
	GetTableRowsFromUserList = () => {
		return this.state.gameList.map((game, i) => {
			return <GameTableRowComponent game={game} key={i} />;
		});
	};

	render = () => {
		// if ()
		return (
			<div className="table-wrapper">
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Player</th>
							<th>Your Team</th>
							<th>Join</th>
						</tr>
					</thead>
					<tbody>
						{this.GetTableRowsFromUserList()}
					</tbody>
				</Table>
			</div>
		);
	};
}