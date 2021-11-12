import * as React from 'react';
import { FirebaseListenerContext } from './FirebaseListenerContext';

const withFirebaseListener =
	Component =>
		props => (
			<FirebaseListenerContext.Consumer>
				{firebaseListener => <Component {...props} firebaseListener={firebaseListener} />}
			</FirebaseListenerContext.Consumer>
		);

export { withFirebaseListener };