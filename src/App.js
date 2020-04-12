import React from 'react';

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

import HomeComponent from "./components/HomeComponent";
import CreateStudentComponent from "./components/CreateStudentComponent";
import EditStudentComponent from "./components/EditStudentComponent";
import ViewStudentsComponent from "./components/ViewStudentsComponent";

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <Navbar bg="dark" variant="dark">
            <Container>

              <Navbar.Brand>
                <Link to={"/"} className="nav-link">
                  Lex Chess
                </Link>
              </Navbar.Brand>

              <Nav className="justify-content-end">
                <Nav>
                  <Link to={"/create-student"} className="nav-link">
                    Create Student
                  </Link>
                </Nav>

                <Nav>
                  <Link to={"/student-list"} className="nav-link">
                    View Student List
                  </Link>
                </Nav>
              </Nav>

            </Container>
          </Navbar>
        </header>

        <Container>
          <Row>
            <Col md={12}>
              <div className="wrapper">
                <Switch>
                  <Route exact path='/' component={HomeComponent} />
                  <Route path="/view-students" component={ViewStudentsComponent} />
                  <Route path="/create-student" component={CreateStudentComponent} />
                  <Route path="/edit-student/:id" component={EditStudentComponent} />
                </Switch>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </BrowserRouter>
  );
}
