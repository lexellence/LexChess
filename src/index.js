import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./App";
import Firebase, { FirebaseContext } from './Firebase';
import { AuthUserProvider } from './Session';
import { FirebaseListenerProvider } from './FirebaseListener';
import { APIProvider } from './API';
import GameHistoryPageProvider from './GameHistoryPage/GameHistoryPageProvider';

const firebase = new Firebase();

ReactDOM.render(
	<React.StrictMode>
		<FirebaseContext.Provider value={firebase}>
			<AuthUserProvider>
				<FirebaseListenerProvider>
					<APIProvider>
						<GameHistoryPageProvider>
							<App />
						</GameHistoryPageProvider>
					</APIProvider>
				</FirebaseListenerProvider>
			</AuthUserProvider>
		</FirebaseContext.Provider>
	</React.StrictMode>,
	document.getElementById("root")
);

serviceWorker.unregister();
