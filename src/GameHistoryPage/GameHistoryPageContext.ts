import { createContext } from 'react';

type GameHistoryPageContextValue = {
	loadingGID: string | null;
	game: Object | null;
	loadGame(gid: string, historyPosition?: number): void;
	downloadGame(gid: string): void;
	leaveGame(): void;
	setHistoryPosition(newPosition: number): void;
}
const GameHistoryPageContext = createContext<GameHistoryPageContextValue | undefined>(undefined);

export type { GameHistoryPageContextValue };
export { GameHistoryPageContext };