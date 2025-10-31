<template>
  <div>
    <a-row :gutter="24">
      <a-col :sm="24" :md="24" :xl="7" :style="{ marginBottom: '24px' }">
        <a-card>
          <div>
            <div>
              <h4>{{ $t('dashboard.deviceStats') }}</h4>
            </div>
            <div>
              <Pie
                :chart-options="chartOptions"
                :chart-data="deviceChartData"
                :height="350"
                v-if='!loadingDevice'
              />
            </div>
          </div>
        </a-card>
        <a-card>
          <div>
            <h4>{{ $t('dashboard.alarmStats') }}</h4>
          </div>
          <div>
            <Pie
              :chart-options="chartOptions"
              :chart-data="alarmChartData"
              :height="350"
              v-if='!loadingAlarm'
            />
          </div>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="24" :xl="17" :style="{ marginBottom: '24px' }">
        <a-card>
          <div style='height: 786px; width: 100%; margin-bottom: 20px'>
            <h4>{{ $t('dashboard.deviceMap') }}</h4>
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
        labels: [],
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
        labels: [],
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
    // Initialize chart labels with translations
    this.deviceChartData.labels = [
      this.$t('dashboard.status.online'),
      this.$t('dashboard.status.offline'),
      this.$t('dashboard.status.standby')
    ]
    this.alarmChartData.labels = [
      this.$t('dashboard.alarm.lowCapacity'),
      this.$t('dashboard.alarm.mosOverheat'),
      this.$t('dashboard.alarm.chargeOvervoltage'),
      this.$t('dashboard.alarm.dischargeUndervoltage'),
      this.$t('dashboard.alarm.batteryOverheat'),
      this.$t('dashboard.alarm.chargeOvercurrent'),
      this.$t('dashboard.alarm.dischargeOvercurrent'),
      this.$t('dashboard.alarm.cellVoltageDiff'),
      this.$t('dashboard.alarm.boxOverheat'),
      this.$t('dashboard.alarm.lowTemperature'),
      this.$t('dashboard.alarm.cellOvervoltage'),
      this.$t('dashboard.alarm.cellUndervoltage'),
      this.$t('dashboard.alarm.protection309A'),
      this.$t('dashboard.alarm.protection309B'),
      this.$t('dashboard.alarm.humidity'),
      this.$t('dashboard.alarm.antiTamper')
    ]
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
        // this.deviceChartPieData = this.labelAndDataToPieData(this.deviceChartData.labels, this.deviceChartData.datasets[0].data)
      })
    },
    getBmsAlarmCount () {
      this.loadingAlarm = true
      getBmsAlarmCount({}).then(res => {
        console.log('alarm count', res)
        this.alarmChartData.datasets[0].data = res.data
        this.loadingAlarm = false
        // this.alarmChartPieData = this.labelAndDataToPieData(this.alarmChartData.labels, this.alarmChartData.datasets[0].data)
        this.alarmBarData = this.labelAndDataToBarData(this.alarmChartData.labels, this.alarmChartData.datasets[0].data)
      })
    },
    get_alarm_name () {
      getDeviceAlarmTypes(227)
        .then(res => {
          console.log('alarm type', res)
          if (res.data) {
            // Use Chinese labels if current locale is zh-CN, otherwise use English
            const currentLocale = this.$i18n.locale
            this.alarmChartData.labels = currentLocale === 'zh-CN' ? res.data.cn : res.data.en
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
