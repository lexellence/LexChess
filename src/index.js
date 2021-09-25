import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./App";
import Firebase, { FirebaseContext } from './Firebase';

const firebase = new Firebase();
ReactDOM.render(
	<React.StrictMode>
		<FirebaseContext.Provider value={firebase}>
			<App />
		</FirebaseContext.Provider>
	</React.StrictMode>,
	document.getElementById("root")
);

serviceWorker.unregister();
