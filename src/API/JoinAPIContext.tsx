import React from 'react';

type JoinAPIContextValue = {
	joinGame(gid: string, team: string): void;
	createGame(team: string): void;
	isCreatingGame: boolean;
	isJoiningGame: boolean;
}

const JoinAPIContext = React.createContext<JoinAPIContextValue | undefined>(undefined);

function useJoinAPIContext() {
	let context = React.useContext(JoinAPIContext);
	if (context === undefined)
		throw Error('useJoinAPIContext must be used in a child component of APIProvider');
	return context;
}

export type { JoinAPIContextValue };
export { useJoinAPIContext };
export default JoinAPIContext;
