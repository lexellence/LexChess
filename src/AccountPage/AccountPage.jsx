import * as React from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSignInMethodsForEmail, linkWithPopup, linkWithCredential, unlink } from "firebase/auth";
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import {
	useAuthUserContext,
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { withFirebase } from '../Firebase';
import { DisplayNameChangeForm } from './DisplayNameChangeForm';
import { EmailChangeForm } from './EmailChangeForm';
import { PasswordChangeForm } from './PasswordChangeForm';
import * as ROUTES from "../constants/routes";

const SIGN_IN_METHODS = [
	{ id: 'password', provider: null },
	{ id: 'google.com', provider: 'googleProvider' },
	{ id: 'facebook.com', provider: 'facebookProvider' },
	{ id: 'twitter.com', provider: 'twitterProvider' }];

const SocialLoginToggle = ({
	onlyOneLeft,
	isEnabled,
	signInMethod,
	onLink,
	onUnlink,
}) =>
	isEnabled ?
		<button
			type="button"
			onClick={() => onUnlink(signInMethod.id)}
			disabled={onlyOneLeft}>
			Deactivate {signInMethod.id}
		</button>
		:
		<button
			type="button"
			onClick={() => onLink(signInMethod.provider)}>
			Link {signInMethod.id}
		</button>;

class DefaultLoginToggle extends React.Component {
	constructor(props) {
		super(props);
		this.state = { passwordOne: '', passwordTwo: '' };
	}

	onSubmit = event => {
		event.preventDefault();

		this.props.onLink(this.state.passwordOne);
		this.setState({ passwordOne: '', passwordTwo: '' });
	};

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	render() {
		const { onlyOneLeft, isEnabled, signInMethod, onUnlink } = this.props;
		const { passwordOne, passwordTwo } = this.state;
		const isInvalid =
			passwordOne !== passwordTwo ||
			passwordOne === '';

		return isEnabled ?
			<button
				type="button"
				onClick={() => onUnlink(signInMethod.id)}
				disabled={onlyOneLeft}>
				Deactivate {signInMethod.id}
			</button>
			:
			<form onSubmit={this.onSubmit}>
				<input
					name="passwordOne"
					value={passwordOne}
					onChange={this.onChange}
					type="password"
					placeholder="New Password" />
				<input
					name="passwordTwo"
					value={passwordTwo}
					onChange={this.onChange}
					type="password"
					placeholder="Confirm New Password" />
				<button disabled={isInvalid} type="submit">
					Link {signInMethod.id}
				</button>
			</form>;
	}
}

class LoginManagementBase extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeSignInMethods: [],
			error: null,
		};
	}
	componentDidMount() {
		this.fetchSignInMethods();
	}

	fetchSignInMethods = () => {
		fetchSignInMethodsForEmail(this.props.firebase.auth, this.props.email)
			.then(activeSignInMethods =>
				this.setState({ activeSignInMethods, error: null }),
			)
			.catch(error => this.setState({ error }));
	};

	onSocialLoginLink = provider => {
		linkWithPopup(this.props.firebase.auth.currentUser, this.props.firebase[provider])
			.then(this.fetchSignInMethods)
			.catch(error => this.setState({ error }));
	};

	onDefaultLoginLink = password => {
		const credential = this.props.firebase.emailAuthProvider.credential(
			this.props.email,
			password,
		);

		linkWithCredential(this.props.firebase.auth.currentUser, credential)
			.then(this.fetchSignInMethods)
			.catch(error => this.setState({ error }));
	};

	onUnlink = providerId => {
		unlink(this.props.firebase.auth.currentUser, providerId)
			.then(this.fetchSignInMethods)
			.catch(error => this.setState({ error }));
	};

	render() {
		const { activeSignInMethods, error } = this.state;
		return (
			<React.Fragment>
				Sign In Methods:
				<ul>
					{SIGN_IN_METHODS.map(signInMethod => {
						const onlyOneLeft = activeSignInMethods.length === 1;
						const isEnabled = activeSignInMethods.includes(signInMethod.id);
						return (
							<li key={signInMethod.id}>
								{signInMethod.id === 'password' ?
									<DefaultLoginToggle
										onlyOneLeft={onlyOneLeft}
										isEnabled={isEnabled}
										signInMethod={signInMethod}
										onLink={this.onDefaultLoginLink}
										onUnlink={this.onUnlink} />
									:
									<SocialLoginToggle
										onlyOneLeft={onlyOneLeft}
										isEnabled={isEnabled}
										signInMethod={signInMethod}
										onLink={this.onSocialLoginLink}
										onUnlink={this.onUnlink} />
								}
							</li>
						);
					})}
				</ul>
				{error && error.message}
			</React.Fragment>
		);
	}
}

const LoginManagement = withFirebase(LoginManagementBase);

function AccountPageBase() {
	const authUser = useAuthUserContext();
	const navigate = useNavigate();

	// Toggle showing email change form
	const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
	const toggleShowEmailChangeForm = useCallback(() => {
		setShowEmailChangeForm(show => !show);
	}, [showEmailChangeForm]);

	// Toggle showing display name change form
	const [showDisplayNameChangeForm, setShowDisplayNameChangeForm] = useState(false);
	const toggleShowDisplayNameForm = useCallback(() => {
		setShowDisplayNameChangeForm(show => !show);
	}, [showDisplayNameChangeForm]);

	// Render
	return (
		<div className='selectable'>
			<h1>My Account Info</h1>
			<Stack gap={3} className="mx-auto text-start">
				<Card style={{ width: '20rem' }} className="mx-auto">
					<Card.Header>Email</Card.Header>
					<Card.Body>
						<Card.Text>{authUser.email}</Card.Text>
						{!showEmailChangeForm &&
							<Button variant="primary" onClick={toggleShowEmailChangeForm}>
								Change
							</Button>
						}
						{showEmailChangeForm &&
							<EmailChangeForm
								afterUpdate={() => navigate(ROUTES.ACCOUNT)}
								onCancel={toggleShowEmailChangeForm} />
						}
					</Card.Body>
				</Card>
				<Card style={{ width: '20rem' }} className="mx-auto">
					<Card.Header>Display Name</Card.Header>
					<Card.Body>
						<Card.Text>{authUser.displayName}</Card.Text>
						{!showDisplayNameChangeForm &&
							<Button variant="primary" onClick={toggleShowDisplayNameForm}>
								Change
							</Button>
						}
						{showDisplayNameChangeForm &&
							<DisplayNameChangeForm
								afterUpdate={() => navigate(ROUTES.ACCOUNT)}
								onCancel={toggleShowDisplayNameForm} />
						}

					</Card.Body>
				</Card>
				<PasswordChangeForm />
				<LoginManagement email={authUser.email} />
			</Stack>
		</div>
	);
}

const AccountPage = withEmailVerification(
	withAuthorization(authUser => Boolean(authUser))(
		AccountPageBase));

export { AccountPage };
