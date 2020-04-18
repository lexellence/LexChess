import React from "react";
import axios from 'axios';
import * as constants from '../Constants';

//+-------------------------------\---------------------------
//|	  UserTableRowComponent       |
//\-------------------------------/---------------------------
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default class UserTableRowComponent extends React.Component {
    /*
    constructor(props) {
        super(props);
    }*/

    deleteUser = () => {
        const endpointURL = constants.API_BASE_URL + constants.API_DELETE_USER + `/${this.props.user._id}`;
        axios.delete(endpointURL)
            .then((res) => {
                console.log('User successfully deleted!');
            }).catch((error) => {
                console.log(error);
            });
    };

    render = () => {
        return (
            <tr>
                <td>{this.props.user.name}</td>
                <td>{this.props.user.email}</td>
                <td>{this.props.user.rollno}</td>
                <td>
                    <Link className="edit-link" to={"/edit-user/" + this.props.user._id}>
                        Edit
                    </Link>
                    <Button onClick={this.deleteUser} size="sm" variant="danger">Delete</Button>
                </td>
            </tr>
        );
    };
}; 