import React from 'react';

import { withFirebase } from '../Firebase';

const INITIAL_STATE = {
	passwordOne: '',
	passwordTwo: '',
	error: null,
};

class PasswordChangeFormBase extends React.Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		const { passwordOne } = this.state;
		this.props.firebase.doPasswordUpdate(passwordOne)
			.then(() => {
				this.setState({ ...INITIAL_STATE });
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
		const isInvalid =
			(this.state.passwordOne !== this.state.passwordTwo) ||
			(this.state.passwordOne === '');

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="passwordOne"
					value={this.state.passwordOne}
					onChange={this.onChange}
					type="password"
					placeholder="New Password" />
				<input
					name="passwordTwo"
					value={this.state.passwordTwo}
					onChange={this.onChange}
					type="password"
					placeholder="Confirm New Password" />
				<button disabled={isInvalid} type="submit">
					Reset My Password
				</button>
				{this.state.error && <p>{this.state.error.message}</p>}
			</form>
		);
	}
}
const PasswordChangeForm = withFirebase(PasswordChangeFormBase);

export { PasswordChangeForm };