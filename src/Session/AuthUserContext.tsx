import { useContext, createContext } from 'react';
import { User } from 'firebase/auth';

type AuthUserContextValue = User | null;
const AuthUserContext = createContext<AuthUserContextValue | undefined>(undefined);

function useAuthUserContext() {
	let context = useContext(AuthUserContext);
	if (context === undefined)
		throw new Error('useAuthUserContext must be used in a child component of AuthUserContext.Provider');
	return context;
}

export type { AuthUserContextValue };
export { AuthUserContext, useAuthUserContext };