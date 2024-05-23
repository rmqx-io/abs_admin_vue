<template>
  <div>
    <a-form>
      <div v-if='!showMoreParam' style='margin-bottom: 10px'>
        <a-row :gutter='48'>
          <a-col :md='8' :sm='24'>
            <a class="ant-dropdown-link" @click='showMoreParam = true'>更多参数<a-icon type="down"/></a>
          </a-col>
        </a-row>
      </div>
      <div v-if='showMoreParam'>
        <a-row :gutter='48'>
          <a-col :md='8' :sm='8'>
            <a class="ant-dropdown-link" @click='showMoreParam = false'>收起参数<a-icon type="up"/></a>
          </a-col>
        </a-row>
        <a-row>
          <a-col :md="4" :sm="24" v-if='false'>
            <a-form-item label="来源类型">
              <a-select v-model='bms_type'>
                <a-select-option value="0">全部</a-select-option>
                <a-select-option value="1">808</a-select-option>
                <a-select-option value="227">弗铭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md='4' :sm='24'>
            <a-form-item label="告警">
              <div><span>{{ selectedItems.join(", ") }}</span></div>
              <a-dropdown @visible-change="onVisibleChange">
                <a-button>
                  {{ selectedItems.length ? "选择了 " + selectedItems.length + " 种" : "所有告警" }}
                  <a-icon type="down" />
                </a-button>
                <a-menu slot="overlay">
                  <a-checkbox-group v-model="selectedItems">
                    <a-menu-item v-for="(item, index) in alarm_types" :key="index">
                      <a-checkbox :value="item">{{ item }}</a-checkbox>
                    </a-menu-item>
                  </a-checkbox-group>
                  <a-menu-divider />
                  <a-button type="primary" size="small" @click="saveSelectedItems">
                    确定
                  </a-button>
                  <a-button type="cancel" size="small" @click="cancelSelectedItems">
                    清除
                  </a-button>
                </a-menu>
              </a-dropdown>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label='开始时间'>
              <a-date-picker v-model="queryData.start_date" show-time format="YYYY-MM-DD HH:mm:ss" placeholder="起始时间"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label='结束时间'>
              <a-date-picker v-model="queryData.end_date" show-time format="YYYY-MM-DD HH:mm:ss" placeholder="结束时间"/>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
      <a-row :gutter='48'>
        <a-col :md="8" :sm="24">
          <a-button type="primary" @click="$refs.alarmtable.refresh(true)">查询</a-button>
        </a-col>
      </a-row>
    </a-form>
    <s-table
      v-if="table_visible"
      ref="alarmtable"
      :columns="columns"
      :data='loadData'
      showPagination="auto"
      :loading="loading"
      rowKey="id"
      @change="handleTableChange"
    >
      <span slot="bms_type" slot-scope="text, record">
        <template>
          <span>{{ device_type_name(record.bms_type) }}</span>
        </template>
      </span>
      <span slot="bms_alarm" slot-scope="text, record">
        <template>
          <span>{{ alarm_name(record.bms_alarm) }}</span>
        </template>
      </span>
      <span slot="organization_name" slot-scope="text, record">
        <template>
          <span>{{ record.organization_name }}</span>
        </template>
      </span>
      <span slot='bms_alarm_timestamp' slot-scope="text, record">
        <template>
          <span>{{ localTime(record.bms_alarm_timestamp) }}</span>
        </template>
      </span>
      <span slot='operation' slot-scope="text, record">
        <a @click="handleBatteryInfo(record)">电池详情</a>
      </span>
    </s-table>

    <battery-info
      v-if="battery_detail_visible"
      ref="batteryInfo"
      :device-id="device_id"
      :bms-bt="bms_bt"
      @cancel="handleBatteryInfoCancel"
      @ok="handleBatteryInfoOk"
    />
  </div>
</template>

<script>
import moment from 'moment/moment'
import { STable } from '@/components'
import { getDeviceAlarm, getDeviceAlarmTypes } from '@/api/manage'
import BatteryInfo from '@/views/list/components/BatteryInfo'

