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
      listRecord: [],
      listEmployee: [],
      currentEmployee: '',
      currentEmployeeRecord: []
    }
  }
  setCurrentEmployee = (employee) => {
    this.setState({ currentEmployee: employee }, () => {
      this.updateCurrentEmployeeRecord();
    });
  }
  updateCurrentEmployeeRecord = () => {
    let user = firebase.auth().currentUser;
    const { currentEmployee } = this.state;
    user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      let recordString = `https://firstfirebase-ffcda.firebaseio.com/record/${currentEmployee.uid}.json?auth=${idToken}`;
      axios.get(recordString).then((recordRes) => {
        let records = recordRes.data;
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
  }
  async getEmployeeFromId(id) {
    let idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
    const employeeInfoString =
      `https://firstfirebase-ffcda.firebaseio.com/user.json?orderBy="id"&equalTo=${id}&print=pretty&auth=${idToken}`;
    let result = await axios.get(employeeInfoString);
    const employees = result.data;
    for (let key in employees) {
      if (employees.hasOwnProperty(key)) {
        var employee = employees[key];
        employee['uid'] = key;
        return employee;
      }
    }
  }
  updateListEmployee(user) {
    user && firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      let uid = user.uid;
      let employeeString = `https://firstfirebase-ffcda.firebaseio.com/user/${uid}/employee.json?auth=${idToken}`;
      axios.get(employeeString)
        .then((employeeRes) => {
          //list employee
          const empData = employeeRes.data;
          for (let key in empData) {
            if (empData.hasOwnProperty(key)) {
              const emp = this.getEmployeeFromId(key);
              emp.then((data) => {
                this.setState({
                  listEmployee: [...this.state.listEmployee, data]
                })
              });
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
      axios.get(recordString)
        .then((recordRes) => {
          //  convert record response json to array
          let records = recordRes.data;
          let mergeArray = [];
          for (let key in records) {
            if (records.hasOwnProperty(key)) {
              var record = records[key];
              record['recordId'] = key;
              mergeArray.push(record);
            }
          }
          this.setState({
            listRecord: mergeArray
          });
        }).catch(function (error) {
          console.log("axios request error", error);
        });
    });
  }

  //update function to call from child component
  update = () => {
    const user = firebase.auth().currentUser;
    this.updateList(user);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      this.updateList(user);
      this.updateListEmployee(user);
    });
  }
  //reset state when logout
  reset = () => {
    this.setState({
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
