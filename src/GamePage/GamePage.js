import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { withAuthorization, withEmailVerification, AuthUserContext } from '../Session';
import * as ROUTES from "../constants/routes";
import { useFirebaseListenerContext } from '../FirebaseListener';
import Game from '../Game';
import { usePlayAPIContext } from '../API';

function getNextGID(selectedGID, gidList) {
	if (!gidList)
		return null;
	if (!selectedGID) {
		if (gidList.length > 0)
			return gidList[0];
	}

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
	const [gids, setGids] = useState(null);
	const userPlay = useRef(null);
	const [selectedGID, setSelectedGID] = useState(null);
	const nextGID = useRef(null);

	// Mount/Unmount
	useEffect(() => {
		const unregisterUserListener =
			firebaseListener.registerUserListener((user) => {
				userPlay.current = user.play;
				setGids(Object.keys(user.play));
			});
		return () => {
			unregisterUserListener();
		};
	}, [firebaseListener]);

	const selectGID = useCallback(gid => {
		sessionStorage.setItem('GamePage::selectedGID', gid);
		nextGID.current = getNextGID(gid, gids);
		setSelectedGID(gid);

		if (gid !== 'none')
			playAPI.visitGame(gid);
	}, [gids, playAPI]);

	// Set selected gid on first load of gid list
	useEffect(() => {
		if (!gids || selectedGID)
			return;
		const previouslySelectedGID = sessionStorage.getItem('GamePage::selectedGID');
		if (gids.includes(previouslySelectedGID))
			selectGID(previouslySelectedGID);
		else if (gids.length > 0)
			selectGID(gids[0]);
		else
			selectGID('none');
	}, [gids, selectedGID, selectGID]);

	// Go to next game when selected game removed from gid list
	useEffect(() => {
		if (!gids || !selectedGID)
			return;

		if (!gids.includes(selectedGID)) {
			// Go to next game
			if (nextGID.current)
				selectGID(nextGID.current);
			else
				history.push(ROUTES.GAME_LIST);
		}
	}, [gids, selectedGID, selectGID, history]);

	// Loading
	if (!gids || !selectedGID)
		return <div align='center'>Loading...</div>;

	// Render
	return (
		<Container>
			<Row>
				<Col xs={2}>
					<ToggleButtonGroup vertical name='gameSelection' onChange={selectGID} defaultValue={selectedGID}>
						{Object.entries(userPlay.current).map(([gid, game], i) =>
							<ToggleButton key={i} value={gid}
								variant={game.visited ? 'primary' : 'warning'}
								size={selectedGID === gid ? 'lg' : 'sm'}>
								Play {i}
							</ToggleButton>
						)}
					</ToggleButtonGroup>
				</Col>
				<Col>
					<div className='page-wrapper' >
						<AuthUserContext.Consumer>
							{authUser => <Game gid={selectedGID} uid={authUser.uid} />}
						</AuthUserContext.Consumer>
					</div>
				</Col>
			</Row>
		</Container >
	);
}

export default
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GamePage));
