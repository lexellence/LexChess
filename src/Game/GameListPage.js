import React from 'react';
import GameList from './GameList';

import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import GameCreator from './GameCreator';

function GameListPage() {
	return (
		<div align='center' style={{ display: 'block' }}>
			<GameCreator />
			<GameList />
		</div>
	);
};

const conditionFunc = function (authUser) {
	return !!authUser;
};

export default
	withEmailVerification(
		withAuthorization(conditionFunc)(
			GameListPage));

