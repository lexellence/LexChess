import React, { useState, useCallback, useEffect } from 'react';
import { useAuthUserContext, AuthUserContextValue } from '../Session';
import { GameHistoryPageContext, GameHistoryPageContextValue } from '.';
import { Firebase, useFirebaseContext } from '../Firebase';
import { ref, get } from "firebase/database";
import { dbGameToClientGame } from '../Game';
import { date as dateFromKey } from 'firebase-key';

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
//|	  serveGameRecordFileToUser    |
//\--------------------------------/--------------------------
function serveGameRecordFileToUser(gid: string, dbGame: any) {
	const filename = dbGame.name_w + ' vs ' + dbGame.name_b + ' ' + dateFromKey(gid).toString() + '.txt';;
	const content = gameToString(gid, dbGame);

	serveFileToUser(filename, content);
}

//+--------------------------------\--------------------------
//|	    	 gameToString		   |
//\--------------------------------/--------------------------
function gameToString(gid: string, dbGame: any): string {
	let result: string = '';
	switch (dbGame.status) {
		case 'draw': result = 'Draw'; break;
		case 'stale': result = 'Draw (stalemate)'; break;
		case 'ins': result = 'Draw (insufficient material)'; break;
		case '3fold': result = 'Draw (three-fold repetition)'; break;
		case 'cm_w': result = dbGame.name_w + ' won (checkmate)'; break;
		case 'cm_b': result = dbGame.name_b + ' won (checkmate)'; break;
		case 'con_w': result = dbGame.name_w + ' won (concession)'; break;
		case 'con_b': result = dbGame.name_b + ' won (concession)'; break;
	}
	let gameString: string = '';
	gameString += 'Game ID: ' + gid + '\n';
	gameString += 'White: ' + dbGame.name_w + '\n';
	gameString += 'Black: ' + dbGame.name_b + '\n';
	if (result)
		gameString += 'Result: ' + result + '\n';
	let movesString: string = '';
	if (dbGame.moves) {
		const moves = Object.values(dbGame.moves);
		moves.forEach((move, i) => {
			movesString += move;
			const isNotLastMove = (i < moves.length - 1);
			if (isNotLastMove)
				movesString += ', ';
		});
	}
	gameString += 'Moves: [' + movesString + ']\n';
	return gameString;
}

//+--------------------------------\--------------------------
//|	 	    serveFileToUser  	   |
//\--------------------------------/--------------------------
function serveFileToUser(filename: string, fileContent: string) {
	const atag = document.createElement('a');
	const file = new Blob([fileContent], { type: 'text/plain' });
	atag.href = URL.createObjectURL(file);
	atag.download = filename;
	atag.click();
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
