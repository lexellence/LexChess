import React from "react";
import axios from 'axios';

//+----------------------------\------------------------------
//|	      HomeComponent        |
//\----------------------------/------------------------------
export default class HomeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            howIsToday: ''
        };
    }

    componentDidMount() {
        axios.get('http://localhost:4000/api/how-is-today/')
            .then(res => {
                this.setState({
                    howIsToday: res.data
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    render() {
        return (
            <div>
                <h1>Hello, today is {this.state.howIsToday}.</h1>
            </div>
        );
    }
}