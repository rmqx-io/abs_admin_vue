<template>
  <div>
    <a-row :gutter="24">
      <a-col :sm="24" :md="7" :xl="7" :style="{ marginBottom: '24px' }">
        <a-card>
          <div>
            <div>
              <h4>设备统计</h4>
            </div>
            <div style='width: 350px'>
              <Pie
                :chart-options="chartOptions"
                :chart-data="deviceChartData"
                :height="350"
              />
            </div>
          </div>
        </a-card>
        <a-card>
          <div>
            <h4>告警统计</h4>
          </div>
          <div style='width: 350px'>
            <Pie
              :chart-options="chartOptions"
              :chart-data="alarmChartData"
              :height="350"
            />
          </div>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="17" :xl="17" :style="{ marginBottom: '24px' }">
        <a-card>
          <div style='height: 805px; width: 100%'>
            <device-map />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {
  ChartCard
} from '@/components'
import { getBmsAlarmCount, getDeviceAlarmTypes, getStatusCount } from '@/api/manage'
import { Pie } from 'vue-chartjs/legacy'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'
import DeviceMap from '@/views/list/components/DeviceMap'
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)
const DataSet = require('@antv/data-set')

const sourceData = [
  { item: '1', count: 32.2 },
  { item: '2', count: 21 },
  { item: '3', count: 17 },
  { item: '4', count: 13 },
  { item: '5', count: 9 },
  { item: '6', count: 7.8 }
]

const pieScale = [{
  dataKey: 'percent',
  min: 0,
  formatter: '.0%'
}]

const dv = new DataSet.View().source(sourceData)
dv.transform({
  type: 'percent',
  field: 'count',
  dimension: 'item',
  as: 'percent'
})
const pieData = dv.rows

export default {
  name: 'Dashboard',
  components: {
    DeviceMap,
    ChartCard,
    Pie
  },
  data () {
    return {
      loadingDevice: false,
      loadingAlarm: false,
      deviceChartData: {
        labels: ['在线', '离线', '待机'],
        datasets: [
          {
            // light blue 88,173,250 hex: #58ADF8
            // turquoise 68,196,195 hex: #44C4C3
            // green 85,193,113 hex: #55C171
            // yellow 250,204,86 hex: #FACC56
            // red 237,95,116 hex: #ED5F74
            // purple 138,98,220 hex: #8A62DC
            // backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            // backgroundColor: ['#58ADF8', '#8A62DC', '#55C171', '#FACC56'],
            // backgroundColor: ['#0074D9', '#FF4136', '#2ECC40', '#FF851B', '#7FDBFF', '#B10DC9', '#FFDC00', '#001f3f', '#39CCCC', '#01FF70', '#85144b', '#F012BE', '#3D9970', '#111111', '#AAAAAA'],
            // backgroundColor: green, yellow, grey
            backgroundColor: ['#55C171', '#FACC56', '#AAAAAA'],
            data: [40, 20, 80]
          }
        ]
      },
      deviceChartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      alarmChartData: {
        // will be overwritten by data from server
        labels: [
          '低容量报警',
          'MOS管超温报警',
          '充电过压报警',
          '放电欠压报警',
          '电池超温报警',
          '充电过流报警',
          '放电过流报警',
          '电芯压差报警',
          '电池箱内超温报警',
          '电池低温报警',
          '单体过压报警',
          '单体欠压报警',
          '309_A保护',
          '309_B保护',
          '湿度报警',
          '防拆报警'
        ],
        datasets: [
          {
            // light blue 88,173,250 hex: #58ADF8
            // turquoise 68,196,195 hex: #44C4C3
            // green 85,193,113 hex: #55C171
            // yellow 250,204,86 hex: #FACC56
            // red 237,95,116 hex: #ED5F74
            // purple 138,98,220 hex: #8A62DC
            // backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            // backgroundColor: ['#58ADF8', '#8A62DC', '#55C171', '#FACC56'],
            backgroundColor: ['#0074D9', '#FF4136', '#2ECC40', '#FF851B', '#7FDBFF', '#B10DC9', '#FFDC00', '#001f3f', '#39CCCC', '#01FF70', '#85144b', '#F012BE', '#3D9970', '#111111', '#AAAAAA'],
            // will be overwritten by data from server
            data: [40, 20, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // array size: 16
          }
        ]
      },
      alarmChartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      pieScale,
      pieData,
      deviceChartPieData: pieData,
      alarmChartPieData: pieData,
      alarmBarData: [],
      sourceData,
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      },
      tooltip: ['item*percent*count', (item, percent, count) => {
        return { name: item, value: ['' + count] }
      }],
      chartData: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [40, 20, 80, 10]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  mounted () {
    console.log('mounted')
    this.get_alarm_name()
    this.getStatusCount()
    this.getBmsAlarmCount()
  },
  methods: {
    getStatusCount () {
      this.loadingDevice = true
      getStatusCount({}).then(res => {
        console.log('status count', res)
        this.deviceChartData.datasets[0].data[0] = res.data.online
        this.deviceChartData.datasets[0].data[1] = res.data.offline
        this.deviceChartData.datasets[0].data[2] = res.data.standby
        this.loadingDevice = false
        this.deviceChartPieData = this.labelAndDataToPieData(this.deviceChartData.labels, this.deviceChartData.datasets[0].data)
      })
    },
    getBmsAlarmCount () {
      this.loadingAlarm = true
      getBmsAlarmCount({}).then(res => {
        console.log('alarm count', res)
        this.alarmChartData.datasets[0].data = res.data
        this.loadingAlarm = false
        this.alarmChartPieData = this.labelAndDataToPieData(this.alarmChartData.labels, this.alarmChartData.datasets[0].data)
        this.alarmBarData = this.labelAndDataToBarData(this.alarmChartData.labels, this.alarmChartData.datasets[0].data)
      })
    },
    get_alarm_name () {
      getDeviceAlarmTypes(227)
        .then(res => {
          console.log('alarm type', res)
          if (res.data && res.data.cn) {
            this.alarmChartData.labels = res.data.cn
          }
        })
    },
    labelAndDataToPieData (label, data) {
      const sourceData = []
      for (let i = 0; i < label.length; i++) {
        sourceData.push({ item: label[i], count: data[i] })
      }
      const dv = new DataSet.View().source(sourceData)
      dv.transform({
        type: 'percent',
        field: 'count',
        dimension: 'item',
        as: 'percent'
      })
      const pieData = dv.rows
      return pieData
    },
    labelAndDataToBarData (label, data) {
      const barData = []
      for (let i = 0; i < label.length; i++) {
        barData.push({ x: label[i], y: data[i] })
      }
      return barData
    }
  }
}
</script>

<style lang="less" scoped>
</style>
