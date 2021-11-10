import React, { useState, useCallback } from 'react';
import { useAuthUserContext, AuthUserContextValue } from '../Session';
import { GameHistoryPageContext, GameHistoryPageContextValue } from '.';
import Firebase, { useFirebaseContext } from '../Firebase';
import { dbGameToClientGame } from '../Game';

//+--------------------------------\--------------------------
//|	 	GameHistoryPageProvider    |
//\--------------------------------/--------------------------
type GameHistoryPageState = {
	isLoadingGame: boolean;
	loadingGID: string | null;
	game: Object | null;
};
const INITIAL_STATE = {
	isLoadingGame: false,
	loadingGID: null,
	game: null
};
const GameHistoryPageProvider: React.FC = ({ children }) => {
	const firebase: Firebase = useFirebaseContext();
	const authUser: AuthUserContextValue = useAuthUserContext();
	const [state, setState] = useState<GameHistoryPageState>({ ...INITIAL_STATE });

	const loadGame = useCallback((gid: string): void => {
		if (authUser) {
			setState({ isLoadingGame: true, loadingGID: gid, game: null });
			firebase.db.ref(`games/${gid}`).once('value').then(snapshot => {
				if (snapshot.exists())
					setState({
						isLoadingGame: false,
						loadingGID: null,
						game: dbGameToClientGame(snapshot.val(), gid, authUser.uid),
					});
				else {
					console.log('GameHistoryPage: Error loading game');
					setState({ ...INITIAL_STATE });
				}
			}).catch((error) => {
				console.error(error);
			});
		}
	}, [firebase.db, authUser]);

	const leaveGame = useCallback((): void => {
		setState({ ...INITIAL_STATE });
	}, []);


	const contextValue: GameHistoryPageContextValue = {
		...state, loadGame, leaveGame
	};
	return (
		<GameHistoryPageContext.Provider value={contextValue} >
			{children}
		</GameHistoryPageContext.Provider>
	);
}

export default GameHistoryPageProvider;
