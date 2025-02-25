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
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    width: '150px'
  }
]

export default {
  name: 'LocationHistoryTable',
  components: {
    STable
  },
  data () {
    return {
      columns,
      loadData: parameter => {
        return getDeviceList(Object.assign(parameter, { device_status: 'total' }))
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
    }
  }
}
</script> 