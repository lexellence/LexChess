import axios, { Method } from 'axios';
import * as ENDPOINTS from "../constants/endpoints";

//+--------------------------------\-------------------------
//|	 	       callAPI    	       |
//\--------------------------------/
//------------------------------------------------------------
async function callAPI(authUser: any, method: Method, url: string) {
	return new Promise(function (resolve, reject) {
		if (!authUser?.getIdToken)
			reject('Failed to get auth token: User not signed in');

		const refreshTokenOnNextAPICall: boolean = localStorage.getItem('refreshTokenOnNextAPICall') === '1' ? true : false;
		authUser.getIdToken(refreshTokenOnNextAPICall).then((idToken: string) => {
			localStorage.setItem('refreshTokenOnNextAPICall', '0');
			axios({
				method: method,
				url: url,
				headers: {
					Authorization: 'Bearer ' + idToken
				}
			}).then(function () {
				resolve(null);
			}).catch(function (error) {
				let rejectMessage: string;
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					rejectMessage = 'Server responded with ' + error.response.status + ' ' + error.response.statusText + '.\n'
						+ (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
					console.log(rejectMessage);
				} else if (error.request) {
					// The request was made but no response was received
					// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
					// http.ClientRequest in node.js
					rejectMessage = 'Server did not respond.';
					console.log(rejectMessage);
				} else {
					// Something happened in setting up the request that triggered an Error
					rejectMessage = 'Something happened: ' + error.message;
					console.log(rejectMessage);
				}
				console.log(error.config);
				reject(rejectMessage);
			});
		}).catch(function (error: any) {
			const rejectMessage = 'Failed to get auth token: ' + JSON.stringify(error);
			console.log(rejectMessage);
			reject(rejectMessage);
		});
	});
}

//+--------------------------------\-------------------------
//|	 	 	   joinGame 	   	   |
//\--------------------------------/
//------------------------------------------------------------
export async function joinGame(authUser: any, gid: string, team: string) {
	return callAPI(authUser, 'put', ENDPOINTS.JOIN_GAME + '/' + gid + '/' + team);
};
//+--------------------------------\-------------------------
//|	 	      createGame		   |
//\--------------------------------/
//------------------------------------------------------------
export async function createGame(authUser: any, team: string) {
	return callAPI(authUser, 'post', ENDPOINTS.CREATE_GAME + '/' + team);
};
//+--------------------------------\-------------------------
//|	 	      visitGame		   |
//\--------------------------------/
//------------------------------------------------------------
export async function visitGame(authUser: any, gid: string) {
	return callAPI(authUser, 'put', ENDPOINTS.VISIT_GAME + '/' + gid);
};
//+--------------------------------\-------------------------
//|	 	      	move			   |
//\--------------------------------/
//------------------------------------------------------------
export async function move(authUser: any, gid: string, moveString: string) {
	return callAPI(authUser, 'put', ENDPOINTS.MOVE + '/' + gid + '/' + moveString);
};
//+--------------------------------\-------------------------
//|	 	 	  leaveGame	     	   |
//\--------------------------------/
//------------------------------------------------------------
export async function leaveGame(authUser: any, gid: string) {
	return callAPI(authUser, 'put', ENDPOINTS.LEAVE_GAME + '/' + gid);
};


