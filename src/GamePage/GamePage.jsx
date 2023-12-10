import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { withAuthorization, withEmailVerification } from '../Session';
import * as ROUTES from "../constants/routes";
import { useFirebaseListenerContext } from '../FirebaseListener';
import { Game } from '../Game';
import { usePlayAPIContext } from '../API';

function GamePageBase() {
	// Get game index
	const params = useParams();
	const [gameIndexToDisplay, setGameIndexToDisplay] = useState(0);
	useEffect(() => {
		const indexStr = params.gameIndex;
		setGameIndexToDisplay(indexStr ? parseInt(indexStr) : 0);
	}, [params]);

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
		if (userPlay) {
			const highestGameIndex = Object.keys(userPlay).length - 1;
			if (highestGameIndex < 0)
				navigate(ROUTES.GAME_LIST);
			else if (gameIndexToDisplay > highestGameIndex) {
				navigate(ROUTES.PLAY + `/${highestGameIndex}`)
			}
		}
	}, [gameIndexToDisplay, userPlay, navigate]);


	// Subscribe to selected game
	const playAPI = usePlayAPIContext();
	const [game, setGame] = useState(null);
	useEffect(() => {
		if (userPlay) {
			const gids = Object.keys(userPlay);
			if (gameIndexToDisplay < gids.length) {
				function handleGameUpdate(newGame) {
					setGame({ ...newGame });
				}
				const gid = gids[gameIndexToDisplay];
				const unsubscribe = firebaseListener.registerGameListener(handleGameUpdate, gid);

				if (!userPlay[gid].visited)
					playAPI.visitGame(gid);

				return unsubscribe;
			}
		}
	}, [gameIndexToDisplay, userPlay, firebaseListener]);

	// Render
	return (
		<section id='game-page'>
			{!game ? <div style={{ textAlign: 'center' }}>Loading...</div>
				: <Game game={game} leaveGame={() => playAPI.leaveGame(game.gid)} />}
		</section>
	);
}
const GamePage =
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GamePageBase));

export { GamePage };
