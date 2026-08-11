<template>
  <div>
    <a-form>
        <div v-if='!showMoreParam' style='margin-bottom: 10px'>
          <a-row :gutter='48'>
            <a-col :md='8' :sm='24'>
              <a class="ant-dropdown-link" @click='showMoreParam = true'>{{ $t('alarm.moreParams') }}<a-icon type="down"/></a>
            </a-col>
          </a-row>
        </div>
        <div v-if='showMoreParam'>
          <a-row :gutter='48'>
            <a-col :md='8' :sm='8'>
              <a class="ant-dropdown-link" @click='showMoreParam = false'>{{ $t('alarm.hideParams') }}<a-icon type="up"/></a>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="4" :sm="24" v-if='false'>
              <a-form-item :label="$t('alarm.sourceType')">
                <a-select v-model='bms_type'>
                  <a-select-option value="0">{{ $t('alarm.all') }}</a-select-option>
                  <a-select-option value="1">808</a-select-option>
                  <a-select-option value="227">{{ $t('alarm.fuming') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md='4' :sm='24'>
              <a-form-item :label="$t('alarm.alarm')">
                <div><span>{{ selectedItems.join(", ") }}</span></div>
                <a-dropdown @visible-change="onVisibleChange">
                  <a-button>
                    {{ selectedItems.length ? $t('alarm.selected') + ' ' + selectedItems.length + ' ' + $t('alarm.types') : $t('alarm.allAlarms') }}
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
                      {{ $t('alarm.confirm') }}
                    </a-button>
                    <a-button type="cancel" size="small" @click="cancelSelectedItems">
                      {{ $t('alarm.clear') }}
                    </a-button>
                  </a-menu>
                </a-dropdown>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item :label="$t('alarm.startTime')">
                <a-date-picker v-model="queryData.start_date" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('alarm.startTimePlaceholder')"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="12">
              <a-form-item :label="$t('alarm.endTime')">
                <a-date-picker v-model="queryData.end_date" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('alarm.endTimePlaceholder')"/>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        <a-row :gutter='48' style="margin-bottom: 16px;">
          <a-col :md="8" :sm="24">
            <a-button type="primary" @click="$refs.alarmtable.refresh(true)">{{ $t('alarm.query') }}</a-button>
            <a-button style="margin-left: 8px" :loading="exportLoading" icon="export" @click="handleExport">{{ $t('alarm.export') }}</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div v-if="showExportProgress" class="alarm-export-progress-card">
        <a-alert
          :type="exportError ? 'error' : (isExportCancelled ? 'warning' : (exportProgress >= 100 ? 'success' : 'info'))"
          show-icon
          style="margin-bottom: 16px;"
        >
          <template slot="message">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600;">
                <a-icon v-if="exportLoading" type="loading" style="margin-right: 8px;" />
                {{ exportTitle }}
              </span>
              <div>
                <a-button
                  v-if="exportLoading"
                  size="small"
                  type="danger"
                  ghost
                  @click="terminateExport(false)"
                  style="margin-right: 8px;"
                >
                  {{ $t('alarm.terminateExport') }}
                </a-button>
                <a-button
                  v-if="!exportLoading && !exportError"
                  size="small"
                  type="link"
                  @click="showExportProgress = false"
                >
                  {{ $t('alarm.close') }}
                </a-button>
              </div>
            </div>
          </template>
          <template slot="description">
            <div style="margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: rgba(0,0,0,0.65);">
                <span>{{ exportStepText }}</span>
                <span v-if="totalExportCount > 0" style="font-weight: 500;">
                  {{ exportedCount }} / {{ totalExportCount }} 条 ({{ exportProgress.toFixed(1) }}%)
                </span>
              </div>
              <a-progress
                :percent="exportProgress"
                :status="exportProgressStatus"
                :show-info="false"
                stroke-linecap="round"
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
              />

              <!-- Action buttons when error occurs -->
              <div v-if="exportError" style="margin-top: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <a-button type="primary" size="small" icon="redo" :loading="exportLoading" @click="retryExport">
                  {{ $t('alarm.retry') }}
                </a-button>
                <a-button v-if="allExportRecords.length > 0" size="small" icon="download" @click="terminateExport(true)">
                  {{ $t('alarm.exportPartial', { count: allExportRecords.length }) }}
                </a-button>
                <a-button size="small" type="danger" ghost icon="close" @click="terminateExport(false)">
                  {{ $t('alarm.terminateExport') }}
                </a-button>
              </div>
            </div>
          </template>
        </a-alert>
      </div>

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
        <span slot="device_type" slot-scope="text, record">
          <template>
            <span>{{ device_type_name(record.device_type) }}</span>
          </template>
        </span>
        <span slot="alarm" slot-scope="text, record">
          <template>
            <span>{{ alarm_name(record.alarm) }}</span>
          </template>
        </span>
        <span slot="organization_id" slot-scope="text, record">
          <template>
            <span>{{ record.organization_id }}</span>
          </template>
        </span>
        <span slot='timestamp' slot-scope="text, record">
          <template>
            <span>{{ localTime(record.timestamp) }}</span>
          </template>
        </span>
        <span slot='operation' slot-scope="text, record">
          <a @click="handleBatteryInfo(record)">{{ $t('alarm.table.batteryDetail') }}</a>
        </span>
      </s-table>

      <a-modal
        :visible="battery_detail_visible"
        width="90vw"
        centered
        :footer="null"
        :destroyOnClose="true"
        @cancel="handleBatteryInfoCancel"
      >
        <battery-info
          v-if="battery_detail_visible"
          ref="batteryInfo"
          :device-id="device_id"
          :bms-bt="bms_bt"
          @cancel="handleBatteryInfoCancel"
          @ok="handleBatteryInfoOk"
        />
      </a-modal>
    </div>
</template>

<script>
import moment from 'moment/moment'
import 'moment/locale/zh-cn';
import { STable } from '@/components'
import {
  getDeviceAlarmTypes,
  getDeviceAlarm,
  getDeviceAlarmPostgres,
  getDeviceList
} from '@/api/manage'
import BatteryInfo from '@/views/list/components/BatteryInfo'

moment.locale('zh-cn');

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
  watch: {
    deviceId () {
      if (this.$refs.alarmtable) {
        this.$refs.alarmtable.refresh(true)
      }
    },
    deviceStatus () {
      if (this.$refs.alarmtable) {
        this.$refs.alarmtable.refresh(true)
      }
    },
    organizationId () {
      if (this.$refs.alarmtable) {
        this.$refs.alarmtable.refresh(true)
      }
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
      loading: false,
      exportLoading: false,
      showExportProgress: false,
      exportProgress: 0,
      exportedCount: 0,
      totalExportCount: 0,
      totalExportPages: 0,
      currentExportPage: 1,
      allExportRecords: [],
      exportStepText: '',
      exportError: null,
      isExportCancelled: false,
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
  computed: {
    exportTitle () {
      if (this.exportError) {
        return this.$t('alarm.exportTitlePaused') || '告警导出异常暂停'
      }
      if (this.isExportCancelled) {
        return this.$t('alarm.exportTitleCancelled') || '告警数据导出已终止'
      }
      if (this.exportProgress >= 100) {
        return this.$t('alarm.exportTitleSuccess') || '告警数据导出完成'
      }
      return this.$t('alarm.exportTitleRunning') || '告警数据导出进行中'
    },
    exportProgressStatus () {
      if (this.exportError) {
        return 'exception'
      }
      if (this.exportProgress >= 100) {
        return 'success'
      }
      if (this.exportLoading) {
        return 'active'
      }
      return 'normal'
    },
    columns() {
      return [
        {
          title: this.$t('alarm.table.id'),
          dataIndex: 'id'
        },
        {
          title: this.$t('alarm.table.deviceId'),
          dataIndex: 'device_id'
        },
        {
          title: this.$t('alarm.table.type'),
          dataIndex: 'device_type',
          scopedSlots: { customRender: 'device_type' }
        },
        {
          title: this.$t('alarm.table.alarm'),
          dataIndex: 'alarm',
          scopedSlots: { customRender: 'alarm' }
        },
        {
          title: this.$t('alarm.table.time'),
          dataIndex: 'timestamp',
          scopedSlots: { customRender: 'timestamp' }
        },
        {
          title: this.$t('alarm.table.operation'),
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          fixed: 'right',
        }
      ]
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
    buildQueryParams (pageNo = 1, pageSize = 10) {
      const arg = Object.assign({}, this.queryData)
      if (arg.start_date) {
        arg.start_date = moment.isMoment(arg.start_date)
          ? arg.start_date.format('YYYY-MM-DD HH:mm:ss')
          : moment(arg.start_date).format('YYYY-MM-DD HH:mm:ss')
      }
      if (arg.end_date) {
        arg.end_date = moment.isMoment(arg.end_date)
          ? arg.end_date.format('YYYY-MM-DD HH:mm:ss')
          : moment(arg.end_date).format('YYYY-MM-DD HH:mm:ss')
      }
      arg.page_no = pageNo
      arg.page_size = pageSize
      if (this.deviceStatus) {
        arg.device_status = this.deviceStatus
      }
      if (this.deviceId) {
        arg.device_id = this.deviceId
      }
      if (this.organizationId) {
        arg.organization_id = this.organizationId
      }
      if (this.selectedItems && this.selectedItems.length > 0) {
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
      return arg
    },
    loadData (parameter) {
      this.loading = true
      console.log('parameter', parameter)
      console.log('queryData', this.queryData)
      const arg = this.buildQueryParams(parameter.pageNo, parameter.pageSize)
      // return getDeviceAlarmPostgres(arg)
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
        .catch(err => {
          this.loading = false
          throw err
        })
    },
    handleExport () {
      if (this.exportLoading) return
      this.allExportRecords = []
      this.currentExportPage = 1
      this.totalExportCount = 0
      this.totalExportPages = 0
      this.exportProgress = 0
      this.exportedCount = 0
      this.exportError = null
      this.isExportCancelled = false
      this.showExportProgress = true
      this.exportLoading = true
      this.processExportLoop()
    },
    retryExport () {
      if (this.exportLoading) return
      this.exportError = null
      this.isExportCancelled = false
      this.exportLoading = true
      this.processExportLoop()
    },
    terminateExport (downloadPartial = false) {
      this.isExportCancelled = true
      this.exportLoading = false
      if (downloadPartial && this.allExportRecords && this.allExportRecords.length > 0) {
        this.downloadCsvFile(this.allExportRecords, true)
        this.exportStepText = `已终止导出，已下载前 ${this.allExportRecords.length} 条数据`
      } else {
        this.exportStepText = this.$t('alarm.exportCancelledMsg') || '已终止导出操作'
      }
      this.exportError = null
      this.$message.info(this.$t('alarm.exportCancelledMsg') || '已终止导出操作')
    },
    async processExportLoop () {
      this.exportLoading = true
      this.exportError = null

      try {
        const BATCH_SIZE = 1000

        // If starting at page 1, load alarm types and initial batch
        if (this.currentExportPage === 1) {
          this.exportStepText = this.$t('alarm.exportStepInit') || '正在初始化查询并拉取首批数据...'
          const alarmPromise = (!this.alarm_types || this.alarm_types.length <= 16)
            ? this.get_alarm_name()
            : Promise.resolve()
          const firstArg = this.buildQueryParams(1, BATCH_SIZE)

          const [_, firstRes] = await Promise.all([
            alarmPromise,
            getDeviceAlarm(firstArg)
          ])

          if (this.isExportCancelled) return

          const total = (firstRes && firstRes.data && firstRes.data.total) || 0
          const firstRecords = (firstRes && firstRes.data && firstRes.data.records) || []

          if (total === 0 || firstRecords.length === 0) {
            this.showExportProgress = false
            this.$message.warning(this.$t('alarm.exportNoData') || '暂无符合条件的告警数据可导出')
            this.exportLoading = false
            return
          }

          this.totalExportCount = total
          this.totalExportPages = Math.ceil(total / BATCH_SIZE)
          this.allExportRecords = [...firstRecords]
          this.exportedCount = this.allExportRecords.length
          this.exportProgress = Math.min((this.exportedCount / total) * 100, 95)
          this.currentExportPage = 2
        }

        // Loop through remaining batches
        while (this.currentExportPage <= this.totalExportPages) {
          if (this.isExportCancelled) return

          const page = this.currentExportPage
          const totalPages = this.totalExportPages
          this.exportStepText = (this.$t('alarm.exportStepFetching', { current: page, total: totalPages }))
            || `正在拉取第 ${page}/${totalPages} 批数据...`

          const pageArg = this.buildQueryParams(page, BATCH_SIZE)
          const pageRes = await getDeviceAlarm(pageArg)

          if (this.isExportCancelled) return

          if (pageRes && pageRes.data && pageRes.data.records) {
            this.allExportRecords = this.allExportRecords.concat(pageRes.data.records)
          }

          this.exportedCount = this.allExportRecords.length
          this.exportProgress = Math.min((this.exportedCount / this.totalExportCount) * 100, 95)
          this.currentExportPage++
        }

        if (this.isExportCancelled) return

        if (this.allExportRecords.length === 0) {
          this.showExportProgress = false
          this.$message.warning(this.$t('alarm.exportNoData') || '暂无符合条件的告警数据可导出')
          this.exportLoading = false
          return
        }

        this.exportStepText = this.$t('alarm.exportStepParsing') || '数据拉取完毕，正在格式化并生成 Excel 文件...'
        this.exportProgress = 98

        // Small yield to let UI render progress update
        await new Promise(resolve => setTimeout(resolve, 50))

        // Trigger CSV download
        this.downloadCsvFile(this.allExportRecords, false)

        this.exportProgress = 100
        this.exportStepText = (this.$t('alarm.exportStepCompleted', { total: this.allExportRecords.length }))
          || `导出完成，已生成并下载文件 (共 ${this.allExportRecords.length} 条记录)`
        this.$message.success(this.$t('alarm.exportSuccess') || '告警数据导出成功')
      } catch (error) {
        console.error('Export alarms error:', error)
        const errorMsg = (error && error.response && error.response.data && error.response.data.msg)
          || (error && error.message)
          || '网络请求异常或超时'
        this.exportError = errorMsg
        const failedPage = this.currentExportPage
        const totalPages = this.totalExportPages || 1
        this.exportStepText = `第 ${failedPage}/${totalPages} 批数据请求失败 (${errorMsg})，您可以选择重试或终止导出`
        this.$message.error(`第 ${failedPage} 批数据请求失败: ${errorMsg}`)
      } finally {
        this.exportLoading = false
      }
    },
    downloadCsvFile (records, isPartial = false) {
      const headers = [
        this.$t('alarm.table.id'),
        this.$t('alarm.table.deviceId'),
        this.$t('alarm.table.type'),
        this.$t('alarm.table.alarm'),
        this.$t('alarm.table.time')
      ]

      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""'
        return `"${String(val).replace(/"/g, '""')}"`
      }

      const rows = records.map(record => {
        const idStr = record.id !== undefined && record.id !== null ? String(record.id) : ''
        const devIdStr = record.device_id ? `\t${record.device_id}` : ''
        const typeStr = this.device_type_name(record.device_type)
        const alarmStr = this.alarm_name(record.alarm)
        const timeStr = record.timestamp ? this.localTime(record.timestamp) : ''
        return [idStr, devIdStr, typeStr, alarmStr, timeStr]
      })

      const csvContent = '\uFEFF' + [
        headers.map(escapeCsv).join(','),
        ...rows.map(row => row.map(escapeCsv).join(','))
      ].join('\r\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = downloadUrl
      const timeStamp = moment().format('YYYYMMDD_HHmmss')
      const prefix = isPartial ? 'alarm_records_partial_' : 'alarm_records_'
      link.download = `${prefix}${timeStamp}.csv`
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(link)
      }, 1000)
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
    alarm_name(alarm) {
      console.log('alarm', alarm)
      // convert alarm to binary string
      // is alarm a number
      let binaryString = ''
      if (typeof alarm === 'number') {
        console.log('alarm is a number')
        binaryString = alarm.toString(2).padStart(64, '0')
      } else if (typeof alarm === 'string') {
        console.log('alarm is a string')
        binaryString = alarm
      } else {
        console.log('alarm is not a number or string')
        binaryString = '0'
      }
      console.log('binaryString', binaryString)
      let alarmName = ''
      for (let i = 0; i < 64; i++) {
        if (this.alarm_types[i] === undefined) {
          break
        }
        // console.log('binaryString[', 63 - i, ']', binaryString[63 - i])
        if (binaryString[63 - i] === '1') {
          console.log('alarm', alarm, i, this.alarm_types[i])
          alarmName += this.alarm_types[i] + ','
        }
      }
      // remove last ','
      if (alarmName.length > 0) {
        alarmName = alarmName.substring(0, alarmName.length - 1)
      } else {
        alarmName = this.$t('alarm.none')
      }
      return alarmName
    },
    get_alarm_name () {
      // 227 fm
      // 236 ls
      return getDeviceAlarmTypes(236)
        .then(res => {
          console.log('alarm type', res)
          if (res.data) {
            // Use Chinese labels if current locale is zh-CN, otherwise use English
            const currentLocale = this.$i18n.locale
            this.alarm_types = currentLocale === 'zh-CN' ? res.data.cn : res.data.en
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
      console.log('record.device_id', record.device_id)
      this.device_id = record.device_id
      this.bms_bt = record.bms_bt
      getDeviceList({ device_id: record.device_id, page_no: 1, page_size: 1 }).then(res => {
        if (res.data && res.data.records && res.data.records.length > 0) {
          this.bms_bt = res.data.records[0].bms_bt
        }
      }).catch(err => {
        console.error('getDeviceList error', err)
      })
      this.battery_detail_visible = true
      this.$nextTick(() => {
        console.log('record.device_id', record.device_id)
        this.$refs.batteryInfo.getBatteryInfoHandle(record.device_id)
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

<style>
/* Using alternative deep selector syntax for Ant Design components */
.ant-calendar-ok-btn {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: #fff !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
}

.ant-calendar-ok-btn:hover,
.ant-calendar-ok-btn:focus {
  background-color: #40a9ff !important;
  border-color: #40a9ff !important;
  color: #fff !important;
}

.ant-calendar-ok-btn:active {
  background-color: #096dd9 !important;
  border-color: #096dd9 !important;
}
</style>
