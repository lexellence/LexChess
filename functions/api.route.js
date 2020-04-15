const firebase = require("firebase");
require("firebase/firestore");
var firebaseConfig = {
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

// Play API
const isValidGame = (game) => {
    if ((typeof (game.userId1) === 'number') &&
        (typeof (game.userId2) === 'number') &&
        (game.moveHistory instanceof Array))
        return true;
    else
        return false;
};
router.route('/add-game').post((req, res, next) => {
    // Validate input
    if (!isValidGame(req.body)) {
        res.status(500).send('invalid game');
        return;
    }

    // Add a game document
    req.body.lastActive = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("games").add(req.body)
        .then(docRef => {
            res.status(200).send('success');
            return;
        })
        .catch(error => {
            res.status(500).send('error');
        });
});

// Home API
router.route('/how-is-today').get((req, res, next) => {
    var homeCollectionRef = db.collection("home");
    var todayDocRef = homeCollectionRef.doc("todayDoc");

    todayDocRef.get()
        .then(doc => {
            if (!doc.exists)
                res.status(404).send("<doc_not_found>");
            else {
                if (!doc.data().howIsToday)
                    res.status(200).send('<field_not_found>');
                else
                    res.status(200).send(doc.data().howIsToday);
            }
            return;
        })
        .catch(error => {
            console.log("Error getting document:", error);
            res.status(500).send('<error>');
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
    res.status(200).json(req.body);
});


router.route('/get-user-list').get((req, res, next) => {
    /*playerSchema.find((error, data) => {
        if (error)
            return next(error);
        else
            res.json(data);
    });*/
    res.status(200).json(userObjectList);
});

router.route('/get-user/:id').get((req, res, next) => {
    /*playerSchema.findById(req.params.id, (error, data) => {
        if (error)
            return next(error);
        else
            res.json(data);
    });*/
    res.status(200).json(userObject);
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
    res.status(200).json(userObject);
});
router.route('/delete-user/:id').delete((req, res, next) => {
    /*playerSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error)
            return next(error);
        else
            res.status(200).json({ msg: data });
    });*/
    res.status(200).json({ msg: 'deleted' });
});

module.exports = router;