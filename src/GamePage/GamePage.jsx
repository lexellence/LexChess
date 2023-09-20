import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { withAuthorization, withEmailVerification } from '../Session';
import * as ROUTES from "../constants/routes";
import { useFirebaseListenerContext } from '../FirebaseListener';
import { Game } from '../Game';
import { usePlayAPIContext } from '../API';
import { MdFiberNew } from 'react-icons/md';
import { FaChessPawn } from 'react-icons/fa';
import { iconSize, iconSize2 } from '../iconSizes';

function getNextGID(selectedGID, gidList) {
	if (!gidList)
		return null;

	const thisGameIndex = gidList.findIndex(gid => gid === selectedGID);
	if (thisGameIndex < 0) {
		// This game does not belong to user
		if (gidList.length > 0) {
			// Pick first game
			return gidList[0];
		}
		else {
			// No games to pick from
			return null;
		}
	}
	else {
		if (gidList.length < 2) {
			// No games to pick from
			return null;
		}
		else {
			// Pick next game
			const nextIndex = (thisGameIndex + 1) % gidList.length;
			return gidList[nextIndex];
		}
	}
};

function GamePageBase() {
	// Get game index
	const [searchParams] = useSearchParams();
	const [gameIndex, setGameIndex] = useState(0);
	useEffect(() => {
		const indexStr = searchParams.get("game");
		setGameIndex(indexStr ? parseInt(indexStr) : 0);
	}, [searchParams]);

	// Register user listener
	const firebaseListener = useFirebaseListenerContext();
	const [userPlay, setUserPlay] = useState(null);
	useEffect(() => {
		const handleUserUpdate = (user) => {
			setUserPlay(user.play);
		};
		const unsubscribe = firebaseListener.registerUserListener(handleUserUpdate);
		return unsubscribe;
	}, [firebaseListener]);

	// Redirect if user has no games, or game index is invalid
	const navigate = useNavigate();
	useEffect(() => {
		if (userPlay)
			if (Object.keys(userPlay).length < 1 ||
				gameIndex > Object.keys(userPlay).length - 1) {
				navigate(ROUTES.GAME_LIST);
			}
	}, [userPlay, navigate]);


	// Subscribe to selected game
	const playAPI = usePlayAPIContext();
	const [game, setGame] = useState(null);
	useEffect(() => {
		if (userPlay) {
			const gids = Object.keys(userPlay);
			if (gameIndex < gids.length) {
				function handleGameUpdate(newGame) {
					setGame({ ...newGame });
				}
				const gid = gids[gameIndex];
				const unsubscribe = firebaseListener.registerGameListener(handleGameUpdate, gid);

				if (!userPlay[gid].visited)
					playAPI.visitGame(gid);

				return unsubscribe;
			}
		}
	}, [firebaseListener, userPlay, gameIndex]);

	// Render
	if (!game)
		return <div style={{ textAlign: 'center' }}>Loading...</div>;
	else {
		return (
			<section id='game-page'>
				{!game ? <div style={{ textAlign: 'center' }}>Loading...</div>
					: <Game game={game} leaveGame={() => playAPI.leaveGame(game.gid)} />}
			</section>
		);
	}
}
const GamePage =
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GamePageBase));

export { GamePage };
