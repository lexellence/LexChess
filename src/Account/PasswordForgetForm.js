import React, { Component } from 'react';
import { withFirebase } from '../Firebase';

const INITIAL_STATE = {
	email: '',
	error: null,
	message: '',
};

class PasswordForgetForm extends Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		const { email } = this.state;

		this.props.firebase
			.doPasswordReset(email)
			.then(() => {
				this.setState({ ...INITIAL_STATE, message: 'A password-change email has been sent.' });
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
		const { email, error } = this.state;

		const isInvalid = email === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="email"
					value={this.state.email}
					onChange={this.onChange}
					type="text"
					placeholder="Email Address" />
				<button disabled={isInvalid} type="submit">
					Reset My Password
        		</button>
				{error && <p>{error.message}</p>}
				{this.state.message && <p>{this.state.message}</p>}
			</form>
		);
	}
}
export default withFirebase(PasswordForgetForm);
