import React from "react";
import ReactDOM from "react-dom";

import "./styles/index.css";
import * as serviceWorker from "./serviceWorker";

import App from "./components/App";

import firebase from 'firebase';
// need ?
// require("firebase/auth");

const FIREBASE_CONFIG = {
	apiKey: "AIzaSyB8hSrh3MzpM_VxuKLDvrwGnDkpSJHBaUU",
	authDomain: "chessfighter-b3ba9.firebaseapp.com",
	databaseURL: "https://chessfighter-b3ba9.firebaseio.com",
	projectId: "chessfighter-b3ba9",
	storageBucket: "chessfighter-b3ba9.appspot.com",
	messagingSenderId: "571875242130",
	appId: "1:571875242130:web:96b940de11853db0a6364b"
};

firebase.initializeApp(FIREBASE_CONFIG);

// As httpOnly cookies are to be used, do not persist any state client side.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.unregister();
