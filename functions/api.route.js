const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyB8hSrh3MzpM_VxuKLDvrwGnDkpSJHBaUU",
    authDomain: "chessfighter-b3ba9.firebaseapp.com",
    databaseURL: "https://chessfighter-b3ba9.firebaseio.com",
    projectId: "chessfighter-b3ba9",
    storageBucket: "chessfighter-b3ba9.appspot.com",
    messagingSenderId: "571875242130",
    appId: "1:571875242130:web:f87864f93d5251b0a6364b"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

const express = require('express');
const router = express.Router();


const Joi = require('@hapi/joi');
const gameSchema = Joi.object({
    userId1:
        Joi.number().integer().required(),
    userId2:
        Joi.number().integer().required(),
    moveHistory:
        Joi.array().items(
            Joi.string().pattern(/^[1-8]{4}[+#]?$/)
        ).required()
    // username: Joi.string().alphanum().min(3).max(30).required(),
    // password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    // repeat_password: Joi.ref('password'), 
    // access_token: [ Joi.string(), Joi.number() ],
    // birth_year: Joi.number().integer().min(1900).max(2013), 
    // email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
});

// Play API
router.route('/add-game').post((req, res, next) => {
    const { error, value } = gameSchema.validate(req.body);
    if (error) {
        res.sendStatus(400); // 400 = bad request
        return;
    }
    req.body.lastActive = firebase.firestore.FieldValue.serverTimestamp();

    // Add a game document
    db.collection("games").add(req.body)
        .then(docRef => {
            res.sendStatus(201); // 201 = created
            return;
        })
        .catch(error => {
            res.sendStatus(500); // 500 = generic internal server error
            next(error);
        });
});

// Home API
router.route('/how-is-today').get((req, res, next) => {
    var homeCollectionRef = db.collection("home");
    var todayDocRef = homeCollectionRef.doc("todayDoc");

    todayDocRef.get()
        .then(doc => {
            if (!doc.exists)
                res.sendStatus(404);    // 404 = not found
            else {
                if (!doc.data().howIsToday)
                    res.sendStatus(404);    // 404 = not found
                else
                    res.status(200).send(doc.data().howIsToday);    // 200 = OK
            }
            return;
        })
        .catch(error => {
            res.sendStatus(500); // 500 = generic internal server error
            next(error);
        });
});

// User List API
const userObject = {
    name: 'name1',
    email: 'email1@mail.com',
    rollno: 1
};
const userObject2 = {
    name: 'name2',
    email: 'email2@mail.com',
    rollno: 2
};
const userObject3 = {
    name: 'name3',
    email: 'email3@mail.com',
    rollno: 3
};
const userObjectList = [userObject, userObject2, userObject3];

///const playerSchema = require('../models/playerSchema');
router.route('/create-user').post((req, res, next) => {
    /*playerSchema.create(req.body, (error, data) => {
        if (error)
            return next(error);
        else {
            console.log('New player:');
            console.log(data);
            res.json(data);
        }
    });*/
    res.sendStatus(201); // 201 = created
});


router.route('/get-user-list').get((req, res, next) => {
    /*playerSchema.find((error, data) => {
        if (error)
            return next(error);
        else
            res.json(data);
    });*/
    res.status(200).json(userObjectList);   // 200 = OK
});

router.route('/get-user/:id').get((req, res, next) => {
    /*playerSchema.findById(req.params.id, (error, data) => {
        if (error)
            return next(error);
        else
            res.json(data);
    });*/
    res.status(200).json(userObject);   // 200 = OK
});
router.route('/update-user/:id').put((req, res, next) => {
    /*playerSchema.findByIdAndUpdate(req.params.id, { $set: req.body },
        (error, data) => {
            if (error) {
                console.log(error);
                return next(error);
            } else {
                res.json(data);
                console.log('player updated successfully!');
            }
        });*/
    res.sendStatus(200);
});
router.route('/delete-user/:id').delete((req, res, next) => {
    /*playerSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error)
            return next(error);
        else
            res.status(200).json({ msg: data });
    });*/
    res.sendStatus(200);
});

module.exports = router;