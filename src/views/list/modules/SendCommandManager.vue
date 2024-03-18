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
    <send-command-manager-devices
      :visible='showDevices'
      :currentBatchSendCommandId='currentBatchSendCommandId'
      @ok="() => { showDevices = false }"
      @cancel="() => { showDevices = false }"
    />
  </a-modal>
</template>

<script>
import { getBatchSendCommandList } from '@/api/manage'
import { STable } from '@/components'
import SendCommandManagerDevices from './SendCommandManagerDevices.vue'

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
    STable,
    SendCommandManagerDevices
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
      queryData: {
        page_no: 1,
        page_size: 5,
        start_time: null,
        end_time: null
      },
      showBatchCommand: true,
      showDevices: false,
      currentBatchSendCommandId: 0 
    }
  },
  mounted () {
    console.log('SendCommandManager mounted')
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
      this.currentBatchSendCommandId = record.id
      this.showDevices = true
    },
    loadData (parameter) {
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      delete arg.pageNo
      delete arg.pageSize
      return getBatchSendCommandList(arg).then(res => {
        console.log('loadData res', res)
        const pages = Math.ceil(res.data.total / res.data.page_size)

        return {
          pageSize: res.data.page_size,
          pageNo: res.data.page_no,
          totalCount: res.data.total,
          totalPage: pages,
          data: res.data.records
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
