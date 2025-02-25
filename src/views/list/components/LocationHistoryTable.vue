<template>
  <div>
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
          <a-button type="primary" @click="refresh(true)">查询</a-button>
        </a-col>
      </a-row>
    </div>

    <s-table
      ref="table"
      size="default"
      :rowKey="(record) => record.id"
      :columns="columns"
      :data="loadData"
      :alert="false"
      showPagination="auto"
    >
      <span slot="device_info" slot-scope="text, record">
        <template>
          编号: <span>{{ record.code }}</span>
          <br />
          别名: <span>{{ record.alias }}</span>
          <br />
          ICCID: <span>{{ record.iccid }}</span>
        </template>
      </span>

      <span slot="organization_info" slot-scope="text, record">
        <template>
          组织: <span>{{ record.organization_name }}</span>
          <br />
          仓库: <span>{{ record.storehouse_name }}</span>
        </template>
      </span>

      <span slot="battery_info" slot-scope="text, record">
        <template>
          里程: <span>{{ record.mileage || '-' }} km</span>
          <br />
          总里程: <span>{{ record.total_mileage || '-' }} km</span>
        </template>
      </span>
    </s-table>
  </div>
</template>

<script>
import { STable } from '@/components'
import { getDeviceList, getLocation } from '@/api/manage'
import moment from 'moment'

const columns = [
  {
    title: '设备信息',
    dataIndex: 'code',
    scopedSlots: { customRender: 'device_info' }
  },
  {
    title: '组织信息',
    dataIndex: 'organization_name',
    scopedSlots: { customRender: 'organization_info' }
  },
  {
    title: '电池信息',
    dataIndex: 'battery',
    scopedSlots: { customRender: 'battery_info' }
  }
]

export default {
  name: 'LocationHistoryTable',
  props: {
    deviceStatus: {
      type: String,
      default: 'total'
    },
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    STable
  },
  data () {
    const defaultStart = moment().subtract(24, 'hours')
    const defaultEnd = moment()
    return {
      columns,
      startDate: defaultStart,
      startTime: defaultStart,
      endDate: defaultEnd,
      endTime: defaultEnd,
      deviceLocationsFirst: new Map(), // 存储设备位置信息
      deviceLocationsLast: new Map(), // 存储设备位置信息
      loadData: parameter => {
        const params = {
          ...parameter,
          device_status: this.deviceStatus,
          device_id: this.queryParams.device_id,
          organization_id: this.queryParams.organization_id,
          bt_code: this.queryParams.bt_code,
          iccid: this.queryParams.iccid,
        }

        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        return getDeviceList(params)
          .then(async res => {
            // 获取每个设备的位置信息
            const devices = res.data.records
            await this.fetchDeviceLocations(devices)

            // 使用位置信息更新设备数据
            const updatedDevices = devices.map(device => {
              const locationDataFirst = this.deviceLocationsFirst.get(device.code)
              const locationDataLast = this.deviceLocationsLast.get(device.code)
              console.log('locationDataFirst "' + locationDataFirst + '"')
              console.log('locationDataLast "' + locationDataLast + '"')
              if (locationDataFirst && locationDataLast) {
                console.log('locationDataFirst.mileage "' + locationDataFirst.mileage + '"')
                console.log('locationDataLast.mileage "' + locationDataLast.mileage + '"')
                return {
                  ...device,
                  total_mileage: (locationDataLast.mileage / 10).toFixed(1), // 转换为km
                  mileage: (locationDataLast.mileage / 10 - locationDataFirst.mileage / 10).toFixed(1), // 转换为km
                  // 其他字段保持不变
                }
              }
              return device
            })

            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              data: updatedDevices
            }
          })
      }
    }
  },
  methods: {
    handleViewHistory (record) {
      this.$emit('view-history', record)
    },
    refresh(force) {
      if (this.$refs.table) {
        this.$refs.table.refresh(force)
      }
    },
    updateDateTime(type, date, time) {
      if (date) {
        this[`${type}Date`] = date
      }
      if (time) {
        this[`${type}Time`] = time
      }
    },
    async fetchDeviceLocations(devices) {
      const locationPromises = devices.map(device => {
        const params = {
          page_no: 1,
          page_size: 1, // page_size 实际没有被使用
          start_date: this.startDate?.format('YYYY-MM-DD HH:mm:ss'),
          start_time: this.startTime?.format('YYYY-MM-DD HH:mm:ss'),
          end_date: this.endDate?.format('YYYY-MM-DD HH:mm:ss'),
          end_time: this.endTime?.format('YYYY-MM-DD HH:mm:ss')
        }
        console.log('device.code "' + device.code + '"')
        return getLocation(device.code, params)
          .then(response => {
            if (response.data && response.data.length > 0) {
              this.deviceLocationsFirst.set(device.code, response.data[0])
              this.deviceLocationsLast.set(device.code, response.data[response.data.length - 1])
            }
          })
          .catch(error => {
            console.error(`Error fetching location for device ${device.code}:`, error)
          })
      })

      await Promise.all(locationPromises)
    }
  },
  watch: {
    deviceStatus() {
      this.refresh(true)
    },
    queryParams: {
      handler() {
        this.refresh(true)
      },
      deep: true
    },
    startDate() {
      this.refresh(true)
    },
    startTime() {
      this.refresh(true)
    },
    endDate() {
      this.refresh(true)
    },
    endTime() {
      this.refresh(true)
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
.ant-calendar-picker {
  margin-right: 8px;
}
</style>
