import React from 'react';

import { withFirebase } from '../Firebase';

function SignOutButtonBase({ firebase }) {
	return (
		<button type="button" onClick={firebase.doSignOut}>Sign Out</button >
	);
}
const SignOutButton = withFirebase(SignOutButtonBase);

export { SignOutButton };