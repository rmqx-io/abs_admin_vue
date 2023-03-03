<template>
<!--  <page-header-wrapper>-->
  <a-card :bordered="false" :bodyStyle="{ padding: '16px 16px', height: '100%' }" :style="{ height: '100%' }">
    <div class="table-page-search-wrapper">
      <a-tabs
        v-model="activeTab"
        @change="onTabChange"
      >
        <a-tab-pane key="table">
          <template #tab>
            <a-icon type="table" />
            <span>表格</span>
          </template>
        </a-tab-pane>
        <a-tab-pane key="map">
          <template #tab>
            <a-icon type="environment" />
            <span>地图</span>
          </template>
        </a-tab-pane>
        <a-tab-pane key="alarm">
          <template #tab>
            <a-icon type="warning" />
            <span>告警</span>
          </template>
        </a-tab-pane>
      </a-tabs>

      <a-form>
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item :label="$t('device.status')">
              <a-radio-group v-model="deviceStatus" @change="onDeviceStatusChange">
                <a-radio-button value="total">{{ $t('device.total') }} ({{ this.statusCount.total}})</a-radio-button>
                <a-radio-button value="online">{{ $t('device.online') }} ({{ this.statusCount.online}})</a-radio-button>
                <a-radio-button value="offline">{{ $t('device.offline') }} ({{ this.statusCount.offline}})</a-radio-button>
                <a-radio-button value="standby">{{ $t('device.standby' )}} ({{ this.statusCount.standby }})</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-form-item label="编号">
              <a-input v-model="queryData.device_id" placeholder=""/>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-form-item label="运营单位">
              <a-tree-select
                show-search
                tree-default-expand-all
                :filterTreeNode="filterTreeNode"
                :treeData="orgList"
                v-model="queryData.organization_id"
              ></a-tree-select>
            </a-form-item>
          </a-col>
<!--            <a-col :md="8" :sm="24">-->
<!--              <a-form-item label="使用状态">-->
<!--                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">-->
<!--                  <a-select-option value="0">全部</a-select-option>-->
<!--                  <a-select-option value="1">关闭</a-select-option>-->
<!--                  <a-select-option value="2">运行中</a-select-option>-->
<!--                </a-select>-->
<!--              </a-form-item>-->
<!--            </a-col>-->
<!--            <template v-if="advanced">-->
<!--              <a-col :md="8" :sm="24">-->
<!--                <a-form-item label="调用次数">-->
<!--                  <a-input-number v-model="queryParam.callNo" style="width: 100%"/>-->
<!--                </a-form-item>-->
<!--              </a-col>-->
<!--              <a-col :md="8" :sm="24">-->
<!--                <a-form-item label="更新日期">-->
<!--                  <a-date-picker v-model="queryParam.date" style="width: 100%" placeholder="请输入更新日期"/>-->
<!--                </a-form-item>-->
<!--              </a-col>-->
<!--              <a-col :md="8" :sm="24">-->
<!--                <a-form-item label="使用状态">-->
<!--                  <a-select v-model="queryParam.useStatus" placeholder="请选择" default-value="0">-->
<!--                    <a-select-option value="0">全部</a-select-option>-->
<!--                    <a-select-option value="1">关闭</a-select-option>-->
<!--                    <a-select-option value="2">运行中</a-select-option>-->
<!--                  </a-select>-->
<!--                </a-form-item>-->
<!--              </a-col>-->
<!--              <a-col :md="8" :sm="24">-->
<!--                <a-form-item label="使用状态">-->
<!--                  <a-select placeholder="请选择" default-value="0">-->
<!--                    <a-select-option value="0">全部</a-select-option>-->
<!--                    <a-select-option value="1">关闭</a-select-option>-->
<!--                    <a-select-option value="2">运行中</a-select-option>-->
<!--                  </a-select>-->
<!--                </a-form-item>-->
<!--              </a-col>-->
<!--            </template>-->
        </a-row>
        <a-row>
          <a-col v-if="!showAlarm" :md="!advanced && 8 || 12" :sm="12">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="refreshTable(true)">查询</a-button>
