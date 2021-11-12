import * as React from 'react';
import firebaseApp from 'firebase/app';

type AuthUserContextValue = firebaseApp.User | null;
const AuthUserContext = React.createContext<AuthUserContextValue | undefined>(undefined);

function useAuthUserContext() {
	let context = React.useContext(AuthUserContext);
	if (context === undefined)
		throw new Error('useAuthUserContext must be used in a child component of AuthUserContext.Provider');
	return context;
}

export type { AuthUserContextValue };
export { AuthUserContext, useAuthUserContext };