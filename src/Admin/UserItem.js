import React from 'react';

import { withFirebase } from '../Firebase';

class UserItemBase extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			user: null,
			...props.location.state,
		};
	}

	componentDidMount() {
		if (this.state.user) {
			return;
		}

		this.setState({ loading: true });

		this.props.firebase
			.userRef(this.props.match.params.id)
			.on('value', snapshot => {
				this.setState({
					user: snapshot.val(),
					loading: false,
				});
			});
	}

	componentWillUnmount() {
		this.props.firebase.user(this.props.match.params.id).off();
	}

	onSendPasswordResetEmail = () => {
		this.props.firebase.doPasswordReset(this.state.user.email);
	};

	render() {
		const { user, loading } = this.state;

		return (
			<React.Fragment>
				<h2>User ({this.props.match.params.id})</h2>
				{loading && <div>Loading ...</div>}

				{user && (
					<React.Fragment>
						<span>
							<strong>ID:</strong> {user.uid}
						</span>
						<span>
							<strong>In game?</strong> {user.inGame}
						</span>
						{user.inGame &&
							<span>
								<strong>Game ID:</strong> {user.gid}
							</span>
						}
						<span>
							<button
								type="button"
								onClick={this.onSendPasswordResetEmail}>
								Send Password Reset
							</button>
						</span>
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}
const UserItem = withFirebase(UserItemBase);

export { UserItem };