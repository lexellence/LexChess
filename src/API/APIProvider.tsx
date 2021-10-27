import React, { useEffect, useState } from 'react';
import { PlayAPIContext, PlayAPIContextValue, JoinAPIContext, JoinAPIContextValue } from '.';
import Firebase, { useFirebaseContext } from '../Firebase';
import * as api from './api';

//+--------------------------------\--------------------------
//|	 	     APIProvider   	       |
//\--------------------------------/
//------------------------------------------------------------
const APIProvider: React.FC = ({ children }) => {
	const firebase: Firebase = useFirebaseContext();
	const [authUser, setAuthUser] = useState<Object | null>(null);
	const [isWaitingForNewGame, setWaitingForNewGame] = useState<boolean>(false);

	const [isWaitingForMoveTable, _setWaitingForMoveTable] = useState<{ [gid: string]: boolean }>({});
	function setWaitingForMove(gid: string, isWaiting: boolean): void {
		const newTable = { ...isWaitingForMoveTable, [gid]: isWaiting };
		if (!isWaiting)
			delete newTable[gid];
		_setWaitingForMoveTable(newTable);
	}

	const [isWaitingForQuitTable, _setWaitingForQuitTable] = useState<{ [gid: string]: boolean }>({});
	function setWaitingForQuit(gid: string, isWaiting: boolean): void {
		const newTable = { ...isWaitingForQuitTable, [gid]: isWaiting };
		if (!isWaiting)
			delete newTable[gid];
		_setWaitingForQuitTable(newTable);
	}

	//+----------------------------------\------------------------
	//|	  		 Mount/Unmount			 |
	//\----------------------------------/------------------------
	useEffect(() => {
		function onSignIn(newAuthUser: any) {
			setAuthUser(newAuthUser);
		}
		function onSignOut() {
			setAuthUser(null);
		};

		const unregisterAuthListener = firebase?.onAuthUserListener(onSignIn, onSignOut);

		return () => {
			if (unregisterAuthListener)
				unregisterAuthListener();
		}
	}, [firebase]);

	//+--------------------------------\--------------------------
	//|	 	 	   joinGame 	   	   |
	//\--------------------------------/
	//------------------------------------------------------------
	function joinGame(gid: string, team: string) {
		if (isWaitingForNewGame)
			return;

		setWaitingForNewGame(true);
		api.joinGame(authUser, gid, team).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setWaitingForNewGame(false);
		});
	};
	//+--------------------------------\--------------------------
	//|	 	      createGame		   |
	//\--------------------------------/
	//------------------------------------------------------------
	function createGame(team: string) {
		if (isWaitingForNewGame)
			return;

		setWaitingForNewGame(true);
		api.createGame(authUser, team).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setWaitingForNewGame(false);
		});
	};
	//+--------------------------------\--------------------------
	//|	 	      	move			   |
	//\--------------------------------/
	//------------------------------------------------------------
	function move(gid: string, moveString: string) {
		if (isWaitingForMoveTable[gid])
			return;

		setWaitingForMove(gid, true);
		api.move(authUser, gid, moveString).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setWaitingForMove(gid, false);
		});
	};
	//+--------------------------------\--------------------------
	//|	 	 	  leaveGame	     	   |
	//\--------------------------------/
	//------------------------------------------------------------
	function leaveGame(gid: string) {
		if (isWaitingForQuitTable[gid])
			return;

		setWaitingForQuit(gid, true);
		api.leaveGame(authUser, gid).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setWaitingForQuit(gid, false);
		});
	};

	const playAPIValue: PlayAPIContextValue = {
		move, leaveGame, isWaitingForMoveTable, isWaitingForQuitTable
	};
	const joinAPIValue: JoinAPIContextValue = {
		joinGame, createGame, isWaitingForNewGame
	};

	//+----------------------------------\------------------------
	//|	  	 		Render				 |
	//\----------------------------------/------------------------
	return (
		<PlayAPIContext.Provider value={playAPIValue} >
			<JoinAPIContext.Provider value={joinAPIValue} >
				{children}
			</JoinAPIContext.Provider>
		</PlayAPIContext.Provider>
	);
}

export default APIProvider;