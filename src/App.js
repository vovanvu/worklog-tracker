import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button } from 'reactstrap';
import axios from 'axios'
import { BrowserRouter as Router, Route } from "react-router-dom";
import TopMenu from './components/TopMenu'
import AddRecord from './components/AddRecord'
import RecordTable from './components/RecordTable'
// import Tbl from './components/Tbl'
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
          //convert record response json to array
          let records = recordRes.data;
          let recordArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              recordArray.push([key, records[key]]);
            }
          }
          //  merge array
          let mergeArray = [];
          // for (let key in records) {
          //   if (records.hasOwnProperty(key)) {
          //     var recordKey = [key];
          //     var record = Object.values(records[key]);
          //     record.reverse();
          //     var result = recordKey.concat(record);
          //     mergeArray.push(result);
          //   }
          // }
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              // var record = records[key].recordKey = key;
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
          console.log("axios request error");
        });
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

  render() {
    const {
      user,
      signOut,
      signInWithGoogle
    } = this.props;
    // const { currentUser, listRecord } = this.state;
    const { listRecord } = this.state;

    return (
      <Router>
        <Container>
          <div className="App">
            {
              user
                ? <div>
                  <TopMenu user={user} signOut={signOut} />
                  {/* <p>Manager: {currentUser.managerid}</p>
                  <p>Permission: {currentUser.permission}</p> */}
                  <AddRecord update={this.update} />
                  <Route
                    path='/' exact
                    render={() => <RecordTable listRecord={listRecord} update={this.update} />}
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
