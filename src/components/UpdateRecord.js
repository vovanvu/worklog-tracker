
import React from 'react';
import axios from 'axios';
import * as firebase from 'firebase/app';
import '../css/UpdateRecord.css'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { FaInfo, FaEdit } from 'react-icons/fa';

class UpdateRecord extends React.Component {
    constructor(props) {
        super(props);
        const { title, description, starttime, endtime } = this.props.record;
        const { readOnly } = this.props;
        this.state = {
            readOnly: readOnly,
            modal: false,
            title: title,
            description: description,
            starttime: starttime,
            endtime: endtime,
            errors: {},
            updateStatus: 0 //0: default, 1: update process, 2: update complete
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal, updateStatus: 0
        }));
        const { title, description, starttime, endtime } = this.props.record;
        this.setState({
            title: title,
            description: description,
            starttime: starttime,
            endtime: endtime
        });
    }
    handleFormSubmit = (e) => {
        const { record } = this.props;
        const recordId = record.recordId;
        if (this.handleValidation()) {
            this.setState({
                updateStatus: 1
            })
            const { title, description, starttime, endtime } = this.state;
            firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
                let uid = firebase.auth().currentUser.uid;
                let updateRecordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}/${recordId}.json?auth=${idToken}`;

                axios.patch(updateRecordString, { title, description, starttime, endtime })
                    .then((result) => {
                        this.setState({
                            updateStatus: 2
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
    handleClearForm = (e) => {
        this.setState({
            title: '',
            description: '',
            starttime: '',
            endtime: '',
            updateStatus: 0
        });
    }
    handleValidation() {
        const { starttime, endtime } = this.state;
        let { title } = this.state;
        let errors = {};
        let formIsValid = true;
        title = title.trim();
        if (!title) {
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
        const { updateStatus, title, description, starttime, endtime, errors, readOnly } = this.state;
        const { record } = this.props;
        return (
            <div>
                {readOnly ?
                    <Button className="btn-action" color="secondary" onClick={this.toggle}><FaInfo /></Button> :
                    <Button className="btn-action" color="secondary" onClick={this.toggle}><FaEdit /></Button>
                }
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    {readOnly ?
                        <ModalHeader toggle={this.toggle}>Info Record <b>{record.recordId}</b></ModalHeader> :
                        <ModalHeader toggle={this.toggle}>Update Record <b>{record.recordId}</b></ModalHeader>
                    }
                    <ModalBody>
                        <Form onSubmit={this.handleFormSubmit}>
                            <FormGroup>
                                <Label for="text">Title</Label>
                                {
                                    readOnly ? (<Input readOnly type="text" name="title" value={title} />) :
                                        <Input type="text" name="title" value={title} onChange={this.handleChange} />

                                }
                                <span style={{ color: "red" }}>{errors["title"]}</span>
                            </FormGroup>
                            <FormGroup>
                                <FormGroup>
                                    <Label for="exampleText">Descriptipn</Label>
                                    {
                                        readOnly ? (<Input readOnly type="textarea" name="description" value={description} />) :
                                            <Input type="textarea" name="description" value={description} onChange={this.handleChange} />
                                    }
                                </FormGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleTime">Start Time</Label>
                                {
                                    readOnly ? (<Input readOnly value={starttime}
                                        type="time"
                                        name="starttime" />) :
                                        <Input value={starttime}
                                            type="time"
                                            name="starttime" onChange={this.handleChange}
                                        />
                                }

                                <span style={{ color: "red" }}>{errors["starttime"]}</span>
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleTime">End Time</Label>
                                {
                                    readOnly ? (<Input readOnly value={endtime}
                                        type="time"
                                        name="endtime" />) :
                                        <Input value={endtime}
                                            type="time"
                                            name="endtime" onChange={this.handleChange}
                                        />
                                }
                                <span style={{ color: "red" }}>{errors["endtime"]}</span>
                            </FormGroup>
                            {
                                readOnly ? <Button color="secondary" onClick={this.toggle}>Cancel</Button> :
                                    <div>     <Button color="primary" onClick={this.handleFormSubmit}>Update Record</Button>{' '}
                                        <Button color="secondary" onClick={this.handleClearForm}>Clear</Button>{' '}
                                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                                        {updateStatus === 1 ? <p className="text-success">Processing...</p> : ''}
                                        {updateStatus === 2 ? <p className="text-success">Update Complete!</p> : ' '}</div>
                            }

                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

export default UpdateRecord;