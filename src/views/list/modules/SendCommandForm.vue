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
      <div v-if='deviceId != null && deviceIdSet == null' style='margin-bottom: 5px'>
        <span>设备ID: {{ deviceId }}</span>
      </div>
      <div v-if='deviceIdSet != null'>
        <div v-if='reload'>
<!--          <span>设备 {{ deviceIdSet }}</span>-->
          <div v-if='deviceIdSet.list && deviceIdSet.list.length > 0'>
            <span>设备ID列表: </span>
            <ul>
              <li v-for='item in deviceIdSet.list' :key='item'>
                <a-row>
                  <a-col :span="20">
                    {{ item }}
                  </a-col>
                  <a-col :span="4">
                    <a @click='handleRemoveDeviceId(item)'>删除</a>
                  </a-col>
                </a-row>
              </li>
            </ul>
          </div>
          <div v-if='deviceIdSet.rangeList && deviceIdSet.rangeList.length > 0'>
            <span>设备ID范围: </span>
            <ul>
              <li v-for='item in deviceIdSet.rangeList' :key='item.join()'>
                <a-row>
                  <a-col :span="20">
                    {{ item[0] }} ~ {{ item[1] }}
                  </a-col>
                  <a-col :span="4">
                    <a @click='handleRemoveDeviceIdRange(item)'>删除</a>
                  </a-col>
                </a-row>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div>
        <a-button type="primary" @click="handleAddDevice">
          添加设备
          <a-icon v-if='!showAddDevice' type="down" />
          <a-icon v-if='showAddDevice' type="up" />
        </a-button>
      </div>
      <div v-if='showAddDevice'>
        <a-tabs
          v-model='activeTab'
        >
          <a-tab-pane key='singleDeviceId'><template #tab><span>单个设备</span></template></a-tab-pane>
          <a-tab-pane key='deviceIdRange'><template #tab><span>设备 ID 范围</span></template></a-tab-pane>
        </a-tabs>
        <div v-if="activeTab === 'singleDeviceId'">
          <a-form-item :label="`设备ID`">
            <a-input v-model='deviceIdNew' placeholder="输入设备ID"></a-input>
          </a-form-item>
          <a-button type="primary" @click="handleAddDeviceId">添加</a-button>
        </div>
        <div v-if="activeTab === 'deviceIdRange'">
          <a-form-item :label="`设备ID范围`">
            <a-input v-model='deviceIdRangeBegin' placeholder="第一个设备ID"></a-input>
            <a-input v-model='deviceIdRangeEnd' placeholder="最后一个设备ID"></a-input>
          </a-form-item>
          <a-button type="primary" @click="handleAddDeviceIdRange">添加</a-button>
        </div>
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
    deviceId: {
      type: String,
      default: () => null
    },
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
      param: null,
      showAddDevice: false,
      activeTab: 'singleDeviceId',
      deviceIdNew: null,
      deviceIdRangeBegin: null,
      deviceIdRangeEnd: null,
      deviceIdSet: null,
      reload: true
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
      if (this.deviceIdSet) {
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
        arg.deviceIdSet = this.deviceIdSet
        batchSendCommand(arg)
      } else if (this.deviceId) {
        sendCommand(this.deviceId, arg)
      }
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
    }
  }
}
</script>

<style scoped>

</style>
