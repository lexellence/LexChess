import React from 'react';
import { Link, withRouter } from 'react-router-dom';

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

class SignInFormBase extends React.Component {
	state = { ...INITIAL_STATE };

	onSubmit = event => {
		const { email, password } = this.state;
		this.props.firebase.doSignInWithEmailAndPassword(email, password)
			.then(result => this.setState({ ...INITIAL_STATE }))
			.catch(error => this.setState({ error }));
		event.preventDefault();
	};
	onChange = event => this.setState({ [event.target.name]: event.target.value });
	render() {
		const { email, password, error } = this.state;
		const isInvalid =
			password === '' || email === '';
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

class SignInGoogleBase extends React.Component {
	state = { error: null };

	onSubmit = event => {
		this.props.firebase.doSignInWithGoogle()
			.then(result => this.setState({ error: null }))
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

class SignInFacebookBase extends React.Component {
	state = { error: null };

	onSubmit = event => {
		this.props.firebase.doSignInWithFacebook()
			.then(result => {
				this.setState({ error: null });
			}).catch(error => {
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
				<button disabled={true} type="submit">Sign In with Facebook</button> (coming soon)
				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

class SignInTwitterBase extends React.Component {
	state = { error: null };

	onSubmit = event => {
		this.props.firebase.doSignInWithTwitter()
			.then(result => {
				this.setState({ error: null });
			}).catch(error => {
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
				<button disabled={true} type="submit">Sign In with Twitter</button> (coming soon)
				{error && <p>{error.message}</p>}
			</form>
		);
	}
}

const SignInForm =
	withRouter(
		withFirebase(
			SignInFormBase));

const SignInGoogle =
	withRouter(
		withFirebase(
			SignInGoogleBase));

const SignInFacebook =
	withRouter(
		withFirebase(
			SignInFacebookBase));

const SignInTwitter =
	withRouter(
		withFirebase(
			SignInTwitterBase));

class SignInPageBase extends React.Component {
	componentDidMount() {
		// Redirect on sign-in
		const onSignIn = authUser => this.props.history.push(ROUTES.GAME_LIST);
		const onSignOut = () => null;
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	}
	componentWillUnmount = () => this.unregisterAuthListener();

	render() {
		return (
			<React.Fragment>
				<h1>Sign In</h1>
				<SignInForm />
				<SignInGoogle />
				<SignInFacebook />
				<SignInTwitter />
				<p><Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link></p>
				<pre><p>Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign-up</Link></p></pre>

			</React.Fragment>
		);
	}
}

const SignInPage =
	withRouter(
		withFirebase(
			SignInPageBase));

export default SignInPage;

