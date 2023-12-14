import { Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "../HomePage";
import { GamePage } from "../GamePage";
import { GameListPage } from "../GameListPage";
import { GameHistoryPage } from "../GameHistoryPage";
import { SignInPage } from "../SignInPage";
import { SignUpPage } from "../SignUpPage";
import { AccountPage, PasswordForgetPage } from '../AccountPage';
import { AdminPage } from '../Admin/AdminPage';

import * as ROUTES from "../constants/routes";

function RouteList() {
	return (
		<Routes>
			<Route path="*" element={<Navigate replace to={ROUTES.HOME} />} />
			<Route index element={<Navigate replace to={ROUTES.HOME} />} />
			<Route path={ROUTES.HOME} element={<HomePage />} />
			<Route path={ROUTES.PLAY_GAME} element={<GamePage />} />
			<Route path={ROUTES.GAME_LIST} element={<GameListPage />} />
			<Route path={ROUTES.GAME_HISTORY} element={<GameHistoryPage />} />
			<Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
			<Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
			<Route path={ROUTES.PASSWORD_FORGET} element={<PasswordForgetPage />} />
			<Route path={ROUTES.ACCOUNT} element={<AccountPage />} />
			<Route path={ROUTES.ADMIN} element={<AdminPage />} />
		</Routes>
	);
}
export { RouteList };

