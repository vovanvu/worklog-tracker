import React, { Component } from 'react';
import CanvasJSReact from '../canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class ColumnChart extends Component {
    render() {
        const { chartArrayData } = this.props;
        const options = {
            title: {
                text: "Total Time Chart"
            },
            animationEnabled: true,
            data: [
                {
                    // Change type to "doughnut", "line", "splineArea", etc.
                    type: "column",
                    dataPoints: chartArrayData
                }
            ]
        }

        return (
            <div>
                <CanvasJSChart options={options}
                /* onRef={ref => this.chart = ref} */
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }
}

export default ColumnChart;