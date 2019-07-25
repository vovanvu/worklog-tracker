import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'reactstrap';
import axios from 'axios'
import { BrowserRouter as Router, Route } from "react-router-dom";
import TopMenu from './components/TopMenu'
import RecordTable from './components/RecordTable'
import EmployeeTable from './components/EmployeeTable'
import SignIn from './components/SignIn'

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
      listEmployee: [],
      currentEmployee: '',
      currentEmployeeRecord: []
    }
  }
  setCurrentEmployee = (employeeId) => {
    this.setState({ currentEmployee: employeeId }, () => {
      this.updateCurrentEmployeeRecord();
    });
  }
  updateCurrentEmployeeRecord = () => {
    let user = firebase.auth().currentUser;
    user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      const { currentEmployee } = this.state;
      user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
        let recordString = `https://firstfirebase-ffcda.firebaseio.com/record/${currentEmployee}.json?auth=${idToken}`;
        axios.get(recordString).then((recordRes) => {

          let records = recordRes.data;
          //  merge array
          //  mergeArray = [{recordId,...recorddata},...]
          let mergeArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              var record = records[key];
              record['recordId'] = key;
              mergeArray.push(record);
            }
          }
          this.setState({ currentEmployeeRecord: mergeArray });
        })
      })
    });
  }

  getListEmployee(user) {
    user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      let uid = user.uid;
      // get list employee
      let employeeString = `https://firstfirebase-ffcda.firebaseio.com/user/${uid}/employee.json?auth=${idToken}`;
      axios.get(employeeString).then((result) => {
        //
        const empData = result.data;
        let empArray = [];
        for (let key in empData) {
          if (empData.hasOwnProperty(key)) {
            empArray.push(key);
          }
        }
      }).catch(function (error) {
        console.log("axios request error", error);
      });
    });
  }
  updateList(user) {
    //&& operator
    user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      // console.log(idToken);
      // Send token to your backend via HTTPS
      // Access REST API with idToken, config rule in database rule
      //khong co quyen tao user voi uid cua minh
      let uid = user.uid;
      let recordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?auth=${idToken}`;
      let userString = `https://firstfirebase-ffcda.firebaseio.com/user/${uid}.json?auth=${idToken}`;
      let employeeString = `https://firstfirebase-ffcda.firebaseio.com/user/${uid}/employee.json?auth=${idToken}`;

      axios.all([
        axios.get(userString),
        axios.get(recordString),
        axios.get(employeeString)
      ])
        .then(axios.spread((userRes, recordRes, employeeRes) => {
          //  convert record response json to array
          let records = recordRes.data;
          //  convert record response json to array,
          // recordArray = [[key,{record}],[key,{record}],...]
          // let recordArray = [];
          // for (let key in records) {
          //   if (records.hasOwnProperty(key)) {
          //     recordArray.push([key, records[key]]);
          //   }
          // }
          //  merge array
          //  mergeArray = [{recordId,...recorddata},...]
          let mergeArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              var record = records[key];
              record['recordId'] = key;
              mergeArray.push(record);
            }
          }
          //list employee
          const empData = employeeRes.data;
          let empArray = [];
          for (let key in empData) {
            if (empData.hasOwnProperty(key)) {
              empArray.push({ 'employeeId': key });
            }
          }
          this.setState({
            currentUser: userRes.data,
            listRecord: mergeArray,
            listEmployee: empArray
          })
        })).catch(function (error) {
          console.log("axios request error", error);
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
  //reset state when logout
  reset = () => {
    this.setState({
      currentUser: {},
      listRecord: [],
      listEmployee: [],
      currentEmployee: '',
      currentEmployeeRecord: []
    });
  }
  render() {
    const {
      user,
      signOut,
      signInWithGoogle
    } = this.props;
    const { listRecord, listEmployee, currentEmployee, currentEmployeeRecord } = this.state;

    return (
      <Router>
        <Container>
          <div className="App">
            {
              user
                ?
                <div>
                  {/* <p>Manager: {currentUser.managerid}</p>
                  <p>Permission: {currentUser.permission}</p> */}
                  <TopMenu user={user} signOut={signOut} reset={this.reset} />
                  <Route
                    path='/' exact
                    render={() =>
                      <RecordTable
                        listRecord={listRecord}
                        update={this.update}
                        readOnly={false} />}
                  />
                  <Route
                    path='/employee-record' exact
                    render={() =>
                      <EmployeeTable
                        listEmployee={listEmployee}
                        currentEmployee={currentEmployee}
                        listRecord={currentEmployeeRecord}
                        setCurrentEmployee={this.setCurrentEmployee}
                      />}
                  />
                  <Route
                    path='/report' exact
                    render={() =>
                      <p>Report will be here!</p>
                    }
                  />
                </div>
                :
                <SignIn signInWithGoogle={signInWithGoogle} />
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
