import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { withAuthentication } from "../Session"

import Navigation from "./Navigation";
import RouteList from "./RouteList";

function App() {
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
								<RouteList />
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</Router>
	)
}

export default withAuthentication(App);