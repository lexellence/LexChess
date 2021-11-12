import * as React from 'react';
import { withRouter } from 'react-router-dom';

import { AuthUserContext } from './AuthUserContext';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';

//+----------------------\------------------------------------
//|	 withAuthorization	 |
//\----------------------/
//	Wrap around other components to protect them from unauthorized users,
//		who get redirected to sign-in page.
//\-----------------------------------------------------------
const withAuthorization = (conditionFunc) => (Component) => {
	class WithAuthorization extends React.Component {
		componentDidMount() {
			const onSignIn = (authUser) => {
				if (!conditionFunc(authUser))
					this.props.history.push(ROUTES.SIGN_IN);
			};
			const onSignOut = () =>
				this.props.history.push(ROUTES.SIGN_IN);
			this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
		}

		componentWillUnmount() {
			this.unregisterAuthListener();
		}

		render() {
			return (
				<AuthUserContext.Consumer >
					{authUser =>
						// conditionFunc(authUser) ? <Component {...this.props} /> : null
						conditionFunc(authUser) ? <Component {...this.props} /> : <p>Not Authorized</p>
					}
				</AuthUserContext.Consumer >
			);
		}
	}

	return withRouter(withFirebase(WithAuthorization));
};
export { withAuthorization };