import { createContext } from 'react';

type PlayAPIContextValue = {
	visitGame(gid: string): void;
	move(gid: string, moveString: string): void;
	leaveGame(gid: string): void;
	isMovingTable: { [gid: string]: boolean };
	isQuittingTable: { [gid: string]: boolean };
}

const PlayAPIContext = createContext<PlayAPIContextValue | undefined>(undefined);

export type { PlayAPIContextValue };
export { PlayAPIContext };