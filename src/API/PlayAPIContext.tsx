import React from 'react';

type PlayAPIContextValue = {
	visitGame(gid: string): void;
	move(gid: string, moveString: string): void;
	leaveGame(gid: string): void;
	isMovingTable: { [gid: string]: boolean };
	isQuittingTable: { [gid: string]: boolean };
}

const PlayAPIContext = React.createContext<PlayAPIContextValue | undefined>(undefined);

function usePlayAPIContext() {
	let context = React.useContext(PlayAPIContext);
	if (context === undefined)
		throw new Error('usePlayAPIContext must be used in a child component of APIProvider');
	return context;
}

export type { PlayAPIContextValue };
export { PlayAPIContext, usePlayAPIContext };