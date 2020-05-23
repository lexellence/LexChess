// Development or Production build?
const environment = process.env.NODE_ENV || 'development';

// Choose remote cloud functions server OR local cloud functions emulator
let apiBaseURL;
if (environment === 'development')
	apiBaseURL = 'http://localhost:5000/chessfighter-b3ba9/us-central1/api';
else
	apiBaseURL = 'https://us-central1-chessfighter-b3ba9.cloudfunctions.net/api';

export const GET_PLAY = apiBaseURL + '/get-play';
export const JOIN_GAME = apiBaseURL + '/join-game';	// :gameid
export const CREATE_GAME = apiBaseURL + '/create-game';
export const MOVE = apiBaseURL + '/move';
export const LEAVE_GAME = apiBaseURL + '/leave-game';
