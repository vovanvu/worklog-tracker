
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
            isAutoAdd: false
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
    }

    handleFormSubmit = (e) => {
        if (this.handleValidation()) {
            this.setState({
                addStatus: 1
            })
            const { title, description } = this.state;
            let { starttime, endtime, isAutoAdd } = this.state;
            const date = this.getToday();
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
                            addStatus: 2
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
    componentDidMount() {
        this.getLastEndTimeToday();
    }
    //
    //get the last record's end time today, not allow multi task
    getLastEndTimeToday() {
        if (!this.handleValidation()) {
            this.setState({
                addStatus: 1
            })
            firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
                let uid = firebase.auth().currentUser.uid;
                var today = this.getToday();
                let a = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?orderBy="date"&equalTo="${today}"&print=pretty&auth=${idToken}`;
                axios.get(a)
                    .then((rs) => {
                        const records = rs.data;
                        let mergeArray = [];
                        for (let key in records) {
                            if (records.hasOwnProperty(key)) {
                                var starttime = records[key].starttime;
                                var endtime = records[key].endtime;
                                var time = { starttime: starttime, endtime: endtime };
                                mergeArray.push(time);
                            }
                        }
                        console.log(mergeArray);
                        //
                        var myS = "18:04";
                        var myE = "19:00";
                        console.log(myS, myE);
                        var isDuplicate = false;
                        for (let i = 0; i < mergeArray.length; i++) {
                            if (myS < mergeArray[i].starttime && myE > mergeArray[i].starttime) {
                                isDuplicate = true;
                            }
                            if (myS < mergeArray[i].endtime && myE > mergeArray[i].endtime) {
                                isDuplicate = true;
                            }
                        }

                        // var s = mergeArray[1].starttime;
                        // var e = mergeArray[1].endtime;
                        // console.log(s, e);

                        // if (myS < s && myE > s) {
                        //     console.log("duplicate before");
                        // }
                        // if (myS < e && myE > e) {
                        //     console.log("duplicate after");
                        // }
                    });
            });
        }
    }
    //
    //
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
    render() {
        const { addStatus, title, description, starttime, endtime, errors, isAutoAdd } = this.state;
        return (
            <div>
                <Button id="btn-add" color="primary" onClick={this.toggle}><FaPlus /> Add Record</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Add New Record</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleFormSubmit}>
                            <FormGroup check>
                                <Label check>
                                    <Input type="checkbox" onChange={this.handleAutoCheck} />
                                    <span title="Add a record with start time is time when you click Add Record, you can stop it in future to get end time">Automatic Add</span>
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
                </Modal>
            </div>
        );
    }
}

export default AddRecord;