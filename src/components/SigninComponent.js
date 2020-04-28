import React from 'react';
import axios from 'axios';
import firebase from 'firebase';
// import 'firebase/auth';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import * as constants from '../Constants';

// Global ID for the element.
const ELEMENT_ID = 'firebaseui_container';

// Promise that resolves unless the FirebaseUI instance is currently being deleted.
let firebaseUiDeletion = Promise.resolve();

export default class SigninComponent extends React.Component {
	state = {
		isSignedIn: undefined,
		gotCookie: false
	};
	uiConfig = {
		signInFlow: 'popup',
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		],

		// TODO: ToS, Privacy Policy
		// tosUrl: '<your-tos-url>',
		// privacyPolicyUrl: function () {
		// 	window.location.assign('<your-privacy-policy-url>');
		// },

		callbacks: {
			// Avoid redirects after sign-in.
			// signInSuccessWithAuthResult: () => false
			signInSuccess: (user, credential, redirectUrl) => {
				// User successfully signed in.
			}
		}

		// Another option:
		// signInSuccessUrl: '/',
	};
	componentDidMount = () => {
		require('firebaseui/dist/firebaseui.css');
		const firebaseui = require('firebaseui');

		var uiConfig = {
			callbacks: {
				// signInSuccessWithAuthResult: () => false,
				signInSuccessWithAuthResult: function (authResult, redirectUrl) {
					// 	user.getIdToken()
					// 		.then(idToken => {
					// 			alert('getIdToken success');
					// 			window.location.href = constants.API_SESSION_LOGIN + '?idToken=' + idToken;
					// 		}).catch(error => {
					// 			alert('getIdToken error: ' + error);
					// 		});
					return false;
				},
				uiShown: function () {
					// The widget is rendered.
					// document.getElementById('loader').style.display = 'none';
				}
			},
			// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
			signInFlow: 'popup',
			// signInSuccessUrl: '<url-to-redirect-to-on-success>',
			signInOptions: [
				{
					provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
					requireDisplayName: true
				},
				{
					provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					requireDisplayName: true
				}
			]
			// tosUrl: '<your-tos-url>',
			// privacyPolicyUrl: '<your-privacy-policy-url>'
		};

		// return
		firebaseUiDeletion.then(() => {
			this.ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

			// if (uiConfig.signInFlow === 'popup')
			// this.ui.reset();

			// We track the auth state to reset firebaseUi if the user signs out.
			this.isSignedIn = false;
			this.setState({ isSignedIn: false });

			this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged((user) => {
				if (!user && this.isSignedIn)
					this.ui.reset();
				this.setState({ isSignedIn: !!user });
			});

			this.ui.start('#' + ELEMENT_ID, uiConfig);
		});
	};
	componentWillUnmount() {
		firebaseUiDeletion = firebaseUiDeletion.then(() => {
			this.unregisterFirebaseAuthObserver();
			return this.ui.delete();
		});
		return firebaseUiDeletion;
	}
	signOut = () => {
		// axios.get(constants.API_SIGN_OUT)
		// 	.then(() => {
		// 		alert('signOut success');
		// 		firebase.auth().signOut();
		// 	})
		// 	.catch(err => {
		// 		alert('signOut error: ' + err.message.toUpperCase());
		// 		return;
		// 	});
	};
	render = () => {
		return (
			<div>
				<h1>Lex chess</h1>
				{this.state.isSignedIn !== undefined && !this.state.isSignedIn &&
					<div>
						<p>Please sign-in:</p>
						{/* <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} /> */}
						<div id={ELEMENT_ID} />
					</div>
				}
				{this.state.isSignedIn &&
					<div>
						<p>Welcome! You are now signed-in!</p>
						<p>Received cookie? {this.state.gotCookie.toString()}</p>

						<p>currentUser=<pre>{JSON.stringify(firebase.auth().currentUser, null, 4)}</pre></p>
						<button onClick={() => this.signOut()}>Sign-out</button>
					</div>
				}
			</div>
		);
	};
}