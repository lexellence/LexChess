import * as React from 'react';
import { fetchSignInMethodsForEmail, linkWithPopup, linkWithCredential, unlink } from "firebase/auth";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {
	useAuthUserContext,
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { withFirebase } from '../Firebase';
import { DisplayNameChangeForm } from './DisplayNameChangeForm';
import { EmailChangeForm } from './EmailChangeForm';
import { PasswordChangeForm } from './PasswordChangeForm';

const SIGN_IN_METHODS = [
	{ id: 'password', provider: null, comingSoon: false },
	{ id: 'google.com', provider: 'googleProvider', comingSoon: false },
	{ id: 'facebook.com', provider: 'facebookProvider', comingSoon: true },
	{ id: 'twitter.com', provider: 'twitterProvider', comingSoon: true }];

const SocialLoginToggle = ({
	onlyOneLeft,
	isEnabled,
	signInMethod,
	onLink,
	onUnlink
}) =>
	isEnabled ?
		<Button className="mb-1"
			type="button"
			onClick={() => onUnlink(signInMethod.id)}
			disabled={onlyOneLeft}>
			Deactivate {signInMethod.id}
		</Button>
		:
		<Button className="mb-1"
			type="button"
			onClick={() => onLink(signInMethod.provider)}
			disabled={signInMethod.comingSoon}>
			Link {signInMethod.id}
		</Button>;

class LoginManagementBase extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeSignInMethods: [],
			error: null,
			hideAll: false
		};
	}
	componentDidMount() {
		this.fetchSignInMethods();
	}

	fetchSignInMethods = () => {
		fetchSignInMethodsForEmail(this.props.firebase.auth, this.props.email)
			.then(activeSignInMethods => this.setState({ activeSignInMethods, error: null, hideAll: false }))
			.catch(error => {
				this.setState({ error, hideAll: true });
			});
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
		if (this.state.hideAll)
			return <>{error && error.message}</>;
		else
			return (
				<>
					{SIGN_IN_METHODS.map(signInMethod => {
						const onlyOneLeft = activeSignInMethods.length === 1;
						const isEnabled = activeSignInMethods.includes(signInMethod.id);
						return (
							<div key={signInMethod.id}>
								{signInMethod.id === 'password' ?
									null
									:
									<div style={{ display: "block" }} >
										<SocialLoginToggle
											onlyOneLeft={onlyOneLeft}
											isEnabled={isEnabled}
											signInMethod={signInMethod}
											onLink={this.onSocialLoginLink}
											onUnlink={this.onUnlink} />
										{signInMethod.comingSoon &&
											"(coming soon)"
										}
										{(!signInMethod.comingSoon && isEnabled && onlyOneLeft) &&
											"(no other method available)"
										}
									</div >
								}
							</div>
						);
					})}
					{error && error.message}
				</>
			);
	}
}

const LoginManagement = withFirebase(LoginManagementBase);

function AccountPageBase() {
	const authUser = useAuthUserContext();

	return (
		<section id="account-page" className="selectable">
			<h1>My Account</h1>
			<Container style={{ maxWidth: "800px" }} className="text-start">
				<Row>
					<Col className="mx-auto">
						<Card style={{ width: '20rem' }} className="mb-4" border="primary">
							<Card.Header>Email</Card.Header>
							<Card.Body>
								<Card.Text>{authUser.email}</Card.Text>
								<EmailChangeForm />
							</Card.Body>
						</Card>
					</Col>
					<Col>
						<Card style={{ width: '20rem' }} className="mb-4" border="primary">
							<Card.Header>Display Name</Card.Header>
							<Card.Body>
								<Card.Text>{authUser.displayName}</Card.Text>
								<DisplayNameChangeForm />
							</Card.Body>
						</Card>
					</Col>
				</Row>
				<Row>
					<Col>
						<Card style={{ width: '20rem' }} className="mb-4" border="primary">
							<Card.Header>Password</Card.Header>
							<Card.Body>
								<PasswordChangeForm />
							</Card.Body>
						</Card>
					</Col>
					<Col>
						<Card style={{ width: '26rem' }} className="mb-4" border="primary">
							<Card.Header>Social Sign In Methods</Card.Header>
							<Card.Body>
								<LoginManagement email={authUser.email} />
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</section>
	);
}

const AccountPage = withEmailVerification(
	withAuthorization(authUser => Boolean(authUser))(
		AccountPageBase));

export { AccountPage };
