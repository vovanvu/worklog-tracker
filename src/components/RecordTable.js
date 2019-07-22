import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import DeleteRecord from '../components/DeleteRecord'
import UpdateRecord from '../components/UpdateRecord'
export default class RecordTable extends Component {
    render() {
        const columns = [
            {
                Header: "Record ID",
                accessor: "recordId",
                width: 300,
                minWidth: 300,
                maxWidth: 300
            },
            {
                Header: "Title",
                accessor: "title"
            },
            {
                Header: "Date",
                accessor: "date",
                width: 100,
                minWidth: 100,
                maxWidth: 100
            },
            {
                Header: "Start Time",
                accessor: "starttime",
                width: 100,
                minWidth: 100,
                maxWidth: 100
            },
            {
                Header: "End Time",
                accessor: "endtime",
                width: 100,
                minWidth: 100,
                maxWidth: 100
            },
            {
                Header: "Action",
                Cell: props => {
                    return (<div>
                        {/* <button
                            onClick={() => {
                                console.log(props.original);
                            }}
                        >Delete</button> */}
                        <DeleteRecord recordId={props.original.recordId} update={this.props.update} />
                        <UpdateRecord record={props.original} update={this.props.update} />

                    </div>

                    )
                },
                sortable: false,
                filterable: false,
                width: 300,
                minWidth: 300,
                maxWidth: 300
            }
        ]
        return (
            <ReactTable
                columns={columns}
                data={this.props.listRecord}
                filterable
                defaultPageSize={10}
            >
            </ReactTable >
        );
    }
}
