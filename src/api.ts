import axios from 'axios';
import * as ENDPOINTS from "./constants/endpoints";

export const getPlayState = (idToken: string) => {
	return axios({
		method: 'get',
		url: ENDPOINTS.GET_PLAY,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const joinGame = (idToken: string, gid: string, team: string) => {
	return axios({
		method: 'put',
		url: ENDPOINTS.JOIN_GAME + '/' + gid + '/' + team,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const leaveGame = (idToken: string) => {
	return axios({
		method: 'put',
		url: ENDPOINTS.LEAVE_GAME,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
export const createGame = (idToken: string, team: string) => {
	return axios({
		method: 'post',
		url: ENDPOINTS.CREATE_GAME + '/' + team,
		headers: {
			Authorization: 'Bearer ' + idToken
		}
	});
};
