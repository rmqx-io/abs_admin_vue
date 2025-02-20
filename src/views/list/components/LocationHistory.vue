<template>
  <a-spin :spinning="loading">
    <div class="filter-container">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="开始时间">
            <a-date-picker
              v-model="startDate"
              format="YYYY-MM-DD"
              @change="(date) => updateDateTime('start', date, startTime)"
            />
            <a-time-picker
              v-model="startTime"
              format="HH:mm:ss"
              @change="(time) => updateDateTime('start', startDate, time)"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="结束时间">
            <a-date-picker
              v-model="endDate"
              format="YYYY-MM-DD"
              @change="(date) => updateDateTime('end', date, endTime)"
            />
            <a-time-picker
              v-model="endTime"
              format="HH:mm:ss"
              @change="(time) => updateDateTime('end', endDate, time)"
            />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="fetchLocationData">查询</a-button>
        </a-col>
      </a-row>
    </div>
    <a-table
      :columns="columns"
      :data-source="locationRecords"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template slot="time" slot-scope="text, record">
        {{ localTime(record.time_tracking) }}
      </template>
      <template slot="coordinates" slot-scope="text, record">
        {{ record.mars_longitude.toFixed(6) }}, {{ record.mars_latitude.toFixed(6) }}
      </template>
      <template slot="gpsCoordinates" slot-scope="text, record">
        {{ record.longitude.toFixed(6) }}, {{ record.latitude.toFixed(6) }}
      </template>
      <template slot="speed" slot-scope="text, record">
        {{ (record.speed / 10).toFixed(1) }}
      </template>
      <template slot="mileage" slot-scope="text, record">
        {{ (record.mileage / 10).toFixed(1) }}
      </template>
    </a-table>
  </a-spin>
</template>

<script>
import { getLocation } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'LocationHistory',
  // eslint-disable-next-line vue/require-prop-types
  props: ['deviceId'],
  data() {
    const defaultStart = moment().subtract(24, 'hours')
    const defaultEnd = moment()
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
        { title: '火星坐标', scopedSlots: { customRender: 'coordinates' } },
        { title: 'GPS坐标', scopedSlots: { customRender: 'gpsCoordinates' } },
        { title: '速度 (Km/h)', dataIndex: 'speed', scopedSlots: { customRender: 'speed' } },
        { title: '里程 (Km)', dataIndex: 'mileage', scopedSlots: { customRender: 'mileage' } },
        { title: '卫星数', dataIndex: 'rssi' }
      ],
      startDate: defaultStart.format('YYYY-MM-DD HH:mm:ss'),
      startTime: defaultStart.format('YYYY-MM-DD HH:mm:ss'),
      endDate: defaultEnd.format('YYYY-MM-DD HH:mm:ss'),
      endTime: defaultEnd.format('YYYY-MM-DD HH:mm:ss'),
    }
  },
  mounted() {
    this.fetchLocationData()
  },
  methods: {
    localTime(time) {
      console.log('time', time)
      return moment.utc(time).local().format('YYYY-MM-DD HH:mm:ss')
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current
      this.fetchLocationData()
    },
    updateDateTime(type, date, time) {
      if (date) {
        this[`${type}Date`] = date.format('YYYY-MM-DD HH:mm:ss')
      }
      if (time) {
        this[`${type}Time`] = time.format('YYYY-MM-DD HH:mm:ss')
      }
    },
    async fetchLocationData() {
      this.loading = true
      try {
        const params = {
          page_no: this.pagination.current,
          page_size: this.pagination.pageSize,
          start_date: this.startDate,
          start_time: this.startTime,
          end_date: this.endDate,
          end_time: this.endTime
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
.filter-container {
  margin-bottom: 20px;
}
.ant-calendar-picker {
  margin-right: 8px;
}
</style>
