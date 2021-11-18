import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
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
	const navigate = useNavigate();
	const firebaseListener = useFirebaseListenerContext();
	const playAPI = usePlayAPIContext();
	const [user, setUser] = useState({ play: {}, past: {} });
	const [selectedGID, setSelectedGID] = useState(null);
	const nextGID = useRef(null);
	const [game, setGame] = useState(null);

	// Mount/Unmount
	useEffect(() => {
		const unregisterUserListener =
			firebaseListener.registerUserListener((user) => {
				if (Object.keys(user.play).length < 1) {
					sessionStorage.removeItem('selectedGID');
					navigate(ROUTES.GAME_LIST);
				}
				else
					setUser(user);
			});
		return () => {
			unregisterUserListener();
		};
	}, [firebaseListener, navigate]);

	// Select game from menu
	const selectGID = useCallback(gid => {
		if (gid) {
			sessionStorage.setItem('selectedGID', gid);
			setSelectedGID(gid);

			const gids = Object.keys(user.play);
			nextGID.current = getNextGID(gid, gids);

			if (!user?.play[gid].visited) {
				playAPI.visitGame(gid);
				const newUserPlay = { ...user.play };
				newUserPlay[gid].visited = true;
				const newUser = { ...user, play: newUserPlay };
				firebaseListener.setLocalUser(newUser);
			}
		}
	}, [user, playAPI, firebaseListener]);

	// Set selected gid on first load of gid list
	useEffect(() => {
		if (!selectedGID) {
			const previouslySelectedGID = sessionStorage.getItem('selectedGID');
			const gids = Object.keys(user.play);
			if (previouslySelectedGID && gids.includes(previouslySelectedGID))
				selectGID(previouslySelectedGID);
			else
				selectGID(gids[0]);
		}
	}, [user.play, selectedGID, selectGID]);

	// Go to next game when selected game not in user's game list
	useEffect(() => {
		if (selectedGID) {
			const gids = Object.keys(user.play);
			if (!gids.includes(selectedGID)) {
				// Go to next game
				if (gids.includes(nextGID.current))
					selectGID(nextGID.current);
				else
					selectGID(gids[0]);
			}
		}
	}, [user.play, selectedGID, selectGID]);

	// Subscribe to selected game
	useEffect(() => {
		if (selectedGID) {
			function handleGameUpdate(newGame) {
				setGame({ ...newGame });
			}
			const unsubscribe = firebaseListener.registerGameListener(handleGameUpdate, selectedGID);
			return unsubscribe;
		}
	}, [firebaseListener, selectedGID]);

	// Render
	if (!user || !selectedGID)
		return <div align='center'>Loading...</div>;
	else {
		return (
			<div align='center'>
				<Container>
					<Row>
						<Col xs={0} md={0} lg={2} xl={2}></Col>
						<Col xs={3} md={2} lg={2} xl={2}>
							<ToggleButtonGroup vertical name='gameSelection' onChange={selectGID} defaultValue={selectedGID} className='game-page-menu'>
								{Object.entries(user.play).map(([gid, userGame], i) =>
									<ToggleButton key={i} value={gid}
										variant='primary' size={selectedGID === gid ? 'lg' : 'sm'}>
										Play {i}
										{!userGame.visited && <MdFiberNew className='attention' size={iconSize} style={{ transform: 'translateY(-1px)' }} />}
										{userGame.myTurn && <FaChessPawn className='myTurn' size={iconSize2} style={{ transform: 'translateY(-2px)' }} />}
									</ToggleButton>
								)}
							</ToggleButtonGroup>
						</Col>
						<Col xs={9} md={8} lg={5} xl={4}>
							{!game ? <span align='center'>Loading...</span>
								: <Game game={game} leaveGame={() => playAPI.leaveGame(game.gid)} />}
						</Col>
						<Col xs={0} md={2} lg={3} xl={4}></Col>
					</Row>
				</Container>
			</div>
		);
	}
}
const GamePage =
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GamePageBase));

export { GamePage };
