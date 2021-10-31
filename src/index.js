import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./App";
import Firebase, { FirebaseContext } from './Firebase';
import { FirebaseListenerProvider } from './FirebaseListener';
import { APIProvider } from './API';

const firebase = new Firebase();

ReactDOM.render(
	<React.StrictMode>
		<FirebaseContext.Provider value={firebase}>
			<FirebaseListenerProvider>
				<APIProvider>
					<App />
				</APIProvider>
			</FirebaseListenerProvider>
		</FirebaseContext.Provider>
	</React.StrictMode>,
	document.getElementById("root")
);

serviceWorker.unregister();
