// Development or Production build?
const environment = process.env.NODE_ENV || 'development';

// Choose remote cloud functions server OR local cloud functions emulator
let apiBaseURL = '';
if (environment === 'development')
    apiBaseURL = 'http://localhost:5000/chessfighter-b3ba9/us-central1/api';
else
    apiBaseURL = 'https://us-central1-chessfighter-b3ba9.cloudfunctions.net/api';

module.exports = Object.freeze({
    // Routes are hard-coded into back-end. Changes here must also be changed there.
    ROUTE_HOME: '/',
    ROUTE_VIEW_USERS: '/view-users',
    ROUTE_CREATE_USER: '/create-user',
    ROUTE_EDIT_USER: '/edit-user',  // '/:id'
    ROUTE_PLAY: '/play',

    API_BASE_URL: apiBaseURL,
    API_ADD_GAME: '/add-game',
    API_HOW_IS_TODAY: '/how-is-today',

    API_CREATE_USER: '/create-user',        // (userObj)
    API_GET_USER_LIST: '/get-user-list',
    API_GET_USER: '/get-user',             // + '/:id'
    API_UPDATE_USER: '/update-user',       // + '/:id' (userObj)
    API_DELETE_USER: '/delete-user'        // + '/:id' 
});
