import React from 'react';
import { Firebase } from '.';

const FirebaseContext = React.createContext<Firebase | undefined>(undefined);

function useFirebaseContext() {
	let context = React.useContext(FirebaseContext);
	if (context === undefined)
		throw Error('useFirebaseContext must be used in a child component of a FirebaseContext Provider');
	return context;
}

export { FirebaseContext, useFirebaseContext };