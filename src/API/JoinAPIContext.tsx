import React from 'react';

type JoinGameValue = {
	isJoining: boolean;
	gid?: string;
	team?: string;
}
type JoinAPIContextValue = {
	joinGame(gid: string, team: string): void;
	createGame(team: string): void;
	isCreatingGame: boolean;
	joiningGameData: JoinGameValue;
}

const JoinAPIContext = React.createContext<JoinAPIContextValue | undefined>(undefined);

function useJoinAPIContext() {
	let context = React.useContext(JoinAPIContext);
	if (context === undefined)
		throw Error('useJoinAPIContext must be used in a child component of APIProvider');
	return context;
}

export type { JoinAPIContextValue, JoinGameValue };
export { useJoinAPIContext };
export default JoinAPIContext;
