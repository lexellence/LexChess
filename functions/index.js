"use strict";
const functions = require('firebase-functions');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')({ origin: true });
const cookieParser = require('cookie-parser');
var boolParser = require('express-query-boolean');
const httpCodes = require("http-status-codes");

const admin = require('firebase-admin');
admin.initializeApp();
// const COOKIE_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;	// 5 days


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.decodedClaims`.
const validateFirebaseIdToken = async (req, res, next) => {
	console.log('*****  validateFirebaseIdToken  *****');

	if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
		!(req.cookies && req.cookies.__session)) {
		console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
			'Make sure you authorize your request by providing the following HTTP header:',
			'Authorization: Bearer <Firebase ID Token>',
			'or by passing a "__session" cookie.');
		res.status(403).send('Unauthorized');
		return;
	}

	let idToken;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		console.log('Found "Authorization" header');
		// Read the ID Token from the Authorization header.
		idToken = req.headers.authorization.split('Bearer ')[1];
	} else if (req.cookies) {
		console.log('Found "__session" cookie');
		// Read the ID Token from cookie.
		idToken = req.cookies.__session;
	} else {
		// No cookie
		res.status(403).send('Unauthorized');
		return;
	}

	try {
		const decodedIdToken = await admin.auth().verifyIdToken(idToken);
		console.log('ID Token correctly decoded', decodedIdToken);
		req.decodedClaims = decodedIdToken;
		next();
		return;
	} catch (error) {
		console.error('Error while verifying Firebase ID token:', error);
		res.status(403).send('Unauthorized');
		return;
	}
};

// Populate req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Change 'true'/'false' values to bool in req.query
app.use(boolParser());

// Automatically allow cross-origin requests
app.use(cors);

// Parse cookies
app.use(cookieParser());

//+------------------------\----------------------------------
//|	  GET /session-login   | Generate session cookie
//\------------------------/
//	
//------------------------------------------------------------
// const SESSION_COOKIE_NAME = '__session';
// app.get('/session-sign-in', (req, res) => {
// 	// Create cookie from ?idToken=
// 	let idToken = req.query.idToken;
// 	admin.auth().createSessionCookie(idToken, { COOKIE_EXPIRES_IN })
// 		.then((sessionCookie) => {
// 			// Send cookie
// 			const options = { maxAge: expiresIn, httpOnly: true, secure: true };
// 			res.cookie(SESSION_COOKIE_NAME, sessionCookie, options);
// 			res.sendStatus(httpCodes.OK);
// 			return;
// 		})
// 		.catch((error) => {
// 			res.status(httpCodes.BAD_REQUEST).send(error);
// 		});
// });

//+------------------------\----------------------------------
//|		verifyCookie 	   |
//\------------------------/
//
//------------------------------------------------------------
// function verifyCookie(req, res, next) {
// 	const sessionCookie = req.cookies.__session || '';
// 	admin.auth().verifySessionCookie(sessionCookie, true)
// 		.then(decodedClaims => {
// 			req.decodedClaims = decodedClaims;
// 			next();
// 			return;
// 		})
// 		.catch(() => {
// 			res.sendStatus(httpCodes.UNAUTHORIZED);
// 		});
// }

//+------------------------\----------------------------------
//|	  	GET /sign-out 	   | Clear session cookie
//\------------------------/----------------------------------
// app.get('/session-sign-out', (req, res) => {
// 	// app.get('/session-sign-out', verifyCookie, (req, res) => {
// 	res.clearCookie(SESSION_COOKIE_NAME);
// 	res.sendStatus(httpCodes.OK);
// });

// app.use('/', require('./api.route'));
app.use('/', validateFirebaseIdToken, require('./api.route'));
// app.use('/', verifyCookie, require('./api.route'));

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

