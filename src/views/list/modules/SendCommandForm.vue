<template>
  <a-modal
    title="下发指令"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { handleOk(); $emit('ok') }"
    @cancel="() => { handleCancel(); $emit('cancel') }"
  >
    <a-table
      :dataSource="sendCommandList"
      :columns="columns"
      rowKey="name"
      :customRow="customRow"
    />
    <a-form-item
      v-if="currentRow"
      :label="currentRow.name_cn"
    >
      <a-input
        v-model='param'
        placeholder="输入参数"
      ></a-input>
    </a-form-item>
  </a-modal>
</template>

<script>
import { getSendCommandList, sendCommand } from '@/api/manage'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    },
    deviceId: {
      type: String,
      default: () => null
    }
  },
  data () {
    return {
      sendCommandList: [],
      columns: [
        {
          title: '指令名称',
          dataIndex: 'name_cn',
          key: 'name_cn'
        },
        {
          title: '描述',
          dataIndex: 'description_cn',
          key: 'description_cn'
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
        }
      ],
      currentRow: null,
      param: null
    }
  },
  created () {
    this.getSendCommandList()
  },
  methods: {
    getSendCommandList () {
      return getSendCommandList('secnet')
        .then(res => {
          this.sendCommandList = res.data
        })
    },
    customRow (record) {
      return {
        on: {
          click: (event) => {
            console.log('row click', record)
            this.currentRow = record
          }
        }
      }
    },
    handleOk () {
      console.log('handleOk', this.currentRow, this.param)
      const arg = {
        id: (new Date()).getTime(), // current timestamp in milliseconds
        name: this.currentRow.name,
        command: this.currentRow.command,
        sub_command: this.currentRow.sub_command,
        param: this.param
      }
      sendCommand(this.deviceId, arg)
    },
    handleCancel () {
      console.log('handleCancel')
    }
  }
}
</script>

<style scoped>

</style>
