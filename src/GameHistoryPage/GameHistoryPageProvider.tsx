import React, { useState, useCallback, useEffect } from 'react';
import { useAuthUserContext, AuthUserContextValue } from '../Session';
import { GameHistoryPageContext, GameHistoryPageContextValue } from '.';
import { Firebase, useFirebaseContext } from '../Firebase';
import { dbGameToClientGame } from '../Game';
import { date as dateFromKey } from 'firebase-key';
import { move } from '../API/api';

async function getDbGame(gid: string, firebase: Firebase) {
	return new Promise(function (resolve, reject) {
		// Get game from local storage if saved
		const savedGameString = localStorage.getItem('GameHistoryPageProvider::' + gid);
		if (savedGameString) {
			resolve(JSON.parse(savedGameString));
		}
		else {
			// Get game from server
			firebase.db.ref(`games/${gid}`).once('value').then((snapshot: any) => {
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

function getGameSummary(gid: string, dbGame: any) {
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
	let summary: string = 'Game ID: ' + gid + '\n' +
		'White: ' + dbGame.name_w + '\n' +
		'Black: ' + dbGame.name_b + '\n';
	if (result)
		summary += 'Result: ' + result + '\n';
	let movesString: string = '';
	if (dbGame.moves)
		for (let i = 0; i < dbGame.moves.length; i++) {
			movesString += move;
			if (i < dbGame.moves.length - 1)
				movesString += ', ';
		}
	summary += 'Moves: [' + movesString + ']\n';
	return summary;
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

	function setHistoryPosition(newPosition: number) {
		sessionStorage.setItem('GameHistoryPageProvider::historyPosition', newPosition.toString());
		setState({ ...state, historyPosition: newPosition });
	}

	const loadGame = useCallback((gid: string, historyPosition: number): void => {
		if (!historyPosition)
			historyPosition = 0;

		function start(dbGame: any) {
			sessionStorage.setItem('GameHistoryPageProvider::viewingGID', gid);
			sessionStorage.setItem('GameHistoryPageProvider::historyPosition', historyPosition.toString());
			setState({
				loadingGID: null,
				downloadingGID: null,
				game: dbGameToClientGame(dbGame, gid, authUser!.uid),
				historyPosition
			});
		}

		// Get game and start
		setState({ ...INITIAL_STATE, loadingGID: gid });
		getDbGame(gid, firebase)
			.then(dbGame => start(dbGame))
			.catch(() => {
				console.log('GameHistoryPage: Error loading game');
				setState({ ...INITIAL_STATE });
			});
	}, [firebase, authUser]);

	const downloadGame = useCallback((gid: string): void => {
		function serveFile(dbGame: any) {
			const content = getGameSummary(gid, dbGame);
			const atag = document.createElement('a');
			const file = new Blob([content], { type: 'text/plain' });
			const date = dateFromKey(gid);
			atag.href = URL.createObjectURL(file);
			atag.download = dbGame.name_w + ' vs ' + dbGame.name_b + ' ' +
				(date.getMonth() + 1) + '-' + date.getDay() + '-' + date.getFullYear() + ' at ' +
				date.getHours() + '-' + date.getMinutes() + '_' + date.getSeconds() + '-' + date.getMilliseconds() + '.txt';
			atag.click();
			setState({ ...INITIAL_STATE });
		}

		// Get game and serve
		setState({ ...INITIAL_STATE, downloadingGID: gid });
		getDbGame(gid, firebase)
			.then(dbGame => serveFile(dbGame))
			.catch(() => {
				console.log('GameHistoryPage: Error downloading game');
				setState({ ...INITIAL_STATE });
			});
	}, [firebase]);

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
		...state, loadGame, downloadGame, leaveGame, setHistoryPosition
	};
	return (
		<GameHistoryPageContext.Provider value={contextValue} >
			{children}
		</GameHistoryPageContext.Provider>
	);
}

export { GameHistoryPageProvider };
