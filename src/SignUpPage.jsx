import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

import { useFirebaseContext } from './Firebase';
import * as ROUTES from './constants/routes';
import * as LIMITS from './constants/charlimits';

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';
const ERROR_MSG_ACCOUNT_EXISTS = `
	An account with this email address already exists. 
	Try to login with this account instead.
	If you think the account is already used from one of the social logins, try to sign in with one of them.
	Afterward, associate your accounts on your personal account page.`;

function SignUpForm() {
	const navigate = useNavigate();
	const firebase = useFirebaseContext();

	const [email, setEmail] = useState('');
	const [passwordOne, setPasswordOne] = useState('');
	const [passwordTwo, setPasswordTwo] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [errorMessage, setErrorMessage] = useState(null);

	function onSubmit(e) {
		// Prevent the browser from reloading the page
		e.preventDefault();

		firebase.doCreateUserWithEmailAndPassword(email, passwordOne)
			.then(userCredential => {
				// console.log('userCredential.user=', userCredential.user);
			})
			.then(() => firebase.doDisplayNameUpdate(displayName))
			.then(() => {
				localStorage.setItem('refreshTokenOnNextAPICall', '1');
				return firebase.doSendEmailVerification();
			})
			.then(() => {
				navigate(ROUTES.GAME_LIST);
			})
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				setErrorMessage(error.message);
			});
	}

	const isInvalid =
		passwordOne !== passwordTwo ||
		passwordOne === '' ||
		email === '' ||
		displayName === '';

	return (
		<form onSubmit={onSubmit}>
			<input
				name="email"
				value={email}
				onChange={e => setEmail(e.target.value)}
				type="text"
				placeholder="Email Address"
				maxLength={LIMITS.MAX_CHARS_EMAIL}
			/>
			<input
				name="passwordOne"
				value={passwordOne}
				onChange={e => setPasswordOne(e.target.value)}
				type="password"
				placeholder="Password"
			/>
			<input
				name="passwordTwo"
				value={passwordTwo}
				onChange={e => setPasswordTwo(e.target.value)}
				type="password"
				placeholder="Confirm Password"
			/>
			<input
				name="displayName"
				value={displayName}
				onChange={e => setDisplayName(e.target.value)}
				type="text"
				placeholder="Display Name"
				maxLength={LIMITS.MAX_CHARS_DISPLAY_NAME}
			/>
			<button disabled={isInvalid} type="submit">Sign Up</button>
			{errorMessage && <p>{errorMessage}</p>}
		</form>
	);
}

const SignUpPage = () => (
	<section id='auth-page'>
		<h1>Create a New Account</h1>
		<div className='auth-form'>
			<SignUpForm />
		</div>
		<pre className="mt-3"><p>Already have an account? <Link to={ROUTES.SIGN_IN}>Sign in</Link></p></pre>
	</section>
);

export { SignUpPage };