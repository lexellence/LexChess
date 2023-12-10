import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from "../constants/routes";
import { JoinGameList } from './JoinGameList';
import { AuthUserContext } from '../Session';
import { GameCreator } from './GameCreator';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { useFirebaseListenerContext } from '../FirebaseListener';

function GameListPageNonAuth() {
	return (
		<section>
			<h3>Please <Link to={ROUTES.SIGN_IN}>sign in</Link> to create, join, or watch a game</h3>
			<JoinGameList isSignedIn={false} />
		</section>
	);
};

const MAX_CONCURRENT_GAMES = 3;
function GameListPageAuth() {
	// Register user listener
	const firebaseListener = useFirebaseListenerContext();
	const [isUserMaxedOut, setIsUserMaxedOut] = useState(false);
	useEffect(() => {
		const handleUserUpdate = (user) => {
			setIsUserMaxedOut(Object.keys(user.play).length >= MAX_CONCURRENT_GAMES);
		};
		return firebaseListener.registerUserListener(handleUserUpdate);
	}, [firebaseListener, setIsUserMaxedOut]);

	return (
		<>
			<section>
				<h1>Create a new game</h1>
				<GameCreator isUserMaxedOut={isUserMaxedOut} />
			</section>
			<section>
				<h1>Join a game</h1>
				<JoinGameList isSignedIn={true} isUserMaxedOut={isUserMaxedOut} />
			</section>
		</>
	);
};

function GameListPageBase() {
	return (
		<div id='game-list-page'>
			<AuthUserContext.Consumer>
				{authUser => authUser ? <GameListPageAuth /> : <GameListPageNonAuth />}
			</AuthUserContext.Consumer>
		</div>
	);
}

const GameListPage = withEmailVerification(
	withAuthorization(authUser => Boolean(authUser))(
		GameListPageBase));

export { GameListPage };
