import { Link } from 'react-router-dom';
import * as ROUTES from "./constants/routes";
import { AuthUserContext } from './Session';

const HomePageDescription = () => (
	<div className='home-desc'>
		<p>LexChess is a fully functioning, realtime, multiplayer chess app.</p>
		<p>You can play up to 5 games at a time.</p>
		<p>Switching between games (or any other page) is immediately responsive,
			without the need to reconnect to the server.
			This is the magic of building web apps with React.</p>
		<p>By subscribing to game updates using Firebase Realtime Database and keeping track of them with React Context,
			you receive updates for all your games automatically in the background,
			no matter what part of the site you are looking at.</p>
		<p>You can also graphically replay all the moves from your previous games,
			or download your game histories in PGN (Portable Game Notation) format.</p>
	</div>
);
const HomePageNonAuth = () => (
	<>
		<h1>Welcome to LexChess!</h1>
		<HomePageDescription />
		<h5>To start playing LexChess, please <Link to={ROUTES.SIGN_IN}>sign in</Link>, or <Link to={ROUTES.SIGN_UP}>create an account</Link>.</h5>
	</>
);

const HomePageAuth = ({ authUser }) => (
	<>
		<h1>Welcome back to LexChess, {authUser.displayName}!</h1>
		<HomePageDescription />
		<h5>Start a <Link to={ROUTES.GAME_LIST}>new game</Link>, or continue a game from the navigation bar at the top.</h5>
	</>
);

const HomePage = () => (
	<div id='home-page'>
		<div>
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
