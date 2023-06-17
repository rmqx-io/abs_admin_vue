<template>
  <div class='scrollable-content'>
    <a-table :columns='columns' rowKey='id' :data='loadData'>
    </a-table>
  </div>
</template>

<script>
import { getDevicePacketLog } from '@/api/manage'

export default {
  name: 'ProtocolLog',
  props: {
    deviceId: { type: String, default: () => null },
    visible: { type: Boolean, required: true },
    loading: { type: Boolean, default: () => false },
    model: { type: Object, default: () => null },
  },
  data () {
    return {
      columns: [
        { title: '编号', dataIndex: 'id' },
        { title: '时间', dataIndex: 'timestamp' },
        { title: '类型', dataIndex: 'type' },
        { title: '内容', dataIndex: 'content' }
      ]
    }
  },
  methods: {
    loadData (parameter) {
      this.loading = true
      console.log('packet log parameter', parameter)
      console.log('packet log queryData', this.queryData)
      let arg = Object.assign(parameter, this.queryData)
      arg.page_no = arg.pageNo
      arg.page_size = arg.pageSize
      delete arg.pageNo
      delete arg.pageSize
      return getDevicePacketLog(this.devcieId, arg)
        .then(res => {
          this.loading = false
          return {
            pageSize: res.data.page_size,
            pageNo: res.data.page_no,
            totalCount: res.data.total,
            total: res.data.total,
            data: res.data.records}
        })
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