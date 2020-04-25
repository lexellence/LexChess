import React from 'react';
// import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';

import * as constants from '../Constants';
firebase.initializeApp(constants.FIREBASE_CONFIG);

export default class SigninComponent extends React.Component {

	// The component's Local state.
	state = {
		isSignedIn: false // Local signed-in state.
	};

	// Configure FirebaseUI.
	uiConfig = {
		// Popup signin flow rather than redirect flow.
		signInFlow: 'popup',
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		],
		callbacks: {
			// Avoid redirects after sign-in.
			signInSuccessWithAuthResult: () => false
		}
	};

	// Listen to the Firebase Auth state and set the local state.
	componentDidMount() {
		this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
			(user) => this.setState({ isSignedIn: !!user })
		);
	}

	// Make sure we un-register Firebase observers when the component unmounts.
	componentWillUnmount() {
		this.unregisterAuthObserver();
	}

	render() {
		if (!this.state.isSignedIn) {
			return (
				<div>
					<h1>Lex chess</h1>
					<p>Please sign-in:</p>
					<StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
				</div>
			);
		}
		return (
			<div>
				<h1>My App</h1>
				<p>Welcome {firebase.auth().currentUser.displayName}! You are now signed-in!</p>
				<button onClick={() => firebase.auth().signOut()}>Sign-out</button>
			</div>
		);
	}
}