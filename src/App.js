import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button } from 'reactstrap';
import axios from 'axios'
import { BrowserRouter as Router, Route } from "react-router-dom";
import TopMenu from './components/TopMenu'
import MyRecord from './components/MyRecord'
import AddRecord from './components/AddRecord'
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
      listRecord: []
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
          //convert record response json to array
          let records = recordRes.data;
          let recordArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              recordArray.push([key, records[key]]);
            }
          }
          this.setState({
            currentUser: userRes.data,
            listRecord: recordArray
          })
          // console.log(this.state.listRecord.length);
          console.log(this.state.listRecord);
        })).catch(function (error) {
          console.log("axios request error");
        });
    });
    //null because not setstate before, log before axios get done (async)
    // console.log(this.state.listRecord);
  }
  update = () => {
    let user = firebase.auth().currentUser;
    this.updateList(user);
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      this.updateList(user);
    });
  }
  render() {
    const {
      user,
      signOut,
      signInWithGoogle,
    } = this.props;
    const { currentUser, listRecord } = this.state;
    return (
      <Router>
        <Container>
          <div className="App">
            {
              user
                ? <div>
                  <TopMenu user={user} signOut={signOut} />
                  <p>Manager: {currentUser.managerid}</p>
                  <p>Permission: {currentUser.permission}</p>
                  <AddRecord update={this.update} buttonLabel="Add New Record" />
                  <Route
                    path='/' exact
                    render={() => <MyRecord listRecord={listRecord} />}
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
