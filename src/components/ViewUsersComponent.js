import React from "react";
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	  ViewUsersComponent       |
//\----------------------------/------------------------------
import Table from 'react-bootstrap/Table';
import UserTableRowComponent from './UserTableRowComponent';

export default class ViewUsersComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userList: []
        };
    }

    componentDidMount = () => {
        const endpointURL = constants.API_BASE_URL + constants.API_GET_USER_LIST;
        axios.get(endpointURL)
            .then(res => {
                this.setState({
                    userList: res.data
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // Create an array of RowComponents out of the array of users
    GetTableRowsFromUserList = () => {
        return this.state.userList.map((user, i) => {
            return <UserTableRowComponent user={user} key={i} />;
        });
    };

    render = () => {
        return (
            <div className="table-wrapper">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Roll No</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.GetTableRowsFromUserList()}
                    </tbody>
                </Table>
            </div>
        );
    };
}