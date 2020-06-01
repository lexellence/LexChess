import React from 'react';
import AuthUserContext from './AuthUserContext';

const withAuthUser = Component => props => (
	<AuthUserContext.Consumer>
		{authUser => <Component {...props} authUser={authUser} />}
	</AuthUserContext.Consumer>
);

export default withAuthUser;