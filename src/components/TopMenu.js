import React from "react";
import './TopMenu.css'
import { Button } from 'reactstrap';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem
} from "reactstrap";
import { Link } from "react-router-dom";
export default class TopMenu extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        const { user, signOut } = this.props;
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <NavbarBrand href=" ">Worklog Tracker</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <Link to="/">My Report</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/">Empoyee Report</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/">Report</Link>
                            </NavItem>
                            <NavItem className="userBox">
                                <img alt='avatar' width={40} height={40} src={user.photoURL} />
                                <p>{user.displayName}</p>
                                <Button className="secondary" onClick={signOut}>Sign out</Button>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}
