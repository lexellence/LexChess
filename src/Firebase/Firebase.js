import firebaseApp from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
// import * as ROLES from '../constants/roles';

const config = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID
};

class Firebase {
	constructor() {
		firebaseApp.initializeApp(config);

		// Helper for Messages
		this.serverValue = firebaseApp.database.ServerValue;

		// Firebase
		this.auth = firebaseApp.auth();
		this.db = firebaseApp.database();

		// Sign In Method Providers
		this.emailAuthProvider = firebaseApp.auth.EmailAuthProvider;
		this.googleProvider = new firebaseApp.auth.GoogleAuthProvider();
		this.facebookProvider = new firebaseApp.auth.FacebookAuthProvider();
		this.twitterProvider = new firebaseApp.auth.TwitterAuthProvider();

	}

	// *** Auth API ***

	doCreateUserWithEmailAndPassword = (email, password) =>
		this.auth.createUserWithEmailAndPassword(email, password);

	doSignInWithEmailAndPassword = (email, password) =>
		this.auth.signInWithEmailAndPassword(email, password);

	doSignInWithGoogle = () =>
		// this.auth.signInWithPopup(this.googleProvider);
		this.auth.signInWithRedirect(this.googleProvider);

	doSignInWithFacebook = () =>
		// this.auth.signInWithPopup(this.facebookProvider);
		this.auth.signInWithRedirect(this.facebookProvider);

	doSignInWithTwitter = () =>
		// this.auth.signInWithPopup(this.twitterProvider);
		this.auth.signInWithRedirect(this.twitterProvider);

	doSignOut = () => this.auth.signOut();

	doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email);

	doSendEmailVerification = () => {
		if (this.auth.currentUser)
			return this.auth.currentUser.sendEmailVerification({
				url: `https://${window.location.host}/game`
			});
	};

	doPasswordUpdate = (password) => {
		if (this.auth.currentUser)
			return this.auth.currentUser.updatePassword(password);
	};
	doDisplayNameUpdate = (displayName) => {
		if (this.auth.currentUser)
			return this.auth.currentUser.updateProfile({ displayName });
	};

	// *** Merge Auth and DB User API *** //
	onAuthUserListener = (onSignIn, onSignOut) =>
		this.auth.onAuthStateChanged(authUser => {
			if (!authUser) {
				onSignOut();
				return;
			}

			// get roles from db; 
			authUser.roles = {};
			this.userRef(authUser.uid).child('roles').once('value')
				.then(snapshot => {
					if (snapshot.exists())
						authUser.roles = snapshot.val();
					onSignIn(authUser);
					return;
				});
		});

	// *** User API ***
	userRef = uid => this.db.ref(`users/${uid}`);
	userListRef = () => this.db.ref('users');

	// *** Message API ***
	messageRef = uid => this.db.ref(`messages/${uid}`);
	messageListRef = () => this.db.ref('messages');
};

export { Firebase };