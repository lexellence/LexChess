import * as React from 'react';
import { FirebaseContext } from './FirebaseContext';

const withFirebase =
	Component =>
		props => (
			<FirebaseContext.Consumer>
				{firebase => <Component {...props} firebase={firebase} />}
			</FirebaseContext.Consumer>
		);

export { withFirebase };