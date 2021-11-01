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

function NavigationNonAuth() {
	return (
		<Navbar bg="dark" variant="dark" className="unselectable">
			<Container>
				<Navbar.Brand>
					<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end nav-menu">
					<Nav>
						<NavLink to={ROUTES.SIGN_IN} activeClassName="active-nav-link" className="nav-link nav-menu-link">Sign in</NavLink>
					</Nav>
				</Nav>
			</Container>
		</Navbar>
	);
}

class NavigationAuthBase extends React.Component {
	state = { userRoles: {}, userGIDs: [] };
	componentDidMount() {
		const onSignIn = (authUser) =>
			this.setState({ userRoles: authUser.roles });
		const onSignOut = () =>
			this.setState({ userRoles: {} });
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);

		const handleUserUpdate = (user) =>
			this.setState({ userGIDs: user.gids });
		this.unregisterUserListener = this.props.firebaseListener.registerUserListener(handleUserUpdate);
	};
	componentWillUnmount = () => {
		this.unregisterUserListener();
		this.unregisterAuthListener();
	};
	render() {
		const dynamicGameLinks = this.state.userGIDs.map((gid, i) => {
			const to = ROUTES.PLAY_BASE + '/' + gid;
			const title = `Play ${i}`;
			return (
				<Nav key={i}>
					<NavLink to={to} activeClassName="active-nav-link" className="nav-link nav-menu-link">{title}</NavLink>
				</Nav>
			);
		});
		return (
			<Navbar bg="dark" variant="dark" className="unselectable" >
				<Container>
					<Navbar.Brand>
						<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
					</Navbar.Brand>
					<Nav className="justify-content-end nav-menu">
						{dynamicGameLinks}
						<Nav>
							<NavLink to={ROUTES.GAME_LIST} activeClassName="active-nav-link" className="nav-link nav-menu-link">New Game</NavLink>
						</Nav>
						<Nav>
							<NavLink to={ROUTES.ACCOUNT} activeClassName="active-nav-link" className="nav-link nav-menu-link">Account</NavLink>
						</Nav>
						{!!this.state.userRoles[ROLES.ADMIN] && <Nav>
							<NavLink to={ROUTES.ADMIN} activeClassName="active-nav-link" className="nav-link nav-menu-link">Admin</NavLink>
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