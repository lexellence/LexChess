import axios from 'axios';
import * as ENDPOINTS from "./constants/endpoints";

export const getPlay = (idToken) => {
	return axios({
		method: 'get',
		url: ENDPOINTS.GET_PLAY,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const joinGame = (idToken, gid) => {
	return axios({
		method: 'put',
		url: ENDPOINTS.JOIN_GAME + '/' + gid,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const leaveGame = (idToken) => {
	return axios({
		method: 'put',
		url: ENDPOINTS.LEAVE_GAME,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const createGame = (idToken) => {
	return axios({
		method: 'post',
		url: ENDPOINTS.CREATE_GAME,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
