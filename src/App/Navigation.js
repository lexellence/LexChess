import React from 'react';
import { Link } from 'react-router-dom';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import { AuthUserContext } from '../Session';
import { withFirebase } from '../Firebase';
import SignOutButton from './SignOutButton';
import * as ROUTES from "../constants/routes";
import * as ROLES from '../constants/roles';
import withFirebaseListener from '../FirebaseListener';

function NavigationNonAuth() {
	return (
		<Navbar bg="dark" variant="dark" className="unselectable">
			<Container>
				<Navbar.Brand>
					<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end">
					<Nav>
						<Link to={ROUTES.SIGN_IN} className="nav-link">Sign in</Link>
					</Nav>
				</Nav>
			</Container>
		</Navbar>
	);
}

class NavigationAuthBase extends React.Component {
	state = { userRoles: {}, userGIDs: {} };
	componentDidMount() {
		const onSignIn = (authUser) =>
			this.setState({ userRoles: authUser.roles });
		const onSignOut = () =>
			this.setState({ userRoles: {} });
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);

		const handleUserUpdate = (user) =>
			this.setState({ userGIDs: user?.gids ? user.gids : {} });
		// const onUserError = (errorMessage) => {
		// 	this.setState({ userGIDs: {} });
		// };
		// this.unregisterUserListener = this.props.firebaseListener.registerUserListener(onUserUpdate, onUserError);
		this.unregisterUserListener = this.props.firebaseListener.registerUserListener(handleUserUpdate);
	};
	componentWillUnmount = () => {
		this.unregisterUserListener();
		this.unregisterAuthListener();
	};
	render() {
		// Dynamic game bar
		const gameNavs = Object.keys(this.state.userGIDs).map((gid, i) => {
			// const to = {
			// 	pathname: ROUTES.PLAY,
			// 	search: '?gid=' + gid,
			// };
			const to = ROUTES.PLAY_BASE + '/' + gid;
			const title = `Play ${i}`;
			return (
				<Nav key={i}>
					<Link to={to} className="nav-link">{title}</Link>
				</Nav>
			);
		});
		return (
			<Navbar bg="dark" variant="dark" className="unselectable">
				<Container>
					<Navbar.Brand>
						<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
					</Navbar.Brand>
					<Nav className="justify-content-end">

						{/* Dynamic game bar */}
						{gameNavs}

						<Nav>
							<Link to={ROUTES.GAME_LIST} className="nav-link">Game List</Link>
						</Nav>
						<Nav>
							<Link to={ROUTES.ACCOUNT} className="nav-link">Account</Link>
						</Nav>
						{!!this.state.userRoles[ROLES.ADMIN] && <Nav>
							<Link to={ROUTES.ADMIN} className="nav-link">Admin</Link>
						</Nav>}
						<Nav>
							<SignOutButton />
						</Nav>
					</Nav>
				</Container>
			</Navbar>
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

export default Navigation;