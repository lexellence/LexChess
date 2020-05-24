import firebase from 'firebase';
require("firebase/auth");
// require('firebase/functions');
// require('firebase/firestore');

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

// export const provider = new firebase.auth.GoogleAuthProvider();
// export const functions = firebase.functions();
// export const db = firebase.firestore();
// export const fieldval = firebase.firestore.FieldValue;

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

export const auth = firebase.auth();
export default firebase;