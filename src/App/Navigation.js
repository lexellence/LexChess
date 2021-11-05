import './Navigation.css';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Nav, Navbar, Container } from "react-bootstrap";

import { AuthUserContext } from '../Session';
import { withFirebase } from '../Firebase';
import SignOutButton from './SignOutButton';
import * as ROUTES from "../constants/routes";
import * as ROLES from '../constants/roles';
import { withFirebaseListener } from '../FirebaseListener';

const navLinkClass = 'nav-link nav-menu-link';
const attentionNavLinkClass = 'nav-link nav-menu-link-attention';

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
		newPlayGame: false,
	};
	componentDidMount() {
		const onSignIn = (authUser) =>
			this.setState({ userRoles: authUser.roles });
		const onSignOut = () =>
			this.setState({ userRoles: {} });
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);

		const handleUserUpdate = (user) => {
			// Is there an unvisited game in the play tab?
			const playValues = Object.values(user.play);
			const newPlayGame = playValues.find(userGame => !userGame.visited) ? true : false;
			if (newPlayGame !== this.state.newPlayGame)
				this.setState({ newPlayGame });

			// Is the user playing any games?
			const hasPlay = playValues.length > 0;
			if (hasPlay !== this.state.hasPlay)
				this.setState({ hasPlay });
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
								<NavLink to={ROUTES.PLAY} activeClassName="active-nav-link"
									className={this.state.newPlayGame ? attentionNavLinkClass : navLinkClass}>
									My Games
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

export default Navigation;;