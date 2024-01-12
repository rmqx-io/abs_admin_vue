<template>
    <a-card :loading="loading">
        <div>
            <a-form>
                <a-row :gutter='48'>
                    <a-col :md="12" :sm="12">
                        <!-- Select date -->
                        <a-form-item aria-label="日期">
                            <a-date-picker
                                v-model="date"
                                style="width: 100%"
                                placeholder="日期"
                                @change="getBmsHistoryDataAndUpdateChart"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>
        <div style="width: 100%; height: 400px;">
            <bms-chart-component
                ref="voltageChart"
                :deviceId="deviceId"
                :title="voltageCurrentCapacityTitle"
                :ylabel="voltageCurrentCapacityYLabel"
                :chartData="voltageCurrentCapacityData"
            />
        </div>
        <div style="width: 100%; height: 400px;">
            <bms-chart-component
                ref="temperatureChart"
                :deviceId="deviceId"
                :title="temperatureTitle"
                :ylabel="temperatureYLabel"
                :chartData="temperatureData"
            />
        </div>
        <div style="width: 100%; height: 400px;">
            <bms-chart-component
                ref="singleBatteryVoltageChart"
                :deviceId="deviceId"
                :title="singleBatteryVoltageTitle"
                :ylabel="singleBatteryVoltageYLabel"
                :chartData="singleBatteryVoltageData"
            />
        </div>
    </a-card>
</template>
<script>
import { getBmsType, getBatteryInfo } from '@/api/manage'
import BmsChartComponent from '@/views/list/components/BmsChartComponent'
import moment from 'moment/moment'

export default {
    name: 'BmsHistory',
    components: {
        BmsChartComponent
    },
    props: {
        deviceId: {
            type: String,
            default: 'default device id'
        }
    },
    mounted () {
        getBmsType(this.deviceId).then(res => {
            this.bms_type = res.data.bms_type
            this.getBmsHistoryDataAndUpdateChart()
        })
    },
    data() {
        return {
            date: moment(new Date()),
            voltageCurrentCapacityTitle: '电池电压、电流、电量',
            voltageCurrentCapacityYLabel: '电压/电流/电量',
            voltageCurrentCapacityData: {},
            temperatureTitle: '电池温度',
            temperatureYLabel: '温度 (°C)',
            temperatureData: {},
            singleBatteryVoltageTitle: '单体电池电压',
            singleBatteryVoltageYLabel: '电压 (V)',
            singleBatteryVoltageData: {},
            loading: false,
            bms_type: "",
        }
    },
    methods: {
        getBmsHistoryDataAndUpdateChart() {
            const start_date = this.date
            let start_time = moment(this.date)
            // set start_time to 00:00:00
            start_time.hour(0)
            start_time.minute(0)
            start_time.second(0)
            const end_date = this.date
            let end_time = moment(this.date)
            // set end_time to 23:59:59
            end_time.hour(23)
            end_time.minute(59)
            end_time.second(59)
            const arg = {
                start_date: start_date.format('YYYY-MM-DD HH:mm:ss'),
                start_time: start_time.format('YYYY-MM-DD HH:mm:ss'),
                end_date: end_date.format('YYYY-MM-DD HH:mm:ss'),
                end_time: end_time.format('YYYY-MM-DD HH:mm:ss')
            }
            console.log('arg', arg)
            this.loading = true
            getBatteryInfo(this.deviceId, this.bms_type, arg)
                .then(res => {
                    this.loading = false
                    console.log('getBatteryInfo', res)
                    const bmsVoltageList = []
                    const bmsCurrentList = []
                    const bmsCapacityList = []
                    const bmsTemperatureList = []
                    const bmsBoxTemperatureList = []
                    const bmsPowerTransistorTemperatureList = []
                    const bmsSingleBatteryVoltageList = []
                    if (res.data && res.data.length > 0) {
                        res.data.forEach(item => {
                            const timestamp = moment(item.time_tracking).format('YYYY-MM-DD HH:mm:ss')
                            bmsVoltageList.push(
                                {
                                    value: item.battery_voltage,
                                    time: timestamp
                                })
                            bmsCurrentList.push(
                                {
                                    value: item.battery_currency,
                                    time: timestamp
                                })
                            bmsCapacityList.push(
                                {
                                    value: item.battery_capacity_soc,
                                    time: timestamp
                                })
                            bmsTemperatureList.push(
                                {
                                    value: item.battery_temperature,
                                    time: timestamp
                                })
                            bmsBoxTemperatureList.push(
                                {
                                    value: item.battery_box_temperature,
                                    time: timestamp
                                })
                            bmsPowerTransistorTemperatureList.push(
                                {
                                    value: item.power_transistor_temperature,
                                    time: timestamp
                                })
                            item.single_battery_voltage_arr.split(',').forEach((voltage, index) => {
                                if (bmsSingleBatteryVoltageList.length < index + 1) {
                                    bmsSingleBatteryVoltageList.push([])
                                }
                                bmsSingleBatteryVoltageList[index].push(
                                    {
                                        value: voltage,
                                        time: timestamp
                                    }
                                )
                            })
                        })
                        // console.log('bmsVoltageList', bmsVoltageList)
                        this.voltageCurrentCapacityData = {
                            '电压': bmsVoltageList,
                            '电流': bmsCurrentList,
                            '电量': bmsCapacityList
                        }
                        this.temperatureData = {
                            '电池温度': bmsTemperatureList,
                            '箱内温度': bmsBoxTemperatureList,
                            '功率管温度': bmsPowerTransistorTemperatureList
                        }
                        this.singleBatteryVoltageData = {}
                        bmsSingleBatteryVoltageList.forEach((voltageList, index) => {
                            this.singleBatteryVoltageData['电池' + (index + 1)] = voltageList
                        })
                        console.log('voltageCurrentCapacityData', this.voltageCurrentCapacityData)
                        console.log('temperatureData', this.temperatureData)
                        console.log('singleBatteryVoltageData', this.singleBatteryVoltageData)
                        const that = this
                        setTimeout(() => {
                            that.$refs.voltageChart.updateChart(this.voltageCurrentCapacityData)
                            that.$refs.temperatureChart.updateChart(this.temperatureData)
                            that.$refs.singleBatteryVoltageChart.updateChart(this.singleBatteryVoltageData)
                        }, 1000)
                    } else if (res.data && res.data.length === 0) {
                        // if no data, clear chart
                        this.voltageCurrentCapacityData = {}
                        this.temperatureData = {}
                        this.singleBatteryVoltageData = {}
                        const that = this
                        setTimeout(() => {
                            that.$refs.voltageChart.updateChart(this.voltageCurrentCapacityData)
                            that.$refs.temperatureChart.updateChart(this.temperatureData)
                            that.$refs.singleBatteryVoltageChart.updateChart(this.singleBatteryVoltageData)
                        }, 1000)
                    }
                })
        }
    }
}
</script>
