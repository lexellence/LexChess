import React from 'react';
import axios from 'axios';
import firebase from 'firebase';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	      HomeComponent        |
//\----------------------------/------------------------------
export default class HomeComponent extends React.Component {
	state = {
		today: '',
		isSignedIn: false
	};
	componentDidMount = () => {
		this.unregisterFirebaseAuthObserver = firebase.auth().onAuthStateChanged(
			(user) => this.setState({ isSignedIn: !!user })
		);

		const endpointURL = constants.API_BASE_URL + constants.API_HOW_IS_TODAY;
		axios.get(endpointURL)
			.then(res => {
				this.setState({
					today: res.data
				});
			})
			.catch(error => {
				console.log(error);
				this.setState({
					today: '<axios GET error>'
				});
			});
	};
	componentWillUnmount() {
		this.unregisterFirebaseAuthObserver();
	}
	render = () => {
		if (this.state.isSignedIn) {
			return (
				<div>
					<h1>Hello, today is {this.state.today}.</h1>
					<p>currentUser=<pre>{JSON.stringify(this.state.currentUser, null, 4)}</pre></p>
				</div>
			);
		}
		else {
			return (
				<div>
					<h1>Hello, today is {this.state.today}.</h1>
					<p>currentUser=signed out</p>
				</div >
			);
		}
	};
}