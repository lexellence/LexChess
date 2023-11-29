import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import { Stack } from 'react-bootstrap';
// import { Form, Button, Card, Alert } from "react-bootstrap";
// import { useAuth } from "../contexts/AuthContext";

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
		// const roles = {};
		// TODO: Where would isAdmin be set to true???
		// if (isAdmin) {
		// 	roles[ROLES.ADMIN] = ROLES.ADMIN;
		// }

		// Prevent the browser from reloading the page
		e.preventDefault();

		firebase.doCreateUserWithEmailAndPassword(email, passwordOne)
			.then(credential => { })
			.then(() => firebase.doDisplayNameUpdate(displayName))
			.then(() => firebase.doSendEmailVerification())
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
			{/* <Stack gap={3} className="mx-auto"> */}

			<input
				name="email"
				value={email}
				onChange={e => setEmail(e.target.value)}
				type="text"
				placeholder="Email Address"
				maxlength={LIMITS.MAX_CHARS_EMAIL}
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
				maxlength={LIMITS.MAX_CHARS_DISPLAY_NAME}
			/>
			<button className="mt-3" disabled={isInvalid} type="submit">Sign Up</button>
			{errorMessage && <p>{errorMessage}</p>}
			{/* </Stack> */}
		</form>
	);
}

const SignUpPage = () => (
	<div style={{ width: "250px", margin: "auto" }}>
		<h1>Sign Up</h1>
		<SignUpForm />
	</div>
);

export { SignUpPage };