<!--                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>-->
<!--              <a @click="toggleAdvanced" style="margin-left: 8px">-->
<!--                {{ advanced ? '收起' : '展开' }}-->
<!--                <a-icon :type="advanced ? 'up' : 'down'"/>-->
<!--              </a>-->
            </span>
          </a-col>
<!--          <a-col :md="8" :sm="24">-->
<!--            <a-checkbox v-model="showMap" @change="onMapChange">显示地图</a-checkbox>-->
<!--            <a-checkbox v-model="showAlarm" @change="onAlarmChange">显示告警</a-checkbox>-->
<!--          </a-col>-->
        </a-row>
      </a-form>
    </div>


    <div v-if='showTableTab'>
      <div v-if="table_visible" class="table-operator">
                                                        <a-button type="primary" icon="plus" @click="handleAdd">添加</a-button>
                                                        <a-button type="primary" @click='handleBatchCommandManager'>下发指令管理</a-button>
                                                        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
                                                        <a-menu slot="overlay">
                                                        <a-menu-item key='send-command' @click='handleSendCommandBatch'>
                                                        <a-icon type='batch' />下发指令
                                                        </a-menu-item>
                                                        </a-menu>
                                                        <a-button style="margin-left: 8px">批量操作<a-icon type="down" /></a-button>
                                                        </a-dropdown>
                                                        </div>

      <s-table
        v-if="table_visible"
        ref="table"
        size="default"
        :rowKey="(record) => record.id"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto"
        :scroll="{ x: 1300 }"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="device_info" slot-scope="text, record">
          <template>
            编号: <span>{{ record.code }}</span>
            <br />
            别名: <span>{{ record.alias }}</span>
            <br />
            ICCID: <span>{{ record.iccid }}</span>
          </template>
        </span>

        <span slot="organization_info" slot-scope="text, record">
          <template>
            组织: <span>{{ record.organization_name }}</span>
            <br />
            仓库: <span>{{ record.storehouse_name }}</span>
          </template>
        </span>

        <span slot="model_info" slot-scope="text, record">
          <template>
            电池型号: <span>{{ record.battery_name }}</span>
            <br />
            设备型号: <span>{{ record.model_name }}</span>
            <br />
            BT码: <span>{{ record.bms_bt }}</span>
          </template>
        </span>

        <span slot="version_info" slot-scope="text, record">
          <template>
            软件: <span>{{ record.s_ver }}</span>
            <br />
            硬件: <span>{{ record.h_ver }}</span>
          </template>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleBatteryInfo(record)">电池详情</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">更多<a-icon type="down"/>
              </a>
              <a-menu slot="overlay">
                <a-menu-item v-if='is_sysadmin'>
                  <a v-if="is_sysadmin" @click="handleEdit(record)">修改</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleMap(record)">历史行程</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleSendCommand(record)">下发指令</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </span>
      </s-table>

      <create-form
        v-if="table_visible"
        ref="createModal"
        :visible="device_create_form_visible"
        :loading="confirmLoading"
        :model="device_create_form_data"
        @cancel="handleCreateFormCancel"
        @ok="handleCreateFormOk"
      />

      <send-command-form
        ref="sendCommandModal"
        :visible="send_command_form_visible"
        :loading="confirmLoading"
        :model="send_command_form_data"
        :device-ids="device_ids"
        @cancel="handleSendCommandFormCancel"
        @ok="handleSendCommandFormOk"
      />

      <send-command-manager
        ref='sendCommandManager'
        :visible="showBatchCommandManager"
        :loading="false"
        @cancel="handleSendCommandManagerCancel"
        @ok="handleSendCommandManagerOk"
      />
      <step-by-step-modal v-if="table_visible" ref="modal" @ok="handleCreateFormOk"/>

      <battery-info
        v-if="battery_detail_visible"
        ref="batteryInfo"
        :device-id="device_id"
        :bms-bt="bms_bt"
        @cancel="handleBatteryInfoCancel"
        @ok="handleBatteryInfoOk"
      />

      <div
        v-if="map_visible"
        style="width: 100%; height: 70vh"
      >
        <div><a @click="handleMapClose()"><< 返回</a></div>
        <div><br /></div>
        <div>设备：{{ device_id }}</div>
        <div><br /></div>
        <a-spin :spinning="map_loading">
          <a-form>
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item aria-label="起始日期">
                  <a-date-picker v-model="queryData.start_date" style="width: 100%" placeholder="起始日期"/>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item aria-label="起始时间">
                  <a-time-picker v-model="queryData.start_time" style="width: 100%" placeholder="起始时间"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item aria-label="结束日期">
                  <a-date-picker
                    v-model="queryData.end_date"
                    style="width: 100%"
                    placeholder="结束日期"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item aria-label="结束时间">
                  <a-time-picker
                    v-model="queryData.end_time"
                    style="width: 100%"
                    placeholder="结束时间"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-button type="primary" @click="refreshMap(device_id)">查询</a-button>
              </a-col>
            </a-row>
          </a-form>
        </a-spin>
        <amap
          :zoom="zoom"
          :center="center"
        >
          <amap-polyline
            :path="polyline.path"
            :line-join="'round'"
          >
          </amap-polyline>
          <amap-marker
            v-for="(marker,i) in polyline.markers"
            :position="marker"
            :key="i"
          >
          </amap-marker>
        </amap>
      </div>
    </div>

    <div
      v-if="showMap"
      style="width: 100%; height: 70vh"
      class="map-container"
    >
      <div
        v-if="isGettingDeviceLocation"
      >
        <a-progress
          :percent="getDevicesLocationPageNo/ getDevicesLocationPages * 100"
          :status="getDevicesLocationPageNo === getDevicesLocationPages ? 'success' : 'active'"
          :stroke-width="10"
          :format="percent => `${percent.toFixed(0)}%`"
        />
        <span>{{ getDevicesLocationPageNo }}</span> / <span>{{ getDevicesLocationPages }}</span>, <span>{{ markersFound }}</span>
      </div>
      <amap
        :center="center2"
        :zoom="4"
        cache-key="marker-cluster-map"
        async
      >
        <!--        <template>-->
        <!--          <amap-marker-->
        <!--            :position.sync="center2"-->
        <!--          />-->
        <!--        </template>-->
        <!-- 点聚合 -->
        <amap-marker-cluster
          v-if="showMarkers"
          :data="deviceMarkers"
          key="custom-cluster"
          :grid-size="options.gridSize"
          :average-center="options.averageCenter"
        >
        </amap-marker-cluster>
      </amap>
    </div>
    <div v-if="showAlarm" class="alarm-container">
      <device-alarm
        ref='alarm'
        :device-id="queryData.device_id"
        :device-status="deviceStatus"
        :organization-id="queryData.organization_id"
      >
      </device-alarm>
    </div>
    </a-card>
