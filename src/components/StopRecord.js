
import React from 'react';
import axios from 'axios';
import * as firebase from 'firebase/app';
import '../css/DeleteRecord.css'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Form } from 'reactstrap';
import { FaStop } from 'react-icons/fa';

class StopRecord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            stopStatus: 0 //0: default, 1: stop process, 2: stop complete
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal, stopStatus: 0
        }));
    }
    handleFormSubmit = (e) => {
        this.setState({
            stopStatus: 1
        })
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
            let uid = firebase.auth().currentUser.uid;
            var recordId = this.props.record.recordId;
            let stopRecordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}/${recordId}.json?auth=${idToken}`;
            this.setState({
                stopStatus: 2
            })
            //get current time
            var today = new Date();
            var hh = String(today.getHours()).padStart(2, '0');
            var mm = String(today.getMinutes()).padStart(2, '0');
            var time = hh + ":" + mm;
            const endtime = { endtime: time };
            axios.patch(stopRecordString, endtime)
                .then(() => {
                    this.setState({
                        stopComplete: 1
                    })
                    //update App.js list record from function passed in props
                    const { update } = this.props;
                    update();
                });
        });
    }
    getToday() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }
    render() {
        const { stopStatus } = this.state;
        const { record } = this.props;
        const startDate = record.date;
        const today = this.getToday();
        const isSameStartEndDate = startDate === today;
        return (
            <div>
                <Button id="btn-stop" color="secondary" onClick={this.toggle}><FaStop /></Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Stop Record <b>{record.recordId}</b> ?</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleFormSubmit}>
                            {!isSameStartEndDate && < p className="text-warning"> Warning: This record's start date is not the same date with the date you stop it!</p>}
                            <Button color="primary" onClick={this.handleFormSubmit}>Stop Record</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                            {stopStatus === 1 ? <p className="text-success">Processing...</p> : ''}
                            {stopStatus === 2 ? <p className="text-success">Stop Complete!</p> : ' '}
                        </Form>
                    </ModalBody>
                </Modal>
            </div >
        );
    }
}

export default StopRecord;