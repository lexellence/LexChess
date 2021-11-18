import { useContext } from 'react';
import { FirebaseContext } from '.';

function useFirebaseContext() {
	let context = useContext(FirebaseContext);
	if (context === undefined)
		throw Error('useFirebaseContext must be used in a child component of a FirebaseContext Provider');
	return context;
}

export { useFirebaseContext };