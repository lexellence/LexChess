import { useContext } from "react";
import { GameHistoryPageContext } from "./GameHistoryPageContext";

function useGameHistoryPageContext() {
	let context = useContext(GameHistoryPageContext);
	if (context === undefined)
		throw new Error('useGameHistoryPageContext must be used in a child component of GameHistoryPageContext.Provider');
	return context;
}

export { useGameHistoryPageContext };