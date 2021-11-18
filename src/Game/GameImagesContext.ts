import { createContext } from 'react';

type GameImagesContextValue = {
	board: HTMLImageElement | null;
	pieces: HTMLImageElement[] | null;
};
const GameImagesContext = createContext<GameImagesContextValue | undefined>(undefined);

export type { GameImagesContextValue };
export { GameImagesContext };