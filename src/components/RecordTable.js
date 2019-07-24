import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import '../css/RecordTable.css'
import AddRecord from '../components/AddRecord'
import DeleteRecord from '../components/DeleteRecord'
import UpdateRecord from '../components/UpdateRecord'
export default class RecordTable extends Component {
    render() {
        const { readOnly } = this.props;
        const columnForRead = [
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
                Header: "Detail",
                Cell: props => {
                    return (<div className="action-group">
                        <UpdateRecord readOnly={true} record={props.original} />
                    </div>

                    )
                },
                sortable: false,
                filterable: false,
                width: 100,
                minWidth: 100,
                maxWidth: 100
            }];
        const columnsForAction = [
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
                    return (<div className="action-group">
                        {/* <button
                            onClick={() => {
                                console.log(props.original);
                            }}
                        >Delete</button> */}
                        <UpdateRecord readOnly={true} record={props.original} />
                        <UpdateRecord readOnly={false} record={props.original} update={this.props.update} />
                        <DeleteRecord recordId={props.original.recordId} update={this.props.update} />
                    </div>

                    )
                },
                sortable: false,
                filterable: false,
                width: 200,
                minWidth: 200,
                maxWidth: 200
            }
        ]
        let columns = '';
        readOnly ? columns = columnForRead : columns = columnsForAction;
        return (
            <div>
                {!readOnly && <AddRecord update={this.props.update} />}
                <ReactTable
                    columns={columns}
                    data={this.props.listRecord}
                    filterable
                    defaultPageSize={10}
                >
                </ReactTable >
            </div>
        );
    }
}
