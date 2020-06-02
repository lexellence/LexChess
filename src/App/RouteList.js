import React from 'react';
import { Switch, Route } from "react-router-dom";

import HomePage from "../HomePage";
import GamePage from "../Game/GamePage";
import SignInPage from "../SignInPage";
import SignUpPage from "../SignUpPage";
import PasswordForgetPage from '../Account/PasswordForgetPage';
import AccountPage from '../Account/AccountPage';
import AdminPage from '../AdminPage';

import * as ROUTES from "../constants/routes";

const RouteList = () => {
	return (
		<Switch>
			<Route exact path={ROUTES.LANDING} component={HomePage} />
			<Route path={ROUTES.GAME} component={GamePage} />
			<Route path={ROUTES.SIGN_IN} component={SignInPage} />
			<Route path={ROUTES.SIGN_UP} component={SignUpPage} />
			<Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
			<Route path={ROUTES.ACCOUNT} component={AccountPage} />
			<Route path={ROUTES.ADMIN} component={AdminPage} />
		</Switch>
	);
};
export default RouteList;

