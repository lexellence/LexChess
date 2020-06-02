import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';

class UserList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			users: [],
		};
	}

	componentDidMount() {
		this.setState({ loading: true });

		this.props.firebase.userListRef().on('value', snapshot => {
			const usersObject = snapshot.val();

			const userList = Object.keys(usersObject).map(key => ({
				...usersObject[key],
				uid: key,
			}));

			this.setState({
				users: userList,
				loading: false,
			});
		});
	}
	componentWillUnmount() {
		this.props.firebase.userListRef().off();
	}
	render() {
		const { users, loading } = this.state;
		return (
			<div>
				<h2>Users</h2>
				{loading && <div>Loading ...</div>}
				<ul>
					{users.map(user => (
						<li key={user.uid}>
							<span>
								<strong>ID:</strong>&nbsp; {user.uid} &emsp;
							</span>&emsp;
							<span>
								<strong>In game?</strong>&nbsp; {user.inGame.toString()}&emsp;
							</span>
							{user.inGame &&
								<span>
									<strong>Game ID:</strong>&nbsp; {user.gid}&emsp;
								</span>
							}
							<span>
								<Link
									to={{
										pathname: `${ROUTES.ADMIN}/${user.uid}`,
										state: { user },
									}}>
									Details
                				</Link>
							</span>
						</li>
					))}
				</ul>
			</div>
		);
	}
}

export default withFirebase(UserList);