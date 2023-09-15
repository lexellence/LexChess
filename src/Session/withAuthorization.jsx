import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { AuthUserContext } from './AuthUserContext';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';

//+----------------------\------------------------------------
//|	 withAuthorization	 |
//\----------------------/
//	Wrap around other components to protect them from unauthorized users,
//		who get redirected to sign-in page.
//\-----------------------------------------------------------
function withAuthorization(conditionFunc) {
	return function (Component) {
		function WithAuthorization(props) {
			// Redirect on non-auth
			const navigate = useNavigate();
			useEffect(() => {
				const onSignIn = (authUser) => {
					if (!conditionFunc(authUser))
						navigate(ROUTES.SIGN_IN);
				};
				const onSignOut = () => navigate(ROUTES.SIGN_IN);
				const unregisterAuthListener = props.firebase.onAuthUserListener(onSignIn, onSignOut);
				return unregisterAuthListener;
			}, [navigate, props.firebase]);

			return (
				<AuthUserContext.Consumer >
					{authUser =>
						conditionFunc(authUser) ? <Component {...props} /> : null
					}
				</AuthUserContext.Consumer >
			);
		}

		return withFirebase(WithAuthorization);
	};
}


export { withAuthorization };