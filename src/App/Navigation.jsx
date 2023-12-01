import './Navigation.css';
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Nav, Navbar, Container } from "react-bootstrap";
import { MdFiberNew } from 'react-icons/md';
import { FaChessPawn } from 'react-icons/fa';
import { iconSize, iconSize2 } from '../iconSizes';

import { AuthUserContext } from '../Session';
import { useFirebaseContext } from '../Firebase';
import { SignOutButton } from './SignOutButton';
import * as ROUTES from '../constants/routes';
import * as ROLES from '../constants/roles';
import { useFirebaseListenerContext } from '../FirebaseListener';

const navLinkClass = 'nav-link nav-menu-link text-nowrap';
function getNavLinkStyle({ isActive }) {
	return isActive ? { borderBottom: '3px solid #a2ff9a' } : null;
}

function NavigationNonAuth() {
	return (
		<Navbar bg="dark" variant="dark" className="unselectable">
			<Container>
				<Navbar.Brand>
					<Link to={ROUTES.LANDING} className="nav-link">LexChess</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end nav-menu">
					<Nav>
						<NavLink to={ROUTES.SIGN_UP} style={getNavLinkStyle} className={navLinkClass}>Create Account</NavLink>
					</Nav>
					<Nav>
						<NavLink to={ROUTES.SIGN_IN} style={getNavLinkStyle} className={navLinkClass}>Sign in</NavLink>
					</Nav>
				</Nav>
			</Container>
		</Navbar>
	);
}

function NavigationAuth() {
	// Register auth listener
	const firebase = useFirebaseContext();
	const [userRoles, setUserRoles] = useState({});
	useEffect(() => {
		const onSignIn = (authUser) =>
			setUserRoles(authUser.roles);
		const onSignOut = () =>
			setUserRoles({});
		return firebase.onAuthUserListener(onSignIn, onSignOut);
	}, [firebase]);

	// Register user listener
	const firebaseListener = useFirebaseListenerContext();
	const [userGameList, setUserGameList] = useState([]);
	useEffect(() => {
		const handleUserUpdate = (user) => {
			setUserGameList(
				Object.entries(user.play).map(
					([gid, userGame]) => (
						{
							gid: gid,
							myTurn: userGame.myTurn,
							visited: userGame.visited
						})
				)
			);
		};
		return firebaseListener.registerUserListener(handleUserUpdate);
	}, [firebaseListener]);

	return (
		<Navbar bg="dark" variant="dark" className="unselectable" style={{ minHeight: "72px", maxHeight: "72px" }}>
			<Container>
				<Navbar.Brand>
					<Link to={ROUTES.LANDING} className="nav-link">Lex Chess</Link>
				</Navbar.Brand>
				<Nav className="justify-content-end nav-menu">
					{userGameList.length > 0 &&
						userGameList.map((userGame, i) =>
							<Nav key={i + 1}>
								<NavLink to={ROUTES.PLAY + `?game=${i}`} style={getNavLinkStyle} className={navLinkClass}>
									Play {i + 1}
									{!userGame.visited && <MdFiberNew className='attention' size={iconSize} />}
									{userGame.myTurn && <FaChessPawn className='myTurn' size={iconSize2} />}
								</NavLink>
							</Nav>
						)
					}
					<Nav>
						<NavLink to={ROUTES.GAME_LIST} style={getNavLinkStyle} className={navLinkClass}>Start</NavLink>
					</Nav>
					<Nav>
						<NavLink to={ROUTES.GAME_HISTORY} style={getNavLinkStyle} className={navLinkClass}>Records</NavLink>
					</Nav>
					<Nav>
						<NavLink to={ROUTES.ACCOUNT} style={getNavLinkStyle} className={navLinkClass}>Account</NavLink>
					</Nav>
					{!!userRoles[ROLES.ADMIN] && <Nav>
						<NavLink to={ROUTES.ADMIN} style={getNavLinkStyle} className={navLinkClass}>Admin</NavLink>
					</Nav>}
					<Nav>
						<SignOutButton />
					</Nav>
				</Nav>
			</Container >
		</Navbar >
	);
}

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