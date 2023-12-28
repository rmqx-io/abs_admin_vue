<template>
  <a-card>
    <el-row>
      <el-col
        type="flex"
        align="middle"
        :xs="24"
        :sm="24"
        :md="24"
        :lg="12"
        :xl="12">
        <div class="content_bt" style="width: 300px; margin-top: 16px">
          <span
            style="
              font-size: 14px;
              font-weight: bold;
              text-align: left;
              line-height: 200%;
            "
          >
            电池编码：{{ this.bmsBt }}
            <br />
            更新时间：{{ this.time_tracking }}
            <el-tag
              :type="this.battery_currency === 0 ? 'info' : this.battery_currency > 0 ? 'warning' : 'danger'"
            >
              {{ this.battery_currency === 0 ? '搁置中' : this.battery_currency > 0 ? '充电中' : '放电中' }}
            </el-tag>
          </span>
        </div>
        <div>
          <span class="title_tx2">SOC:{{ this.battery_capacity_soc }}%</span>
          <el-image
            style="margin-top: 15px; width: 300px; height: 160px"
            class="img_battery"
            fit="fill"
            :src="require('@/assets/battery/icon_battery_' + this.getSocImg(this.battery_capacity_soc) + '.png')"
          />
        </div>
        <el-row type="flex" align="middle" style="margin-top: 20px">
          <el-col :span="2" :offset="6" type="flex" align="middle">
            <span
              class="tx_soh"
              :style="
                battery_healthy < 30
                  ? 'color:#f34d37'
                  : battery_healthy < 70
                    ? 'color:#F8B34D'
                    : 'color:#47ba80'
              "
            >
              SOH:
            </span>
          </el-col>
          <el-col :span="10" type="flex" align="middle">
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="battery_healthy"
              :color="customColorMethod"
            ></el-progress>
          </el-col>
        </el-row>

        <el-col
          :span="24"
          type="flex"
          align="middle"
          justify="middle"
          style="margin-top: 30px; margin-bottom: 30px"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="充电MOS" span="1">
              <el-switch
                v-model="isMosRec"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="放电MOS" span="1">
              <el-switch
                v-model="isMosDis"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="均衡开关" span="1">
              <el-switch
                v-model="isMosDis"
                disabled
                active-color="#41b584"
                inactive-color="#f34d37"
              ></el-switch>
            </el-descriptions-item>
            <el-descriptions-item label="当前电流" span="1">
              <el-tag
                size="small"
                :type="battery_currency === 0 ? 'info' : battery_currency > 0 ? 'warning' : 'danger'"
              >
                {{ battery_currency }} A
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前电压" span="1">
              <el-tag size="small">{{ battery_voltage }} V</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前功率" span="1">
              <el-tag size="small">{{ battery_voltage * battery_currency }} W</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="标称容量" span="1">
              <el-tag size="small">{{ battery_capacity_config }} Ah</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="剩余容量" span="1">
              <el-tag size="small">{{ battery_capacity_soc * battery_capacity_config / 100 }} Ah</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="循环次数" span="1">
              <el-tag size="small">{{ battery_charging_cycle }} 次</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>

        <el-row type="flex" align="middle" style="padding: 8px">
          <el-col :span="12" type="flex" align="middle">
            <span>放电MOS:</span>
            <el-tag
              size="mini"
              type="danger"
              effect="dark"
              @click="controlMos('discharge', '00')"
            >
              关闭
            </el-tag>
            <el-tag
              size="mini"
              type="success"
              effect="dark"
              @click="controlMos('discharge', '01')"
            >
              开启
            </el-tag>
          </el-col>
          <el-col :span="12" type="flex" align="middle">
            <span>充电MOS:</span>
            <el-tag
              size="mini"
              type="danger"
              effect="dark"
              @click="controlMos('charge', '00')"
            >
              关闭
            </el-tag>
            <el-tag
              size="mini"
              type="success"
              effect="dark"
              @click="controlMos('charge', '01')"
            >
              开启
            </el-tag>
          </el-col>
        </el-row>
        <el-row type="flex" align="middle" style="padding: 8px"></el-row>
      </el-col>

      <el-col
        type="flex"
        align="middle"
        :xs="24"
        :sm="24"
        :md="24"
        :lg="12"
        :xl="12">
        <!-- 电池图表 -->
        <el-row>
          <el-col type="flex" align="middle" justify="middle">
            <chart-bms-more
              ref="bmschart"
            ></chart-bms-more>
            <span
              v-if="initHis && dataListBMS.length === 0"
              style="border-style: solid; border-width: 1px; padding: 8px"
            >
              设备无数据
            </span>
          </el-col>
          <el-col
            :span="23"
            :offset="1"
            type="flex"
            align="middle"
            justify="middle"
          >
            <el-row
              v-for="(itemList, indexList) in tempList"
              :key="'temp' + indexList"
              style="margin-top: 8px"
              type="flex"
              align="middle"
            >
              <el-col
                v-for="(item, index) in itemList"
                :key="'temp2' + index"
                :span="7"
                class="content_center"
              >
                <el-image
                  class="item_battery"
                  :src="require('@/assets/battery/icon_temp_item.png')"
                />
                <span style="font-size: 12px; margin-right: 4px">
                  {{ item.name }}:
                </span>
                <span :style="'font-size: 12px; font-weight: bold;'">
                  {{ item.value }}℃
                </span>
              </el-col>
            </el-row>

            <el-row type="flex" align="start" style="margin-top: 20px">
              <el-col :span="7" type="flex" align="middle">
                <el-tag>
                  最高单体电压
                </el-tag>
                <el-tag size="small" effect="plain" type="success">
                  {{ maxVol }}V
                </el-tag>
              </el-col>
              <el-col :span="7" type="flex" align="middle">
                <el-tag>
                  最低单体电压
                </el-tag>
                <el-tag size="small" effect="plain" type="danger">
                  {{ minVol }}V
                </el-tag>
              </el-col>
              <el-col :span="7" type="flex" align="middle">
                <el-tag>
                  单体电压压差
                </el-tag>
                <el-tag size="small" effect="plain" type="info">
                  {{ voltageDifference }}V
                </el-tag>
              </el-col>
            </el-row>

            <!-- 单个电池 -->
            <el-row
              v-for="(itemList, indexList) in batteryList"
              :key="'battery' + indexList"
              style="margin-top: 8px"
              type="flex"
            >
              <el-col
                v-for="(item, index) in itemList"
                :key="'battery2' + index"
                :span="5"
                class="content_start"
              >
                <span style="font-size: 12px; width: 20px">
                  [{{ indexList * 5 + index + 1 }}]
                </span>
                <el-image
                  class="item_battery"
                  :src="require('@/assets/battery/icon_battery_item.png')"
                />
                <span
                  :style="
                    'font-size: 12px; font-weight: bold;' +
                      (item.value === maxVol
                        ? 'color:#47ba80;'
                        : item.value === minVol
                          ? 'color:#f34d37;'
                          : 'color:#222222;')
                  "
                >
                  {{ item.value }}V
                </span>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 第三排 -->
    <el-row>
      <!-- 基础信息 -->
      <el-row
        type="flex"
        justify="space-between"
        align="middle"
        style="padding: 8px; margin-top: 8px"
      >
        <el-col :span="20">
          <span class="det_title">基础信息</span>
        </el-col>
        <el-col :span="2">
          <!--          <el-button-->
          <!--            type="primary"-->
          <!--            size="mini"-->
          <!--            style="margin-left: 8px"-->
          <!--            @click="onSendOrder()"-->
          <!--          >-->
          <!--            下发指令-->
          <!--          </el-button>-->
        </el-col>
      </el-row>

      <el-descriptions :column="6" size="mini" border>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            二维码/别名
          </template>
          {{ deviceId }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-stopwatch"></i>
            GPS电压
          </template>
          {{ gps_battery_voltage }}V
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            信号
          </template>
          <el-tag size="mini">GSM:{{ rssi }}</el-tag>
          <el-tag size="mini">GPS:{{ gnss }}</el-tag>
          <el-tag size="mini" :type="gps_location == 1 ? 'success' : 'danger'">
            {{ gps_location == 1 ? 'GPS定位' : '基站定位' }}
          </el-tag>
        </el-descriptions-item>
        <!-- ################################## -->
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            GPS信号时间
          </template>
          {{ receive_time }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            GPS定位时间
          </template>
          {{ gps_location_time }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-time"></i>
            电池运行时间
          </template>
          {{ batterySystimeStr }}
        </el-descriptions-item>
        <!-- ################################## -->

        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-info"></i>
            电池类型
          </template>
          {{ batteryType }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-info"></i>
            电池版本
          </template>
          {{ batteryVer }}
        </el-descriptions-item>
        <el-descriptions-item span="2">
          <template slot="label">
            <i class="el-icon-tickets"></i>
            状态
          </template>
          <el-tag :type="mACCON ? 'danger' : 'info'" size="mini">
            {{ mACCON ? '运动中' : '静止' }}
          </el-tag>
          <el-tag
            :type="battery_currency === 0 ? 'info' : battery_currency > 0 ? 'warning' : 'danger'"
            size="mini"
          >
            {{ battery_currency === 0 ? '搁置中' : battery_currency > 0 ? '充电中' : '放电中' }}
          </el-tag>
        <!-- <el-tag size="mini">油电开</el-tag> -->
        </el-descriptions-item>
      </el-descriptions>
    </el-row>

    <el-row>
      <el-row
        type="flex"
        justify="space-between"
        align="middle"
        style="padding: 8px; margin-top: 8px"
      >
        <el-col :span="20">
          <span class="det_title">报警信息</span>
        </el-col>
      </el-row>
      <el-descriptions :column="10" size="mini" border>
        <el-descriptions-item
          span="2"
          v-for="item in alarms"
          :key="item.key"
          :label="item.key"
        >
          {{ alarm_display(item.value) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
  </a-card>
</template>

<script>
import ChartBmsMore from '@/views/history/bms_history/components/ChartBmsMore.vue'
// import BmsInfoCharts from '@/views/list/components/BmsInfoCharts'
import {
  getBatteryInfo, getBatteryInfoLatest,
  getBmsType,
  sendFmBmsCommand
} from '@/api/manage'
import moment from 'moment/moment'

export default {
  name: 'BmsInfoCharts',
  components: {
    // BmsInfoCharts,
    ChartBmsMore
  },
  props: {
    deviceId: {
      type: String,
      default: () => null
    },
    bmsBt: {
      type: String,
      default: () => null
    }
  },
  mounted () {
    getBmsType(this.deviceId).then(res => {
      console.log('bms type', res.data.bms_type)
      this.bms_type = res.data.bms_type
      const bms_type = res.data.bms_type
      getBatteryInfoLatest(this.deviceId, res.data.bms_type, {})
        .then(res => {
          console.log('battery info latest', res)
          if (res.data && res.data.vehicle_detail_vo) {
            this.battery_capacity_config = res.data.battery_capacity
            this.gps_battery_voltage = res.data.vehicle_detail_vo.gps_battery_voltage
            this.rssi = res.data.vehicle_detail_vo.rssi
            this.gnss = res.data.vehicle_detail_vo.gnss
            this.gps_location = res.data.vehicle_detail_vo.gps_location
            this.gps_location_time = moment(res.data.vehicle_detail_vo.time_tracking).format('YYYY-MM-DD HH:mm:ss')
            this.receive_time = moment(res.data.vehicle_detail_vo.receive_time).format('YYYY-MM-DD HH:mm:ss')
          }
          if (res.data && res.data.logs && res.data.logs.length > 0) {
            const bmsInfo = res.data.logs[0]
            this.time_tracking = moment(bmsInfo.time_tracking).format('YYYY-MM-DD HH:mm:ss')
            this.battery_capacity_soc = bmsInfo.battery_capacity_soc
            this.battery_healthy = bmsInfo.battery_healthy
            this.battery_voltage = bmsInfo.battery_voltage
            this.batteryList = this.form_battery_voltage_array_for_display(bmsInfo.single_battery_voltage_arr.split(','), 5)
            this.tempList = this.form_temperature_array_for_display(bmsInfo)
            // console.log('battery list', this.batteryList)
            // single_battery_voltage_arr
            this.battery_currency = bmsInfo.battery_currency
            this.isMosRec = bmsInfo.battery_status_charging_mos
            this.isMosDis = bmsInfo.battery_status_discharging_mos
            this.battery_charging_cycle = bmsInfo.battery_charging_cycle
            this.humidity = bmsInfo.humidity

            this.battery_alarm_low_power = bmsInfo.battery_alarm_low_power
            this.battery_alarm_mos_high_temperature = bmsInfo.battery_alarm_mos_high_temperature
            this.battery_alarm_charging_high_voltage = bmsInfo.battery_alarm_charging_high_voltage
            this.battery_alarm_discharging_low_voltage = bmsInfo.battery_alarm_discharging_low_voltage
            this.battery_alarm_high_temperature = bmsInfo.battery_alarm_high_temperature
            this.battery_alarm_charging_high_current = bmsInfo.battery_alarm_charging_high_current
            this.battery_alarm_discharging_high_current = bmsInfo.battery_alarm_discharging_high_current
            this.battery_alarm_voltage_difference = bmsInfo.battery_alarm_voltage_difference
            this.battery_alarm_box_high_temperature = bmsInfo.battery_alarm_box_high_temperature
            this.battery_alarm_low_temperature = bmsInfo.battery_alarm_low_temperature
            this.battery_alarm_single_cell_high_voltage = bmsInfo.battery_alarm_single_cell_high_voltage
            this.battery_alarm_single_cell_low_voltage = bmsInfo.battery_alarm_single_cell_low_voltage
            this.battery_alarm_309_a = bmsInfo.battery_alarm_309_a
            this.battery_alarm_309_b = bmsInfo.battery_alarm_309_b
            this.battery_alarm_humidity = bmsInfo.battery_alarm_humidity
            this.battery_alarm_disassemble = bmsInfo.battery_alarm_disassemble

            this.set_alarms()

            if (bms_type === "bms_jx") {
              this.getBatteryInfoLatestJx(bmsInfo)
            }
          }
        }).catch(err => {
          console.log('battery info latest', err)
      })
    })
    if (this.dataListBMS.length === 0) {
      setTimeout(() => {
        this.initBMSUI()
      }, 1000)
      // this.getBmsHis(this.mCurSn, 227, 6)
    }
  },
  data () {
    return {
      initHis: false,
      valueDate: [],

      hasMosRec: false,
      hasMosDis: false,
      batterySystimeStr: '',

      mChargeProtection: '-',
      mDischargeProtection: '-',
      mShortProtection: '-',

      dataListBMS: [],

      mAlias: '',
      gps_location_time: '-',
      receive_time: '-',
      gps_location: '-',
      rssi: '-',
      gnss: '-',
      gps_battery_voltage: '-',
      mACCON: false,
      mLat: 0,
      mLng: 0,

      time_tracking: '-',
      mCurSn: '',
      isMosRec: false,
      isMosDis: false,
      isEleLink: false,
      isRec: false,
      socImg: 1,
      battery_currency: '-',
      battery_voltage: '-',
      humidity: '-',
      battery_capacity_soc: '-',
      battery_capacity_config: 0,
      battery_charging_cycle: 0,
      battery_healthy: 0,
      mSurplusCapacity: '-',
      mRecIndex: '-',

      voltageDifference: '-',
      maxVol: '-',
      minVol: '-',
      batterySpeSwitch: false,
      batterySystime: '-',
      batteryName: '-',
      batteryType: '-',
      batteryVer: '-',

      alarms: [],

      battery_alarm_low_power: null,
      battery_alarm_mos_high_temperature: null,
      battery_alarm_charging_high_voltage: null,
      battery_alarm_discharging_low_voltage: null,
      battery_alarm_high_temperature: null,
      battery_alarm_charging_high_current: null,
      battery_alarm_discharging_high_current: null,
      battery_alarm_voltage_difference: null,
      battery_alarm_box_high_temperature: null,
      battery_alarm_low_temperature: null,
      battery_alarm_single_cell_high_voltage: null,
      battery_alarm_single_cell_low_voltage: null,
      battery_alarm_309_a: null,
      battery_alarm_309_b: null,
      battery_alarm_humidity: null,
      battery_alarm_disassemble: null,
      mAlarm16: '-',
      mAlarm17: '-',
      mAlarm18: '-',
      mAlarm19: '-',
      tempList: [],
      batteryList: [
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ],
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ],
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ],
        [
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' },
          { pos: '', value: '-' }
        ]
      ],

      mSingleChargeProtectionVoltage: '-',
      mSingleChargRecoverVoltage: '-',
      mSingleDischargeProtectionVoltage: '-',
      mSingleDischargeRecoverVoltage: '-',
      mSingleDifferentialPressureProtectionVoltage: '-',
      mChargeProtectionVoltage: '-',
      mChargeRecoverVoltage: '-',
      mDischargeProtectionVoltage: '-',
      mDischargeRecoverVoltage: '-',
      mSecondChargeProtectionVoltage: '-',
      mSecondDischargeProtectionVoltage: '-',
      mRatedCapacity: '-',
      mRatedCurrent: '-',
      mEquilibriumVoltage: '-',
      mEquilibriumCurrent: '-',
      mChargeSwitch: '-',
      mDischargeSwitch: '-',
      mLowSOCAlarmValue: '-',
      bms_type: ''
    }
  },
  methods: {
    customColorMethod (percentage) {
      if (percentage < 30) {
        return '#f34d37'
      } else if (percentage < 70) {
        return '#F8B34D'
      } else {
        return '#47ba80'
      }
    },
    getSocImg (soc) {
      let img = 0
      if (soc === 0) {
        img = 0
      } else if (soc <= 25) {
        img = 1
      } else if (soc <= 50) {
        img = 2
      } else if (soc <= 75) {
        img = 3
      } else if (soc > 75) {
        img = 4
      }
      return img
    },
    bms_chart_init_jx (bmsList) {
      this.$refs.bmschart.init(
        bmsList,
        ['电压', '电流', 'SOC', 'T01', 'T02', 'T03'],
        ['V', 'A', '%', '℃', '℃', '℃'],
        [
          '#6AD6E6',
          '#6F95DA',
          '#47ba80',
          '#E8A456',
          '#DBBB5B',
          '#E8E156'
        ],
        3
      )
    },
    form_temperature_array_for_display_jx(item) {
        // 温度数组
        const tempList = []
        tempList.push({
          pos: 0,
          name: 'T01',
          value: item.battery_box_temperature
        })
        tempList.push({
          pos: 1,
          name: 'T02',
          value: item.battery_temperature
        })
        tempList.push({
          pos: 2,
          name: 'T03',
          value: item.power_transistor_temperature
        })
        return [tempList]
    },
    initBMSUI () {
      const arg = {
        start_date: moment(new Date() - 2 * 60 * 60 * 1000),
        start_time: moment(new Date() - 2 * 60 * 60 * 1000)
      }
      getBmsType(this.deviceId).then(res => {
        console.log('get bms type', res)
        getBatteryInfo(this.deviceId, res.data.bms_type, arg)
          .then(res => {
            console.log('get battery info', res)
            const bmsList = []
            if (res.data && res.data.length > 0) {
              res.data.forEach(item => {
                const timestamp = moment(item.time_tracking).format('YYYY-MM-DD HH:mm:ss')
                console.log('timestamp', timestamp)
                bmsList.push([
                  {
                    value: item.battery_voltage,
                    date: timestamp
                  },
                  {
                    value: item.battery_currency,
                    date: timestamp
                  },
                  {
                    value: item.battery_capacity_soc,
                    date: timestamp
                  },
                  {
                    value: item.power_transistor_temperature,
                    date: timestamp
                  },
                  {
                    value: item.battery_temperature,
                    date: timestamp
                  },
                  {
                    value: item.battery_box_temperature,
                    date: timestamp
                  }
                ])
              })
            }
            // if the result is empty, add a empty data
            if (bmsList.length === 0) {
              const timestamp = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
              bmsList.push([{ value: 0, date: timestamp }, { value: 0, date: timestamp }, { value: 0, date: timestamp },
              { value: 0, date: timestamp }, { value: 0, date: timestamp }, { value: 0, date: timestamp }])
            }
            setTimeout(() => {
              this.$nextTick(() => {
                if (this.$refs && this.$refs.bmschart) {
                  if (this.bms_type === "bms_jx") {
                    this.bms_chart_init_jx(bmsList);
                  } else {
                    this.$refs.bmschart.init(
                      bmsList,
                      ['电压', '电流', 'SOC', '箱内温度', '电池温度', '功率管温度'],
                      ['V', 'A', '%', '℃', '℃', '℃'],
                      [
                        '#6AD6E6',
                        '#6F95DA',
                        '#47ba80',
                        '#E8A456',
                        '#DBBB5B',
                        '#E8E156'
                      ],
                      3
                    )
                  }
                }
              })
            }, 300)
          })
      })
    },
    form_battery_voltage_array_for_display (array, subGroupLength) {
      let index = 0
      const batteryListTemp = []

      array.forEach((items, index) => {
        const vol = parseFloat(items).toFixed(3)
        if (index === 0) {
          this.maxVol = vol
          this.minVol = vol
        }
        if (vol > this.maxVol) {
          this.maxVol = vol
        } else if (vol < this.minVol) {
          this.minVol = vol
        }
        batteryListTemp.push({
          pos: index,
          value: vol
        })
      })
      this.voltageDifference = (this.maxVol - this.minVol).toFixed(3)
      const newArray = []
      while (index < array.length) {
        newArray.push(batteryListTemp.slice(index, (index += subGroupLength)))
      }
      return newArray
    },
    form_temperature_array_for_display (item) {
      if (this.bms_type === "bms_jx") {
        return this.form_temperature_array_for_display_jx(item);
      } else {
        // 温度数组
        const tempList = []
        tempList.push({
          pos: 0,
          name: '箱内温度',
          value: item.battery_box_temperature
        })
        tempList.push({
          pos: 1,
          name: '电池温度',
          value: item.battery_temperature
        })
        tempList.push({
          pos: 2,
          name: '功率管温度',
          value: item.power_transistor_temperature
        })
        return [tempList]
      }
    },
    alarm_display (alarm) {
      if (alarm === true) {
        return '异常'
      }
      if (alarm === false) {
        return '正常'
      }
      return '未读取'
    },
    set_alarms () {
      this.alarms = [
        { key: '低容量报警', value: this.battery_alarm_low_power },
        { key: 'MOS管超温报警', value: this.battery_alarm_mos_high_temperature },
        { key: '充电过压报警', value: this.battery_alarm_charging_high_voltage },
        { key: '放电欠压报警', value: this.battery_alarm_discharging_low_voltage },
        { key: '电池超温报警', value: this.battery_alarm_high_temperature },
        { key: '充电过流报警', value: this.battery_alarm_charging_high_current },
        { key: '放电过流报警', value: this.battery_alarm_discharging_high_current },
        { key: '电芯压差报警', value: this.battery_alarm_voltage_difference },
        { key: '电池箱内超温报警', value: this.battery_alarm_box_high_temperature },
        { key: '电池低温报警', value: this.battery_alarm_low_temperature },
        { key: '单体过压报警', value: this.battery_alarm_single_cell_high_voltage },
        { key: '单体欠压报警', value: this.battery_alarm_single_cell_low_voltage },
        { key: '309_A保护', value: this.battery_alarm_309_a },
        { key: '309_B保护', value: this.battery_alarm_309_b },
        { key: '湿度报警', value: this.battery_alarm_humidity },
        { key: '防拆报警', value: this.battery_alarm_disassemble }
      ]
    },
    getBatteryInfoLatestJx(bmsInfo) {
      this.isMosRec = bmsInfo.battery_status_charging_mos
      this.isMosDis = bmsInfo.battery_status_discharging_mos
      this.battery_capacity_config = bmsInfo.battery_capacity_config
    },
    controlMos(mos, on_off) {
      var mos_address;
      if (mos === 'charge') {
        mos_address = 0xab;
      } else if (mos === 'discharge') {
        mos_address = 0xac;
      } else {
        console.warn('unknown mos', mos);
        return;
      }

      const arg = {
        command: mos_address,
        param: on_off
      }
      sendFmBmsCommand(this.deviceId, arg)
      .then(res => {
        console.log("send command", mos, on_off, res);
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "~ant-design-vue/es/style/themes/default.less";

.img_battery {
  height: 120px;
  width: 230px;
  margin-bottom: 8px;
}
.item_battery {
  height: 30px;
  width: 30px;
}
.title_tx2 {
  position: absolute;
  z-index: 1000;
  font-size: 28px;
  width: 290px;
  top: 150px;
  text-align: center;
}
.tx_soh {
  color: #47ba80;
  font-size: 16px;
  font-weight: bold;
}
.content_bt {
  flex-direction: column;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.content_start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.content_center_dir {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.content_center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.content_between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.det_title {
  font-size: 18px;
  font-weight: bold;
}
.bg-suc-a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #47ba80;
  border-radius: 4px;
}
.bg-suc-t {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #47ba80;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.bg-suc-b {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-style: solid;
  border-color: #47ba80;
  text-decoration: none;
}

.bg-fail-a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #f34d37;
  border-radius: 4px;
}
.bg-fail-t {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: #fff;
  background: #f34d37;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.bg-fail-b {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-style: solid;
  border-color: #f34d37;
  text-decoration: none;
}
.text-suc {
  color: #47ba80;
}
.text-fail {
  color: #5a5a5a;
}

</style>
