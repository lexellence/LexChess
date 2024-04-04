import { createContext } from 'react';

type JoinGameValue = {
	isJoining: boolean;
	gid?: string;
	team?: string;
}
type JoinAPIContextValue = {
	joinGame(gid: string, team: string): void;
	createGame(team: string, minutesPerPlayer: string, incrementSecondsPerTurn: string): void;
	isCreatingGame: boolean;
	joiningGameData: JoinGameValue;
}

const JoinAPIContext = createContext<JoinAPIContextValue | undefined>(undefined);

export type { JoinAPIContextValue, JoinGameValue };
export { JoinAPIContext };