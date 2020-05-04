import React from 'react';
import axios from 'axios';
import firebase from 'firebase';
import 'firebase/auth';

import * as constants from '../Constants';

// Global ID for the element.
const ELEMENT_ID = 'firebaseui_container';

// Promise that resolves unless the FirebaseUI instance is currently being deleted.
let firebaseUiDeletion = Promise.resolve();

export default class SigninComponent extends React.Component {
	state = {
		isSignedIn: undefined,
		idToken: '',
		uid: '',
		displayName: '',
		email: ''
	};

	componentDidMount = () => {
		require('firebaseui/dist/firebaseui.css');
		const firebaseui = require('firebaseui');
		var uiConfig = {
			callbacks: {
				signInSuccess: (user, credential, redirectUrl) => {
					return false;
				},
				// signInSuccessWithAuthResult: (authResult, redirectUrl) => {
				// 	return false;
				// },
				// uiShown: function () {
				// }
			},
			signInFlow: 'popup',
			// signInSuccessUrl: '<url-to-redirect-to-on-success>',
			signInOptions: [
				{ provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, requireDisplayName: false }
				// { provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID, requireDisplayName: false }
			]
			// tosUrl: '<your-tos-url>',
			// privacyPolicyUrl: '<your-privacy-policy-url>'
		};


		return firebaseUiDeletion.then(() => {
			this.ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

			// if (this.uiConfig.signInFlow === 'popup')
			// 	this.ui.reset();

			this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged((user) => {
				if (!user) {
					if (this.state.isSignedIn) {
						this.ui.reset();
						this.setState({ isSignedIn: false, idToken: '' });
						window.location.reload(false);
					}
					return;
				}
				user.getIdToken()
					.then(idToken => {
						this.setState({
							isSignedIn: true,
							idToken: idToken,
							uid: user.uid,
							displayName: user.displayName,
							email: user.email
						});

					})
					.catch(err => {
						this.setState({ isSignedIn: false, idToken: '' });
						alert('error getting user id token from firebase');
						firebase.auth().signOut();
					});
			});

			this.ui.start('#' + ELEMENT_ID, uiConfig);
		});
	};

	componentWillUnmount() {
		firebaseUiDeletion = firebaseUiDeletion.then(() => {
			this.unregisterFirebaseAuthObserver();
			// alert('ui.delete');
			return this.ui.delete();
		});
		return firebaseUiDeletion;
	}
	signOut = () => {
		firebase.auth().signOut();
		//.then(() => this.setState({}));

		// axios.get(constants.API_SESSION_SIGN_OUT)
		// 	.then(res => {
		// 		firebase.auth().signOut();
		// 		// window.location.reload(false);
		// 		alert('signOut success: ' + JSON.stringify(res.data));
		// 	})
		// 	.catch(err => {
		// 		alert('signOut error: ' + err.message.toUpperCase());
		// 	});
	};
	render = () => {
		return (
			<div>
				{(!this.state.isSignedIn) &&
					<div id='signin'>
						<p>Please sign-in:</p>
						<div id={ELEMENT_ID} />
					</div>
				}
				{this.state.isSignedIn &&
					<div>
						<p>Welcome! You are now signed-in!</p>
						{/* <p>Received cookie? {this.state.gotCookie.toString()}</p> */}

						{/* <p>currentUser=<pre>{JSON.stringify(firebase.auth().currentUser, null, 4)}</pre></p> */}
						<p>uid = {this.state.uid}</p>
						<p>display name = {this.state.displayName}</p>
						<p>email = {this.state.email}</p>
						<p>id token = {this.state.idToken}</p>
						<button onClick={() => this.signOut()}>Sign-out</button>
					</div>
				}
			</div>

		);
	};
};