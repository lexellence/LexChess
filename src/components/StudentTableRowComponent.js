import React from "react";
import axios from 'axios';

//+-------------------------------\---------------------------
//|	  StudentTableRowComponent    |
//\-------------------------------/---------------------------
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default class StudentTableRowComponent extends React.Component {
    constructor(props) {
        super(props);
        this.deleteStudent = this.deleteStudent.bind(this);
    }

    deleteStudent() {
        axios.delete('http://localhost:4000/api/delete-student/' + this.props.obj._id)
            .then((res) => {
                console.log('Student successfully deleted!');
            }).catch((error) => {
                console.log(error);
            });
    }

    render() {
        return (
            <tr>
                <td>{this.props.obj.name}</td>
                <td>{this.props.obj.email}</td>
                <td>{this.props.obj.rollno}</td>
                <td>
                    <Link className="edit-link" to={"/edit-student/" + this.props.obj._id}>
                        Edit
                    </Link>
                    <Button onClick={this.deleteStudent} size="sm" variant="danger">Delete</Button>
                </td>
            </tr>
        );
    }
}; 