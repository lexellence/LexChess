import React, { useEffect, useState } from 'react';
import { PlayAPIContext, PlayAPIContextValue, JoinAPIContext, JoinAPIContextValue, JoinGameValue } from '.';
import Firebase, { useFirebaseContext } from '../Firebase';
import * as api from './api';

//+--------------------------------\--------------------------
//|	 	     APIProvider   	       |
//\--------------------------------/
//------------------------------------------------------------
const APIProvider: React.FC = ({ children }) => {
	const firebase: Firebase = useFirebaseContext();
	const [authUser, setAuthUser] = useState<Object | null>(null);
	const [isCreatingGame, setCreatingGame] = useState<boolean>(false);
	const [joiningGameData, setJoiningGameData] = useState<JoinGameValue>({ isJoining: false });

	const [isMovingTable, _setMovingTable] = useState<{ [gid: string]: boolean }>({});
	function setMoving(gid: string, isMoving: boolean): void {
		const newTable = { ...isMovingTable, [gid]: isMoving };
		if (!isMoving)
			delete newTable[gid];
		_setMovingTable(newTable);
	}

	const [isQuittingTable, _setQuittingTable] = useState<{ [gid: string]: boolean }>({});
	function setQuitting(gid: string, isQuitting: boolean): void {
		const newTable = { ...isQuittingTable, [gid]: isQuitting };
		if (!isQuitting)
			delete newTable[gid];
		_setQuittingTable(newTable);
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
		if (joiningGameData.isJoining)
			return;

		setJoiningGameData({ isJoining: true, gid, team });
		api.joinGame(authUser, gid, team).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setJoiningGameData({ isJoining: false });
		});
	};
	//+--------------------------------\--------------------------
	//|	 	      createGame		   |
	//\--------------------------------/
	//------------------------------------------------------------
	function createGame(team: string) {
		if (isCreatingGame)
			return;

		setCreatingGame(true);
		api.createGame(authUser, team).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setCreatingGame(false);
		});
	};
	//+--------------------------------\--------------------------
	//|	 	      	move			   |
	//\--------------------------------/
	//------------------------------------------------------------
	function move(gid: string, moveString: string) {
		if (isMovingTable[gid])
			return;

		setMoving(gid, true);
		api.move(authUser, gid, moveString).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setMoving(gid, false);
		});
	};
	//+--------------------------------\--------------------------
	//|	 	 	  leaveGame	     	   |
	//\--------------------------------/
	//------------------------------------------------------------
	function leaveGame(gid: string) {
		if (isQuittingTable[gid])
			return;

		setQuitting(gid, true);
		api.leaveGame(authUser, gid).catch(errorMessage => {
			console.log(errorMessage);
			alert(errorMessage);
		}).finally(() => {
			setQuitting(gid, false);
		});
	};

	const playAPIValue: PlayAPIContextValue = {
		move, leaveGame, isMovingTable, isQuittingTable
	};
	const joinAPIValue: JoinAPIContextValue = {
		joinGame, createGame, isCreatingGame, joiningGameData
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