import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';
import * as LIMITS from './constants/charlimits';

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
				autoComplete="off"
				placeholder="Email Address"
				maxLength={LIMITS.MAX_CHARS_EMAIL}
			/>
			<input
				name="password"
				value={state.password}
				onChange={onChange}
				type="password"
				autoComplete="off"
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

	const buttonText = disabled ? <s>Sign in with {name}</s> : <>Sign in with {name}</>;
	return (
		<form onSubmit={onSubmit}>
			<button type='submit' disabled={disabled}>
				{buttonText}
			</button>
			{error && <p className="text-danger">{error.message}</p>}
		</form >
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
		<div id='auth-page'>
			<section>
				<h1>Sign In</h1>
				<div className='auth-form'>
					<SignInForm />
				</div>
				<pre className="mt-2"><Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link></pre>
			</section>
			<section>
				<h1 className="mt-3">Other Sign In Methods</h1>
				<div className='auth-form'>
					<SignInSocialMedia name='Google' doSignIn={firebase.doSignInWithGoogle} />
					<hr />
					<h6>Coming soon</h6>
					<SignInSocialMedia name='Facebook' doSignIn={firebase.doSignInWithFacebook} disabled />
					<SignInSocialMedia name='Twitter' doSignIn={firebase.doSignInWithTwitter} disabled />
				</div>
				<pre className="mt-3"><p>Don't have an account? <Link to={ROUTES.SIGN_UP}>Create one</Link></p></pre>
			</section>
		</div>
	);
}

const SignInPage =
	withFirebase(
		SignInPageBase);

export { SignInPage };

