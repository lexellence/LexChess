/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// *************************************************************************************************
// Start DAVID'S CODE
// import functions from 'firebase-functions';
// import express from 'express';
import express, { NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import boolParser from 'express-query-boolean';
import httpCodes from 'http-status-codes';
import admin from 'firebase-admin';
// import { initializeApp } from 'firebase-admin/app';
const functions = require('firebase-functions');
// import * as functions from 'firebase-functions'

admin.initializeApp();
const expressApp = express();

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.decodedClaims`.
const validateFirebaseIdToken = async (req: any, res: any, next: NextFunction) => {
    console.log('*****  validateFirebaseIdToken  *****');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(httpCodes.FORBIDDEN).send('Unauthorized');
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
        res.status(httpCodes.FORBIDDEN).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);

        // If email not yet verified, don't process API call
        if (!decodedIdToken.email_verified) {
            console.error('User tried to make API call before email was verified.');
            res.status(httpCodes.FORBIDDEN).send('PLEASE SIGN OUT AND BACK IN, THEN TRY AGAIN.');
            return;
        }

        // Send user info to API
        req.decodedClaims = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(httpCodes.FORBIDDEN).send('Unauthorized');
        return;
    }
};

// Populate req.body
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());

// Change 'true'/'false' values to bool in req.query
// app.use(boolParser());

// Automatically allow cross-origin requests
expressApp.use(cors({ origin: true }));

// Parse cookies
expressApp.use(cookieParser());

// Handle API requests
expressApp.use('/', validateFirebaseIdToken, require('./api.route'));

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(expressApp);

// Make sure user has an entry in the database
exports.initDatabaseUser = functions.auth.user().onCreate(async (user: any) => {
    const db = admin.database();
    console.log('creating db user');
    await db.ref(`users/${user.uid}/exists`).update(true);
});







// ****************************************************************************
// ***  OLD LOGIN SYSTEM WITHOUT USING FIREBASE AUTHENTICATION ON FRONT-END ***
// ****************************************************************************

// const COOKIE_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;	// 5 days
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
// app.use('/', verifyCookie, require('./api.route'));


