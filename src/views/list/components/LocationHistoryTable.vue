<template>
  <div>
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
          速度: <span>{{ record.speed || '-' }} km/h</span>
          <br />
          循环次数: <span>{{ record.bms_charging_cycle || '-' }}</span>
        </template>
      </span>

      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleViewHistory(record)">查看历史</a>
        </template>
      </span>
    </s-table>
  </div>
</template>

<script>
import { STable } from '@/components'
import { getDeviceList } from '@/api/manage'

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
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    width: '150px'
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
    return {
      columns,
      loadData: parameter => {
        // 合并查询参数
        const params = {
          ...parameter,
          device_status: this.deviceStatus,
          device_id: this.queryParams.device_id,
          organization_id: this.queryParams.organization_id,
          bt_code: this.queryParams.bt_code,
          iccid: this.queryParams.iccid
        }

        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        return getDeviceList(params)
          .then(res => {
            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              data: res.data.records
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
    }
  }
}
</script>
