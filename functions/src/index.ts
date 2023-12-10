import express, { NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpCodes from 'http-status-codes';
import admin from 'firebase-admin';
const functions = require('firebase-functions');

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