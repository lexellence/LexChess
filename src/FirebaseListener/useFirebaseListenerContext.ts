import { useContext } from "react";
import { FirebaseListenerContext } from ".";

function useFirebaseListenerContext() {
	let context = useContext(FirebaseListenerContext);
	if (context === undefined)
		throw new Error('useFirebaseListenerContext must be used in a child component of FirebaseListener.Provider');
	return context;
}

export { useFirebaseListenerContext };