<!--  </page-header-wrapper>-->
</template>

<script>
// import VueAMap from 'vue-amap'
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import {
  addDevice,
  getAdminOrgTree,
  getDeviceList,
  getLocation,
  getStatusCount,
  updateDevice
} from '@/api/manage'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'
import SendCommandForm from '@/views/list/modules/SendCommandForm'
import SendCommandManager from '@/views/list/modules/SendCommandManager'
import BatteryInfo from '@/views/list/components/BatteryInfo'
import storage from 'store'
import { ACCESS_TOKEN, ROLE } from '@/store/mutation-types'
import DeviceAlarm from '@/views/list/components/DeviceAlarm'

function interpolate(u, begin, end) {
  if (u < 0) u = 0;
  if (u > 1) u = 1;
  u = Math.pow(u, 1 / 10);
  return u * (end - begin) + begin;
}
// let amapManager = new VueAMap.AMapManager()

const columns = [
  // {
  //   title: '#',
  //   scopedSlots: { customRender: 'serial' }
  // },
  {
    title: '编号',
    dataIndex: 'code',
    scopedSlots: { customRender: 'device_info' }
  },
  {
    title: '组织信息',
    dataIndex: 'organization_name',
    scopedSlots: { customRender: 'organization_info' }
  },
  {
    title: '设备型号',
    dataIndex: 'model_name',
    scopedSlots: { customRender: 'model_info' }
  },
  {
    title: '版本信息',
    dataIndex: 'version',
    scopedSlots: { customRender: 'version_info' }
  },
  {
    title: '上线时间',
    dataIndex: 'register_time',
    width: '136px'
  },
  {
    title: '创建时间',
    dataIndex: 'create_date',
    width: '136px'
  },
  {
    title: '第一次 GPS 定位时间',
    dataIndex: 'first_gps_location_time',
    width: '136px'
  },
  {
    title: '第一次基站定位时间',
    dataIndex: 'first_cell_location_time',
    width: '136px'
  }
  // ,
  // {
  //   title: '描述',
  //   dataIndex: 'description',
  //   scopedSlots: { customRender: 'description' }
  // },
  // {
  //   title: '服务调用次数',
  //   dataIndex: 'callNo',
  //   sorter: true,
  //   needTotal: true,
  //   customRender: (text) => text + ' 次'
  // },
  // {
  //   title: '状态',
  //   dataIndex: 'status',
  //   scopedSlots: { customRender: 'status' }
  // },
  // {
  //   title: '更新时间',
  //   dataIndex: 'updatedAt',
  //   sorter: true
  // },
  ,
  {
    title: '操作',
    dataIndex: 'action23',
    scopedSlots: { customRender: 'action' },
    fixed: 'right'
  }
]

