<template>
  <a-modal
    title="协议日志"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <div>
      <a-table :columns='columns' rowKey='id' :data='loadData'>
      </a-table>
    </div>
  </a-modal>
</template>

<script>
import { getDevicePacketLog } from '@/api/manage'

export default {
  name: 'ProtocolLog',
  props: {
    devcieId: { type: String, default: () => null },
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

</style>