import { useContext } from 'react';
import { PlayAPIContext } from './PlayAPIContext';

function usePlayAPIContext() {
	let context = useContext(PlayAPIContext);
	if (context === undefined)
		throw new Error('usePlayAPIContext must be used in a child component of APIProvider');
	return context;
}

export { usePlayAPIContext };
