import React from "react";
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	   EditplayerComponent    |
//\----------------------------/------------------------------
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class EditUserComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			email: '',
			rollno: ''
		};
	}

	componentDidMount = () => {
		axios.get(constants.API_BASE_URL + constants.API_GET_USER + `/${this.props.match.params.id}`)
			.then(res => {
				this.setState({
					name: res.data.name,
					email: res.data.email,
					rollno: res.data.rollno
				});
			})
			.catch((error) => {
				console.log(error);
			});
	};

	onChangeUserName = (e) => {
		this.setState({ name: e.target.value });
	};

	onChangeUserEmail = (e) => {
		this.setState({ email: e.target.value });
	};

	onChangeUserRollno = (e) => {
		this.setState({ rollno: e.target.value });
	};

	onSubmit = (e) => {
		e.preventDefault();

		const userObject = {
			name: this.state.name,
			email: this.state.email,
			rollno: this.state.rollno
		};
		const endpointURL = constants.API_BASE_URL + constants.API_UPDATE_USER + `/${this.props.match.params.id}`;
		axios.put(endpointURL, userObject)
			.then((res) => {
				console.log(res.data);
				console.log('User successfully updated');
			}).catch((error) => {
				console.log(error);
			});

		// Redirect to user List 
		this.props.history.push(constants.ROUTE_VIEW_PLAYERS);
	};

	render = () => {
		return (
			<div className="form-wrapper">
				<Form onSubmit={this.onSubmit}>
					<Form.Group controlId="Name">
						<Form.Label>Name</Form.Label>
						<Form.Control type="text" value={this.state.name} onChange={this.onChangeUserName} />
					</Form.Group>

					<Form.Group controlId="Email">
						<Form.Label>Email</Form.Label>
						<Form.Control type="email" value={this.state.email} onChange={this.onChangeUserEmail} />
					</Form.Group>

					<Form.Group controlId="Name">
						<Form.Label>Roll No</Form.Label>
						<Form.Control type="text" value={this.state.rollno} onChange={this.onChangeUserRollno} />
					</Form.Group>

					<Button variant="danger" size="lg" block="block" type="submit">
						Update User
                    </Button>
				</Form>
			</div>
		);
	};
}