import React, { Component } from 'react';
import ReactTable from 'react-table';
import axios from 'axios'
import * as firebase from 'firebase/app';
import 'react-table/react-table.css'
import RecordTable from '../components/RecordTable'
import { Col, Row, Button } from 'reactstrap'
import ChartDatePicker from '../components/ChartDatePicker'
import ExcelExport from '../components/ExcelExport'
export default class EmployeeTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportDayStart: this.getToday(),
            reportDayEnd: this.getToday(),
            excelArray: []
        };

    }
    changeReportDate = (startdate, enddate) => {
        this.setState({
            reportDayStart: startdate,
            reportDayEnd: enddate
        }, () => {
            const { reportDayStart, reportDayEnd } = this.state;
            this.exportExcel(reportDayStart, reportDayEnd);
        })
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
            const { currentEmployee } = this.props;
            let uid = currentEmployee.uid;
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
            var id = currentEmployee.id;
            var name = currentEmployee.name;
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
            const { currentEmployee } = this.props;
            let uid = currentEmployee.uid;
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
        return new Date(year, month, day).getTime();;
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.currentEmployee !== nextProps.currentEmployee) {
            const { reportDayStart, reportDayEnd } = this.state;
            this.exportExcel(reportDayStart, reportDayEnd);
        }
    }
    render() {
        const columns = [
            {
                Header: "ID",
                accessor: "id",
                width: 150,
                minWidth: 150,
                maxWidth: 150
            },
            {
                Header: "Name",
                accessor: "name",
                width: 150,
                minWidth: 150,
                maxWidth: 150
            },
            {
                Header: "",
                width: 300,
                minWidth: 300,
                maxWidth: 300,
                filterable: false,
                Cell: props => {
                    return (<div className="action-group">
                        <Button color="primary"
                            onClick={() => {
                                // const uid = props.original.uid;
                                // setCurrentEmployee(uid);
                                const employee = props.original;
                                setCurrentEmployee(employee);
                            }}
                        >Select</Button>
                    </div>

                    )
                }
            }
        ]
        const { currentEmployee, listRecord, setCurrentEmployee, listEmployee } = this.props;
        const { excelArray } = this.state;

        return (
            <div>
                <Row>
                    <Col md={5}>
                        <p>Select Employee. Total: {listEmployee.length}</p>
                        <ReactTable
                            columns={columns}
                            data={listEmployee}
                            filterable
                            sortable={false}
                            defaultPageSize={10}
                        >
                        </ReactTable >
                    </Col>
                    <Col md={7}>
                        {currentEmployee ?
                            <div><p>Selected employee: <b>{currentEmployee.id} - {currentEmployee.name}</b></p>
                                <p>Select date to export total time report excel file (limit 3 months prior to today):</p>
                                <ChartDatePicker pickDate={this.changeReportDate} />
                                <span>Download Excel: </span>
                                <ExcelExport excelArray={excelArray} />
                                <hr></hr>
                                <p>Record List</p>
                            </div>
                            : <p>No employee selected</p>}
                        <RecordTable listRecord={listRecord} readOnly={true} />
                    </Col>
                </Row>
            </div >
        );
    }
}
