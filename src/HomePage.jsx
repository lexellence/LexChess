import * as React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from "./constants/routes";
import { AuthUserContext } from './Session';

const HomePageNonAuth = () => (
	<div align='center'>
		<h1>Welcome to Lex Chess!</h1>
		<h5>Please <Link to={ROUTES.SIGN_IN}>sign in</Link>.</h5>
	</div>
);

const HomePageAuth = ({ authUser }) => (
	<div align='center'>
		<h1>Welcome back, {authUser.displayName}!</h1>
		<h5>Start a <Link to={ROUTES.GAME_LIST}>new game</Link>.</h5>
	</div>
);

const HomePage = () => (
	<AuthUserContext.Consumer>
		{authUser =>
			authUser ? <HomePageAuth authUser={authUser} /> : <HomePageNonAuth />
		}
	</AuthUserContext.Consumer>
);

export { HomePage };
