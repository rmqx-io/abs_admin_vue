<template>
  <a-modal
    title="下发指令管理"
    width="90vw"
    centered
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { handleOk(); $emit('ok') }"
    @cancel="() => { handleCancel(); $emit('cancel') }"
  >
    <div v-if='showBatchCommand'>
      <s-table
        ref='table'
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
        <span slot='action' slot-scope="text, record">
          <template>
            <a @click='handleViewDevices(record)'>查看设备</a>
          </template>
        </span>
      </s-table>
    </div>
    <div v-if='showDevices'>
      <a-row>
        <a @click='handleBack'><< 返回</a>
      </a-row>
      <a-row>
        <span>编号 {{ this.currentBatchSendCommandId }}</span>
      </a-row>
      <s-table
        ref='tableDevices'
        :columns="columnsDevices"
        :data="loadDataDevices"
        :rowKey="(record) => record.id"
      >
      </s-table>
    </div>
  </a-modal>
</template>

<script>
import { getBatchSendCommandDevices, getBatchSendCommandList } from '@/api/manage'
import { STable } from '@/components'

export default {
  name: 'SendCommandManager',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    }
  },
  components: {
    STable
  },
  data () {
    return {
      columns: [
        {
          title: '编号',
          dataIndex: 'id',
          key: 'id'
        },
        {
          title: '指令',
          dataIndex: 'command',
          key: 'command'
        },
        {
          title: '子指令',
          dataIndex: 'sub_command',
          key: 'sub_command'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description'
        },
        {
          title: '创建时间',
          dataIndex: 'create_time'
        },
        {
          title: '参数',
          dataIndex: 'params'
        },
        {
          title: '离线重发',
          dataIndex: 'enable_offline_message'
        },
        {
          title: '过期时间',
          dataIndex: 'ttl'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      columnsDevices: [
        {
          title: '编号',
          dataIndex: 'id'
        },
        {
          title: '设备编号',
          dataIndex: 'device_id'
        },
        {
          title: '发送时间',
          dataIndex: 'sent_time'
        },
        {
          title: '应答时间',
          dataIndex: 'ack_time'
        },
        {
          title: '状态',
          dataIndex: 'status'
        }
      ],
      queryData: {
        page_no: 1,
        page_size: 5,
        start_time: null,
        end_time: null
      },
      showBatchCommand: true,
      showDevices: false,
      currentBatchSendCommandId: null
    }
  },
  mounted () {
    console.log('mounted')
    this.fetch()
  },
  methods: {
    handleOk () {
      console.log('ok')
    },
    handleCancel () {
      console.log('cancel')
    },
    fetch () {
    },
    refresh () {
      this.$refs.table.refresh(true)
    },
    handleViewDevices (record) {
      console.log('handleViewDevices', record)
      this.showBatchCommand = false
      this.showDevices = true
      this.currentBatchSendCommandId = record.id
      // next 1s refresh
      setTimeout(() => {
        this.$refs.tableDevices.refresh(true)
      }, 100)
    },
    handleBack () {
      this.showDevices = false
      this.showBatchCommand = true
      this.currentBatchSendCommandId = null
      setTimeout(() => {
        this.$refs.table.refresh(true)
      }, 100)
    },
    loadData (parameter) {
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      delete arg.pageNo
      delete arg.pageSize
      return getBatchSendCommandList(arg).then(res => {
        console.log('loadData res', res)
        return {
          pageSize: res.data.page_size,
          pageNo: res.data.page_no,
          totalCount: res.data.total,
          totalPage: res.data.pages,
          data: res.data.records
        }
      })
    },
    loadDataDevices (parameter) {
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      delete arg.pageNo
      delete arg.pageSize
      arg.batch_command_id = this.currentBatchSendCommandId
      return getBatchSendCommandDevices(arg).then(res => {
        console.log('loadDataDevices res', res)
        return {
          pageSize: res.data.page_size,
          pageNo: res.data.page_no,
          totalCount: res.data.total,
          totalPage: res.data.pages,
          data: res.data.records
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
