import React, { useState, useCallback } from 'react';
import { useAuthUserContext, AuthUserContextValue } from '../Session';
import { GameHistoryPageContext, GameHistoryPageContextValue } from '.';
import { Firebase, useFirebaseContext } from '../Firebase';
import { dbGameToClientGame } from '../Game';

//+--------------------------------\--------------------------
//|	 	GameHistoryPageProvider    |
//\--------------------------------/--------------------------
type GameHistoryPageState = {
	loadingGID: string | null;
	game: Object | null;
};
const INITIAL_STATE = {
	loadingGID: null,
	game: null,
};
const GameHistoryPageProvider: React.FC = ({ children }) => {
	const firebase: Firebase = useFirebaseContext();
	const authUser: AuthUserContextValue = useAuthUserContext();
	const [state, setState] = useState<GameHistoryPageState>({ ...INITIAL_STATE });
	const [historyPosition, setHistoryPosition] = useState(0);

	const loadGame = useCallback((gid: string): void => {
		if (authUser) {
			// Get game from local storage if saved
			const savedGameString = localStorage.getItem('GameHistoryPageProvider::' + gid);
			if (savedGameString) {
				setState({
					loadingGID: null,
					game: dbGameToClientGame(JSON.parse(savedGameString), gid, authUser.uid),
				});
				setHistoryPosition(0);
			}
			else {
				// Get game from server
				setState({
					loadingGID: gid,
					game: null,
				});
				firebase.db.ref(`games/${gid}`).once('value').then((snapshot: any) => {
					if (snapshot.exists()) {
						localStorage.setItem('GameHistoryPageProvider::' + gid, JSON.stringify(snapshot.val()));
						setState({
							loadingGID: null,
							game: dbGameToClientGame(snapshot.val(), gid, authUser.uid),
						});
						setHistoryPosition(0);
					}
					else {
						console.log('GameHistoryPage: Error loading game');
						setState({ ...INITIAL_STATE });
					}
				});
			}
		}
	}, [firebase.db, authUser]);

	const leaveGame = (): void => {
		setState({ ...INITIAL_STATE });
	};

	const contextValue: GameHistoryPageContextValue = {
		...state, loadGame, leaveGame, historyPosition, setHistoryPosition
	};
	return (
		<GameHistoryPageContext.Provider value={contextValue} >
			{children}
		</GameHistoryPageContext.Provider>
	);
}

export { GameHistoryPageProvider };
