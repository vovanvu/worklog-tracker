import React from "react";
import ReactExport from "react-data-export";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export default class Download extends React.Component {
    render() {
        const { excelArray } = this.props;
        return (
            <ExcelFile>
                <ExcelSheet data={excelArray} name="Report">
                    <ExcelColumn label="Name" value="name" />
                    <ExcelColumn label="Employee ID" value="id" />
                    <ExcelColumn label="Date" value="date" />
                    <ExcelColumn label="Time" value="time" />
                </ExcelSheet>
            </ExcelFile>
        );
    }
}
