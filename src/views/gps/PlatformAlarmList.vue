<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper" style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item :label="$t('gps.alarm.type')">
          <a-select v-model="query.alarm_type" style="width: 160px" allow-clear @change="resetPage()">
            <a-select-option :value="1">{{ $t('gps.alarm.enter') }}</a-select-option>
            <a-select-option :value="2">{{ $t('gps.alarm.exit') }}</a-select-option>
            <a-select-option :value="3">{{ $t('gps.alarm.speed') }}</a-select-option>
            <a-select-option :value="4">{{ $t('gps.alarm.powerOff') }}</a-select-option>
            <a-select-option :value="5">{{ $t('gps.alarm.lowBattery') }}</a-select-option>
            <a-select-option :value="6">{{ $t('gps.alarm.vibration') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('gps.common.status')">
          <a-select v-model="query.status" style="width: 140px" allow-clear @change="resetPage()">
            <a-select-option :value="0">{{ $t('gps.alarm.pending') }}</a-select-option>
            <a-select-option :value="1">{{ $t('gps.alarm.confirmed') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('gps.common.deviceId')">
          <a-input v-model="query.device_id" style="width: 180px" @keyup.enter.native="resetPage()" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" icon="search" @click="resetPage()">{{ $t('common.search') }}</a-button>
        </a-form-item>
        <a-form-item>
          <a-popconfirm :title="$t('gps.alarm.clearConfirm')" @confirm="clearAlarms()">
            <a-button type="danger" icon="delete">{{ $t('gps.alarm.clear') }}</a-button>
          </a-popconfirm>
        </a-form-item>
      </a-form>
    </div>

    <a-table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      :pagination="pagination"
      @change="onPageChange"
    >
      <template slot="alarm_type" slot-scope="record">
        <a-tag :color="alarmColor(record.alarm_type)">{{ alarmName(record.alarm_type) }}</a-tag>
      </template>
      <template slot="status" slot-scope="text">
        <a-tag :color="text === 1 ? 'green' : 'orange'">{{ text === 1 ? $t('gps.alarm.confirmed') : $t('gps.alarm.pending') }}</a-tag>
      </template>
      <template slot="location" slot-scope="record">
        <span v-if="record.lat || record.lng">{{ record.lat }}, {{ record.lng }}</span>
        <span v-else>-</span>
      </template>
      <template slot="action" slot-scope="record">
        <a v-if="record.status !== 1" @click="confirmAlarm(record)">{{ $t('gps.alarm.confirm') }}</a>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { getPlatformAlarmPage, confirmPlatformAlarm, clearPlatformAlarm } from '@/api/manage'

export default {
  name: 'PlatformAlarmList',
  data () {
    return {
      loading: false,
      rows: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
      query: { alarm_type: undefined, status: 0, device_id: undefined },
      columns: [
        { title: this.$t('gps.common.deviceId'), dataIndex: 'device_id' },
        { title: this.$t('gps.alarm.type'), scopedSlots: { customRender: 'alarm_type' } },
        { title: this.$t('gps.alarm.message'), dataIndex: 'message' },
        { title: this.$t('gps.alarm.location'), scopedSlots: { customRender: 'location' } },
        { title: this.$t('gps.alarm.speed'), dataIndex: 'speed_kmh' },
        { title: this.$t('gps.common.status'), dataIndex: 'status', scopedSlots: { customRender: 'status' } },
        { title: this.$t('gps.alarm.time'), dataIndex: 'create_date' },
        { title: this.$t('gps.common.action'), key: 'action', scopedSlots: { customRender: 'action' } }
      ]
    }
  },
  computed: {
    pagination () {
      return {
        current: this.pageNo,
        pageSize: this.pageSize,
        total: this.total,
        showSizeChanger: true,
        showTotal: t => `${this.$t('gps.common.total')} ${t}`
      }
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    alarmName (t) {
      const map = {
        1: this.$t('gps.alarm.enter'),
        2: this.$t('gps.alarm.exit'),
        3: this.$t('gps.alarm.speed'),
        4: this.$t('gps.alarm.powerOff'),
        5: this.$t('gps.alarm.lowBattery'),
        6: this.$t('gps.alarm.vibration')
      }
      return map[t] || t
    },
    alarmColor (t) {
      const map = { 1: 'blue', 2: 'purple', 3: 'red', 4: 'volcano', 5: 'orange', 6: 'magenta' }
      return map[t] || 'default'
    },
    resetPage () {
      this.pageNo = 1
      this.loadData()
    },
    async loadData () {
      this.loading = true
      try {
        const res = await getPlatformAlarmPage({
          page_no: this.pageNo,
          page_size: this.pageSize,
          device_id: this.query.device_id || undefined,
          alarm_type: this.query.alarm_type,
          status: this.query.status,
          start_date: undefined,
          end_date: undefined
        })
        const data = res.data || {}
        this.rows = data.records || []
        this.total = data.total || 0
      } finally {
        this.loading = false
      }
    },
    onPageChange (pag) {
      this.pageNo = pag.current
      this.pageSize = pag.pageSize
      this.loadData()
    },
    async confirmAlarm (record) {
      try {
        await confirmPlatformAlarm({ id: String(record.id) })
        this.$message.success(this.$t('gps.common.success'))
        this.loadData()
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    },
    async clearAlarms () {
      try {
        await clearPlatformAlarm({ start_date: undefined })
        this.$message.success(this.$t('gps.common.success'))
        this.loadData()
      } catch (err) {
        this.$message.error(this.$t('gps.common.failed'))
      }
    }
  }
}
</script>
