import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.css";
import "../styles/App.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Navigation from "./Navigation";
import Home from "./Home";
import Play from "./Play";
import Signin from "./Signin";

import * as ROUTES from "../constants/routes";

export default function App() {
	return (
		<Router>
			<div className="App">
				<header className="App-header">
					<Navigation />
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
		</Router>
	);
};
