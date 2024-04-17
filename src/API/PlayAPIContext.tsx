import { createContext } from 'react';

type PlayAPIContextValue = {
	visitGame(gid: string): void;
	playerReady(gid: string, isReady: string): void;
	isMarkingReadyTable: { [gid: string]: boolean };
	move(gid: string, moveString: string): void;
	isMovingTable: { [gid: string]: boolean };
	leaveGame(gid: string): void;
	isQuittingTable: { [gid: string]: boolean };
}

const PlayAPIContext = createContext<PlayAPIContextValue | undefined>(undefined);

export type { PlayAPIContextValue };
export { PlayAPIContext };