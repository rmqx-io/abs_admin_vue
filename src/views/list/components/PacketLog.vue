<template>
  <div class='scrollable-content'>
    <s-table
      ref='packetLogTable'
      :columns='columns'
      rowKey='id'
      :data='loadData'
      showPagination='auto'
    >
      <span slot='time_tracking' slot-scope="text, record">
        <template>
          {{ record.time_tracking ? localTime(record.time_tracking) : ''}}
        </template>
      </span>
      <span slot='command' slot-scope='text, record'>
        <template>
          {{ record.command ? '0x' + record.command.toString(16).padStart(4, '0') : '' }}
        </template>
      </span>
      <span slot='upload' slot-scope='text, record'>
        <template>
          {{ record.upload ? '上行' : '下行' }}
        </template>
      </span>
      <span slot='packet' slot-scope="text, record">
        <template>
          {{ byteArrayToHexArray(record.packet).join(' ') }}
        </template>
      </span>
    </s-table>
    <div class='pagination'>
      <Button :disabled='currentPage === 1' @click='handleFirstPage()' >首页</Button>
<!--      <Button :disabled='currentPage === 1' @click="handlePreviousPage()">上一页</Button>-->
      <Button :disabled='hasMore === false' @click='handleNextPage()'>下一页</Button>
    </div>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import Button from 'ant-design-vue/lib/button'
import { getDevicePacketLog } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'ProtocolLog',
  components: {
    STable,
    Ellipsis,
    Button
  },
  props: {
    deviceId: { type: String, default: () => null },
    visible: { type: Boolean, required: true },
    model: { type: Object, default: () => null }
  },
  data () {
    return {
      columns: [
        { title: '编号', dataIndex: 'id' },
        { title: '时间', dataIndex: 'time_tracking', scopedSlots: { customRender: 'time_tracking' } },
        { title: '类型', dataIndex: 'command', scopedSlots: { customRender: 'command' } },
        { title: '方向', dataIndex: 'upload' },
        { title: '内容', dataIndex: 'packet', scopedSlots: { customRender: 'packet' } }
      ],
      cursor: null,
      currentPage: 1,
      hasMore: false
    }
  },
  methods: {
    loadData (parameter) {
      console.log('packet log parameter', parameter)
      console.log('packet log queryData', this.queryData)
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      if (this.cursor !== null) {
        console.log('packet log cursor', this.cursor)
        arg.cursor = this.cursor.join(',')
      }
      delete arg.pageNo
      delete arg.pageSize
      return getDevicePacketLog(this.deviceId, arg)
        .then(res => {
          console.log('packet log res', res)
          this.hasMore = res.data.has_more
          this.cursor = res.data.cursor
          return {
            // pageSize: res.data.page_size,
            // pageNo: res.data.page_no,
            // totalCount: res.data.total,
            // total: res.data.total,
            pageSize: 10,
            pageNo: 1,
            totalCount: 10,
            totalPage: 1,
            data: res.data.packets
          }
        })
    },
    localTime (time) {
      return moment.utc(time).local().format('YYYY-MM-DD HH:mm:ss')
    },
    byteArrayToHexArray (byteArray) {
      const hexArray = []
      for (let i = 0; i < byteArray.length; i++) {
        const hexValue = byteArray[i].toString(16).padStart(2, '0')
        hexArray.push(hexValue)
      }
      return hexArray
    },
    refresh () {
      if (this.currentPage === 1) {
        this.cursor = null
      }
      this.$refs.packetLogTable.refresh()
    },
    handleFirstPage () {
      console.log('handleFirstPage')
      this.currentPage = 1
      this.cursor = null
      this.refresh()
    },
    handlePreviousPage () {
      console.log('handlePreviousPage')
      if (this.currentPage > 1)  {
        this.currentPage--
      }
    },
    handleNextPage () {
      console.log('handleNextPage')
      this.currentPage++
      this.refresh()
    }
  }
}
</script>

<style scoped>
.vm {
  width: 100%;
  max-width: 100%;
}
.fullscreen-modal {
  width: 100%;
  max-width: 100%;
  top: 0;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.fullscreen-modal .vm-titlebar {
  flex-shrink: 0;
}
.fullscreen-modal .vm-content {
  padding: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scrollable-content {
  width: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 15px 10px 15px;
  flex-grow: 1;
}
.fullscreen-modal .fullscreen-modal-footer {
  border-top: 1px solid #e5e5e5;
  padding: 15px;
}
</style>
