import React from 'react';
import AuthUserContext from './AuthUserContext';
import { withFirebase } from '../Firebase';

//+----------------------\------------------------------------
//|	  withAuthProvider	 |
//\----------------------/
//	Wrap a component to act as the single provider of 
//	information about the signed-in user.
//\-----------------------------------------------------------
const withAuthProvider = (Component) => {
	class WithAuthProvider extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				authUser: JSON.parse(localStorage.getItem('authUser')),
			};
		}

		componentDidMount() {
			const onSignIn = (authUser) => {
				localStorage.setItem('authUser', JSON.stringify(authUser));
				this.setState({ authUser });
			};
			const onSignOut = () => {
				localStorage.removeItem('authUser');
				this.setState({ authUser: null });
			};
			this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
		}

		componentWillUnmount() {
			this.unregisterAuthListener();
		}

		render() {
			return (
				<AuthUserContext.Provider value={this.state.authUser}>
					<Component {...this.props} />
				</AuthUserContext.Provider>
			);
		}
	}

	return withFirebase(WithAuthProvider);
};

export default withAuthProvider;