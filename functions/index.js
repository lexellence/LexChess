const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const functions = require('firebase-functions');

// Populate req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// TODO: Add middleware to authenticate requests

// API
const apiRoute = require('./api.route');
app.use('/', apiRoute);

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

