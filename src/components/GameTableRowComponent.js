import React from "react";
import axios from 'axios';
import * as constants from '../Constants';

//+-------------------------------\---------------------------
//|	  UserTableRowComponent       |
//\-------------------------------/---------------------------
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default class GameTableRowComponent extends React.Component {
	joinGame = () => {
		// const endpointURL = constants.API_BASE_URL + constants.API_JOIN_GAME + `/${this.props.user._id}`;
		// axios.delete(endpointURL)
		// 	.then((res) => {
		// 		console.log('User successfully deleted!');
		// 	}).catch((error) => {
		// 		console.log(error);
		// 	});
	};

	render = () => {
		return (
			<tr>
				<td>{this.props.game.name}</td>
				<td>{this.props.game.yourTeam}</td>
				<td>
					<Link className="edit-link" to={"/join-game/" + this.props.game._id}>
						Edit
			        </Link>
					{/* <Button onClick={this.deleteUser} size="sm" variant="danger">Delete</Button> */}
				</td>
			</tr>

			// <tr>
			// 	<td>{this.props.user.displayName)}</td>
			// 	<td>{this.props.user.email}</td>
			// 	<td>{this.props.user.rollno}</td>
			// </tr>
		);
	};
}; 