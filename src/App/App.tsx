import "./App.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Navigation from "./Navigation";
import RouteList from "./RouteList";

import { withAuthProvider } from "../Session";

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
							<div className='page-wrapper'>
								<RouteList />
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</BrowserRouter>
	)
}

export default withAuthProvider(App);