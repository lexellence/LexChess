import React from 'react';
import Button from 'react-bootstrap/Button';
import GameList from './GameList';
import * as api from '../api';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import withFirebaseListener from '../FirebaseListener';

const INITIAL_STATE = {
	gameList: null,
	// errorMessage: null,
};
class GameListPageBase extends React.Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}
	componentDidMount() {
		// Auth User Listener
		const onSignIn = (authUser) => { this.authUser = authUser; };
		const onSignOut = () => { this.authUser = null; };
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);

		// Game List Listener
		// const handleGameListError = (errorMessage) => {
		// 	this.setState({ ...INITIAL_STATE, errorMessage });
		// };
		const handleGameListUpdate = (gameList) => {
			if (gameList) {
				// Convert object to array, including gid from property keys
				gameList = Object.entries(gameList).map(listing => {
					return { gid: listing[0], ...listing[1] };
				});
			}
			else
				gameList = [];
			this.setState({ ...INITIAL_STATE, gameList });
		};
		// this.unregisterGameListListener = this.props.firebaseListener.registerGameListListener(handleGameListUpdate, handleGameListError);
		this.unregisterGameListListener = this.props.firebaseListener.registerGameListListener(handleGameListUpdate);
	};
	componentWillUnmount() {
		this.unregisterGameListListener();
		this.unregisterAuthListener();
	}
	getToken = async () => {
		if (!this.authUser) {
			alert("Cannot get token: user not logged in.");
			return null;
		}
		try {
			return await this.authUser.getIdToken();
		}
		catch (error) {
			// TODO: error mode in render()
			console.log(error);
			alert('Failed to get auth token');
			return null;
		};
	};
	createGame = async (team) => {
		const token = await this.getToken();
		if (token) {
			try {
				api.createGame(token, team);
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};
	joinGame = async (gid, team) => {
		const token = await this.getToken();
		if (token) {
			try {
				api.joinGame(token, gid, team);
			} catch (errorMessage) {
				alert(errorMessage);
			}
		}
	};

	render() {
		// const { gameList, errorMessage } = this.state;
		const { gameList } = this.state;

		// // Error
		// if (errorMessage)
		// 	return <div align='center'>Something happened: {errorMessage}</div>;

		// Loading
		if (!gameList)
			return <div align='center'>Loading...</div>;

		return (
			<div align='center' style={{ display: 'block' }}>
				<h1>Game List</h1>
				<Button onClick={() => this.createGame('w')}>Create game as white</Button>
				<Button onClick={() => this.createGame('b')}>Create game as black</Button>
				<Button onClick={() => this.createGame('d')}>Create game and defer</Button>
				<GameList gameList={gameList}
					joinGameCallback={this.joinGame} />
			</div >
		);
	}
};

const conditionFunc = function (authUser) {
	return !!authUser;
};

const GameListPage =
	withFirebaseListener(
		withEmailVerification(
			withAuthorization(conditionFunc)(
				GameListPageBase)));

export default GameListPage;
