
import React from 'react';
import axios from 'axios';
import * as firebase from 'firebase/app';
import '../css/AddRecord.css'
import { FaPlus } from 'react-icons/fa';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
class AddRecord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            title: '',
            description: '',
            starttime: '',
            endtime: '',
            errors: {},
            addStatus: 0, //0: default, 1: add process, 2: add complete
            isAutoAdd: false,
            timeArray: []
        };

        this.toggle = this.toggle.bind(this);
        this.handleAutoCheck = this.handleAutoCheck.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
        const { modal } = this.state;
        !modal &&
            this.setState({
                title: '',
                description: '',
                starttime: '',
                endtime: '',
                errors: {},
                addStatus: 0, //0: default, 1: add process, 2: add complete
                isAutoAdd: false
            });
        !modal && this.setTimeArrayToday();
    }
    dateStringToMilliseconds(dateString) {
        var dateArr = dateString.split("/");
        var day = dateArr[0];
        var month = dateArr[1];
        var year = dateArr[2];
        return new Date(year, month, day).getTime();;
    }
    millisecondsToDateString(ms) {
        var today = new Date(ms);
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth()).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }
    handleFormSubmit = (e) => {
        if (this.handleValidation()) {
            this.setState({
                addStatus: 1
            })
            const { title, description } = this.state;
            let { starttime, endtime, isAutoAdd } = this.state;
            let date = this.getToday();
            date = this.dateStringToMilliseconds(date);
            firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
                let uid = firebase.auth().currentUser.uid;
                let addRecordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?auth=${idToken}`;
                //if auto add, get current time to fill start time and empty for end time
                if (isAutoAdd) {
                    var today = new Date();
                    var hh = String(today.getHours()).padStart(2, '0');
                    var mm = String(today.getMinutes()).padStart(2, '0');
                    var time = hh + ":" + mm;
                    starttime = time;
                    endtime = '';
                }
                axios.post(addRecordString, { title, description, starttime, endtime, date })
                    .then(() => {
                        this.setState({
                            addStatus: 2,
                            modal: false
                        })

                        //update App.js list record from function passed in props
                        const { update } = this.props;
                        update();
                    });
            });
        } else {
            console.log('form validate failed');
        }
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }
    getToday() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }

    handleClearForm = (e) => {
        this.setState({
            title: '',
            description: '',
            starttime: '',
            endtime: '',
            errors: {},
            addStatus: 0
        });
    }
    //check time is overlap with the other
    isOverlapRecordTime(starttime, endtime) {
        let isOverlap = false;
        const { timeArray } = this.state;
        for (let i = 0; i < timeArray.length; i++) {
            if (starttime < timeArray[i].starttime && endtime > timeArray[i].starttime) {
                isOverlap = true;
            }
            if (starttime < timeArray[i].endtime && endtime > timeArray[i].endtime) {
                isOverlap = true;
            }
            if (starttime === timeArray[i].starttime && endtime === timeArray[i].endtime) {
                isOverlap = true;
            }
        }
        return isOverlap;
    }
    //set Time array today to check overlap
    setTimeArrayToday() {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
            let uid = firebase.auth().currentUser.uid;
            let today = this.getToday();
            today = this.dateStringToMilliseconds(today);
            let a = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?orderBy="date"&equalTo=${today}&print=pretty&auth=${idToken}`;
            axios.get(a).then((rs) => {
                const records = rs.data;
                let timeArray = [];
                for (let key in records) {
                    if (records.hasOwnProperty(key)) {
                        let starttime = records[key].starttime;
                        let endtime = records[key].endtime;
                        let time = { starttime: starttime, endtime: endtime };
                        timeArray.push(time);
                    }
                }
                this.setState({
                    timeArray: timeArray
                })
            });
        });
    }
    handleValidation() {
        const { starttime, endtime, isAutoAdd } = this.state;
        let { title } = this.state;
        let errors = {};
        let formIsValid = true;
        title = title.trim();
        if (!title) {
            formIsValid = false;
            errors["title"] = "Cannot be empty";
        }
        if (!isAutoAdd) {
            if (!starttime) {
                formIsValid = false;
                errors["starttime"] = "Cannot be empty";
            }
            if (!endtime) {
                formIsValid = false;
                errors["endtime"] = "Cannot be empty";
            }
            if (starttime && endtime) {
                const validTime = this.isEndTimeAfterStartTime(starttime, endtime);
                if (!validTime) {
                    formIsValid = false;
                    errors["endtime"] = "End time must be after start time";
                } else {
                    const isOverlapTime = this.isOverlapRecordTime(starttime, endtime);
                    if (isOverlapTime) {
                        formIsValid = false;
                        errors["endtime"] = "Time is overlap with other record";
                    }
                }
            }
        }
        this.setState({ errors: errors });
        return formIsValid;
    }
    isEndTimeAfterStartTime(start, end) {
        var startArr = start.split(':');
        var endArr = end.split(':');
        var startHour = startArr[0];
        var startMinute = startArr[1];
        var endHour = endArr[0];
        var endMinute = endArr[1];
        if (endHour > startHour) {
            return true;
        }
        // eslint-disable-next-line
        if (endHour == startHour && endMinute >= startMinute) {
            return true;
        }
        return false;
    }
    handleAutoCheck(e) {
        const checkStatus = e.target.checked;
        checkStatus ?
            this.setState({
                isAutoAdd: true,
                starttime: '',
                endtime: ''
            })
            :
            this.setState({ isAutoAdd: false });
    }

    hasRecordOnActive() {
        var isHas = false;
        const { timeArray } = this.state;
        var today = new Date();
        var hh = String(today.getHours()).padStart(2, '0');
        var mm = String(today.getMinutes()).padStart(2, '0');
        var time = hh + ":" + mm;
        for (let i = 0; i < timeArray.length; i++) {
            if (time > timeArray[i].starttime && time < timeArray[i].endtime) {
                isHas = true;
                return isHas;
            }
        }
    }
    hasAutomaticRecordOnActive() {
        var isHas = false;
        const { timeArray } = this.state;
        for (let i = 0; i < timeArray.length; i++) {
            if (timeArray[i].endtime === '') {
                isHas = true;
                return isHas;
            }
        }
    }
    render() {
        const { addStatus, title, description, starttime, endtime, errors, isAutoAdd } = this.state;
        const hasRecordOnActive = this.hasRecordOnActive();
        const hasAutomaticRecordOnActive = this.hasAutomaticRecordOnActive();
        return (
            <div>
                <Button id="btn-add" color="primary" onClick={this.toggle}><FaPlus /> Add Record</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    {hasAutomaticRecordOnActive ? <ModalHeader toggle={this.toggle} >You must stop your current Automatic Record to add new Record</ModalHeader> :
                        <div>
                            <ModalHeader toggle={this.toggle}>Add New Record</ModalHeader>
                            <ModalBody>
                                <Form onSubmit={this.handleFormSubmit}>
                                    <FormGroup check>
                                        <Label check>
                                            {hasRecordOnActive ? <span className="text-warning">Can not use Automatic Add, you have a record on active</span> :
                                                <div>
                                                    <Input type="checkbox" onChange={this.handleAutoCheck} />
                                                    <span title="Add a record with start time is time when you click Add Record, you can stop it in future to get end time">Automatic Add</span>
                                                </div>
                                            }
                                        </Label>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="text">Title</Label>
                                        <Input type="text" name="title" value={title} onChange={this.handleChange} />
                                        <span style={{ color: "red" }}>{errors["title"]}</span>
                                    </FormGroup>
                                    <FormGroup>
                                        <FormGroup>
                                            <Label for="exampleText">Descriptipn</Label>
                                            <Input type="textarea" name="description" value={description} onChange={this.handleChange} />
                                        </FormGroup>
                                    </FormGroup>
                                    {!isAutoAdd &&
                                        <div>
                                            <FormGroup>
                                                <Label for="exampleTime">Start Time</Label>
                                                <Input value={starttime}
                                                    type="time"
                                                    name="starttime" onChange={this.handleChange}
                                                />
                                                <span style={{ color: "red" }}>{errors["starttime"]}</span>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="exampleTime">End Time</Label>
                                                <Input value={endtime}
                                                    type="time"
                                                    name="endtime" onChange={this.handleChange}
                                                />
                                                <span style={{ color: "red" }}>{errors["endtime"]}</span>
                                            </FormGroup>
                                        </div>}
                                    <Button color="primary" onClick={this.handleFormSubmit}>Add Record</Button>{' '}
                                    <Button color="secondary" onClick={this.handleClearForm}>Clear</Button>{' '}
                                    <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                                    {addStatus === 1 ? <p className="text-success">Processing...</p> : ''}
                                    {addStatus === 2 ? <p className="text-success">Add Complete!</p> : ' '}
                                </Form>
                            </ModalBody>
                        </div>}
                </Modal>
            </div>
        );
    }
}

export default AddRecord;