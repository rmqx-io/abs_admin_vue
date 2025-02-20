<template>
  <a-spin :spinning="loading">
    <a-table
      :columns="columns"
      :data-source="locationRecords"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template slot="time" slot-scope="text">
        {{ localTime(text) }}
      </template>
      <template slot="coordinates" slot-scope="text, record">
        {{ record.mars_longitude.toFixed(6) }}, {{ record.mars_latitude.toFixed(6) }}
      </template>
    </a-table>
  </a-spin>
</template>

<script>
import { getLocation } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'LocationHistory',
  props: ['deviceId'],
  data() {
    return {
      loading: false,
      locationRecords: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      columns: [
        { title: '时间', dataIndex: 'location_time', scopedSlots: { customRender: 'time' } },
        { title: '坐标', scopedSlots: { customRender: 'coordinates' } },
        { title: '速度 (km/h)', dataIndex: 'speed' },
        { title: '方向 (°)', dataIndex: 'direction' },
        { title: '海拔 (m)', dataIndex: 'altitude' },
        { title: '卫星数', dataIndex: 'satellites' }
      ]
    }
  },
  mounted() {
    this.fetchLocationData()
  },
  methods: {
    localTime(time) {
      return moment.utc(time).local().format('YYYY-MM-DD HH:mm:ss')
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current
      this.fetchLocationData()
    },
    async fetchLocationData() {
      this.loading = true
      try {
        const params = {
          page_no: this.pagination.current,
          page_size: this.pagination.pageSize,
        }
        const response = await getLocation(this.deviceId, params)
        console.log('response', response)
        this.locationRecords = response.data
        this.pagination.total = response.totalCount || 0
      } catch (error) {
        console.error('Error fetching location history:', error)
        this.$message.error('获取位置记录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.ant-table {
  margin-top: 16px;
}
</style>
