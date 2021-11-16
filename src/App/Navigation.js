import './Navigation.css';
import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Nav, Navbar, Container } from "react-bootstrap";
import { MdFiberNew } from 'react-icons/md';
import { FaChessPawn } from 'react-icons/fa';
import { iconSize, iconSize2 } from '../iconSizes';

import { AuthUserContext } from '../Session';
import { withFirebase } from '../Firebase';
import { SignOutButton } from './SignOutButton';
import * as ROUTES from '../constants/routes';
import * as ROLES from '../constants/roles';
import { withFirebaseListener } from '../FirebaseListener';

const navLinkClass = 'nav-link nav-menu-link';

function NavigationNonAuth() {
	return (
		<Navbar bg="dark" variant="dark" className="unselectable">
			<Container>
				<Navbar.Brand>
					<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end nav-menu">
					<Nav>
						<NavLink to={ROUTES.GAME_LIST} activeClassName="active-nav-link" className={navLinkClass}>Game List</NavLink>
					</Nav>
					<Nav>
						<NavLink to={ROUTES.SIGN_IN} activeClassName="active-nav-link" className={navLinkClass}>Sign in</NavLink>
					</Nav>
				</Nav>
			</Container>
		</Navbar>
	);
}

class NavigationAuthBase extends React.Component {
	state = {
		userRoles: {},
		hasPlay: false,
		allGamesVisited: true,
		myTurn: false,
	};
	componentDidMount() {
		const onSignIn = (authUser) =>
			this.setState({ userRoles: authUser.roles });
		const onSignOut = () =>
			this.setState({ userRoles: {} });
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);

		const handleUserUpdate = (user) => {
			const playValues = Object.values(user.play);

			const hasPlay = playValues.length > 0;
			const allGamesVisited = playValues.every(userGame => userGame.visited);
			const myTurn = !playValues.every(userGame => !userGame.myTurn);

			if (hasPlay !== this.state.hasPlay ||
				allGamesVisited !== this.state.allGamesVisited ||
				myTurn !== this.state.myTurn)
				this.setState({ hasPlay, allGamesVisited, myTurn });
		};
		this.unregisterUserListener = this.props.firebaseListener.registerUserListener(handleUserUpdate);
	};
	componentWillUnmount = () => {
		this.unregisterUserListener();
		this.unregisterAuthListener();
	};
	render() {
		return (
			<Navbar bg="dark" variant="dark" className="unselectable" >
				<Container>
					<Navbar.Brand>
						<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
					</Navbar.Brand>
					<Nav className="justify-content-end nav-menu">
						{this.state.hasPlay &&
							<Nav>
								<NavLink to={ROUTES.PLAY} activeClassName="active-nav-link" className={navLinkClass}>
									My Games
									{!this.state.allGamesVisited && <MdFiberNew className='attention' size={iconSize} />}
									{this.state.myTurn && <FaChessPawn className='myTurn' size={iconSize2} />}
								</NavLink>
							</Nav>
						}
						<Nav>
							<NavLink to={ROUTES.GAME_LIST} activeClassName="active-nav-link" className={navLinkClass}>New Game</NavLink>
						</Nav>
						<Nav>
							<NavLink to={ROUTES.GAME_HISTORY} activeClassName="active-nav-link" className={navLinkClass}>Records</NavLink>
						</Nav>
						<Nav>
							<NavLink to={ROUTES.ACCOUNT} activeClassName="active-nav-link" className={navLinkClass}>Account</NavLink>
						</Nav>
						{!!this.state.userRoles[ROLES.ADMIN] && <Nav>
							<NavLink to={ROUTES.ADMIN} activeClassName="active-nav-link" className={navLinkClass}>Admin</NavLink>
						</Nav>}
						<Nav>
							<SignOutButton />
						</Nav>
					</Nav>
				</Container >
			</Navbar >
		);
	}
}
const NavigationAuth =
	withFirebaseListener(
		withFirebase(
			NavigationAuthBase));

function Navigation() {
	return (
		<AuthUserContext.Consumer>
			{authUser =>
				authUser ? <NavigationAuth /> : <NavigationNonAuth />
			}
		</AuthUserContext.Consumer>
	);
}

export { Navigation };