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
import Report from './components/Report'
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
      currentEmployeeRecord: [],
      chartArrayData: [],
      excelArray: [],
      reportDayStart: this.getToday(),
      reportDayEnd: this.getToday()
    }
    this.setChartArrayDataFromDateToDate = this.setChartArrayDataFromDateToDate.bind(this);
    this.exportExcel = this.exportExcel.bind(this);
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
            let date = record['date'];
            record['date'] = this.millisecondsToDateString(date);
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
  async getEmployeeFromUid(uid) {
    let idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
    const employeeInfoString =
      `https://firstfirebase-ffcda.firebaseio.com/user/${uid}.json?auth=${idToken}`;
    let result = await axios.get(employeeInfoString);
    const employee = result.data;
    return employee;
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
              let date = record['date'];
              record['date'] = this.millisecondsToDateString(date);
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
    const { reportDayStart, reportDayEnd } = this.state;
    this.setChartArrayDataFromDateToDate(reportDayStart, reportDayEnd);
  }

  componentDidMount() {

    firebase.auth().onAuthStateChanged((user) => {
      this.updateList(user);
      this.updateListEmployee(user);
      const { reportDayStart, reportDayEnd } = this.state;
      this.setChartArrayDataFromDateToDate(reportDayStart, reportDayEnd);
      this.exportExcel(reportDayStart, reportDayEnd);
    });
  }
  //reset state when logout
  reset = () => {
    this.setState({
      listRecord: [],
      listEmployee: [],
      currentEmployee: '',
      currentEmployeeRecord: [],
      chartArrayData: [],
      excelArray: [],
      reportDayStart: this.getToday(),
      reportDayEnd: this.getToday()
    });
  }
  changeReportDate = (startdate, enddate) => {
    this.setState({
      reportDayStart: startdate,
      reportDayEnd: enddate
    }, () => {
      const { reportDayStart, reportDayEnd } = this.state;
      this.setChartArrayDataFromDateToDate(reportDayStart, reportDayEnd);
      this.exportExcel(reportDayStart, reportDayEnd);
    })
  }
  async setChartArrayDataFromDateToDate(startdate, enddate) {
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    if (isNumeric(startdate) && isNumeric(enddate)) {
      startdate = this.millisecondsToDateString(startdate);
      enddate = this.millisecondsToDateString(enddate);
    }
    startdate = this.dateStringToMilliseconds(startdate);
    enddate = this.dateStringToMilliseconds(enddate);
    const user = firebase.auth().currentUser;
    if (user) {
      const idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
      let uid = firebase.auth().currentUser.uid;
      let timeArrayString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?orderBy="date"&startAt=${startdate}&endAt=${enddate}&print=pretty&auth=${idToken}`;
      const rs = await axios.get(timeArrayString);
      const records = rs.data;
      let dateArray = [];
      for (let key in records) {
        if (records.hasOwnProperty(key)) {
          let record = records[key];
          let date = record.date;
          date = this.millisecondsToDateString(date);
          if (!dateArray.includes(date)) {
            dateArray.push(date);
          }
        }
      }
      let chartArrayData = [];
      for (let i = 0; i < dateArray.length; i++) {
        const date = dateArray[i];
        const totalTime = await this.getDateTotalTime(dateArray[i]);
        let dateColumn = {};
        dateColumn.label = date;
        dateColumn.y = totalTime;
        if (totalTime < 4) { dateColumn.color = 'red' }
        else if (totalTime >= 4 && totalTime <= 8) { dateColumn.color = 'green' }
        else if (totalTime > 8) { dateColumn.color = 'blue' }
        chartArrayData.push(dateColumn);
      }
      this.setState({
        chartArrayData: chartArrayData
      })
    }
  }
  async exportExcel(startdate, enddate) {
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    if (isNumeric(startdate) && isNumeric(enddate)) {
      startdate = this.millisecondsToDateString(startdate);
      enddate = this.millisecondsToDateString(enddate);
    }
    startdate = this.dateStringToMilliseconds(startdate);
    enddate = this.dateStringToMilliseconds(enddate);
    const user = firebase.auth().currentUser;
    if (user) {
      const idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
      let uid = firebase.auth().currentUser.uid;
      let timeArrayString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?orderBy="date"&startAt=${startdate}&endAt=${enddate}&print=pretty&auth=${idToken}`;
      const rs = await axios.get(timeArrayString);
      const records = rs.data;
      let dateArray = [];
      for (let key in records) {
        if (records.hasOwnProperty(key)) {
          let record = records[key];
          let date = record.date;
          date = this.millisecondsToDateString(date);
          if (!dateArray.includes(date)) {
            dateArray.push(date);
          }
        }
      }
      let chartArrayData = [];
      var employee = await this.getEmployeeFromUid(user.uid);
      var id = employee.id;
      var name = employee.name;
      for (let i = 0; i < dateArray.length; i++) {
        const date = dateArray[i];
        const totalTime = await this.getDateTotalTime(dateArray[i]);
        let excelRow = {};
        excelRow.name = name;
        excelRow.id = id;
        excelRow.date = date;
        excelRow.time = totalTime;
        chartArrayData.push(excelRow);
      }
      this.setState({
        excelArray: chartArrayData
      })
    }
  }
  async getDateTotalTime(date) {
    const user = firebase.auth().currentUser;
    if (user) {
      const idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
      let uid = firebase.auth().currentUser.uid;
      let today = date;
      today = this.dateStringToMilliseconds(today);
      let timeArrayString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?orderBy="date"&equalTo=${today}&print=pretty&auth=${idToken}`;
      const rs = await axios.get(timeArrayString);
      const records = rs.data;
      let total = 0;
      for (let key in records) {
        if (records.hasOwnProperty(key)) {
          let starttime = records[key].starttime;
          let endtime = records[key].endtime;
          var diff = 0;
          if (starttime && starttime) {
            starttime = convertToSeconds(starttime);
            endtime = convertToSeconds(endtime);
            diff = Math.abs(endtime - starttime);
            const floatTimeValue = secondsToFloatValue(diff);
            total += floatTimeValue;
          }
          function convertToSeconds(time) {
            var splitTime = time.split(":");
            return splitTime[0] * 3600 + splitTime[1] * 60;
          }
          function secondsToFloatValue(secs) {
            var hours = parseInt(secs / 3600);
            var seconds = parseInt(secs % 3600);
            var minutes = parseInt(seconds / 60);
            const floatValue = hours + minutes / 60;
            const result = Math.round(floatValue * 1000) / 1000;
            return result;
          }
        }
      }
      return total;
    }
  }
  getToday() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    return today;
  }
  millisecondsToDateString(ms) {
    var today = new Date(ms);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    return today;
  }
  dateStringToMilliseconds(dateString) {
    var dateArr = dateString.split("/");
    var day = dateArr[0];
    var month = dateArr[1] - 1;
    var year = dateArr[2];
    return new Date(year, month, day).getTime();
  }
  render() {
    const {
      user,
      signOut,
      signInWithGoogle
    } = this.props;
    const {
      listRecord,
      listEmployee,
      currentEmployee,
      currentEmployeeRecord,
      chartArrayData,
      excelArray
    } = this.state;
    // this.setChartArrayDataFromDateToDate();
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
                      <Report chartArrayData={chartArrayData}
                        pickDate={this.changeReportDate}
                        excelArray={excelArray}
                      />
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
