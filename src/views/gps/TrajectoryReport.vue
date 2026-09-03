<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper" style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item :label="$t('gps.common.deviceId')">
          <a-input v-model="query.device_id" style="width: 180px" @keyup.enter.native="loadData()" />
        </a-form-item>
        <a-form-item>
          <a-range-picker show-time v-model="query.range" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" icon="search" @click="loadData()">{{ $t('gps.mileage.query') }}</a-button>
          <a-button style="margin-left: 8px" @click="exportCsv()">{{ $t('gps.trajectory.exportCsv') }}</a-button>
          <a-button style="margin-left: 8px" @click="exportKml()">{{ $t('gps.trajectory.exportKml') }}</a-button>
        </a-form-item>
      </a-form>
    </div>
    <a-descriptions v-if="report" bordered size="small" :column="3" style="margin-bottom: 16px">
      <a-descriptions-item :label="$t('gps.trajectory.points')">{{ report.point_count }}</a-descriptions-item>
      <a-descriptions-item :label="$t('gps.mileage.distance')">{{ (report.distance_km || 0).toFixed(2) }} km</a-descriptions-item>
      <a-descriptions-item :label="$t('gps.trajectory.duration')">{{ report.duration_secs }} s</a-descriptions-item>
      <a-descriptions-item :label="$t('gps.trajectory.stops')">{{ report.stop_count }}</a-descriptions-item>
    </a-descriptions>
    <a-table
      row-key="start_ts"
      size="middle"
      :columns="columns"
      :data-source="stops"
      :loading="loading"
      :pagination="false"
    />
  </a-card>
</template>

<script>
import { getTrajectoryReport, exportTrajectoryCsv, exportTrajectoryKml } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'TrajectoryReport',
  data () {
    return {
      loading: false,
      query: { device_id: '', range: [] },
      report: null,
      stops: [],
      columns: [
        { title: 'lat', dataIndex: 'lat' },
        { title: 'lng', dataIndex: 'lng' },
        { title: this.$t('gps.trajectory.duration'), dataIndex: 'duration_secs' }
      ]
    }
  },
  methods: {
    rangeArgs () {
      const r = this.query.range || []
      return {
        start_date: r[0] ? moment(r[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
        end_date: r[1] ? moment(r[1]).format('YYYY-MM-DD HH:mm:ss') : undefined
      }
    },
    async loadData () {
      if (!this.query.device_id) {
        this.$message.error(this.$t('gps.common.deviceIdRequired'))
        return
      }
      this.loading = true
      try {
        const res = await getTrajectoryReport({
          device_id: this.query.device_id,
          ...this.rangeArgs()
        })
        this.report = res.data || {}
        this.stops = this.report.stops || []
      } finally {
        this.loading = false
      }
    },
    async exportCsv () {
      const blob = await exportTrajectoryCsv({ device_id: this.query.device_id, ...this.rangeArgs() })
      this.downloadBlob(blob, 'trajectory.csv')
    },
    async exportKml () {
      const blob = await exportTrajectoryKml({ device_id: this.query.device_id, ...this.rangeArgs() })
      this.downloadBlob(blob, 'trajectory.kml')
    },
    downloadBlob (blob, name) {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>
