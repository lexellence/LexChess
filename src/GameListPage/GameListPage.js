import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from "../constants/routes";
import GameList from '../GameList';
import { AuthUserContext } from '../Session';
import GameCreator from './GameCreator';

function GameListPageNonAuth() {
	return (
		<div align='center' style={{ display: 'block' }}>
			<h3>Please <Link to={ROUTES.SIGN_IN}>sign in</Link> to create, join, or watch a game</h3>
			<GameList />
		</div>
	);
};
function GameListPageAuth() {
	return (
		<div align='center' style={{ display: 'block' }}>
			<h1>Create a new game</h1>
			<GameCreator />
			<h1>Join a game</h1>
			<GameList isSignedIn />
		</div>
	);
};
function GameListPage() {
	return (
		<AuthUserContext.Consumer>
			{authUser => authUser ? <GameListPageAuth /> : <GameListPageNonAuth />}
		</AuthUserContext.Consumer>
	);
}

export default GameListPage;
