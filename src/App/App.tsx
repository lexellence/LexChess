import "./App.scss";
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

				<main>
					<RouteList />
				</main>
			</div>
		</BrowserRouter>
	)
}

export { App };