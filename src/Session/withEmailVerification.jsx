import * as React from 'react';

import { AuthUserContext } from './AuthUserContext';
import { withFirebase } from '../Firebase';

const needsEmailVerification = (authUser) =>
	authUser &&
	!authUser.emailVerified &&
	authUser.providerData
		.map(provider => provider.providerId)
		.includes('password');

//+------------------------------\----------------------------
//|	   withEmailVerification	 |
//\------------------------------/
//	Wrap around other components to protect them from unverified users
//\-----------------------------------------------------------
const withEmailVerification =
	Component => {
		class WithEmailVerification extends React.Component {
			constructor(props) {
				super(props);

				this.state = { isSent: false };
			}

			onSendEmailVerification = () => {
				this.props.firebase
					.doSendEmailVerification()
					.then(() => this.setState({ isSent: true }));
			};

			render() {
				return (
					<AuthUserContext.Consumer>
						{authUser =>
							needsEmailVerification(authUser) ?
								(
									<React.Fragment>
										<h1>Verify Your Email</h1>
										{this.state.isSent ?
											(
												<p>
													Email confirmation sent: Check your email (Spam
													folder included) for a confirmation email.
												</p>
											)
											:
											(
												<p>
													Check your email (Spam folder
													included) for a confirmation email or send
													another confirmation email.
												</p>
											)}
										<p><b>Refresh this page once you confirmed your email.</b></p>
										<button
											type="button"
											onClick={this.onSendEmailVerification}
											disabled={this.state.isSent}>
											Send another confirmation email
										</button>
									</React.Fragment>
								)
								:
								(
									<Component {...this.props} />
								)
						}
					</AuthUserContext.Consumer>
				);
			}
		}

		return withFirebase(WithEmailVerification);
	};

export { withEmailVerification };