import React from 'react';
import AuthUserContext from './AuthUserContext';
import { withFirebase } from '../Firebase';

//+----------------------\------------------------------------
//|	 withAuthentication	 | 
//\----------------------/
//	Wrap a component to act as the single provider of 
//	information about the signed-in user.
//\-----------------------------------------------------------
const withAuthentication = Component => {
	class WithAuthentication extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				authUser: JSON.parse(localStorage.getItem('authUser')),
			};
		}

		componentDidMount() {
			this.listener = this.props.firebase.onAuthUserListener(
				// next(authUser)
				authUser => {
					localStorage.setItem('authUser', JSON.stringify(authUser));
					this.setState({ authUser });
				},
				// fallback()
				() => {
					localStorage.removeItem('authUser');
					this.setState({ authUser: null });
				},
			);
		}

		componentWillUnmount() {
			this.listener();
		}

		render() {
			return (
				<AuthUserContext.Provider value={this.state.authUser}>
					<Component {...this.props} />
				</AuthUserContext.Provider>
			);
		}
	}

	return withFirebase(WithAuthentication);
};

export default withAuthentication;