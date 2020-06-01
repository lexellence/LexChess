import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

const INITIAL_STATE = {
	email: '',
	password: '',
	error: null,
};

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential';
const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an email address to this social account already exists. 
  Try to login from this account instead and associate your social accounts on your personal account page.
`;

class SignInGoogleBase extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	onSubmit = event => {
		this.props.firebase.doSignInWithGoogle()
			.then(socialAuthUser => {
				// Create a user in Firebase Realtime Database
				let userRef = this.props.firebase.userRef(socialAuthUser.user.uid);
				return userRef.set({
					displayName: socialAuthUser.user.displayName,
					email: socialAuthUser.user.email,
					roles: {}
				});
			})
			.then(() => {
				this.setState({ error: null });
				this.props.history.push(ROUTES.GAME);
			})
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				this.setState({ error });
			});
		event.preventDefault();
	};

	render() {
		const { error } = this.state;
		return (
			<form onSubmit={this.onSubmit}>
				<button type="submit">Sign In with Google</button>
				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

class SignInFacebookBase extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	onSubmit = event => {
		this.props.firebase.doSignInWithFacebook()
			.then(socialAuthUser => {
				// Create a user in Firebase Realtime Database
				let userRef = this.props.firebase.userRef(socialAuthUser.user.uid);
				return userRef.set({
					displayName: socialAuthUser.additionalUserInfo.profile.name,
					email: socialAuthUser.additionalUserInfo.profile.email,
					roles: {},
				});
			})
			.then(() => {
				this.setState({ error: null });
				this.props.history.push(ROUTES.GAME);
			})
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				this.setState({ error });
			});
		event.preventDefault();
	};

	render() {
		const { error } = this.state;
		return (
			<form onSubmit={this.onSubmit}>
				<button type="submit">Sign In with Facebook</button>
				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

class SignInTwitterBase extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	onSubmit = event => {
		this.props.firebase.doSignInWithTwitter()
			.then(socialAuthUser => {
				// Create a user in your Firebase Realtime Database too
				let userRef = this.props.firebase.userRef(socialAuthUser.user.uid);
				return userRef.set({
					displayName: socialAuthUser.additionalUserInfo.profile.name,
					email: socialAuthUser.additionalUserInfo.profile.email,
					roles: {},
				});
			})
			.then(() => {
				this.setState({ error: null });
				this.props.history.push(ROUTES.GAME);
			})
			.catch(error => {
				if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
					error.message = ERROR_MSG_ACCOUNT_EXISTS;
				this.setState({ error });
			});
		event.preventDefault();
	};

	render() {
		const { error } = this.state;
		return (
			<form onSubmit={this.onSubmit}>
				<button type="submit">Sign In with Twitter</button>
				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

class SignInFormBase extends Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		const { email, password } = this.state;

		this.props.firebase.doSignInWithEmailAndPassword(email, password)
			.then(() => {
				this.setState({ ...INITIAL_STATE });
				this.props.history.push(ROUTES.GAME);
			})
			.catch(error => {
				this.setState({ error });
			});

		event.preventDefault();
	};

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	render() {
		const { email, password, error } = this.state;

		const isInvalid =
			password === '' ||
			email === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="email"
					value={email}
					onChange={this.onChange}
					type="text"
					placeholder="Email Address" />
				<input
					name="password"
					value={password}
					onChange={this.onChange}
					type="password"
					placeholder="Password" />
				<button disabled={isInvalid} type="submit">Sign-in</button>

				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

const SignInGoogle = compose(
	withRouter,
	withFirebase,
)(SignInGoogleBase);

const SignInFacebook = compose(
	withRouter,
	withFirebase,
)(SignInFacebookBase);

const SignInTwitter = compose(
	withRouter,
	withFirebase,
)(SignInTwitterBase);

const SignInForm = compose(
	withRouter,
	withFirebase,
)(SignInFormBase);

const SignInPage = () => (
	<div>
		<h1>Sign In</h1>
		<SignInForm />
		<SignInGoogle />
		<SignInFacebook />
		<SignInTwitter />
		<p><Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link></p>
		<pre><p>Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign-up</Link></p></pre>

	</div>
);
export default SignInPage;

