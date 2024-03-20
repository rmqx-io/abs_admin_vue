<template>
    <div ref="chart" style="width: 100%; height: 100%;"></div>
</template>
<script>
import * as echarts from 'echarts'

export default {
    name: 'BmsChartComponent',
    components: {
    },
    props: {
        deviceId: {
            type: String,
            default: 'default device id'
        },
        title: {
            type: String,
            default: 'default title'
        },
        ylabel: {
            type: String,
            default: 'default ylabel'
        },
        chartData: {
            type: Object,
            default: () => {
                return {
                    "data1": [
                        { time: "2023-07-22 00:00:00", value: 20 },
                        { time: "2023-07-22 00:02:00", value: 50 },
                        { time: "2023-07-22 00:04:00", value: 35 },
                        { time: "2023-07-22 00:06:00", value: 10 },
                        { time: "2023-07-22 00:08:00", value: 40 },
                    ],
                    "data2": [
                        { time: "2023-07-22 00:00:00", value: 25 },
                        { time: "2023-07-22 00:02:00", value: 51 },
                        { time: "2023-07-22 00:04:00", value: 25 },
                        { time: "2023-07-22 00:06:00", value: 20 },
                        { time: "2023-07-22 00:08:00", value: 10 },
                    ]
                }
            }
        },
        color: {
            type: Array,
            default: () => [
                '#6AD6E6',
                '#6F95DA',
                '#47ba80',
                '#E8A456',
                '#DBBB5B',
                '#E8E156'
            ]
        }
    },
    mounted() {
        this.updateChart(undefined);
    },
    data() {
        return {
        }
    },
    methods: {
        renderChart(series) {
            let chart = echarts.getInstanceByDom(this.$refs.chart);
            if (chart == null) {
                chart = echarts.init(this.$refs.chart);
            }
            const options = {
                sampling: 'lttb',
                color: this.color,
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params, ticket, callback) {
                        // console.log('params', params)
                        // console.log('ticket', ticket)
                        // console.log('callback', callback)
                        var res = params[0].name
                        for (var i = 0, l = params.length; i < l; i++) {
                            if (i === 0) {
                                res += params[i].value[0]
                            }
                            res += '<br/>'
                            // a dot with corresponding color
                            res += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + ';"></span>'
                            res += params[i].seriesName + '</span> : ' + params[i].value[1]
                        }
                        setTimeout(function () {
                            callback(ticket, res)
                        }, 100)
                        return 'loading'
                    }
                },
                title: {
                    left: 'center',
                    text: this.title
                },
                toolbox: {
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '10%'],
                    name: this.ylabel
                },
                series: series
            };
            chart.setOption(options);
        },
        updateChart(chartData) {
            if (chartData === undefined) {
                chartData = this.chartData
            }
            var series = []
            for (var key in chartData) {
                series.push({
                    data: chartData[key].map((item) => [item.time, item.value]),
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    name: key
                })
            }
            this.renderChart(series)
        }
    }
}
</script>
