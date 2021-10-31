import React from 'react';
import GameList from './GameList';

import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { withFirebaseListener } from '../FirebaseListener';
import GameCreator from './GameCreator';

const INITIAL_STATE = {
	authUser: null,
	userGIDs: null,
	gameList: null,
};
class GameListPageBase extends React.Component {
	state = { ...INITIAL_STATE };

	componentDidMount() {
		this.registerAuthListener();
	};
	componentWillUnmount() {
		if (this.unregisterUserListener)
			this.unregisterUserListener();
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
		const handleGameListUpdate = (gameList) =>
			this.setState({ gameList });
		this.unregisterGameListListener = this.props.firebaseListener.registerGameListListener(handleGameListUpdate);
	};

	render() {
		const { gameList, userGIDs } = this.state;

		// Loading
		if (!gameList || !userGIDs)
			return <div align='center'>Loading...</div>;

		return (
			<div align='center' style={{ display: 'block' }}>
				<GameCreator />
				<GameList gameList={gameList} userGIDs={userGIDs} />
			</div>
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
