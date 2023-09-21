// import firebaseApp from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/database';


import { initializeApp } from 'firebase/app';
import {
	getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
	signInWithRedirect, EmailAuthProvider, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider,
	sendPasswordResetEmail, sendEmailVerification, updatePassword, updateProfile, updateEmail, onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, get, child } from "firebase/database";
import * as ROUTES from '../constants/routes';

// import * as ROLES from '../constants/roles';

const config = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

class Firebase {
	constructor() {
		this.app = initializeApp(config);

		// Firebase
		this.auth = getAuth(this.app);
		this.db = getDatabase(this.app);

		// Sign In Method Providers
		this.emailAuthProvider = new EmailAuthProvider;
		this.googleProvider = new GoogleAuthProvider();
		this.facebookProvider = new FacebookAuthProvider();
		this.twitterProvider = new TwitterAuthProvider();

	}

	// *** Auth API ***

	doCreateUserWithEmailAndPassword = (email, password) => createUserWithEmailAndPassword(this.auth, email, password);

	doSignInWithEmailAndPassword = (email, password) => signInWithEmailAndPassword(this.auth, email, password);

	doSignInWithGoogle = () => signInWithRedirect(this.auth, this.googleProvider);
	doSignInWithFacebook = () => signInWithRedirect(this.auth, this.facebookProvider);
	doSignInWithTwitter = () => signInWithRedirect(this.auth, this.twitterProvider);

	doSignOut = () => signOut(this.auth);

	doPasswordReset = (email) => sendPasswordResetEmail(this.auth, email);

	doSendEmailVerification = () => {
		return sendEmailVerification(this.auth.currentUser,
			{ url: `https://${window.location.host}${ROUTES.GAME_LIST}` });
	};

	doPasswordUpdate = (password) => {
		return updatePassword(this.auth.currentUser, password);
	};
	doDisplayNameUpdate = (displayName) => {
		return updateProfile(this.auth.currentUser, { displayName });
	};
	doEmailUpdate = (email) => {
		return updateEmail(this.auth.currentUser, email);
	};

	// *** User API ***
	userRef = uid => ref(this.db, `users/${uid}`);
	userListRef = () => ref(this.db, 'users');

	// *** Merge Auth and DB User API *** //
	onAuthUserListener = (onSignIn, onSignOut) =>
		onAuthStateChanged(this.auth, authUser => {
			if (!authUser) {
				onSignOut();
				return;
			}

			// get roles from db; 
			authUser.roles = {};
			get(child(this.userRef(authUser.uid), 'roles')).then(snapshot => {
				if (snapshot.exists())
					authUser.roles = snapshot.val();
				onSignIn(authUser);
				return;
			});
		});


	// *** Message API ***
	// messageRef = uid => this.db.ref(`messages/${uid}`);
	// messageListRef = () => this.db.ref('messages');
};

export { Firebase };