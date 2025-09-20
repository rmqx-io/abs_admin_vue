<template>
  <a-card :bordered="false" :bodyStyle="{ padding: '16px 16px', height: '100%' }" :style="{ height: '100%' }">
    <div class="table-page-search-wrapper">
      <a-tabs v-model="activeTab" @change="onTabChange">
        <a-tab-pane key="states">
          <template #tab><a-icon type="database" /><span>设备状态</span></template>
        </a-tab-pane>
        <a-tab-pane key="properties">
          <template #tab><a-icon type="setting" /><span>设备属性</span></template>
        </a-tab-pane>
      </a-tabs>

      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="6" :sm="24">
            <a-form-item label="设备ID">
              <a-input
                v-model="queryParam.device_id"
                placeholder="请输入设备ID"
                @keyup.enter.native="refreshTable"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <a-form-item label="每页数量">
              <a-select v-model="queryParam.limit" style="width: 120px" @change="refreshTable">
                <a-select-option value="10">10</a-select-option>
                <a-select-option value="50">50</a-select-option>
                <a-select-option value="100">100</a-select-option>
                <a-select-option value="200">200</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="refreshTable">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator" style="margin-bottom: 16px;">
      <a-button type="primary" icon="reload" @click="refreshTable">刷新</a-button>
    </div>

    <s-table
      ref="table"
      size="default"
      :rowKey="(record) => record.device_id"
      :columns="columns"
      :data="loadData"
      :alert="true"
      showPagination="auto"
      :scroll="{ x: 1200 }"
    >
      <span slot="status" slot-scope="text">
        <a-badge :status="text === 'ON' ? 'success' : 'default'" :text="text" />
      </span>

      <span slot="channels" slot-scope="text">
        <div v-for="(channel, index) in text" :key="index" style="margin-bottom: 8px;">
          <div><strong>通道 {{ index + 1 }}:</strong></div>
          <div>状态: <a-badge :status="channel.status === 'ON' ? 'success' : 'default'" :text="channel.status" /></div>
          <div>电流: {{ channel.current }} A</div>
          <div>电压: {{ channel.voltage }} V</div>
          <div>功率: {{ channel.power }} W</div>
          <div>总电量: {{ channel.energy_total }} kWh</div>
        </div>
      </span>

      <span slot="wifi" slot-scope="text">
        <div>SSID: {{ text.ssid }}</div>
        <div>RSSI: {{ text.rssi }}</div>
        <div>IP: {{ text.ip }}</div>
        <div>网关: {{ text.gateway }}</div>
      </span>

      <span slot="action" slot-scope="text, record">
        <a @click="viewDetails(record)">查看详情</a>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getSmartLightStates, getSmartLightProperties } from '@/api/smartLight'

export default {
  name: 'SmartLightList',
  components: {
    STable,
    Ellipsis
  },
  data () {
    return {
      activeTab: 'states',
      queryParam: {
        device_id: '',
        limit: 50
      },
      columns: [],
      loadData: parameter => {
        console.log('loadData.parameter', parameter)
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        if (this.activeTab === 'states') {
          return getSmartLightStates(requestParameters)
            .then(res => {
              console.log('Smart light states response:', res)
              // API returns RespVO<PaginatedResponse> where data contains the paginated structure
              return res.data
            })
        } else {
          return getSmartLightProperties(requestParameters)
            .then(res => {
              console.log('Smart light properties response:', res)
              // API returns RespVO<PaginatedResponse> where data contains the paginated structure
              return res.data
            })
        }
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  created () {
    this.updateColumns()
  },
  watch: {
    activeTab () {
      this.updateColumns()
      this.refreshTable()
    }
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
    updateColumns () {
      if (this.activeTab === 'states') {
        this.columns = [
          {
            title: '设备ID',
            dataIndex: 'device_id',
            sorter: true
          },
          {
            title: '时间戳',
            dataIndex: 'timestamp',
            sorter: true,
            customRender: (text) => {
              return new Date(text * 1000).toLocaleString()
            }
          },
          {
            title: '运行时间',
            dataIndex: 'uptime',
            sorter: true
          },
          {
            title: '设备锁定',
            dataIndex: 'device_locked',
            sorter: true,
            customRender: (text) => {
              return text ? '是' : '否'
            }
          },
          {
            title: '通道信息',
            dataIndex: 'channels',
            scopedSlots: { customRender: 'channels' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: '150px',
            scopedSlots: { customRender: 'action' }
          }
        ]
      } else {
        this.columns = [
          {
            title: '设备ID',
            dataIndex: 'device_id',
            sorter: true
          },
          {
            title: '时间戳',
            dataIndex: 'timestamp',
            sorter: true,
            customRender: (text) => {
              return new Date(text * 1000).toLocaleString()
            }
          },
          {
            title: '设备类型',
            dataIndex: 'device_type'
          },
          {
            title: '固件版本',
            dataIndex: 'firmware'
          },
          {
            title: '硬件版本',
            dataIndex: 'hardware'
          },
          {
            title: '时区',
            dataIndex: 'timezone'
          },
          {
            title: '电价',
            dataIndex: 'electricity_price'
          },
          {
            title: '设备锁定',
            dataIndex: 'device_locked',
            customRender: (text) => {
              return text ? '是' : '否'
            }
          },
          {
            title: 'WiFi信息',
            dataIndex: 'wifi',
            scopedSlots: { customRender: 'wifi' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: '150px',
            scopedSlots: { customRender: 'action' }
          }
        ]
      }
    },

    onTabChange (key) {
      this.activeTab = key
    },

    refreshTable () {
      this.$refs.table.refresh(true)
    },

    resetSearch () {
      this.queryParam = {
        device_id: '',
        limit: 50
      }
      this.refreshTable()
    },

    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    viewDetails (record) {
      this.$message.info('查看详情功能待实现')
    }
  }
}
</script>

<style lang="less" scoped>
.table-operator {
  margin-bottom: 18px;
}
.table-operator .ant-btn {
  margin-right: 8px;
}
</style>
