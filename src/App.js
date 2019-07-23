import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button } from 'reactstrap';
import axios from 'axios'
import { BrowserRouter as Router, Route } from "react-router-dom";
import TopMenu from './components/TopMenu'
import RecordTable from './components/RecordTable'
//firebase
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from './firebaseConfig';
//initialize
const firebaseApp = firebase.initializeApp(firebaseConfig);
//setup provider
const firebaseAppAuth = firebaseApp.auth();
const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //init for render value, otherwise render() get null
      currentUser: {},
      listRecord: [],
    }
  }

  updateList(user) {
    //&& operator
    user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      // Send token to your backend via HTTPS
      // Access REST API with idToken, config rule in database rule
      //console.log(idToken);
      //khong co quyen tao user voi uid cua minh
      //let queryString = `https://firstfirebase-ffcda.firebaseio.com/user.json`;
      let uid = user.uid;
      let recordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?auth=${idToken}`;
      let userString = `https://firstfirebase-ffcda.firebaseio.com/user/${uid}.json?auth=${idToken}`;

      axios.all([
        axios.get(userString),
        axios.get(recordString)
      ])
        .then(axios.spread((userRes, recordRes) => {
          //  convert record response json to array
          let records = recordRes.data;
          let recordArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              recordArray.push([key, records[key]]);
            }
          }
          //  merge array
          let mergeArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              var record = records[key];
              record['recordId'] = key;
              mergeArray.push(record);
            }
          }
          this.setState({
            currentUser: userRes.data,
            listRecord: mergeArray
          })
        })).catch(function (error) {
          console.log("axios request error", error);
        });
      //get list employee
      // let employeeString = `https://firstfirebase-ffcda.firebaseio.com/user/UU8KHimAC6YF7O7ukZpMAx3kRsR2.json?auth=${idToken}`;
      // axios.get(employeeString).then((result) => {
      //   console.log(result);
      // });
    });
    //null because not setstate before, log before axios get done (async)
    // console.log(this.state.listRecord);
  }

  //update function to call from child component
  update = () => {
    let user = firebase.auth().currentUser;
    this.updateList(user);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      this.updateList(user);
    });
  }
  reset = () => {
    this.setState({
      currentUser: {},
      listRecord: [],
    });
  }
  render() {
    const {
      user,
      signOut,
      signInWithGoogle
    } = this.props;
    const { listRecord } = this.state;

    return (
      <Router>
        <Container>
          <div className="App">
            {
              user
                ? <div>
                  <TopMenu user={user} signOut={signOut} reset={this.reset} />
                  {/* <p>Manager: {currentUser.managerid}</p>
                  <p>Permission: {currentUser.permission}</p> */}
                  <Route
                    path='/' exact
                    render={() => <RecordTable listRecord={listRecord} update={this.update} />}
                  />
                  <Route
                    path='/employee-record' exact
                    render={() => <h2>employee</h2>}
                  />
                </div>
                :
                <Button className="primary" onClick={signInWithGoogle}>Sign in with Google</Button>
            }
          </div>
        </Container>
      </Router>
    );
  }
}

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);
