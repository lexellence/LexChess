import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { withAuthorization, withEmailVerification, AuthUserContext } from '../Session';
import * as ROUTES from "../constants/routes";
import { useFirebaseListenerContext } from '../FirebaseListener';
import Game from './Game';

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
	const [gids, setGids] = useState(null);
	const [selectedGID, setSelectedGID] = useState(null);
	const nextGID = useRef(null);

	// Mount/Unmount
	useEffect(() => {
		const unregisterUserListener =
			firebaseListener.registerUserListener((user) => {
				setGids(user.gidsPlay);
			});
		return () => {
			unregisterUserListener();
		};
	}, [firebaseListener]);

	const selectGID = useCallback(gid => {
		sessionStorage.setItem('GamePage::selectedGID', gid);
		nextGID.current = getNextGID(gid, gids);
		setSelectedGID(gid);
	}, [gids]);

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
						{gids.map((gid, i) =>
							<ToggleButton key={i} value={gid}
								variant={selectedGID === gid ? 'primary' : 'outline-primary'}>
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
