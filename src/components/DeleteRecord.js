
import React from 'react';
import axios from 'axios';
import * as firebase from 'firebase/app';
import '../css/DeleteRecord.css'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Form } from 'reactstrap';
import { FaTrash } from 'react-icons/fa';

class DeleteRecord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            deleteStatus: 0 //0: default, 1: delete process, 2: delete complete
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal, deleteStatus: 0
        }));
    }
    handleFormSubmit = (e) => {
        this.setState({
            deleteStatus: 1
        })
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
            let uid = firebase.auth().currentUser.uid;
            var recordId = this.props.recordId;
            let deleteRecordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}/${recordId}.json?auth=${idToken}`;

            axios.delete(deleteRecordString, recordId)
                .then(() => {
                    this.setState({
                        deleteStatus: 2
                    })
                    //update App.js list record from function passed in props
                    const { update } = this.props;
                    update();
                });
        });
    }
    render() {
        const { deleteStatus } = this.state;
        const { recordId } = this.props;
        return (
            <div>
                <Button id="btn-delete" color="secondary" onClick={this.toggle}><FaTrash /></Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Delete Record <b>{recordId}</b> ?</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleFormSubmit}>
                            <Button color="primary" onClick={this.handleFormSubmit}>Delete Record</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                            {deleteStatus === 1 ? <p className="text-success">Processing...</p> : ''}
                            {deleteStatus === 2 ? <p className="text-success">Delete Complete!</p> : ' '}
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

export default DeleteRecord;