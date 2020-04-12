import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
//import { Link, Route } from "react-router-dom"

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

/*const Dashboard = () => (
  <div>
    <h2>Dashboard</h2>
    ...
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
    ...
  </div>
)
ReactDOM.render(
  <Router>
    <div>
      <aside>
        <Link to={`/`}>Dashboard</Link>
        <Link to={`/about`}>About</Link>
      </aside>

      <main>
        <Route exact path="/" component={Dashboard} />
        <Route path="/about" component={About} />
      </main>
    </div>
  </Router>,
  document.getElementById('root')
);*/


ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);





/*
// function Welcome(props) {
//   return <h1>Hello, {props.name}</h1>;
// }
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = { name: props.name };
  }

  render() {
    return (
      // <div>
      //     Hello World!!!:)
      // </div>
      <h1>Hello, {this.props.name}</h1>
    );
  }
}

const element = <Home name="David2" />;
ReactDOM.render(
  element,
  document.getElementById('root')
);
*/




// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
