import React, { useState, useCallback, useEffect } from 'react';
import { useAuthUserContext, AuthUserContextValue } from '../Session';
import { GameHistoryPageContext, GameHistoryPageContextValue } from '.';
import { Firebase, useFirebaseContext } from '../Firebase';
import { ref, get } from "firebase/database";
import { dbGameToClientGame } from '../Game';
import { serveGameRecordFileToUser } from './serveGameRecordFileToUser';

//+--------------------------------\--------------------------
//|	     getGameFromDatabase   	   |
//\--------------------------------/--------------------------
async function getGameFromDatabase(gid: string, firebase: Firebase) {
	return new Promise(function (resolve, reject) {
		// Get game from local storage if saved
		const savedGameString = localStorage.getItem('GameHistoryPageProvider::' + gid);
		if (savedGameString) {
			resolve(JSON.parse(savedGameString));
		}
		else {
			// Get game from server
			get(ref(firebase.db, `games/${gid}`)).then((snapshot: any) => {
				if (snapshot.exists()) {
					const gameString = JSON.stringify(snapshot.val());
					localStorage.setItem('GameHistoryPageProvider::' + gid, gameString);
					resolve(snapshot.val());
				}
				else
					reject();
			});
		}
	});
}

//+--------------------------------\--------------------------
//|	 	GameHistoryPageProvider    |
//\--------------------------------/--------------------------
type GameHistoryPageState = {
	loadingGID: string | null;
	downloadingGID: string | null;
	game: Object | null;
	historyPosition: number;
};
const INITIAL_STATE = {
	loadingGID: null,
	downloadingGID: null,
	game: null,
	historyPosition: 0,
};
interface Props {
	children: React.ReactNode;
}
const GameHistoryPageProvider: React.FC<Props> = ({ children }) => {
	const firebase: Firebase = useFirebaseContext();
	const authUser: AuthUserContextValue = useAuthUserContext();
	const [state, setState] = useState<GameHistoryPageState>({ ...INITIAL_STATE });

	//+--------------------------------\--------------------------
	//|	 	  setHistoryPosition       |
	//\--------------------------------/--------------------------
	function setHistoryPosition(newPosition: number) {
		sessionStorage.setItem('GameHistoryPageProvider::historyPosition', newPosition.toString());
		setState({ ...state, historyPosition: newPosition });
	}

	//+--------------------------------\--------------------------
	//|	 	  	   loadGame       	   |
	//\--------------------------------/--------------------------
	const loadGame = useCallback((gid: string, historyPosition: number): void => {
		if (!historyPosition)
			historyPosition = 0;

		setState({ ...INITIAL_STATE, loadingGID: gid });
		getGameFromDatabase(gid, firebase)
			.then(dbGame => {
				sessionStorage.setItem('GameHistoryPageProvider::viewingGID', gid);
				sessionStorage.setItem('GameHistoryPageProvider::historyPosition', historyPosition.toString());
				setState({
					loadingGID: null,
					downloadingGID: null,
					game: dbGameToClientGame(dbGame, gid, authUser!.uid),
					historyPosition
				});
			})
			.catch(() => {
				console.log('GameHistoryPage: Error loading game');
				setState({ ...INITIAL_STATE });
			});
	}, [firebase, authUser]);

	//+--------------------------------\--------------------------
	//|	 	     downloadGame          |
	//\--------------------------------/--------------------------
	const downloadGame = useCallback((gid: string): void => {
		// Get game and serve
		setState({ ...INITIAL_STATE, downloadingGID: gid });
		getGameFromDatabase(gid, firebase)
			.then(dbGame => {
				serveGameRecordFileToUser(gid, dbGame);
				setState({ ...INITIAL_STATE });
			})
			.catch(() => {
				console.log('GameHistoryPage: Error downloading game');
				setState({ ...INITIAL_STATE });
			});
	}, [firebase]);

	//+--------------------------------\--------------------------
	//|	 	  	  leaveGame       	   |
	//\--------------------------------/--------------------------
	function leaveGame(): void {
		sessionStorage.removeItem('GameHistoryPageProvider::viewingGID');
		sessionStorage.removeItem('GameHistoryPageProvider::historyPosition');
		setState({ ...INITIAL_STATE });
	};

	//+-------------------------------------------------\---------
	//|   Effect: Load from session storage on mount 	|
	//\-------------------------------------------------/---------
	useEffect(() => {
		const viewingGID = sessionStorage.getItem('GameHistoryPageProvider::viewingGID');
		if (viewingGID) {
			const historyPositionString = sessionStorage.getItem('GameHistoryPageProvider::historyPosition');
			const historyPosition = historyPositionString ? parseInt(historyPositionString) : 0;
			loadGame(viewingGID, historyPosition);
		}
	}, [loadGame]);

	//+-------------------------------------------------\---------
	//|   	    Render: Provide context value		 	|
	//\-------------------------------------------------/---------
	const contextValue: GameHistoryPageContextValue = {
		...state, loadGame, downloadGame, leaveGame, setHistoryPosition
	};
	return (
		<GameHistoryPageContext.Provider value={contextValue} >
			{children}
		</GameHistoryPageContext.Provider>
	);
}

export { GameHistoryPageProvider };
