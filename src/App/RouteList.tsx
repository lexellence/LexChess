import React from 'react';
import { Switch, Route } from "react-router-dom";

import HomePage from "../HomePage";
import GamePage from "../GamePage";
import GameListPage from "../GameListPage";
import GameHistoryPage from "../GameHistoryPage";
import SignInPage from "../SignInPage";
import SignUpPage from "../SignUpPage";
import AccountPage, { PasswordForgetPage } from '../AccountPage';
import AdminPage from '../Admin/AdminPage';

import * as ROUTES from "../constants/routes";

function RouteList() {
	return (
		<Switch>
			<Route exact path={ROUTES.LANDING}>		<HomePage />			</Route>
			<Route path={ROUTES.PLAY}>				<GamePage />			</Route>
			<Route path={ROUTES.GAME_LIST}>			<GameListPage />		</Route>
			<Route path={ROUTES.GAME_HISTORY}>		<GameHistoryPage />		</Route>
			<Route path={ROUTES.SIGN_IN}>			<SignInPage />			</Route>
			<Route path={ROUTES.SIGN_UP}>			<SignUpPage />			</Route>
			<Route path={ROUTES.PASSWORD_FORGET}>	<PasswordForgetPage />	</Route>
			<Route path={ROUTES.ACCOUNT}>			<AccountPage />			</Route>
			<Route path={ROUTES.ADMIN}>				<AdminPage />			</Route>
		</Switch >
	);
}
export default RouteList;

