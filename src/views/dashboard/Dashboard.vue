<template>
  <div>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <a-card>
          <div>
            <h4>设备统计</h4>
          </div>
          <div>
            <Pie
              ref='deviceChart'
              v-if='!loadingDevice'
              :chart-options='deviceChartOptions'
              :chart-data='deviceChartData'
              :height='600'
            />
          </div>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <a-card>
          <div>
            <h4>告警统计</h4>
          </div>
          <div>
            <Pie
              :chart-options='alarmChartOptions'
              :chart-data='alarmChartData'
              :height='600'
            />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import {
  ChartCard
} from '@/components'
import { Bar, Pie } from 'vue-chartjs'
import PageView from '@/layouts/PageView'
import { getBmsAlarmCount, getDeviceAlarmTypes, getStatusCount } from '@/api/manage'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default {
  name: 'Dashboard',
  components: {
    ChartCard,
    PageView,
    Bar,
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
      })
    },
    getBmsAlarmCount () {
      this.loadingAlarm = true
      getBmsAlarmCount({}).then(res => {
        console.log('alarm count', res)
        this.alarmChartData.datasets[0].data = res.data
        this.loadingAlarm = false
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
    }
  }
}
</script>

<style lang="less" scoped>
</style>
