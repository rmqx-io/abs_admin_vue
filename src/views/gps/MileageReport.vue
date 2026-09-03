<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper" style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item :label="$t('gps.common.deviceId')">
          <a-input v-model="query.device_id" style="width: 180px" @keyup.enter.native="loadData()" />
        </a-form-item>
        <a-form-item :label="$t('gps.mileage.day')">
          <a-range-picker v-model="query.range" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" icon="search" @click="loadData()">{{ $t('gps.mileage.query') }}</a-button>
          <a-button style="margin-left: 8px" @click="exportCsv()">{{ $t('gps.mileage.exportCsv') }}</a-button>
        </a-form-item>
      </a-form>
    </div>
    <p v-if="report">{{ $t('gps.mileage.total') }}: {{ (report.total_km || 0).toFixed(2) }} km</p>
    <a-table
      row-key="day"
      size="middle"
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      :pagination="false"
    />
  </a-card>
</template>

<script>
import { getMileageReport, exportMileageCsv } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'MileageReport',
  data () {
    return {
      loading: false,
      query: { device_id: '', range: [] },
      report: null,
      rows: [],
      columns: [
        { title: this.$t('gps.mileage.day'), dataIndex: 'day' },
        { title: this.$t('gps.mileage.distance') + ' (km)', dataIndex: 'distance_km' },
        { title: this.$t('gps.mileage.segments'), dataIndex: 'segments' }
      ]
    }
  },
  methods: {
    dayRange () {
      const r = this.query.range || []
      return {
        start_day: r[0] ? moment(r[0]).format('YYYY-MM-DD') : undefined,
        end_day: r[1] ? moment(r[1]).format('YYYY-MM-DD') : undefined
      }
    },
    async loadData () {
      if (!this.query.device_id) {
        this.$message.error(this.$t('gps.common.deviceIdRequired'))
        return
      }
      this.loading = true
      try {
        const res = await getMileageReport({
          device_id: this.query.device_id,
          ...this.dayRange()
        })
        this.report = res.data || {}
        this.rows = this.report.days || []
      } finally {
        this.loading = false
      }
    },
    async exportCsv () {
      if (!this.query.device_id) {
        this.$message.error(this.$t('gps.common.deviceIdRequired'))
        return
      }
      const blob = await exportMileageCsv({
        device_id: this.query.device_id,
        ...this.dayRange()
      })
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'mileage.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>
