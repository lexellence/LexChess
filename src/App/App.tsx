import "./App.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Navigation from "./Navigation";
import RouteList from "./RouteList";

import { withAuthProvider } from "../Session";
import { withFirebaseListenerProvider } from "../FirebaseListener";

function App() {
	return (
		<BrowserRouter>
			<div className="App unselectable">
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
		</BrowserRouter>
	)
}

export default withFirebaseListenerProvider(withAuthProvider(App));