import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import * as constants from "./Constants";
import firebase from 'firebase';
firebase.initializeApp(constants.FIREBASE_CONFIG);

ReactDOM.render(
	<BrowserRouter>
		<App />
	</BrowserRouter>,
	document.getElementById("root")
);

serviceWorker.unregister();
