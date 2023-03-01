<template>
  <a-modal
    title="下发指令"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { handleOk(); $emit('ok') }"
    @cancel="() => { handleCancel(); $emit('cancel') }"
  >
    <div>
      <a-table
        :dataSource='deviceIds'
        :columns='columnsDeviceIds'
        rowKey='deviceId'
      >
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleDeviceIdsRemove(record)">删除</a>
          </template>
        </span>
      </a-table>
      <div>
        <a-button type="primary" @click="handleAddDevice">
          添加设备
          <a-icon v-if='!showAddDevice' type="down" />
          <a-icon v-if='showAddDevice' type="up" />
        </a-button>
      </div>
      <div v-if='showAddDevice'>
        <a-form-item
          :label="`设备编号`"
        >
          <a-textarea
            v-decorator="['newDeviceIds', {rules: [{required: true, message: '设备编号'}]}]"
            :rows="4"
            v-model='newDeviceIds'
            placeholder='输入设备编号
一行一个设备'
          />
        </a-form-item>
        <div v-if='formErrorMessage' class='error'>{{ this.formErrorMessage}}</div>
        <a-button type="primary" @click="handleAddDeviceIds">
          添加
        </a-button>
      </div>
    </div>
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
    <div v-if='formErrorMessage' class='error'>{{ this.formErrorMessage}}</div>
  </a-modal>
</template>

<script>
import { batchSendCommand, getSendCommandList, sendCommand } from '@/api/manage'

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
    deviceIds: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      enableDeviceIdRange: false,
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
      columnsDeviceIds: [
        {
          title: '设备ID',
          dataIndex: 'deviceId',
          key: 'deviceId'
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          fixed: 'right'
        }
      ],
      currentRow: null,
      param: null,
      showAddDevice: false,
      activeTab: 'singleDeviceId',
      deviceIdNew: null,
      deviceIdRangeBegin: null,
      deviceIdRangeEnd: null,
      deviceIdSet: null,
      reload: true,
      formErrorMessage: null,
      newDeviceIds: null
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
      this.formErrorMessage = null
      if (this.currentRow === null) {
        this.formErrorMessage = '请选择指令'
        return
      }
      console.log('deviceIds', this.deviceIds)
      if (this.deviceIds.length === 0) {
        this.formErrorMessage = '请添加设备'
        return
      }
      // console.log('handleOk', this.currentRow, this.param)
      let arg = {
        id: (new Date()).getTime(), // current timestamp in milliseconds
        name: this.currentRow.name,
        command: this.currentRow.command,
        subCommand: this.currentRow.sub_command,
        param: this.param
      }
        //
        // send the device id set (array of device id and/or device id range) to the backend.
        // The backend will send the command to each device in the set one by one in background.
        //
        // The backend will store the command in a database table and return the batch command id.
        //
        // The frontend can use this id to query the status of the batch command.
        //
        // The backend will (should?) also send a notification to the frontend when the batch command is finished.
        //
        // arg.deviceIdSet = this.deviceIdSet
      arg.deviceIds = this.deviceIds.map(item => item.deviceId)
      batchSendCommand(arg)
    },
    handleCancel () {
      console.log('handleCancel')
      this.deviceIdSet = null
      this.showAddDevice = false
    },
    handleAddDevice () {
      console.log('handleAddDevice')
      this.showAddDevice = !this.showAddDevice
    },
    initDeviceSet () {
      if (this.deviceIdSet == null) {
        this.deviceIdSet = {
          list: []
        }
        if (this.deviceId) {
          this.deviceIdSet.list.push(this.deviceId)
        }
      }
      if (this.deviceIdSet.list == null) {
        this.deviceIdSet.list = []
      }
      if (this.deviceIdSet.rangeList == null) {
        this.deviceIdSet.rangeList = []
      }
    },
    reloadDeviceSet () {
      this.reload = false
      this.reload = true
    },
    handleAddDeviceId () {
      console.log('handleAddDeviceId', this.deviceIdNew)
      this.initDeviceSet()
      this.deviceIdSet.list.push(this.deviceIdNew)
      this.deviceIdNew = null
      this.reloadDeviceSet()
    },
    handleAddDeviceIdRange () {
      console.log('handleAddDeviceIdRange', this.deviceIdRangeBegin, this.deviceIdRangeEnd)
      this.initDeviceSet()
      this.deviceIdSet.rangeList.push([this.deviceIdRangeBegin, this.deviceIdRangeEnd])
      this.deviceIdRangeBegin = null
      this.deviceIdRangeEnd = null
      this.reloadDeviceSet()
    },
    handleRemoveDeviceId (id) {
      console.log('handleRemoveDeviceId', id)
      if (this.deviceIdSet && this.deviceIdSet.list) {
        const index = this.deviceIdSet.list.indexOf(id)
        if (index >= 0) {
          this.deviceIdSet.list.splice(index, 1)
        }
      }
      this.reloadDeviceSet()
    },
    handleRemoveDeviceIdRange (idRange) {
      console.log('handleRemoveDeviceIdRange', idRange)
      if (this.deviceIdSet && this.deviceIdSet.rangeList) {
        let foundIndex = -1
        this.deviceIdSet.rangeList.forEach((range, index) => {
          console.log('range', range, 'index', index)
          if (range[0] === idRange[0] && range[1] === idRange[1]) {
            foundIndex = index
          }
        })
        if (foundIndex >= 0) {
          console.log('remove range', foundIndex)
          this.deviceIdSet.rangeList.splice(foundIndex, 1)
          console.log('rangeList', this.deviceIdSet.rangeList)
        }
      }
      this.reloadDeviceSet()
    },
    handleDeviceIdsRemove (id) {
      console.log('handleDeviceIdsRemove', id)
      const index = this.deviceIds.indexOf(id)
      if (index >= 0) {
        this.deviceIds.splice(index, 1)
      }
    },
    handleAddDeviceIds () {
      console.log('handleAddDeviceIds', this.newDeviceIds)
      this.newDeviceIds.split('\n').forEach(id => {
        const index = this.deviceIds.findIndex(item => item.deviceId === id)
        if (index < 0) {
          this.deviceIds.push({ deviceId: id })
        }
      })
    }
  }
}
</script>

<style scoped>
.info, .success, .warning, .error, .validation {
  border: 1px solid;
  margin: 10px 0px;
  padding: 15px 10px 15px 50px;
  background-repeat: no-repeat;
  background-position: 10px center;
}
.error{
  color: #D8000C;
  background-color: #FFBABA;
  background-image: url('~@/assets/icons/error.png');
}
.success {
  color: #4F8A10;
  background-color: #DFF2BF;
  background-image: url('~@/assets/icons/success.png');
}
</style>
