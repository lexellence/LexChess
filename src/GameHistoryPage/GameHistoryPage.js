import React from 'react';
import GameList from './GameList';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';

function GameHistoryPage() {
	return (
		<div align='center' style={{ display: 'block' }}>
			<h1>View my past games</h1>
			<GameList isSignedIn isHistory />
		</div>
	);
}

export default
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GameHistoryPage));
