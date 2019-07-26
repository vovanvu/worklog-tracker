import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import RecordTable from '../components/RecordTable'
import { Col, Row, Button } from 'reactstrap'
export default class EmployeeTable extends Component {
    getIdFromUid(uid){
        const {listEmployee} = this.props;
        const result = listEmployee.filter(emp=>emp.uid=uid);
        return result;
    }
    render() {
        const columns = [
            {
                Header: "ID",
                accessor: "id",
                width: 150,
                minWidth: 150,
                maxWidth: 150
            },
            {
                Header: "Name",
                accessor: "name",
                width: 150,
                minWidth: 150,
                maxWidth: 150
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
                                const uid = props.original.uid;
                                setCurrentEmployee(uid);
                            }}
                        >Select</Button>
                    </div>

                    )
                }
            }
        ]
        const { currentEmployee, listRecord, setCurrentEmployee,listEmployee } = this.props;
        console.log(`render`,listEmployee)
        return (
            <div>
                <Row>
                    <Col md={5}>
                        <p>Select Employee: {listEmployee.length}</p>
                        <ReactTable
                            columns={columns}
                            data={listEmployee}
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
