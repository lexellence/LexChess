import React from 'react';
import { AuthUserContext } from './Session';

const HomePageNonAuth = () => (
	<div align='center'>
		<h1>Welcome to Lex Chess!</h1>
		<p>Please sign in.</p>
	</div>
);

const HomePageAuth = ({ authUser }) => (
	<div align='center'>
		<h1>Welcome back, {authUser.displayName}!</h1>
	</div>
);

const HomePage = () => (
	<AuthUserContext.Consumer>
		{authUser =>
			authUser ? <HomePageAuth authUser={authUser} /> : <HomePageNonAuth />
		}
	</AuthUserContext.Consumer>
);

export default HomePage;
