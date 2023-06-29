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
            <a-input v-model="queryParam.username" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="设备编号">
            <a-input v-model="queryParam.deviceNo" placeholder="请输入设备编号" />
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
const columns = [
  {
    title: 'id',
    dataIndex: 'id'
  },
  {
    title: '用户名',
    dataIndex: 'username'
  },
  {
    title: '设备编号',
    dataIndex: 'deviceNo'
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
        pageSize: 10,
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
      setTimeout(() => {
        this.loading = false
        this.data = [
          {
            id: 1,
            username: 'admin',
            deviceNo: '1234567890'
          },
          {
            id: 2,
            username: 'user',
            deviceNo: '0987654321'
          }
        ]
        this.pagination.total = 2
      }, 1000)
    },
    handleEdit (record) {
      console.log('TODO: edit', record)
    },
    handleDelete (record) {
      console.log('TODO: delete', record)
    },
    handleSearch () {
      console.log('TODO: search')
    }
  }
}
</script>

<style lang='less'>
</style>