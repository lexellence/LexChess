import React from 'react';
import { Link } from 'react-router-dom';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import * as ROUTES from "../constants/routes";

export default function Navigation() {
	return (
		<Navbar bg="dark" variant="dark">
			<Container>
				<Navbar.Brand>
					<Link to={ROUTES.HOME} className="nav-link">Lex Chess</Link>
				</Navbar.Brand>

				<Nav className="justify-content-end">
					<Nav>
						<Link to={ROUTES.PLAY} className="nav-link">Play</Link>
					</Nav>

					<Nav>
						<Link to={ROUTES.SIGN_IN} className="nav-link">Sign in</Link>
					</Nav>
				</Nav>
			</Container>
		</Navbar>
	);
};