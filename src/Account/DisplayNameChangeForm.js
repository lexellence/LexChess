import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

const INITIAL_STATE = {
	displayName: '',
	error: null,
};

class DisplayNameChangeForm extends Component {
	constructor(props) {
		super(props);
		this.state = { ...INITIAL_STATE };
	}

	onSubmit = event => {
		const { displayName } = this.state;
		this.props.firebase.doDisplayNameUpdate(displayName)
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
		const { displayName, error } = this.state;
		const isInvalid =
			displayName === '';

		return (
			<form onSubmit={this.onSubmit}>
				<input
					name="displayName"
					value={displayName}
					onChange={this.onChange}
					type="text"
					placeholder="New Display Name" />
				<button disabled={isInvalid} type="submit">
					Change My Display Name
        		</button>
				{error && <p>{error.message}</p>}
			</form>
		);
	}
}
export default withFirebase(DisplayNameChangeForm);