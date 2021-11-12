import React from 'react';
import { OnUpdateFunc, UnregisterFunc } from './Notifier';

type FirebaseListenerContextValue = {
	registerUserListener(onUpdate: OnUpdateFunc): UnregisterFunc;
	registerGameListListener(onUpdate: OnUpdateFunc): UnregisterFunc;
	registerGameListener(onUpdate: OnUpdateFunc, gid: string): UnregisterFunc;
};
const FirebaseListenerContext = React.createContext<FirebaseListenerContextValue | undefined>(undefined);

function useFirebaseListenerContext() {
	let context = React.useContext(FirebaseListenerContext);
	if (context === undefined)
		throw new Error('useFirebaseListenerContext must be used in a child component of FirebaseListener.Provider');
	return context;
}

export type { FirebaseListenerContextValue };
export { FirebaseListenerContext, useFirebaseListenerContext };