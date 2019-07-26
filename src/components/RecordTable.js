import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import '../css/RecordTable.css'
import AddRecord from '../components/AddRecord'
import DeleteRecord from '../components/DeleteRecord'
import UpdateRecord from '../components/UpdateRecord'
import StopRecord from '../components/StopRecord'
export default class RecordTable extends Component {
    getToday() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }
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
                width: 250,
                minWidth: 250,
                maxWidth: 250
            },
            {
                Header: "Title",
                accessor: "title"
            },
            {
                Header: "Date",
                id: 'date',
                accessor: "date",
                width: 150,
                minWidth: 150,
                maxWidth: 150
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
                    const endtime = props.original.endtime;
                    return (<div className="action-group">
                        {/* <button
                            onClick={() => {
                                console.log(props.original.endtime);
                            }}
                        >Delete</button> */}
                        {!endtime && <StopRecord record={props.original} update={this.props.update} />}
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
        const today = this.getToday();
        return (
            <div>
                {!readOnly && <AddRecord update={this.props.update} />}
                <ReactTable
                    columns={columns}
                    data={this.props.listRecord}
                    filterable
                    defaultPageSize={10}
                    defaultFiltered={[
                        {
                            id: 'date',
                            value: today
                        }
                    ]}
                >
                </ReactTable >
            </div >
        );
    }
}
