import * as React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from "../constants/routes";
import { JoinGameList } from './JoinGameList';
import { AuthUserContext } from '../Session';
import { GameCreator } from './GameCreator';

function GameListPageNonAuth() {
	return (
		<>
			<h3>Please <Link to={ROUTES.SIGN_IN}>sign in</Link> to create, join, or watch a game</h3>
			<JoinGameList />
		</>
	);
};
function GameListPageAuth() {
	return (
		<>
			<h1>Create a new game</h1>
			<GameCreator />
			<h1>Join a game</h1>
			<JoinGameList isSignedIn />
		</>
	);
};
function GameListPage() {
	return (
		<div id='game-list-page'>
			<AuthUserContext.Consumer>
				{authUser => authUser ? <GameListPageAuth /> : <GameListPageNonAuth />}
			</AuthUserContext.Consumer>
		</div>
	);
}

export { GameListPage };
