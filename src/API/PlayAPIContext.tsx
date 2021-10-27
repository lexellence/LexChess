import React from 'react';

type PlayAPIContextValue = {
	move(gid: string, moveString: string): void;
	leaveGame(gid: string): void;
	isWaitingForMoveTable: { [gid: string]: boolean };	// key = gid
	isWaitingForQuitTable: { [gid: string]: boolean };	// key = gid
}

const PlayAPIContext = React.createContext<PlayAPIContextValue | undefined>(undefined);

function usePlayAPIContext() {
	let context = React.useContext(PlayAPIContext);
	if (context === undefined)
		throw new Error('usePlayAPIContext must be used in a child component of APIProvider');
	return context;
}

export type { PlayAPIContextValue };
export { usePlayAPIContext };
export default PlayAPIContext;
