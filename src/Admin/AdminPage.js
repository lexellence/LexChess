import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { withAuthorization, withEmailVerification } from '../Session';
import UserList from './UserList';
import UserItem from './UserItem';
import * as ROLES from '../constants/roles';
import * as ROUTES from '../constants/routes';

function AdminPage() {
	return (
		<React.Fragment>
			<h1>Admin</h1>
			<p>The Admin Page is accessible by every signed in admin user.</p>

			<Switch>
				<Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
				<Route exact path={ROUTES.ADMIN} component={UserList} />
			</Switch>
		</React.Fragment>
	);
}

// class AdminPage extends React.Component {
// 	state = { userRoles: {} };
// 	componentDidMount() {
// 		const onSignIn = authUser => this.setState({ userRoles: authUser.roles });
// 		const onSignOut = () => this.setState({ userRoles: {} });
// 		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
// 	};
// 	componentWillUnmount = () => this.unregisterAuthListener();
// 	render() {
// 		return (
// 			<React.Fragment>
// 				<h1>Admin</h1>
// 				<p>The Admin Page is accessible by every signed in admin user.</p>

// 				<Switch>
// 					<Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
// 					<Route exact path={ROUTES.ADMIN} component={UserList} />
// 				</Switch>
// 			</React.Fragment>
// 		);
// 	}
// }
// const AdminPage = withFirebase(AdminPageBase);

const conditionFunc = function (authUser) {
	return (authUser && !!authUser.roles[ROLES.ADMIN]);
};

export default
	withEmailVerification(
		withAuthorization(conditionFunc)(
			AdminPage));
