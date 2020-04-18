import React from "react";
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	  CreateplayerComponent   |
//\----------------------------/------------------------------
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class CreateUserComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            rollno: '',
        };
    }

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

        // Compose payload
        const userObject = {
            name: this.state.name,
            email: this.state.email,
            rollno: this.state.rollno
        };

        // Send to server
        const endpointURL = constants.API_BASE_URL + constants.API_CREATE_USER;
        axios.post(endpointURL, userObject)
            .then(res => {
                console.log(res.data);
            })
            .catch(error => {
                console.log(error);
            });
        this.setState({ name: '', email: '', rollno: '' });

        // Redirect to player List 
        this.props.history.push(constants.ROUTE_CREATE_USER);
    };
    render = () => {
        return (
            <div class="form-wrapper">
                <Form onSubmit={this.onSubmit}>
                    <Form.Group controlId="Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control required type="text" value={this.state.name} onChange={this.onChangeUserName} />
                    </Form.Group>

                    <Form.Group controlId="Email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control required type="email" value={this.state.email} onChange={this.onChangeUserEmail} />
                    </Form.Group>

                    <Form.Group controlId="Name">
                        <Form.Label>Roll No</Form.Label>
                        <Form.Control required type="text" value={this.state.rollno} onChange={this.onChangeUserRollno} />
                    </Form.Group>

                    <Button variant="danger" size="lg" block="block" type="submit">
                        Create User
                    </Button>
                </Form>
            </div>
        );
    };
}