import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// import * as firebase from "firebase/app";
// import "firebase/auth";
// import {
// 	FirebaseAuthProvider,
// 	FirebaseAuthConsumer,
// 	IfFirebaseAuthed,
// 	IfFirebaseAuthedAnd
// } from "@react-firebase/auth";

// const firebaseConfig = {
// 	apiKey: "AIzaSyB8hSrh3MzpM_VxuKLDvrwGnDkpSJHBaUU",
// 	authDomain: "chessfighter-b3ba9.firebaseapp.com",
// 	databaseURL: "https://chessfighter-b3ba9.firebaseio.com",
// 	projectId: "chessfighter-b3ba9",
// 	storageBucket: "chessfighter-b3ba9.appspot.com",
// 	messagingSenderId: "571875242130",
// 	appId: "1:571875242130:web:96b940de11853db0a6364b"
// };

ReactDOM.render(
	// <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
	<BrowserRouter>
		<App />
	</BrowserRouter>,
	// </FirebaseAuthProvider>,
	document.getElementById("root")
);

// export const App = () => {
// 	return (
// 		<FirebaseAuthProvider {...firebaseConfig} firebase={firebase}>
// 			<div>
// 				<button
// 					onClick={() => {
// 						const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
// 						firebase.auth().signInWithPopup(googleAuthProvider);
// 					}}
// 				>
// 					Sign In with Google
//         </button>
// 				<button
// 					data-testid="signin-anon"
// 					onClick={() => {
// 						firebase.auth().signInAnonymously();
// 					}}
// 				>
// 					Sign In Anonymously
//         </button>
// 				<button
// 					onClick={() => {
// 						firebase.auth().signOut();
// 					}}
// 				>
// 					Sign Out
//         </button>
// 				<FirebaseAuthConsumer>
// 					{({ isSignedIn, user, providerId }) => {
// 						return (
// 							<pre style={{ height: 300, overflow: "auto" }}>
// 								{JSON.stringify({ isSignedIn, user, providerId }, null, 2)}
// 							</pre>
// 						);
// 					}}
// 				</FirebaseAuthConsumer>
// 				<div>
// 					<IfFirebaseAuthed>
// 						{() => {
// 							return <div>You are authenticated</div>;
// 						}}
// 					</IfFirebaseAuthed>
// 					<IfFirebaseAuthedAnd
// 						filter={({ providerId }) => providerId !== "anonymous"}
// 					>
// 						{({ providerId }) => {
// 							return <div>You are authenticated with {providerId}</div>;
// 						}}
// 					</IfFirebaseAuthedAnd>
// 				</div>
// 			</div>
// 		</FirebaseAuthProvider>
// 	);
// };
// ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.unregister();
