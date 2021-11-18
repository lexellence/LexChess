import { useContext } from "react";
import { GameImagesContext } from ".";

function useGameImagesContext() {
	let context = useContext(GameImagesContext);
	if (context === undefined)
		throw new Error('useGameImagesContext must be used in a child component of GameImagesContext.Provider');
	return context;
}

export { useGameImagesContext };