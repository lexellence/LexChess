import { useContext } from 'react';
import { JoinAPIContext } from './JoinAPIContext';

function useJoinAPIContext() {
	let context = useContext(JoinAPIContext);
	if (context === undefined)
		throw Error('useJoinAPIContext must be used in a child component of APIProvider');
	return context;
}

export { useJoinAPIContext };
