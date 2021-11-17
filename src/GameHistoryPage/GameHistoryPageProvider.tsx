import React, { useState, useCallback, useEffect } from 'react';
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
	historyPosition: number;
};
const INITIAL_STATE = {
	loadingGID: null,
	game: null,
	historyPosition: 0,
};
const GameHistoryPageProvider: React.FC = ({ children }) => {
	const firebase: Firebase = useFirebaseContext();
	const authUser: AuthUserContextValue = useAuthUserContext();
	const [state, setState] = useState<GameHistoryPageState>({ ...INITIAL_STATE });


	function setHistoryPosition(newPosition: number) {
		sessionStorage.setItem('GameHistoryPageProvider::historyPosition', newPosition.toString());
		setState({ ...state, historyPosition: newPosition });
	}

	const loadGame = useCallback((gid: string, historyPosition: number): void => {
		if (!historyPosition)
			historyPosition = 0;

		function start(dbGame: Object) {
			sessionStorage.setItem('GameHistoryPageProvider::viewingGID', gid);
			sessionStorage.setItem('GameHistoryPageProvider::historyPosition', historyPosition.toString());
			setState({
				loadingGID: null,
				game: dbGameToClientGame(dbGame, gid, authUser!.uid),
				historyPosition
			});
		}

		if (authUser) {
			// Get game from local storage if saved
			const savedGameString = localStorage.getItem('GameHistoryPageProvider::' + gid);
			if (savedGameString) {
				start(JSON.parse(savedGameString))
			}
			else {
				// Get game from server
				setState({ ...INITIAL_STATE, loadingGID: gid });
				firebase.db.ref(`games/${gid}`).once('value').then((snapshot: any) => {
					if (snapshot.exists()) {
						const gameString = JSON.stringify(snapshot.val());
						localStorage.setItem('GameHistoryPageProvider::' + gid, gameString);
						start(snapshot.val());
					}
					else {
						console.log('GameHistoryPage: Error loading game');
						setState({ ...INITIAL_STATE });
					}
				});
			}
		}
	}, [firebase.db, authUser]);

	// Load from session storage on mount 
	useEffect(() => {
		const viewingGID = sessionStorage.getItem('GameHistoryPageProvider::viewingGID');
		if (viewingGID) {
			const historyPositionString = sessionStorage.getItem('GameHistoryPageProvider::historyPosition');
			const historyPosition = historyPositionString ? parseInt(historyPositionString) : 0;
			loadGame(viewingGID, historyPosition);
		}
	}, [loadGame]);

	function leaveGame(): void {
		sessionStorage.removeItem('GameHistoryPageProvider::viewingGID');
		sessionStorage.removeItem('GameHistoryPageProvider::historyPosition');
		setState({ ...INITIAL_STATE });
	};

	const contextValue: GameHistoryPageContextValue = {
		...state, loadGame, leaveGame, setHistoryPosition
	};
	return (
		<GameHistoryPageContext.Provider value={contextValue} >
			{children}
		</GameHistoryPageContext.Provider>
	);
}

export { GameHistoryPageProvider };
