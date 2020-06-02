import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

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
		app.initializeApp(config);

		// Helper for Messages
		// this.serverValue = app.database.ServerValue;

		// Firebase
		this.auth = app.auth();
		// this.db = app.database();

		// Sign In Method Providers
		this.emailAuthProvider = app.auth.EmailAuthProvider;
		this.googleProvider = new app.auth.GoogleAuthProvider();
		this.facebookProvider = new app.auth.FacebookAuthProvider();
		this.twitterProvider = new app.auth.TwitterAuthProvider();

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

	doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

	doSendEmailVerification = () => {
		if (this.auth.currentUser)
			return this.auth.currentUser.sendEmailVerification({
				url: `https://${window.location.host}/game`
			});
	};

	doPasswordUpdate = password => {
		if (this.auth.currentUser)
			return this.auth.currentUser.updatePassword(password);
	};
	doDisplayNameUpdate = displayName => {
		if (this.auth.currentUser)
			return this.auth.currentUser.updateProfile({ displayName });
	};

	// *** Merge Auth and DB User API *** //
	onAuthUserListener = (next, fallback) =>
		this.auth.onAuthStateChanged(authUser => {
			// Fallback if no auth
			if (!authUser) {
				fallback();
				return;
			}
			// replace with code to get roles from db
			authUser.roles = {};
			next(authUser);
		});

	// *** User API ***
	userRef = uid => this.db.ref(`users/${uid}`);
	userListRef = () => this.db.ref('users');

	// *** Message API ***
	messageRef = uid => this.db.ref(`messages/${uid}`);
	messageListRef = () => this.db.ref('messages');
};

export default Firebase;