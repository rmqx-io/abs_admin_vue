<template>
<!--  <page-header-wrapper>-->
    <a-card
      :bordered="false"

    >
      <div v-if="table_visible" class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="编号">
                <a-input v-model="queryData.device_id" placeholder=""/>
              </a-form-item>
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
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
<!--                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>-->
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div v-if="table_visible" class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">添加</a-button>
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        v-if="table_visible"
        ref="table"
        size="default"
        rowKey="(record) => record.data.id"
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
            <a v-if="is_sysadmin" @click="handleEdit(record)">修改</a>
            <a-divider v-if="is_sysadmin" type="vertical" />
<!--            <a @click="handleSub(record)">订阅报警</a>-->
            <a @click="handleBatteryInfo(record)">电池详情</a>
            <a-divider type="vertical" />
            <a @click="handleMap(record)">历史行程</a>
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
      <step-by-step-modal v-if="table_visible" ref="modal" @ok="handleCreateFormOk"/>

      <info
        v-if="battery_detail_visible"
        ref="batteryInfo"
        :device-id="device_id"
        @cancel="handleBatteryInfoCancel"
        @ok="handleBatteryInfoOk"
      />

      <div
        v-if="map_visible"
        style="width: 100%; height: 600px"
      >
        <div><a @click="handleMapClose()"><< 返回</a></div>
        <div><br /></div>
        <div>设备：{{ device_id }}</div>
        <div><br /></div>
        <a-spin :spinning="map_loading">
          <a-form layout="inline">
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
        <el-amap
          vid="'amapDemo'"
          :map-style="'fresh'"
          size="mini"
          :zoom="zoom"
          :center="center"
          v-if="refresh_map"
        >
          <el-amap-polyline
            :path="polyline.path"
            :line-join="'round'"
          ></el-amap-polyline>
          <el-amap-marker
            v-for="(marker,i) in polyline.markers"
            :position="marker"
            :key="i"
          >
          </el-amap-marker>
        </el-amap>
      </div>

    </a-card>
<!--  </page-header-wrapper>-->
</template>

<script>
import VueAMap from 'vue-amap'
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import {
  addDevice,
  getAdminOrgTree,
  getBatteryInfo,
  getDeviceList,
  getLocation,
  getRoleList,
  updateDevice
} from '@/api/manage'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'
import Info from '@/views/list/components/Info'
import storage from 'store'
import { ACCESS_TOKEN, ROLE } from '@/store/mutation-types'

let amapManager = new VueAMap.AMapManager()

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
    width: '160px',
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
    STable,
    Ellipsis,
    CreateForm,
    StepByStepModal,
    Info
  },
  data() {
    this.columns = columns
    return {
      // create model
      is_sysadmin: false,
      device_create_form_visible: false,
      table_visible: true,
      battery_detail_visible: false,
      map_visible: false,
      confirmLoading: false,
      device_create_form_data: null,
      device_id: null,
      map_loading: false,
      refresh_map: true,
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
      amapManager,
      orgList: []
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
      this.$refs.table.refresh(true)
    }

    this.getAdminOrgList()
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleAdd() {
      console.log('handle add')
      this.device_create_form_data = null
      this.device_create_form_visible = true
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
              this.$refs.table.refresh()

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
              this.$refs.table.refresh()

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
    }
  }
}
</script>
