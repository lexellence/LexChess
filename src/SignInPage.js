import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import to from 'await-to-js';

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

class SignInFormBase extends Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		const { email, password } = this.state;
		this.props.firebase.doSignInWithEmailAndPassword(email, password)
			.then(result => {
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

class SignInGoogleBase extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	onSubmit = event => {
		this.props.firebase.doSignInWithGoogle().then(result => {
			this.setState({ error: null });
			this.props.history.push(ROUTES.GAME);
		}).catch(error => {
			if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
				error.message = ERROR_MSG_ACCOUNT_EXISTS;
			this.setState({ error });
		});
		event.preventDefault();


		// event.preventDefault();
		// alert('onSubmit');
		// this.props.firebase.doSignInWithGoogle()
		// 	.then(result => {
		// 		alert(JSON.stringify(result));
		// 		const user = result.user;
		// 		// Create a user (or update existing user) in Firebase Realtime Database
		// 		const userRef = this.props.firebase.userRef(user.uid);
		// 		// let [error, snapshot] = await to(userRef.once('value'));
		// 		// if (error)
		// 		// 	alert(error);
		// 		// else if (snapshot.val())
		// 		// 	await userRef.update({ displayName });
		// 		// else
		// 		alert(JSON.stringify(userRef));
		// 		userRef.set({ inGame: false, displayName: user.displayName, roles: {} });
		// 		alert('didset');
		// 		this.setState({ error: null });
		// 		this.props.history.push(ROUTES.GAME);
		// 	})
		// 	.catch(error => {
		// 		alert(JSON.stringify(error));

		// 		if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
		// 			error.message = ERROR_MSG_ACCOUNT_EXISTS;
		// 		this.setState({ error });
		// 	});
		// alert('end of onSubmit');

		// this.props.firebase.doSignInWithGoogle
		// 	.then(() => {
		// 		this.setState({ ...INITIAL_STATE });
		// 		this.props.history.push(ROUTES.GAME);
		// 	})
		// 	.catch(error => {
		// 		this.setState({ error });
		// 	});
		// event.preventDefault();
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

	onSubmit = async (event) => {
		try {
			let socialAuthUser = await this.props.firebase.doSignInWithFacebook();

			// Create a user (or update existing user) in Firebase Realtime Database
			const userRef = this.props.firebase.userRef(socialAuthUser.user.uid);
			let snapshot = await userRef.once('value');
			const displayName = socialAuthUser.additionalUserInfo.profile.name;
			if (snapshot.val())
				await userRef.update({ displayName });
			else
				await userRef.set({ inGame: false, displayName, roles: {} });
			this.setState({ error: null });
			this.props.history.push(ROUTES.GAME);
		}
		catch (error) {
			if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
				error.message = ERROR_MSG_ACCOUNT_EXISTS;
			this.setState({ error });
		}
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

	onSubmit = async (event) => {
		try {
			let socialAuthUser = await this.props.firebase.doSignInWithTwitter();

			// Create a user (or update existing user) in Firebase Realtime Database
			const userRef = this.props.firebase.userRef(socialAuthUser.user.uid);
			let snapshot = await userRef.once('value');
			const displayName = socialAuthUser.additionalUserInfo.profile.name;
			if (snapshot.val())
				await userRef.update({ displayName });
			else
				await userRef.set({ inGame: false, displayName, roles: {} });
			this.setState({ error: null });
			this.props.history.push(ROUTES.GAME);
		}
		catch (error) {
			if (error.code === ERROR_CODE_ACCOUNT_EXISTS)
				error.message = ERROR_MSG_ACCOUNT_EXISTS;
			this.setState({ error });
		}
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

const SignInForm = compose(
	withRouter,
	withFirebase,
)(SignInFormBase);

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

