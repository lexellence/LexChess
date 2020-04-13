//import * as functions from 'firebase-functions';
/*const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
//app.use(myMiddleware);

// build multiple CRUD interfaces:
//app.get('/:id', (req, res) => res.send(Widgets.getById(req.params.id)));
//app.post('/', (req, res) => res.send(Widgets.create()));
//app.put('/:id', (req, res) => res.send(Widgets.update(req.params.id, req.body)));
//app.delete('/:id', (req, res) => res.send(Widgets.delete(req.params.id)));
app.get('/message', (req, res) => {
    const name = req.query.name;
    res.send(`Hello ${name}`);
});
*/
const functions = require('firebase-functions');

exports.bigben = functions.https.onRequest((req: any, res: any) => {
  res.status(200).send('message');
});

