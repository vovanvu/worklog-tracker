
import React from 'react';
import axios from 'axios';
import * as firebase from 'firebase/app';

import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
class UpdateRecord extends React.Component {
    constructor(props) {
        super(props);
        const { title, description, starttime, endtime } = this.props.record;
        this.state = {
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
            modal: !prevState.modal, deleteStatus: 0
        }));
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
                this.setState({
                    updateStatus: 2
                })
                axios.patch(updateRecordString, { title, description, starttime, endtime })
                    .then((result) => {
                        this.setState({
                            updateComplete: 1
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

        this.setState({ errors: errors });
        return formIsValid;
    }

    render() {
        const { updateStatus, title, description, starttime, endtime, errors } = this.state;
        const { record } = this.props;
        return (
            <div>
                <Button color="primary" onClick={this.toggle}>Update</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Update Record</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleFormSubmit}>
                            <FormGroup>
                                <Label for="text">Title {record.recordId}</Label>
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
                            <Button color="primary" onClick={this.handleFormSubmit}>Update Record</Button>{' '}
                            <Button color="secondary" onClick={this.handleClearForm}>Clear</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                            {updateStatus === 1 ? <p className="text-success">Processing...</p> : ''}
                            {updateStatus === 2 ? <p className="text-success">Update Complete!</p> : ' '}
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

export default UpdateRecord;