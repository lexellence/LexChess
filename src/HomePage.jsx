import * as React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from "./constants/routes";
import { AuthUserContext } from './Session';

const HomePageNonAuth = () => (
	<>
		<h5>To start playing LexChess, please <Link to={ROUTES.SIGN_IN}>sign in</Link>, or <Link to={ROUTES.SIGN_UP}>create an account</Link>.</h5>
	</>
);

const HomePageAuth = ({ authUser }) => (
	<>
		<h1>Welcome back, {authUser.displayName}!</h1>
		<h5>Start a <Link to={ROUTES.GAME_LIST}>new game</Link>.</h5>
	</>
);

const HomePage = () => (
	<div className='home-page'>
		<h1>Welcome to LexChess!</h1>
		<ul className='home-desc'>
			<li>LexChess is a fully functioning, realtime, multiplayer chess app.</li>
			<li>You can play up to 5 games at a time.</li>
			<li>Switching between games (or any other page) is immediately responsive, without the need to reconnect to the server. This is the magic of building web apps with React.</li>
			<li>By subscribing to game updates using Firebase Realtime Database and keeping track of them with React Context, you receive updates for all your games automatically in the background, no matter what part of the site you are looking at.</li>
		</ul>

		<div className='mt-3'>
			<AuthUserContext.Consumer>
				{authUser =>
					authUser ? <HomePageAuth authUser={authUser} /> : <HomePageNonAuth />
				}
			</AuthUserContext.Consumer>
		</div>
		<pre className="mt-3"><p>Impressed? <a href='https://davidleksen.com' target='blank'>Hire me</a></p></pre>
	</div>
);

export { HomePage };
