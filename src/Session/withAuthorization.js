import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import AuthUserContext from './AuthUserContext';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';

//+----------------------\------------------------------------
//|	 withAuthorization	 |
//\----------------------/
//	Wrap around other components to protect them from unauthorized users
//\-----------------------------------------------------------
const withAuthorization = condition => Component => {
	class WithAuthorization extends React.Component {
		componentDidMount() {
			const onSignIn = authUser => {
				if (!condition(authUser))
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
						condition(authUser) ? <Component {...this.props} /> : null
					}
				</AuthUserContext.Consumer >
			);
		}
	}

	return compose(
		withRouter,
		withFirebase,
	)(WithAuthorization);
};
export default withAuthorization;