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
            students: []
        };
    }

    componentDidMount() {
        axios.get('http://localhost:4000/api/get-student-list/')
            .then(res => {
                this.setState({
                    students: res.data
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    DataTable() {
        return this.state.students.map((res, i) => {
            return <StudentTableRowComponent obj={res} key={i} />;
        });
    }

    render() {
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
                        {/* { Table data} */}
                        {this.DataTable()}
                    </tbody>
                </Table>
            </div>
        );
    }
}