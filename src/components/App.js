import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.css";
import "../styles/App.css";

import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

import Home from "./Home";
import Play from "./Play";
import Signin from "./Signin";

import * as ROUTES from "../constants/routes";

export default class App extends React.Component {
	render = () => {
		return (
			<BrowserRouter>
				<div className="App">
					<header className="App-header">
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
					</header>

					<Container>
						<Row>
							<Col md={12}>
								<div className="wrapper">
									<Switch>
										<Route exact path={ROUTES.LANDING} component={Home} />
										<Route exact path={ROUTES.HOME} component={Home} />
										<Route path={ROUTES.PLAY} component={Play} />
										<Route path={ROUTES.SIGN_IN} component={Signin} />
									</Switch>
								</div>
							</Col>
						</Row>
					</Container>
				</div>
			</BrowserRouter>
		);
	};
};
