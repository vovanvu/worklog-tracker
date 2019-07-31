import React, { Component } from 'react';
import ColumnChart from './ColumnChart'
import ChartDatePicker from './ChartDatePicker'
import ExcelExport from './ExcelExport'
export default class Report extends Component {
    render() {
        const { chartArrayData, pickDate, excelArray } = this.props;
        return (
            <div>
                <p>Select date to export total time report excel file (limit 3 months prior to today):</p>
                <ChartDatePicker pickDate={pickDate} />
                <span>Download Excel: </span>
                <ExcelExport excelArray={excelArray} />
                <ColumnChart chartArrayData={chartArrayData} />
            </div>

        )
    }
}