export default {
  name: 'DeviceAlarm',
  components: {
    STable,
    BatteryInfo,
  },
  props: {
    deviceId: {
      type: String,
      default: () => null
    },
    deviceStatus: {
      type: String,
      default: () => null
    },
    organizationId: {
      type: Number,
      default: () => null
    }
  },
  data () {
    return {
      table_visible: true,
      battery_detail_visible: false,
      device_id: null,
      bms_bt: null,
      showMoreParam: false,
      bms_type: '0',
      alarm_types: ['Item 1', 'Item 2', 'Item 3', 'Item 4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
      selectedItems: [],
      prevSelectedItems: [],
      columns: [
        {
          title: '编号',
          dataIndex: 'id'
        },
        {
          title: '设备编号',
          dataIndex: 'code'
        },
        {
          title: '类型',
          dataIndex: 'bms_type',
          scopedSlots: { customRender: 'bms_type' }
        },
        {
          title: '告警',
          dataIndex: 'bms_alarm',
          scopedSlots: { customRender: 'bms_alarm' }
        },
        {
          title: '组织',
          dataIndex: 'organization_name',
          scopedSlots: { customRender: 'organization_name' }
        },
        {
          title: '时间',
          dataIndex: 'bms_alarm_timestamp',
          scopedSlots: { customRender: 'bms_alarm_timestamp' }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          fixed: 'right',
        }
      ],
      loading: false,
      queryData: {
        device_id: null,
        account: null,
        name: null,
        page_no: 1,
        page_size: 10,
        start_date: moment(new Date() - 2 * 60 * 60 * 1000),
        end_date: null,
        organization_id: null
      }
    }
  },
  methods: {
    handleTableChange (pagination, filters, sorter) {
      console.log('pagination', pagination)
      console.log('filters', filters)
      console.log('sorter', sorter)
    },
    query () {
      console.log('query', this.deviceId, this.deviceStatus, this.organizationId)
      // this.loadData({})
      // this.$refs.deviceAlarmTable.refresh(true)
      console.log('refs', this.$refs)
      // this.$refs.deviceAlarmTable.refresh()
    },
    loadData (parameter) {
      this.loading = true
      console.log('parameter', parameter)
      console.log('queryData', this.queryData)
      console.log('start_date', this.queryData.start_date)
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      delete arg.pageNo
      delete arg.pageSize
      if (this.deviceStatus) {
        arg.device_status = this.deviceStatus
      }
      if (this.deviceId) {
        arg.device_id = this.deviceId
      }
      if (this.organizationId) {
        arg.organization_id = this.organizationId
      }
      if (this.selectedItems.length > 0) {
        arg.alarm_types_index = ''
        this.selectedItems.forEach((item, index) => {
          this.alarm_types.forEach((alarm, i) => {
            if (item === alarm) {
              if (index === 0) {
                arg.alarm_types_index += i + '-' + item
              } else {
                arg.alarm_types_index += ',' + i + '-' + item
              }
            }
          })
        })
      }
      return getDeviceAlarm(arg)
        .then(res => {
          this.loading = false
          console.log('device alarm', res)
          // pages is round up res.data.total / res.data.page_size
          const pages = Math.ceil(res.data.total / res.data.page_size)
          return {
            pageSize: res.data.page_size,
            pageNo: res.data.page_no,
            totalCount: res.data.total,
            totalPage: pages,
            data: res.data.records
          }
        })
    },
    device_type_name (type) {
      const hexString = type.toString(16);
      return '0x' + hexString + ' (' + type + ')'
      // if (type === 227) {
      //   return '弗铭'
      // } else {
      //   return type
      // }
    },
    alarm_name (alarm) {
      let alarmName = ''
      for (let i = 0; i < 64; i++) {
        if (this.alarm_types[i] === undefined) {
          break
        }
        if (alarm & (1 << i)) {
          alarmName += this.alarm_types[i] + ','
        }
      }
      // remove last ','
      if (alarmName.length > 0) {
        alarmName = alarmName.substring(0, alarmName.length - 1)
      } else {
        alarmName = '无'
      }
      return alarmName
    },
    get_alarm_name () {
      // 227 fm
      // 236 ls
      getDeviceAlarmTypes(236)
        .then(res => {
          console.log('alarm type', res)
          if (res.data && res.data.cn) {
            this.alarm_types = res.data.cn
          }
        })
    },
    onVisibleChange (visible) {
      if (!visible) {
        // User clicked outside the dropdown, restore previous selection
        this.selectedItems = this.prevSelectedItems
      }
    },
    saveSelectedItems () {
      this.prevSelectedItems = this.selectedItems.slice()
      // Do something with the selected items, e.g. send them to the server
    },
    cancelSelectedItems () {
      this.selectedItems = []
    },
    localTime (time) {
      return moment.utc(time).local().format('YYYY-MM-DD HH:mm:ss')
    },
    handleBatteryInfo(record) {
      console.log('record', record)
      console.log('record.code', record.code)
      this.device_id = record.code
      this.bms_bt = record.bms_bt
      this.battery_detail_visible = true
      this.table_visible = false
      this.$nextTick(() => {
        console.log('record.code', record.code)
        this.$refs.batteryInfo.getBatteryInfoHandle(record.code)
      })
    },
    handleBatteryInfoCancel() {
      this.battery_detail_visible = false
      this.table_visible = true
    },
    handleBatteryInfoOk() {
      this.battery_detail_visible = false
      this.table_visible = true
    }
  },
  created () {
    this.query()
    this.get_alarm_name()
  }
}
</script>

<style scoped>

</style>
