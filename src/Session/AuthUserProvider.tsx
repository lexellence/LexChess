import React, { useEffect, useState } from 'react';
import { AuthUserContext, AuthUserContextValue } from './AuthUserContext';
import { Firebase, useFirebaseContext } from '../Firebase';

//+----------------------\------------------------------------
//|	  AuthUserProvider	 |
//\----------------------/
//	The single provider of information about the signed-in user.
//\-----------------------------------------------------------
interface Props {
	children: React.ReactNode;
}
const AuthUserProvider: React.FC<Props> = ({ children }) => {
	const storedAuthUser = localStorage.getItem('authUser');
	const [authUser, setAuthUser] = useState<AuthUserContextValue>(storedAuthUser ? JSON.parse(storedAuthUser) : null);

	//+----------------------------------\------------------------
	//|	  		 Mount/Unmount			 |
	//\----------------------------------/------------------------
	const firebase: Firebase = useFirebaseContext();
	useEffect(() => {
		function onSignIn(newAuthUser: any) {
			localStorage.setItem('authUser', JSON.stringify(newAuthUser));
			setAuthUser(newAuthUser);
		}
		function onSignOut() {
			localStorage.removeItem('authUser');
			setAuthUser(null);
		}
		const unregisterAuthListener = firebase.onAuthUserListener(onSignIn, onSignOut);
		return () => {
			if (unregisterAuthListener)
				unregisterAuthListener();
		};
	}, [firebase]);

	//+----------------------------------\------------------------
	//|	  	 		Render				 |
	//\----------------------------------/------------------------
	return (
		<AuthUserContext.Provider value={authUser}>
			{children}
		</AuthUserContext.Provider>
	);
};

export { AuthUserProvider };