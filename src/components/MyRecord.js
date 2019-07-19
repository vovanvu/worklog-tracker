import React, { Component } from 'react';
import { Table } from 'reactstrap';
export default class MyRecord extends Component {

    render() {
        const { listRecord } = this.props;
        return (
            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Start time</th>
                        <th>End time</th>
                    </tr></thead>
                <tbody>{listRecord.map((item) =>
                    <tr key={item[0]}>
                        <td>{item[0]}</td>
                        <td>{item[1].date}</td>
                        <td>{item[1].title}</td>
                        <td>{item[1].description}</td>
                        <td>{item[1].starttime}</td>
                        <td>{item[1].endtime}</td>
                    </tr>
                )}</tbody>
            </Table>
        );
    }
}

