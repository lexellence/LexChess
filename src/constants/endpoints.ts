// Emulator or live?
const API_URL_DEV = 'http://localhost:5001/chessfighter-b3ba9/us-central1/api';
const API_URL_PROD = 'https://us-central1-chessfighter-b3ba9.cloudfunctions.net/api';
const API_URL = (process.env.NODE_ENV === 'production') ? API_URL_PROD : API_URL_DEV;

// Endpoint URLs
export const GET_PLAY = API_URL + '/get-play-state';
export const JOIN_GAME = API_URL + '/join-game';
export const CREATE_GAME = API_URL + '/create-game';
export const VISIT_GAME = API_URL + '/visit-game';
export const MOVE = API_URL + '/move';
export const LEAVE_GAME = API_URL + '/leave-game';
