import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';
// import * as ROLES from './constants/roles';

const INITIAL_STATE = {
	email: '',
	passwordOne: '',
	passwordTwo: '',
	displayName: '',
	// isAdmin: false,
	error: null
};

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';
const ERROR_MSG_ACCOUNT_EXISTS = `
	An account with this email address already exists. 
	Try to login with this account instead.
	If you think the account is already used from one of the social logins, try to sign in with one of them.
	Afterward, associate your accounts on your personal account page.`;

class SignUpFormBase extends Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		// const { email, passwordOne, displayName, isAdmin } = this.state;
		const { email, passwordOne, displayName } = this.state;
		// const roles = {};

		// TODO: Where would isAdmin be set to true???
		// if (isAdmin) {
		// 	roles[ROLES.ADMIN] = ROLES.ADMIN;
		// }d

		this.props.firebase
			.doCreateUserWithEmailAndPassword(email, passwordOne)
			.then(credential => credential.user.updateProfile({ displayName }))
			.then(() => this.props.firebase.doSendEmailVerification())
			.then(() => {
				this.setState({ ...INITIAL_STATE });
				this.props.history.push(ROUTES.GAME);
			})
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				this.setState({ error });
			});

		event.preventDefault();
	};

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	render() {
		const { email, passwordOne, passwordTwo, displayName, error } = this.state;

		const isInvalid =
			passwordOne !== passwordTwo ||
			passwordOne === '' ||
			email === '' ||
			displayName === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="email"
					value={email}
					onChange={this.onChange}
					type="text"
					placeholder="Email Address"
				/>
				<input
					name="passwordOne"
					value={passwordOne}
					onChange={this.onChange}
					type="password"
					placeholder="Password"
				/>
				<input
					name="passwordTwo"
					value={passwordTwo}
					onChange={this.onChange}
					type="password"
					placeholder="Confirm Password"
				/>
				<input
					name="displayName"
					value={displayName}
					onChange={this.onChange}
					type="text"
					placeholder="Display Name"
				/>
				<button disabled={isInvalid} type="submit">Sign Up</button>

				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

const SignUpForm = compose(
	withRouter,
	withFirebase,
)(SignUpFormBase);

const SignUpPage = () => (
	<div>
		<h1>Sign Up</h1>
		<SignUpForm />
	</div>
);
export default SignUpPage;