const statusMap = {
  0: {
    status: 'default',
    text: '关闭'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'success',
    text: '已上线'
  },
  3: {
    status: 'error',
    text: '异常'
  }
}

export default {
  name: 'TableList',
  components: {
    SendCommandManager,
    DeviceAlarm,
    STable,
    Ellipsis,
    CreateForm,
    SendCommandForm,
    StepByStepModal,
    BatteryInfo
  },
  data() {
    this.columns = columns
    return {
      activeTab: 'table',
      styles: {
        fill: '#FFFF00',
        stroke: '#FFFF00'
      },
      data: [
        { lnglat: [113.92, 22.55], weight: 40 },
        { lnglat: [113.93, 22.54], weight: 40 },
        { lnglat: [113.92, 22.53], weight: 40 },
        { lnglat: [113.91, 22.54], weight: 40 },
        { lnglat: [113.929379, 22.532922], weight: 40 },
        { lnglat: [113.928178, 22.531258], weight: 40 }
      ],
      options: {
        gridSize: 100,
        averageCenter: true,
        zoomOnClick: true
      },
      dataList: [
        {
          lnglat: [113.951955, 22.530825],
          lng: 113.951955,
          lat: 22.530825,
          id: 1,
          content: 'aaa'
        }
      ],
      center2: [113.94, 22.52],
      zoom2: 13,
      markers2: [
        { lnglat: [116.397428, 39.90923], label: 'Marker 1' },
        { lnglat: [116.397888, 39.900168], label: 'Marker 2' },
        { lnglat: [116.410332, 39.89734], label: 'Marker 3' }
      ],
      position1: [116.473571, 39.993083],
      points: [
        { lnglat: [116.939621, 39.343147] }
      ],
      markers: [
        { position: [116.402144, 39.910012], title: "Marker 1" },
        { position: [116.391095, 39.904684], title: "Marker 2" },
        { position: [116.418044, 39.957106], title: "Marker 3" },
        { position: [116.373688, 39.931149], title: "Marker 4" }
      ],
      deviceMarkers: [],
      // create model
      is_sysadmin: false,
      device_create_form_visible: false,
      table_visible: true,
      showMap: false,
      isGettingDeviceLocation: false,
      getDevicesLocationPages: 0,
      getDevicesLocationPageNo: 0,
      markersFound: 0,
      showMarkers: false,
      showTableTab: true,
      showAlarm: false,
      send_command_form_visible: false,
      battery_detail_visible: false,
      map_visible: false,
      confirmLoading: false,
      device_create_form_data: null,
      send_command_form_data: null,
      device_id: null,
      bms_bt: null,
      device_ids: [],
      map_loading: false,
      refresh_map: true,
      refresh_device_map: true,
      polyline: {
        path: [],
        markers: []
      },
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      queryData: {
        device_id: null,
        account: null,
        name: null,
        page_no: 1,
        page_size: 5,
        start_date: moment(new Date() - 2 * 60 * 60 * 1000),
        start_time: moment(new Date() - 2 * 60 * 60 * 1000),
        organization_id: null
      },
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        let arg = Object.assign(parameter, this.queryData)
        arg.page_no = arg.pageNo
        arg.page_size = arg.pageSize
        delete arg.pageNo
        delete arg.pageSize
        if (this.deviceStatus) {
          arg.device_status = this.deviceStatus
        }
        console.log('loadData request arg:', arg)
        return getDeviceList(arg)
          .then(res => {
            console.log('device list', res)
            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              totalPage: res.data.pages,
              data: res.data.records
            }
          })
      },
      selectedRowKeys: [],
      selectedRows: [],
      // 地图
      zoom: 14,
      center: [113.94, 22.52],
      // amapManager,
      orgList: [],
      statusCount: {},
      deviceStatus: 'online',
      showBatchCommandManager: false
    }
  },
  filters: {
    statusFilter(type) {
      return statusMap[type].text
    },
    statusTypeFilter(type) {
      return statusMap[type].status
    }
  },
  created () {
    // getRoleList({ t: new Date() })
    const role = storage.get(ROLE)
    console.log('role', role)
    if (role === 'sysadmin') {
      this.is_sysadmin = true
    }
  },
  mounted () {
    // console.log('mounted', this.$route)
    if (this.$route.query.device_id) {
      this.queryData.device_id = this.$route.query.device_id
      // this.$refs.table.refresh(true)
      this.refreshTable(true)
    }

    this.getStatusCount()
    this.getAdminOrgList()
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
    // queryData () {
    //   return {
    //     device_id: this.$route.query.device_id,
    //     account: this.$route.query.account,
    //     name: this.$route.query.name,
    //     page_no: this.$route.query.page_no,
    //     page_size: this.$route.query.page_size,
    //     start_date: this.$route.query.start_date,
    //     start_time: this.$route.query.start_time,
    //     organization_id: this.$route.query.organization_id
    //   }
    // }
  },
  methods: {
    handleAdd() {
      console.log('handle add')
      this.device_create_form_data = null
      this.device_create_form_visible = true
    },
    handleBatchCommandManager () {
      this.showBatchCommandManager = true
      // after 1s refresh
      setTimeout(() => {
        this.$refs.sendCommandManager.refresh()
      }, 100)
    },
    handleEdit(record) {
      console.log('handleEdit', record)
      this.device_create_form_visible = true
      this.device_create_form_data = { ...record }
    },
    handleCreateFormOk() {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('update device', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              updateDevice(values)
                .then(res => {
                  console.log(res)
                  resolve()
                }).catch(err => {
                console.log('update device', err)
                this.confirmLoading = false
                this.$message.error(err.data.message)
                reject(err)
              })
            }).then(res => {
              this.device_create_form_visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              // this.$refs.table.refresh()
              this.refreshTable(null)

              this.$message.info('修改成功')
            })
          } else {
            delete values.id
            // 新增
            new Promise((resolve, reject) => {
              console.log('add device', values)
              addDevice(values)
                .then(res => {
                  console.log(res)
                  resolve()
                }).catch(err => {
                console.log('add device', err)
                this.confirmLoading = false
                this.$message.error(err.data.message)
                reject(err)
              })
            }).then(res => {
              this.device_create_form_visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              // this.$refs.table.refresh()
              this.refreshTable(null)

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCreateFormCancel() {
      console.log('handle cancel')
      this.device_create_form_visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleBatteryInfoCancel() {
      this.battery_detail_visible = false
      this.table_visible = true
    },
    handleSendCommandFormCancel () {
      this.send_command_form_visible = false
    },
    handleSendCommandFormOk () {

    },
    handleSendCommandManagerCancel () {
      this.showBatchCommandManager = false
    },
    handleSendCommandManagerOk () {
      this.showBatchCommandManager = false
    },
    handleBatteryInfoOk() {
      this.battery_detail_visible = false
      this.table_visible = true
    },
    handleSub(record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    handleBatteryInfo(record) {
      // this.$router.push({ path: '/list/table-list/info/1' })
      this.device_id = record.code
      this.bms_bt = record.bms_bt
      this.battery_detail_visible = true
      this.table_visible = false
      console.log(this.$refs)
      // batteryInfo 因为不可见，在这个循环里面，还没有被创建，所以 refs 里面没有
      // 需要在下一个循环里面执行 batteryInfo 的代码
      this.$nextTick(() => {
        console.log(this.$refs)
        this.$refs.batteryInfo.getBatteryInfo(record.code)
      })
      // this.$refs.batteryInfo.getBatteryInfo(record.code)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    resetSearchForm() {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    handleMapClose() {
      this.map_visible = false
      this.table_visible = true
    },
    handleMap(record) {
      this.device_id = record.code
      this.map_visible = true
      this.table_visible = false
      this.refreshMap(record.code)
    },
    handleSendCommand (record) {
      this.device_id = record.code
      this.device_ids = [{ 'deviceId': record.code }]
      console.log('send command')
      this.send_command_form_visible = true
    },
    handleSendCommandBatch () {
      this.device_ids = this.selectedRows.map(item => {
        return { 'deviceId': item.code }
      })
      console.log('send command batch')
      this.send_command_form_visible = true
    },
    refreshMap (deviceId) {
      this.map_loading = true
      let arg = this.queryData
      console.log('loadData request arg:', arg)
      return getLocation(deviceId, arg)
        .then(res => {
          this.map_loading = false
          if (res.data.length > 0) {
            this.polyline.path = []
            this.polyline.markers = []
            this.center = [res.data[0].mars_longitude, res.data[0].mars_latitude]
            res.data.forEach((item, index) => {
              // console.log('mars_lng', item.mars_longitude)
              // console.log('mars_lat', item.mars_latitude)
              // console.log('push', [item.mars_longitude, item.mars_latitude])
              this.polyline.path.push([item.mars_longitude, item.mars_latitude])
              this.polyline.markers.push([item.mars_longitude, item.mars_latitude])
            })
            console.log('path', this.polyline.path)
            this.refresh_map = false
            this.$nextTick(() => {
                this.refresh_map = true
              }
            )
          }
        }).catch(err => {
          console.log('get location data failed', err)
          this.map_loading = false
          this.refresh_map = false
          this.$nextTick(() => {
              this.refresh_map = true
            }
          )
        })
    },
    filterTreeNode (input, option) {
      return (
        option.data.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    getAdminOrgList () {
      return getAdminOrgTree(this.queryParam)
        .then(res => {
          console.log('org list', res)
          this.orgList = []
          this.orgList.push(res.data)
        })
    },
    getDeviceLocation (arg, page_no) {
      // get all device location
      console.log('loadData request arg:', arg)
      arg.page_no = page_no
      this.getDevicesLocationPageNo = page_no
      console.log('getDeviceLocation', arg, 'page_no', page_no)
      getDeviceList(arg)
        .then(res => {
          console.log('device list', res)

          this.getDevicesLocationPages = res.data.pages

          // append device to deviceMarkers
          res.data.records.forEach((item, index) => {
            if (item.last_location_lng !== null && item.last_location_lat !== null) {
              this.markersFound += 1
              this.deviceMarkers.push({
                lnglat: [item.last_location_lng, item.last_location_lat],
                title: item.code
              })
            }
          })
          if (page_no >= res.data.pages) {
            this.isGettingDeviceLocation = false
            console.log('markersFound', this.markersFound)
          } else {
            this.getDeviceLocation(arg, page_no + 1)
          }
        })
    },
    refreshTable (param) {
      if (this.$refs.table) {
        this.$refs.table.refresh(param)
      }
      // refresh status count
      this.getStatusCount()
      if (this.showMap) {
        if (this.isGettingDeviceLocation) {
          return
        }
        this.deviceMarkers = []
        this.markersFound = 0
        let arg = Object.assign({}, this.queryData)
        arg.page_no = arg.pageNo
        arg.page_size = 2000
        delete arg.pageNo
        delete arg.pageSize
        if (this.deviceStatus) {
          arg.device_status = this.deviceStatus
        }

        this.isGettingDeviceLocation = true
        this.getDeviceLocation(arg, 1)
      }
      if (this.$refs.alarm) {
        this.$refs.alarm.query()
      }
    },
    getStatusCount () {
      console.log('query data', this.queryData)
      if (this.queryData.device_id === '') {
        this.queryData.device_id = null
      }
      // if (this.queryData.organization_id === undefined || this.queryData.organization_id === 0) {
      //   this.queryData.organization_id = 0
      // }
      return getStatusCount({
        'device_id': this.queryData.device_id,
        'organization_id': this.queryData.organization_id
      })
        .then(res => {
          console.log('status count', res)
          this.statusCount = res.data
        })
    },
    onMapChange () {
      console.log('map change', this.showMap)
      this.table_visible = !this.showMap
      if (this.showMap) {
        this.showMarkers = true
        if (this.deviceMarkers.length === 0) {
          this.refreshTable(true)
        }
      }
    },
    onAlarmChange () {
      console.log('alarm change', this.showAlarm)
    },
    onDeviceStatusChange () {
      console.log('device status change', this.deviceStatus)
      this.refreshTable(true)
    },
    onTabChange (tab) {
      console.log('tab change', tab)
      if (tab === 'map') {
        console.log('show map')
        this.showTableTab = false
        this.table_visible = false
        this.showAlarm = false
        this.showMap = true
        this.showMarkers = true
        if (this.deviceMarkers.length === 0) {
          this.refreshTable(true)
        }
      } else if (tab === 'alarm') {
        console.log('show alarm')
        this.showTableTab = false
        this.showMap = false
        this.showMarkers = false
        this.table_visible = false
        this.showAlarm = true
      } else {
        console.log('show table')
        this.showTableTab = true
        this.showMap = false
        this.showMarkers = false
        this.showAlarm = false
        this.table_visible = true
      }
    },
    getClusterStyle(context) {
      const u = context.count / this.data.length;
      const hue = ~~interpolate(u, 90, 0);
      const size = ~~interpolate(u, 30, 50);
      return {
        backgroundColor: `hsla(${hue}, 100%, 50%, 0.7)`,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
        borderRadius: `${size / 2}px`,
        border: `1px solid hsla(${hue}, 100%, 40%, 1)`,
        boxShadow: `0 0 1px hsla(${hue}, 100%, 50%, 1)`,
        color: `hsla(${hue}, 100%, 20%, 1)`,
        fontSize: "14px",
        textAlign: "center",
      }
    },
    getMarkerOptions (point) {
      return {
        offset: [-16, -37],
        url: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
      }
      // return {
      //   position: point.lnglat,
      //   offset: [-15, -15],
      //   content: 'abc'
      // }
    },
    getClusterOptions (context) {
      return {
        gridSize: 80,
        minClusterSize: 2
      }
      // const size = Math.round(
      //   30 + Math.pow(context.count / this.data.length, 1 / 5) * 20
      // )
      // return {
      //   offset: [-size / 2, -size / 2]
      // }
    }
  }
}
</script>
