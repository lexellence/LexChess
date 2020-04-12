import React from "react";
import axios from 'axios';

//+----------------------------\------------------------------
//|	   EditStudentComponent    |
//\----------------------------/------------------------------
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class EditStudentComponent extends React.Component {
    constructor(props) {
        super(props);

        // Setting up functions
        this.onChangeStudentName = this.onChangeStudentName.bind(this);
        this.onChangeStudentEmail = this.onChangeStudentEmail.bind(this);
        this.onChangeStudentRollno = this.onChangeStudentRollno.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        // Setting up state
        this.state = {
            name: '',
            email: '',
            rollno: ''
        };
    }

    componentDidMount() {
        axios.get('http://localhost:4000/api/get-student/' + this.props.match.params.id)
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
    }

    onChangeStudentName(e) {
        this.setState({ name: e.target.value });
    }

    onChangeStudentEmail(e) {
        this.setState({ email: e.target.value });
    }

    onChangeStudentRollno(e) {
        this.setState({ rollno: e.target.value });
    }

    onSubmit(e) {
        e.preventDefault();

        const studentObject = {
            name: this.state.name,
            email: this.state.email,
            rollno: this.state.rollno
        };

        axios.put('http://localhost:4000/api/update-student/' + this.props.match.params.id, studentObject)
            .then((res) => {
                console.log(res.data);
                console.log('Student successfully updated');
            }).catch((error) => {
                console.log(error);
            });

        // Redirect to Student List 
        this.props.history.push('/view-students');
    }

    render() {
        return (
            <div className="form-wrapper">
                <Form onSubmit={this.onSubmit}>
                    <Form.Group controlId="Name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" value={this.state.name} onChange={this.onChangeStudentName} />
                    </Form.Group>

                    <Form.Group controlId="Email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={this.state.email} onChange={this.onChangeStudentEmail} />
                    </Form.Group>

                    <Form.Group controlId="Name">
                        <Form.Label>Roll No</Form.Label>
                        <Form.Control type="text" value={this.state.rollno} onChange={this.onChangeStudentRollno} />
                    </Form.Group>

                    <Button variant="danger" size="lg" block="block" type="submit">
                        Update Student
                    </Button>
                </Form>
            </div>
        );
    }
}