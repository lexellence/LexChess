import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential';
const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an email address to this social account already exists. 
  Try to login from this account instead and associate your social accounts on your personal account page.
`;

const INITIAL_STATE = {
	email: '',
	password: '',
	error: null,
};

function SignInFormBase({ firebase }) {
	const [state, setState] = useState({ ...INITIAL_STATE });

	function onSubmit(event) {
		const { email, password } = state;
		firebase.doSignInWithEmailAndPassword(email, password)
			.then(result => setState({ ...INITIAL_STATE }))
			.catch(error => setState({ ...state, error }));
		event.preventDefault();
	};
	function onChange(event) {
		setState({ ...state, [event.target.name]: event.target.value });
	}

	const isInvalid = (state.password === '' || state.email === '');
	return (
		<form onSubmit={onSubmit} >
			<input
				name="email"
				value={state.email}
				onChange={onChange}
				type="text"
				placeholder="Email Address"
			/>
			<input
				name="password"
				value={state.password}
				onChange={onChange}
				type="password"
				placeholder="Password"
			/>
			<button disabled={isInvalid} type="submit">Sign-in</button>

			{state.error && <p className="text-danger">{state.error.message}</p>}
		</form>
	);
}

const SignInForm =
	withFirebase(
		SignInFormBase);

function SignInSocialMedia({ name, doSignIn, disabled }) {
	const [error, setError] = useState(null);

	function onSubmit(event) {
		doSignIn()
			.then(result => setError(null))
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				setError(error);
			});
		event.preventDefault();
	}

	return (
		<form onSubmit={onSubmit}>
			<button type='submit' disabled={disabled}>Sign In with {name}</button> {disabled && '(coming soon)'}
			{error && <p className="text-danger">{error.message}</p>}
		</form>
	);
}

function SignInPageBase({ firebase }) {
	// Redirect on sign-in
	const navigate = useNavigate();
	useEffect(() => {
		const onSignIn = authUser => navigate(ROUTES.GAME_LIST);
		const onSignOut = () => null;
		const unregisterAuthListener = firebase.onAuthUserListener(onSignIn, onSignOut);
		return unregisterAuthListener;
	});

	return (
		<div className='authPage'>
			<h1>Sign In</h1>
			<div className='authForm'>
				<SignInForm />
				<pre className="mt-2"><Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link></pre>
			</div>
			<h1 className="mt-3">Other Ways to Sign In</h1>
			<SignInSocialMedia name='Google' doSignIn={firebase.doSignInWithGoogle} />
			{/* <SignInSocialMedia name='Facebook' doSignIn={firebase.doSignInWithFacebook} disabled /> */}
			{/* <SignInSocialMedia name='Twitter' doSignIn={firebase.doSignInWithTwitter} disabled /> */}
			<pre className="mt-3"><p>Don't have an account? <Link to={ROUTES.SIGN_UP}>Create one</Link></p></pre>
		</div>
	);
}

const SignInPage =
	withFirebase(
		SignInPageBase);

export { SignInPage };

