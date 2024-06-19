<template>
  <div>
    <!-- App user talbe -->
    <a-card>
      <div>
        <h4>App用户</h4>
      </div>
      <div>
        <!-- query form -->
        <a-form layout="inline" :form="queryParam">
          <a-form-item label="用户名">
            <a-input v-model="queryParam.account" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="设备编号">
            <a-input v-model="queryParam.device_id" placeholder="请输入设备编号" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-table
          :columns="columns"
          :data-source="data"
          :pagination="pagination"
          :loading="loading"
          :row-key="record => record.id"
          @change="handleTableChange"
        >
          <template slot='action' slot-scope="text, record">
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider type="vertical" />
            <a-button type="link" @click="handleDelete(record)">删除</a-button>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script>
import { getAppUserDeviceBind } from '@/api/manage'

const columns = [
  {
    title: 'id',
    dataIndex: 'id'
  },
  {
    title: '用户名',
    dataIndex: 'account'
  },
  {
    title: '设备编号',
    dataIndex: 'device_id'
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
]
export default {
  mounted () {
    this.fetch()
  },
  data () {
    return {
      columns,
      data: [],
      pagination: {
        current: 1,
        pageSize: 100,
        total: 0
      },
      loading: false,
      queryParam: {
      }
    }
  },
  methods: {
    handleTableChange (pagination) {
      this.pagination = pagination
      this.fetch()
    },
    fetch () {
      // fetch app user / devices binding data from server
      this.loading = true
      getAppUserDeviceBind({
        page_no: this.pagination.current,
        page_size: this.pagination.pageSize,
        ...this.queryParam
      }).then(res => {
        this.loading = false
        this.data = res.data
        // this.pagination.total = res.total
      }).catch(() => {
        this.loading = false
      })
    },
    handleEdit (record) {
      console.log('TODO: edit', record)
    },
    handleDelete (record) {
      console.log('TODO: delete', record)
    },
    handleSearch () {
      this.fetch()
    }
  }
}
</script>

<style lang='less'>
</style>