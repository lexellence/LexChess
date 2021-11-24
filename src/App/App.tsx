import "./App.scss";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Navigation } from "./Navigation";
import { RouteList } from "./RouteList";

function App() {
	return (
		<BrowserRouter>
			<div id='app' className='unselectable'>
				<header>
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