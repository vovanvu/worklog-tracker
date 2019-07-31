import React from "react";
import '../css/TopMenu.css'
import { Button } from 'reactstrap';
import { withRouter } from "react-router-dom";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem
} from "reactstrap";
import { NavLink } from "react-router-dom";
class TopMenu extends React.Component {
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
                            <NavLink className="nav-link" to="/" exact activeStyle={{
                                textDecoration: 'underline'
                            }}>My Record</NavLink>
                            <NavLink className="nav-link" to="/employee-record" exact activeStyle={{
                                textDecoration: 'underline'
                            }}>Employee Record</NavLink>
                            <NavLink className="nav-link" to="/report" exact activeStyle={{
                                textDecoration: 'underline'
                            }}>Report</NavLink>
                            <NavItem className="userBox">
                                <img id='avatar' alt='avatar' width={40} height={40} src={user.photoURL} />
                                <p id='display-name'>{user.displayName}</p>
                                <Button className="secondary" onClick={(e) => {
                                    const { reset } = this.props;
                                    this.props.history.push('/');
                                    reset();
                                    signOut();
                                }}>Sign out</Button>
                            </NavItem>
                        </Nav>
                        {/* <Nav className="ml-auto" navbar>
                            <NavItem>
                                <Link to="/">My Record</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/employee-record">Employee Record</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/report">Report</Link>
                            </NavItem>
                            <NavItem className="userBox">
                                <img id='avatar' alt='avatar' width={40} height={40} src={user.photoURL} />
                                <p id='display-name'>{user.displayName}</p>
                                <Button className="secondary" onClick={(e) => {
                                    const { reset } = this.props;
                                    this.props.history.push('/');
                                    reset();
                                    signOut();
                                }}>Sign out</Button>
                            </NavItem>
                        </Nav> */}
                    </Collapse>
                </Navbar>
            </div >
        );
    }
}

export default withRouter(TopMenu)