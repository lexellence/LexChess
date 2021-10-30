import React from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ButtonSpinner from '../ButtonSpinner';
import GameList from './GameList';
import { withJoinAPI } from '../API';

import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { withFirebaseListener } from '../FirebaseListener';

const INITIAL_STATE = {
	authUser: null,
	userGIDs: [],
	gameList: null,
	createGameTeam: 'd',
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
		this.props.joinAPI.createGame(this.state.createGameTeam);
	};
	handleJoinGame = (gid, team) => {
		this.props.joinAPI.joinGame(gid, team);
	};
	handleCreateGameTeamChange = (team) => {
		this.setState({ createGameTeam: team });
	};
	render() {
		const { gameList, userGIDs, createGameTeam } = this.state;
		const { isCreatingGame, isJoiningGame } = this.props.joinAPI;

		// Loading
		if (!gameList)
			return <div align='center'>Loading...</div>;

		const createGameTeamRadios = [
			{ name: 'Defer', value: 'd' },
			{ name: 'White', value: 'w' },
			{ name: 'Black', value: 'b' },
		];
		return (
			<div align='center' style={{ display: 'block' }}>
				<div>
					<h1>Create a new game</h1>
					Play as:<br />
					<ToggleButtonGroup type='radio' name='teamSelection' defaultValue='d' onChange={this.handleCreateGameTeamChange}>
						{createGameTeamRadios.map((radio, i) =>
							<ToggleButton key={i} value={radio.value} variant={createGameTeam === radio.value ? 'secondary' : 'outline-secondary'} disabled={isCreatingGame}>{radio.name}</ToggleButton>)}
					</ToggleButtonGroup >
					<br />
					<Button disabled={isCreatingGame} onClick={this.handleCreateGame}>
						{isCreatingGame ? <ButtonSpinner /> : 'Create game'}
					</Button>
				</div>

				<div>
					<h1>Join a game</h1>
					<GameList gameList={gameList} userGIDs={userGIDs} onJoinGame={this.handleJoinGame} buttonsDisabled={isJoiningGame} />
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
		withJoinAPI(
			withEmailVerification(
				withAuthorization(conditionFunc)(
					GameListPageBase))));

export default GameListPage;
