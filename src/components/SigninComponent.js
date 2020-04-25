import React from 'react';
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export default class SigninComponent extends React.Component {
	state = {
		isSignedIn: false
	};
	uiConfig = {
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
	componentDidMount() {
		this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged(
			(user) => this.setState({ isSignedIn: !!user })
		);
	}
	componentWillUnmount() {
		this.unregisterFirebaseAuthObserver();
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
				<p>Welcome! You are now signed-in!</p>
				<p>currentUser=<pre>{JSON.stringify(firebase.auth().currentUser, null, 4)}</pre></p>
				<button onClick={() => firebase.auth().signOut()}>Sign-out</button>
			</div>
		);
	}
}