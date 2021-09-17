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
	authUser: null,
	gameList: null,
};
class GameListPageBase extends React.Component {
	state = { ...INITIAL_STATE };

	componentDidMount() {
		this.registerAuthListener();
	};
	componentWillUnmount() {
		if (this.unregisterGameListListener)
			this.unregisterGameListListener();

		this.unregisterAuthListener();
	}
	registerAuthListener = () => {
		const onSignIn = (authUser) => {
			this.setState({ authUser });
			this.registerGameListListener();
		};
		const onSignOut = () => {
			this.unregisterGameListListener();
			this.setState({ authUser: null });
		};
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	};
	registerGameListListener = () => {
		const handleGameListUpdate = (gameList) => {
			if (gameList) {
				// Convert object to array, including gid from property keys
				gameList = Object.entries(gameList).map(listing => {
					return { gid: listing[0], ...listing[1] };
				});
			}
			else
				gameList = [];
			this.setState({ gameList });
		};
		this.unregisterGameListListener = this.props.firebaseListener.registerGameListListener(handleGameListUpdate);
	};
	createGame = (team) => {
		this.state.authUser.getIdToken().then(token => {
			api.createGame(token, team).catch(errorMessage => {
				console.log(errorMessage);
				alert(errorMessage);
			});
		}).catch(error => {
			console.log(error);
			alert('Failed to get auth token: ' + JSON.stringify(error));
		});
	};
	joinGame = (gid, team) => {
		this.state.authUser.getIdToken().then(token => {
			api.joinGame(token, gid, team).catch(errorMessage => {
				console.log(errorMessage);
				alert(errorMessage);
			});
		}).catch(error => {
			console.log(error);
			alert('Failed to get auth token: ' + JSON.stringify(error));
		});
	};

	render() {
		const { gameList } = this.state;

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
