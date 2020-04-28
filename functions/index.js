"use strict";
const functions = require('firebase-functions');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpCodes = require("http-status-codes");

const admin = require('firebase-admin');
const firebaseConfig = require('./firebaseConfig.json');
admin.initializeApp({
	credential: admin.credential.applicationDefault(), // .cert(serviceAccount) or .refreshToken(refreshTokenfromOAuth2)
	databaseURL: firebaseConfig.databaseURL
});
const CHECK_REVOKED_ON_VERIFYIDTOKEN = false;	// CHECK_REVOKED true might have caused an error before (look into security rules instead?)
const COOKIE_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;	// 5 days

// Populate req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Parse cookies
app.use(cookieParser());

//+------------------------\----------------------------------
//|	  GET /session-login   | Generate session cookie
//\------------------------/
//	
//------------------------------------------------------------
app.get('/session-login', (req, res) => {
	// Create cookie from ?idToken=
	let idToken = req.query.idToken;
	admin.auth().createSessionCookie(idToken, { COOKIE_EXPIRES_IN })
		.then((sessionCookie) => {
			// Send cookie
			const options = { maxAge: expiresIn, httpOnly: true, secure: true };
			res.cookie('__session', sessionCookie, options);
			res.end();
			return;
		})
		.catch((error) => {
			res.status(httpCodes.BAD_REQUEST).send(error);
		});
});

//+------------------------\----------------------------------
//|	  	GET /sign-out 	   | Clear session cookie
//\------------------------/----------------------------------
app.get('/sign-out', (req, res) => {
	res.clearCookie('__session');
	res.end();
	//res.redirect(301, '../play');
});

//+------------------------\----------------------------------
//|		verifyCookie 	   |
//\------------------------/
//
//------------------------------------------------------------
function verifyCookie(req, res, next) {
	const sessionCookie = req.cookies.__session || '';
	admin.auth().verifySessionCookie(sessionCookie, true)
		.then(decodedClaims => {
			req.decodedClaims = decodedClaims;
			next();
			return;
		})
		.catch(() => {
			// res.redirect('/signin');
			res.sendStatus(httpCodes.UNAUTHORIZED);
		});
}

// API functions require valid session cookie present
const apiRoute = require('./api.route');
app.use('/', apiRoute);
// app.use('/', verifyCookie, apiRoute);

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

