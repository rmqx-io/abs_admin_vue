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
                    <a-col :md="6" :sm="12">
                        <a-form-item aria-label="导出">
                            <a-button
                                type="primary"
                                ghost
                                icon="file-excel"
                                :loading="exporting"
                                data-testid="bms-history-export-button"
                                @click="exportExcel"
                            >导出 Excel</a-button>
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
import { getBmsType, getBatteryInfo, exportBmsHistoryExcel } from '@/api/manage'
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
            exporting: false,
            bms_type: "",
        }
    },
    methods: {
        getBmsHistoryDataAndUpdateChart() {
            const start_date = this.date
            const start_time = moment(this.date)
            // set start_time to 00:00:00
            start_time.hour(0)
            start_time.minute(0)
            start_time.second(0)
            const end_date = this.date
            const end_time = moment(this.date)
            // set end_time to 23:59:59
            end_time.hour(23)
            end_time.minute(59)
            end_time.second(59)
            const arg = {
                start_date: start_time,
                start_time: start_time,
                end_date: end_time.format('YYYY-MM-DD HH:mm:ss'),
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
                                    value: parseFloat(item.battery_temperature) === -273.1 ? null : item.battery_temperature,
                                    time: timestamp
                                })
                            bmsBoxTemperatureList.push(
                                {
                                    value: parseFloat(item.battery_box_temperature) === -273.1 ? null : item.battery_box_temperature,
                                    time: timestamp
                                })
                            bmsPowerTransistorTemperatureList.push(
                                {
                                    value: parseFloat(item.power_transistor_temperature) === -273.1 ? null : item.power_transistor_temperature,
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
        },
        /**
         * 导出所选日期（00:00:00 ~ 23:59:59）的全部历史信息为 Excel。
         * 页面是 ECharts 折线图，落盘由后端把同一套查询结果写成 .xlsx，
         * 前端只负责带上当前 bms_type 和日期区间，再把 blob 交给浏览器下载。
         */
        async exportExcel () {
            if (!this.bms_type) {
                this.$message.error('BMS 类型加载未完成，请稍后重试')
                return
            }
            const startDate = this.date.clone().startOf('day')
            const endDate = this.date.clone().endOf('day')
            this.exporting = true
            try {
                const blob = await exportBmsHistoryExcel(this.deviceId, this.bms_type, {
                    device_id: this.deviceId,
                    bms_type: this.bms_type,
                    start_date: startDate.format('YYYY-MM-DD HH:mm:ss'),
                    end_date: endDate.format('YYYY-MM-DD HH:mm:ss')
                })
                if (!blob || !blob.size) {
                    this.$message.error('导出失败：响应为空')
                    return
                }
                if (blob.type && blob.type.indexOf('json') !== -1) {
                    this.$message.error(await readExportError(blob))
                    return
                }
                const fileName = `BMS历史信息_${this.deviceId}_${startDate.format('YYYYMMDD')}.xlsx`
                const url = window.URL.createObjectURL(new Blob([blob]))
                const link = document.createElement('a')
                link.href = url
                link.download = fileName
                link.click()
                window.URL.revokeObjectURL(url)
                this.$message.success(`已导出 ${fileName}`)
            } catch (error) {
                console.error('exportBmsHistoryExcel failed:', error)
                this.$message.error('导出失败，请稍后重试')
            } finally {
                this.exporting = false
            }
        }
    }
}

/**
 * responseType=blob 会把后端的 RespVO 错误也包成 Blob，下载前读回来提示给用户。
 */
async function readExportError (blob) {
    if (!blob || !blob.text) {
        return '导出失败'
    }
    try {
        const body = JSON.parse(await blob.text())
        return body.message || '导出失败'
    } catch (ignore) {
        return '导出失败'
    }
}
</script>
