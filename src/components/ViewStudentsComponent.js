import React from "react";
import axios from 'axios';

//+----------------------------\------------------------------
//|	  ViewStudentsComponent    |
//\----------------------------/------------------------------
import Table from 'react-bootstrap/Table';
import StudentTableRowComponent from './StudentTableRowComponent';

export default class ViewStudentsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            studentList: []
        };
    }

    componentDidMount = () => {
        axios.get('http://localhost:4000/api/get-student-list/')
            .then(res => {
                this.setState({
                    studentList: res.data
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // Create an array of RowComponents out of the array of students
    DataTable = () => {
        return this.state.studentList.map((student, i) => {
            return <StudentTableRowComponent student={student} key={i} />;
        });
    }

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
                        {this.DataTable()}
                    </tbody>
                </Table>
            </div>
        );
    }
}