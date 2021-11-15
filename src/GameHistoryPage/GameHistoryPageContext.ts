import * as React from 'react';

type GameHistoryPageContextValue = {
	loadingGID: string | null;
	game: Object | null;
	loadGame(gid: string): void;
	leaveGame(): void;
	historyPosition: number;
	setHistoryPosition(newPosition: number): void;
}
const GameHistoryPageContext = React.createContext<GameHistoryPageContextValue | undefined>(undefined);

function useGameHistoryPageContext() {
	let context = React.useContext(GameHistoryPageContext);
	if (context === undefined)
		throw new Error('useGameHistoryPageContext must be used in a child component of GameHistoryPageContext.Provider');
	return context;
}

export type { GameHistoryPageContextValue };
export { GameHistoryPageContext, useGameHistoryPageContext };