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

function NavigationNonAuth() {
	return (
		<Navbar bg="dark" variant="dark">
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
	state = { userRoles: {} };
	componentDidMount() {
		const onSignIn = authUser => this.setState({ userRoles: authUser.roles });
		const onSignOut = () => this.setState({ userRoles: {} });
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	};
	componentWillUnmount = () => this.unregisterAuthListener();
	render() {
		return (
			<Navbar bg="dark" variant="dark">
				<Container>
					<Navbar.Brand>
						<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
					</Navbar.Brand>
					<Nav className="justify-content-end">
						<Nav>
							<Link to={ROUTES.GAME} className="nav-link">Play</Link>
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
	withFirebase(
		NavigationAuthBase);

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