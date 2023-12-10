import { Routes, Route } from 'react-router-dom';

import { withAuthorization, withEmailVerification } from '../Session';
import { UserList } from './UserList';
import { UserItem } from './UserItem';
import * as ROLES from '../constants/roles';
import * as ROUTES from '../constants/routes';

function AdminPageBase() {
	return (
		<section id="admin-page">
			<h1>Admin</h1>
			<p>The Admin Page is accessible by every signed in admin user.</p>

			<Routes>
				<Route path={ROUTES.ADMIN_DETAILS} element={<UserItem />} />
				<Route path={ROUTES.ADMIN} element={<UserList />} />
			</Routes>
		</section>);
}
const AdminPage =
	withEmailVerification(
		withAuthorization(authUser => (authUser && !!authUser.roles[ROLES.ADMIN]))(
			AdminPageBase));

export { AdminPage };
