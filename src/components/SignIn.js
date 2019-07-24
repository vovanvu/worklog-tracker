import React, { Component } from 'react'
import { Button, Row, Col } from 'reactstrap';
import '../css/SignIn.css'
import { FaGoogle } from 'react-icons/fa';

export default class SignIn extends Component {

    render() {
        const { signInWithGoogle } = this.props;
        return (
            <Row className="signin-background">
                <Col>
                    <div id="rectangle">
                        <Row>
                            <Col>
                                <div id="signin-box">
                                    <p id="worklog-text">Worklog Tracker</p>
                                    <Row>
                                        <Col className="btn-signin">
                                            <Button className="primary" onClick={signInWithGoogle}>Sign in with Google <FaGoogle /></Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        );
    }
}