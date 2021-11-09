import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { withAuthorization, withEmailVerification } from '../Session';
import * as ROUTES from "../constants/routes";
import { useFirebaseListenerContext } from '../FirebaseListener';
import Game from '../Game';
import { usePlayAPIContext } from '../API';

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

function GamePage() {
	const history = useHistory();
	const firebaseListener = useFirebaseListenerContext();
	const playAPI = usePlayAPIContext();
	const [userPlay, setUserPlay] = useState({});
	const [selectedGID, setSelectedGID] = useState(null);
	const nextGID = useRef(null);
	const [game, setGame] = useState(null);

	// Mount/Unmount
	useEffect(() => {
		const unregisterUserListener =
			firebaseListener.registerUserListener((user) => {
				if (!user || !user.play || Object.keys(user.play).length < 1) {
					sessionStorage.removeItem('selectedGID');
					history.push(ROUTES.GAME_LIST);
				}
				else
					setUserPlay(user.play);
			});
		return () => {
			unregisterUserListener();
		};
	}, [firebaseListener, history]);

	// Select game from menu
	const selectGID = useCallback(gid => {
		if (gid) {
			sessionStorage.setItem('selectedGID', gid);
			setSelectedGID(gid);

			const gids = Object.keys(userPlay);
			nextGID.current = getNextGID(gid, gids);

			if (!userPlay[gid].visited)
				playAPI.visitGame(gid);
		}
	}, [userPlay, playAPI]);

	// Set selected gid on first load of gid list
	useEffect(() => {
		if (!selectedGID) {
			const previouslySelectedGID = sessionStorage.getItem('selectedGID');
			const gids = Object.keys(userPlay);
			if (previouslySelectedGID && gids.includes(previouslySelectedGID))
				selectGID(previouslySelectedGID);
			else
				selectGID(gids[0]);
		}
	}, [userPlay, selectedGID, selectGID]);

	// Go to next game when selected game not in user's game list
	useEffect(() => {
		if (selectedGID) {
			const gids = Object.keys(userPlay);
			if (!gids.includes(selectedGID)) {
				// Go to next game
				if (gids.includes(nextGID.current))
					selectGID(nextGID.current);
				else
					selectGID(gids[0]);
			}
		}
	}, [userPlay, selectedGID, selectGID, history]);

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
	if (!userPlay || !selectedGID)
		return <div align='center'>Loading...</div>;
	else {
		return (
			<Container>
				<Row>
					<Col xs={2}>
						<ToggleButtonGroup vertical name='gameSelection' onChange={selectGID} defaultValue={selectedGID}>
							{Object.entries(userPlay).map(([gid, userGame], i) =>
								<ToggleButton key={i} value={gid}
									variant={userGame.visited ? 'primary' : 'warning'}
									size={selectedGID === gid ? 'lg' : 'sm'}>
									Play {i}
								</ToggleButton>
							)}
						</ToggleButtonGroup>
					</Col>
					<Col>
						{!game ? <div align='center'>Loading...</div>
							: <div className='page-wrapper'>
								<Game game={game} />
							</div>}
					</Col>
				</Row>
			</Container>
		);
	}
}

export default
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GamePage));
