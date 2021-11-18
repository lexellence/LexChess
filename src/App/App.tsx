import "./App.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Navigation } from "./Navigation";
import { RouteList } from "./RouteList";

function App() {
	return (
		<BrowserRouter>
			<div className="App unselectable">
				<header className="App-header">
					<Navigation />
				</header>

				<div className='page-wrapper'>
					<RouteList />
				</div>
			</div>
		</BrowserRouter>
	)
}

export { App };