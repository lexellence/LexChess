import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

import PlayComponent from "./components/PlayComponent";
import SigninComponent from "./components/SigninComponent";

import * as constants from "./Constants";

export default class App extends React.Component {
	render = () => {
		return (
			<BrowserRouter>
				<div className="App">
					<header className="App-header">
						<Navbar bg="dark" variant="dark">
							<Container>
								<Navbar.Brand>
									<Link to={constants.ROUTE_PLAY} className="nav-link">
										Lex Chess
                </Link>
								</Navbar.Brand>

								<Nav className="justify-content-end">
									<Nav>
										<Link to={constants.ROUTE_PLAY} className="nav-link">
											Play
                  </Link>
									</Nav>

									<Nav>
										<Link to={constants.ROUTE_SIGN_IN} className="nav-link">
											Sign in
                  </Link>
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
										<Route exact path="/" component={PlayComponent} />
										<Route
											path={constants.ROUTE_PLAY}
											component={PlayComponent}
										/>
										<Route
											path={constants.ROUTE_SIGN_IN}
											component={SigninComponent}
										/>
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
