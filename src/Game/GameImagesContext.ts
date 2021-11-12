import * as React from 'react';

type GameImagesContextValue = {
	board: HTMLImageElement | null;
	pieces: HTMLImageElement[] | null;
};

const GameImagesContext = React.createContext<GameImagesContextValue | undefined>(undefined);

function useGameImagesContext() {
	let context = React.useContext(GameImagesContext);
	if (context === undefined)
		throw new Error('useGameImagesContext must be used in a child component of GameImagesContext.Provider');
	return context;
}

export type { GameImagesContextValue };
export { GameImagesContext, useGameImagesContext };