<template>
  <a-card>
    <div><a @click="handleClose()"><< 返回</a></div>
    <div>{{ this.deviceId }}</div>
<!--    <div>{{ this.data }}</div>-->
    <s-table
      ref="batteryInfoTable"
      size="default"
      rowKey="(record) => record.data.id"
      :columns="columns"
      :data="loadData"
      :alert="true"
      :rowSelection="rowSelection"
      :showPagination="false"
    >
      <span slot='info_id' slot-scope="text, record">
        <template>
          <span>{{ record.id }}</span>
        </template>
      </span>
      <span slot='time_track' slot-scope="text, record">
        <template>
          <span>{{ record.time_tracking }}</span>
        </template>
      </span>
      <span slot='single_battery_voltage' slot-scope="text, record">
        <template>
          <span>{{ record.single_battery_voltage_arr }}</span>
        </template>
      </span>
      <span slot='battery_capacity_soc' slot-scope="text, record">
        <template>
          <span>{{ record.battery_capacity_soc }}</span>
        </template>
      </span>
      <span slot='battery_voltage' slot-scope="text, record">
        <template>
          <span>{{ record.battery_voltage }}</span>
        </template>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import { getBatteryInfo } from '@/api/manage'
import { STable } from '@/components'

const columns = [
  {
    title: '编号',
    dataIndex: 'id',
    scopedSlots: { customRender: 'info_id' }
  },
  {
    title: '时间',
    dataIndex: 'time_tracking',
    scopedSlots: { customRender: 'time_track' }
  },
  {
    title: '单个电池电压',
    dataIndex: 'single_battery_voltage_arr',
    scopedSlots: { customRender: 'single_battery_voltage' }
  },
  {
    title: '电池容量',
    dataIndex: 'battery_capacity_soc',
    scopedSlots: { customRender: 'battery_capacity_soc' }
  },
  {
    title: '电池电压',
    dataIndex: 'battery_voltage',
    scopedSlots: { customRender: 'battery_voltage' }
  },

  // battery_box_temperature
  // battery_capacity_soc
  // battery_currency
  // battery_healthy
  // battery_temperature
  // battery_voltage
  // bit_status
// power_transistor_temperature
// single_battery_voltage_arr
// time_tracking
// vehicle_id
]

export default {
  name: 'Info',
  components: {
    STable
  },
  props: {
    loading: {
      type: Boolean,
      default: () => false
    },
    deviceId: {
      type: String,
      default: () => null
    },
    data: {
      type: Object,
      default: () => null
    },
    title: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    bordered: {
      type: Boolean,
      default: false
    }
  },
  data () {
    this.columns = columns
    return {
      loadData: parameter => {
        const arg = {}
        console.log('loadData request arg:', arg)
        return getBatteryInfo(this.deviceId, arg)
          .then(res => {
            return {
              pageSize: 1000,
              pageNo: 0,
              totalCount: 1,
              totalPage: 1,
              data: res.data
            }
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  created () {
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleClose: function handleCancel (e) {
      this.$emit('cancel', e)
    },
    getBatteryInfo (deviceId) {
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    }
  }
}
</script>

<style lang="less" scoped>
@import "~ant-design-vue/es/style/themes/default.less";

.header-info {
  position: relative;
  text-align: center;
  & > span {
    display: inline-block;
    margin-bottom: 4px;
    color: @text-color-secondary;
    font-size: @font-size-base;
    line-height: 22px;
  }
  & > p {
    margin: 0;
    color: @heading-color;
    font-size: 24px;
    line-height: 32px;
  }
  & > em {
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 56px;
    background-color: @border-color-split;
  }
}
</style>
