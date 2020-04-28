"use strict";
const express = require("express");
const router = express.Router();
const httpCodes = require("http-status-codes");

const { validateBody, schemas } = require("./validator");
const Joi = require("@hapi/joi");
const to = require('await-to-js').default;

// const firebase = require("firebase");
// require("firebase/auth");
// require("firebase/firestore");
// const firebaseConfig = require('../firebaseConfig.json');
// firebase.initializeApp(firebaseConfig);

// const db = firebase.firestore();


//+------------------------\----------------------------------
//|	    GET /get-play      |
//\------------------------/
//	Get inGame. 
//		If false, get openGames[].
//		If true, get isWhite, isWaiting.
//				If isWaiting, get moves[].
//------------------------------------------------------------
router.get("/get-play", (req, res) => {
	// let uid = req.decodedClaims.uid;

	let payload = {
		inGame: true,
		isWhite: true,
		isWaiting: false,
		moves: ['6163', '7674']
	};
	let payload2 = {
		inGame: false,
		games: [{ gid: 0, name: 'the blacksmith', isWhite: false },
		{ gid: 10, name: 'the reaper', isWhite: true },
		{ gid: 20, name: 'chessmasterflash', isWhite: true }]
	};
	res.status(httpCodes.OK).json(payload);
});
//+------------------------\----------------------------------
//|	    PUT /join-game     |
//\------------------------/
//
//------------------------------------------------------------
router.put("/join-game/:gid", async (req, res) => {
	let uid = req.decodedClaims.uid;
	let gid = req.params.gid;
});
//+------------------------\----------------------------------
//|	  POST /create-game    |
//\------------------------/
//
//------------------------------------------------------------
router.post("/create-game", async (req, res) => {
	let uid = req.decodedClaims.uid;

});
//+------------------------\----------------------------------
//|	      PUT /move        |
//\------------------------/
//
//------------------------------------------------------------
router.put("/move", validateBody(schemas.move), async (req, res) => {
	let uid = req.decodedClaims.uid;

});
//+------------------------\----------------------------------
//|	   PUT /leave-game     |
//\------------------------/
//
//------------------------------------------------------------
router.put("/leave-game", validateBody(schemas.move), async (req, res) => {
	let uid = req.decodedClaims.uid;

});

module.exports = router;



