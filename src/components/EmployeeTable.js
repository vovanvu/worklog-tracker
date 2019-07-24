import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import RecordTable from '../components/RecordTable'
import { Col, Row, Button } from 'reactstrap'
export default class EmployeeTable extends Component {
    render() {
        const { currentEmployee, listRecord, setCurrentEmployee } = this.props;
        const columns = [
            {
                Header: "Employee ID",
                accessor: "employeeId",
                width: 300,
                minWidth: 300,
                maxWidth: 300
            },
            {
                Header: "",
                width: 300,
                minWidth: 300,
                maxWidth: 300,
                filterable: false,
                Cell: props => {
                    return (<div className="action-group">
                        <Button color="primary"
                            onClick={() => {
                                const employeeId = props.original.employeeId;
                                setCurrentEmployee(employeeId);
                            }}
                        >Select</Button>
                    </div>

                    )
                }
            }
        ]
        return (
            <div>
                <Row>
                    <Col md={5}>
                        <p>Select Employee</p>
                        <ReactTable
                            columns={columns}
                            data={this.props.listEmployee}
                            filterable
                            sortable={false}
                            defaultPageSize={10}
                        >
                        </ReactTable >
                    </Col>
                    <Col md={7}>
                        {currentEmployee ? <p>{currentEmployee}'s Records</p> : <p>No employee selected</p>}
                        <RecordTable listRecord={listRecord} readOnly={true} />
                    </Col>
                </Row>
            </div >
        );
    }
}
