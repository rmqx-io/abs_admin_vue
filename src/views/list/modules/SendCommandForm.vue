<template>
  <a-modal
    title="下发指令"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <div>send command form</div>
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
      <a-input placeholder="输入参数"></a-input>
    </a-form-item>
  </a-modal>
</template>

<script>
import { getSendCommandList } from '@/api/manage'

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
      currentRow: null
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
    }
  }
}
</script>

<style scoped>

</style>
