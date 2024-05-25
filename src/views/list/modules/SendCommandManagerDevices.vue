<template>
  <div v-if="this.currentBatchSendCommandId > 0">
    <a-modal title="设备" width="90vw" centered :visible="visible" @ok="() => { $emit('ok') }"
      @cancel="() => { $emit('cancel') }">
      <a-row>
        <span>命令编号 {{ this.currentBatchSendCommandId }}</span>
      </a-row>
      <s-table ref='tableDevices' :columns="columnsDevices" :data="loadDataDevices" :rowKey="(record) => record.id">
      </s-table>
      <a-row>
        <button @click="handleRefreshDevices()">刷新</button>
      </a-row>
    </a-modal>
  </div>
</template>

<script>
  import {
    getBatchSendCommandDevices
  } from '@/api/manage';
  import {
    STable
  } from '@/components';

  export default {
    name: 'SendCommandManagerDevices',
    props: {
      visible: {
        type: Boolean,
        required: true
      },
      currentBatchSendCommandId: {
        type: Number,
        required: true
      }
    },
    components: {
      STable
    },
    data() {
      return {
        columnsDevices: [{
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
      }
    },
    methods: {
      handleRefreshDevices() {
        if (this.$refs.tableDevices) this.$refs.tableDevices.refresh()
      },
      loadDataDevices(parameter) {
        let arg = Object.assign(parameter, this.queryData)
        arg.page_no = arg.pageNo
        arg.page_size = arg.pageSize
        delete arg.pageNo
        delete arg.pageSize
        arg.batch_command_id = this.currentBatchSendCommandId
        return getBatchSendCommandDevices(arg).then(res => {
          console.log('loadDataDevices res', res)
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
    },
    watch: {
      currentBatchSendCommandId(newValue) {
        if (newValue > 0 && this.visible) {
          this.handleRefreshDevices()
        }
      }
    }
  }
</script>