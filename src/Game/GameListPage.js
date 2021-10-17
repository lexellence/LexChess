import React from 'react';
import { Button, ToggleButton, ToggleButtonGroup, Spinner } from 'react-bootstrap';
import GameList from './GameList';
import * as api from '../api';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import withFirebaseListener from '../FirebaseListener';

const INITIAL_STATE = {
	authUser: null,
	userGIDs: [],
	gameList: null,
	createGameTeam: 'd',
	waitingForAPI: false,
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
			this.registerUserListener();
			this.registerGameListListener();
		};
		const onSignOut = () => {
			this.unregisterUserListener();
			this.unregisterGameListListener();
			this.setState({ authUser: null });
		};
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	};
	registerUserListener = () => {
		const handleUserUpdate = (user) =>
			this.setState({ userGIDs: user.gids });
		this.unregisterUserListener = this.props.firebaseListener.registerUserListener(handleUserUpdate);
	};
	registerGameListListener = () => {
		const handleGameListUpdate = (gameList) => {
			this.setState({ gameList });
		};
		this.unregisterGameListListener = this.props.firebaseListener.registerGameListListener(handleGameListUpdate);
	};
	handleCreateGame = () => {
		this.setState(prevState => ({ waitingForAPI: true }));
		this.state.authUser.getIdToken().then(token => {
			api.createGame(token, this.state.createGameTeam).catch(errorMessage => {
				console.log(errorMessage);
				alert(errorMessage);
			}).finally(() => {
				this.setState(prevState => ({ waitingForAPI: false }));
			});
		}).catch(error => {
			console.log(error);
			alert('Failed to get auth token: ' + JSON.stringify(error));
		});
	};
	handleJoinGame = (gid, team) => {
		this.setState(prevState => ({ waitingForAPI: true }));
		this.state.authUser.getIdToken().then(token => {
			api.joinGame(token, gid, team).catch(errorMessage => {
				console.log(errorMessage);
				alert(errorMessage);
			}).finally(() => {
				this.setState(prevState => ({ waitingForAPI: false }));
			});
		}).catch(error => {
			console.log(error);
			alert('Failed to get auth token: ' + JSON.stringify(error));
		});
	};
	handleCreateGameTeamChange = (team) => {
		this.setState({ createGameTeam: team });
	};
	render() {
		const { gameList, userGIDs, waitingForAPI } = this.state;

		// Loading
		if (!gameList)
			return <div align='center'>Loading...</div>;

		const createGameButtonContent =
			!waitingForAPI ? 'Create game' :
				<Spinner
					as="span"
					variant="light"
					size="sm"
					role="status"
					aria-hidden="true"
					animation="border" />;

		return (
			<div align='center' style={{ display: 'block' }}>
				<div>
					<h1>Create a new game</h1>
					<ToggleButtonGroup type='radio' name='teamSelection' defaultValue='d' onChange={this.handleCreateGameTeamChange}>
						<ToggleButton value={'w'} variant='outline-secondary' disabled={waitingForAPI}>Play as white</ToggleButton>
						<ToggleButton value={'b'} variant='outline-secondary' disabled={waitingForAPI}>Play as black</ToggleButton>
						<ToggleButton value={'d'} variant='outline-secondary' disabled={waitingForAPI}>Let opponent choose</ToggleButton>
					</ToggleButtonGroup>
					<br />
					{/* <span className='d-grid gap-2'> */}
					<Button disabled={waitingForAPI} onClick={this.handleCreateGame}>
						{createGameButtonContent}
					</Button>
					{/* </span> */}
				</div>

				<div>
					<h1>Join a game</h1>
					<GameList gameList={gameList} userGIDs={userGIDs} onJoinGame={this.handleJoinGame} buttonsDisabled={waitingForAPI} />
				</div>
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
