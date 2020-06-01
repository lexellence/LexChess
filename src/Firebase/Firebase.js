import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import to from 'await-to-js';

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
		this.serverValue = app.database.ServerValue;

		// Firebase
		this.auth = app.auth();
		this.auth.setPersistence(app.auth.Auth.Persistence.LOCAL);
		this.db = app.database();

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
		this.auth.signInWithPopup(this.googleProvider);

	doSignInWithFacebook = () =>
		this.auth.signInWithPopup(this.facebookProvider);

	doSignInWithTwitter = () =>
		this.auth.signInWithPopup(this.twitterProvider);

	doSignOut = () => this.auth.signOut();

	doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

	doSendEmailVerification = () =>
		this.auth.currentUser.sendEmailVerification({
			url: `https://${window.location.host}/game`
		});

	doPasswordUpdate = password =>
		this.auth.currentUser.updatePassword(password);
	doDisplayNameUpdate = displayName => {
		var updates = {};
		updates['displayName'] = displayName;
		this.userRef(this.authUser.uid).update(updates);
	};

	// *** Merge Auth and DB User API *** //
	onAuthUserListener = (next, fallback) =>
		this.auth.onAuthStateChanged(async authUser => {
			// Fallback if no auth
			if (!authUser) {
				fallback();
				return;
			}

			// Get id token to send with api requests
			let idToken, snapshot, err;
			[err, idToken] = await to(authUser.getIdToken());
			if (err) {
				alert('Error getting user token from firebase');
				this.doSignOut();
			};

			[err, snapshot] = await to(this.userRef(authUser.uid).once('value'));
			let dbUser = err ? {} : snapshot.val();

			// default empty roles
			if (!dbUser.roles) {
				dbUser.roles = {};
			}

			// merge auth, db user, and token
			authUser = {
				uid: authUser.uid,
				email: authUser.email,
				emailVerified: authUser.emailVerified,
				providerData: authUser.providerData,
				...dbUser,
				idToken: idToken,
			};

			next(authUser);
		});

	// *** User API ***
	userRef = uid => this.db.ref(`users/${uid}`);
	userListRef = () => this.db.ref('users');

	// *** Message API ***
	messageRef = uid => this.db.ref(`messages/${uid}`);
	messageListRef = () => this.db.ref('messages');
}

export default Firebase;