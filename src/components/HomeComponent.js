import React from "react";
import axios from 'axios';

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
        //this.setState({
        //    today: 'blue'
        //});

        //axios.get('http://localhost:4000/api/how-is-today/')
        //axios.get('https://firestore.googleapis.com/v1/projects/chessfighter-b3ba9/databases/(default)/documents/home/home')
       // axios.get('https://us-central1-chessfighter-b3ba9.cloudfunctions.net/howIsToday/message?name=MyName')
       /* axios.get('https://us-central1-chessfighter-b3ba9.cloudfunctions.net/bigben')
            .then(res => {
                this.setState({
                    today: res.data
                });
            })
            .catch((error) => {
                console.log(error);
                this.setState({
                    today: 'error'
                });
            });*/
        axios({
            method: 'get',
            url: 'https://us-central1-chessfighter-b3ba9.cloudfunctions.net/bigben', // or https://us-central1-PROJECT_NAME.cloudfunctions.net/test_message_json
        })
            .then((response) => {
                console.log(response.data); 
                this.setState({
                    today: response.data
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    render = () => {
        return (
            <div>
                <h1>Hello, today is {this.state.today}.</h1>
            </div>
        );
    }
}