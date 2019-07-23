
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
            addStatus: 0 //0: default, 1: add process, 2: add complete
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal, addStatus: 0
        }));
    }
    handleFormSubmit = (e) => {
        if (this.handleValidation()) {
            this.setState({
                addStatus: 1
            })
            const { title, description, starttime, endtime } = this.state;
            const date = this.getToday();
            firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
                let uid = firebase.auth().currentUser.uid;
                let addRecordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?auth=${idToken}`;
                this.setState({
                    addStatus: 2
                })
                axios.post(addRecordString, { title, description, starttime, endtime, date })
                    .then((result) => {
                        this.setState({
                            addComplete: 1
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
    handleValidation() {
        const { title, starttime, endtime } = this.state;
        let errors = {};
        let formIsValid = true;

        if (!title || !title.trim()) {
            formIsValid = false;
            errors["title"] = "Cannot be empty";
        }
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
    render() {
        const { addStatus, title, description, starttime, endtime, errors } = this.state;
        return (
            <div>
                <Button id="btn-add" color="primary" onClick={this.toggle}><FaPlus /> Add Record</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Add New Record</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleFormSubmit}>
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