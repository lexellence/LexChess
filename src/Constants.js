// Development or Production build?
const environment = process.env.NODE_ENV || 'development';

// Choose remote cloud functions server OR local cloud functions emulator
let apiBaseURL;
if (environment === 'development')
	apiBaseURL = 'http://localhost:5000/chessfighter-b3ba9/us-central1/api';
else
	apiBaseURL = 'https://us-central1-chessfighter-b3ba9.cloudfunctions.net/api';

module.exports = Object.freeze({
	// Routes are hard-coded into back-end. Changes here must also be changed there.
	ROUTE_PLAY: '/play',
	ROUTE_SIGN_IN: '/sign-in',

	API_SESSION_SIGN_IN: apiBaseURL + '/session-sign-in',
	API_SESSION_SIGN_OUT: apiBaseURL + '/session-sign-out',

	API_GET_PLAY: apiBaseURL + '/get-play',
	API_JOIN_GAME: apiBaseURL + '/join-game',	// :gameid
	API_CREATE_GAME: apiBaseURL + '/create-game',
	API_MOVE: apiBaseURL + '/move',
	API_LEAVE_GAME: apiBaseURL + '/leave-game',


	FIREBASE_CONFIG: {
		apiKey: "AIzaSyB8hSrh3MzpM_VxuKLDvrwGnDkpSJHBaUU",
		authDomain: "chessfighter-b3ba9.firebaseapp.com",
		databaseURL: "https://chessfighter-b3ba9.firebaseio.com",
		projectId: "chessfighter-b3ba9",
		storageBucket: "chessfighter-b3ba9.appspot.com",
		messagingSenderId: "571875242130",
		appId: "1:571875242130:web:96b940de11853db0a6364b"
	}
});
