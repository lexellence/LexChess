import axios from 'axios';
import * as ENDPOINTS from "./constants/endpoints";

export const getPlayState = (idToken) => {
	return axios({
		method: 'get',
		url: ENDPOINTS.GET_PLAY,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const joinGame = (idToken, gid, team) => {
	return axios({
		method: 'put',
		url: ENDPOINTS.JOIN_GAME + '/' + gid + '/' + team,
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
export const createGame = (idToken, team) => {
	return axios({
		method: 'post',
		url: ENDPOINTS.CREATE_GAME + '/' + team,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
