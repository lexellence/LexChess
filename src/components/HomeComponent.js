import React from 'react';
import axios from 'axios';
import * as constants from '../Constants';

//+----------------------------\------------------------------
//|	      HomeComponent        |
//\----------------------------/------------------------------
export default class HomeComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            today: ''
        };
    }

    componentDidMount = () => {
        const endpointURL = constants.API_BASE_URL + constants.API_HOW_IS_TODAY;
        axios.get(endpointURL)
          .then(res => {
                this.setState({
                    today: res.data
                });
            })
            .catch(error => {
                console.log(error);
                this.setState({
                    today: '<axios GET error>'
                });
            });
    };

    render = () => {
        return (
            <div>
                <h1>Hello, today is {this.state.today}.</h1>
            </div>
        );
    };
}