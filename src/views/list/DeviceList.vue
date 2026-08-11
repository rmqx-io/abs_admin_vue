<template>
  <!--  <page-header-wrapper>-->
  <a-card :bordered="false" :bodyStyle="{ padding: '16px 16px', height: '100%' }" :style="{ height: '100%' }">
    <div v-if='showExporting'>
      <a-alert
        :message="exportError ? $t('list.device.export.failed') : $t('list.device.export.title')"
        :description="exportError ? $t('list.device.export.error', { error: exportError }) : $t('list.device.export.description')"
        :type="exportError ? 'error' : 'info'"
        show-icon
      >
      </a-alert>

      <!-- Independent error prompt and resume button -->
      <div v-if="exportError" class="export-error-actions">
        <a-button type="primary" @click="resumeExporting">
          {{ $t('list.device.export.resume') }}
        </a-button>
      </div>

      <div v-if="lastExportedDeviceId" class="export-status">
        <span>{{ $t('list.device.export.lastId', { id: lastExportedDeviceId }) }}</span>
        <span v-if="exportedCount && totalExportCount">
          {{ $t('list.device.export.progress', { current: exportedCount, total: totalExportCount }) }}
        </span>
      </div>

      <a-progress
        v-if="showExporting"
        :style="{ width: '98%' }"
        :percent="exportProgress"
        status="active"
        :show-info="true"
        :format="percent => `${percent.toFixed(2)}%`"
      />
    </div>
    <div class="table-page-search-wrapper">
      <a-tabs
        v-model="activeTab"
        @change="onTabChange"
        class="device-list-tabs"
      >
        <a-tab-pane key="table">
          <template #tab><a-icon type="table" /><span>{{ $t('list.device.tabs.table') }}</span></template>
        </a-tab-pane>
        <a-tab-pane key="alarm">
          <template #tab><a-icon type="warning" /><span>{{ $t('list.device.tabs.alarm') }}</span></template>
        </a-tab-pane>
        <a-tab-pane key="location-history">
          <template #tab><a-icon type="history" /><span>{{ $t('list.device.tabs.locationHistory') }}</span></template>
        </a-tab-pane>
      </a-tabs>

      <a-form>
        <a-row :gutter="48">
          <a-col :md="10" :sm="24">
            <a-form-item :label="$t('Status')">
              <a-radio-group v-model="deviceStatus" @change="onDeviceStatusChange">
                <a-radio-button class="status-btn-total" value="total" data-testid="device-status-total">
                  <span class="status-dot total"></span>
                  <span class="status-label">{{ $t('Total') }}</span>
                  <span class="status-count-badge total">{{ statusCount.total }}</span>
                </a-radio-button>
                <a-radio-button class="status-btn-online" value="online">
                  <span class="status-dot online"></span>
                  <span class="status-label">{{ $t('Online') }}</span>
                  <span class="status-count-badge online">{{ statusCount.online }}</span>
                </a-radio-button>
                <a-radio-button class="status-btn-offline" value="offline">
                  <span class="status-dot offline"></span>
                  <span class="status-label">{{ $t('Offline') }}</span>
                  <span class="status-count-badge offline">{{ statusCount.offline }}</span>
                </a-radio-button>
                <a-radio-button class="status-btn-standby" value="standby">
                  <span class="status-dot standby"></span>
                  <span class="status-label">{{ $t('Standby') }}</span>
                  <span class="status-count-badge standby">{{ statusCount.standby }}</span>
                </a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="12">
            <a-form-item :label="$t('No')">
              <a-input
                data-testid="device-search-input"
                v-model="queryData.device_id"
                placeholder=""
                @keyup.enter.native="refreshTable(true)"
              />
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="12">
            <a-form-item :label="$t('Organization')">
              <org-select
                v-model="queryData.organization_id"
                :org-list="orgList"
                :placeholder="$t('list.device.filters.orgPlaceholder')"
              />
              <div class="recent-org-shortcuts" v-if="recentOrgs && recentOrgs.length > 0">
                <span v-for="org in recentOrgs" :key="org.id" class="recent-org-tag" @click="queryData.organization_id = org.id">
                  {{ org.name }}
                </span>
              </div>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <div class="more-params-wrapper">
              <div v-if="!showMoreParam">
                <a class="ant-dropdown-link" @click="showMoreParam = true">{{ $t('list.device.filters.moreParams') }}<a-icon type="down"/></a>
              </div>
              <div v-if="showMoreParam">
                <a
                  class="ant-dropdown-link"
                  @click="() => { showMoreParam = false; queryData.bt_code = ''; queryData.iccid = ''; queryData.soh = ''; queryData.soc = ''; queryData.alarm = '' }"
                >{{ $t('list.device.filters.collapseParams') }}<a-icon type="up"/></a>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <template v-if="showMoreParam">
            <a-col :md="6" :sm="12"><a-form-item :label="$t('BT Code')"><a-input v-model="queryData.bt_code" placeholder=""/></a-form-item></a-col>
            <a-col :md="6" :sm="12"><a-form-item :label="$t('ICCID')"><a-input v-model="queryData.iccid" placeholder=""/></a-form-item></a-col>
            <a-col :md="6" :sm="12"><a-form-item :label="$t('SOH')"><a-input v-model="queryData.soh" placeholder=""/></a-form-item></a-col>
            <a-col :md="6" :sm="12"><a-form-item :label="$t('SOC')"><a-input v-model="queryData.soc" placeholder=""/></a-form-item></a-col>
          </template>
        </a-row>
        <a-row :gutter="48">
          <a-col v-if="!showAlarm" :md="3" :sm="12">
            <a-form-item>
              <a-button data-testid="device-search-button" type="primary" style="width: 100%" @click="refreshTable(true)">
                <a-icon type="search" />{{ $t('common.search') }}
              </a-button>
            </a-form-item>
          </a-col>
          <!-- checkbox for contains_search -->
          <a-col :md="4" :sm="12">
            <a-form-item>
              <a-checkbox v-model="queryData.contains_search">{{ $t('list.device.filters.fuzzySearch') }}</a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div v-if='showTableTab'>
      <div v-if="table_visible" class="table-operator">
        <a-button type='primary' icon='plus' @click='handleAdd'>{{ $t('list.device.actions.addEdit') }}</a-button>
        <a-button type='primary' @click='handleBatchCommandManager'>{{ $t('list.device.actions.commandManager') }}</a-button>
        <a-button type='primary' @click='handleSelectParams'>{{ $t('list.device.actions.productionTest') }}</a-button>
        <a-button type='primary' data-testid='device-export-button' @click='handleExport'>{{ $t('list.device.actions.export') }}</a-button>
        <a-button type='primary' @click='handleImport'>{{ $t('list.device.actions.import') }}</a-button>
        <a-button type='primary' @click='handleSendBtCode'>{{ $t('list.device.actions.sendBtCode') }}</a-button>
        <a-button type='primary' @click='handleRefreshOnlineStatusPage'>{{ $t('list.device.actions.refreshOnlineStatus') }}</a-button>
        <a-dropdown v-action:edit v-if='selectedRowKeys.length > 0'>
          <a-menu slot='overlay'>
            <a-menu-item key='send-command' @click='handleSendCommandBatch'>
              <a-icon type='batch' />
              {{ $t('list.device.actions.batchCommand') }}
            </a-menu-item>
          </a-menu>
          <a-button style='margin-left: 8px'>{{ $t('common.batchActions') }}
            <a-icon type='down' />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        v-if="table_visible"
        ref="table"
        size="default"
        :rowKey="(record) => record.id || record.code || Math.random().toString()"
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
          <a-badge :status="statusMap[text].status" :text="statusMap[text].text" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="online" slot-scope="text, record">
          <a-badge :status="record.online ? 'processing' : 'default'" :text="record.online ? '在线' : '离线'" />
        </span>
        <span slot="device_info" slot-scope="text, record">
          <template>
            {{ $t('list.device.info.code') }}: <span>{{ record.code }}</span>
            <br />
            {{ $t('list.device.info.alias') }}: <span>{{ record.alias }}</span>
            <br />
            ICCID: <span>{{ record.iccid }}</span>
          </template>
        </span>

        <span slot="organization_info" slot-scope="text, record">
          <template>
            {{ $t('list.device.info.organization') }}: <span>{{ displayOrganizationName(record) }}</span>
            <br />
            {{ $t('list.device.info.storehouse') }}: <span>{{ record.storehouse_name && record.storehouse_name !== 'NULL' ? record.storehouse_name : '' }}</span>
          </template>
        </span>

        <span slot="bms_info" slot-scope="text, record">
          <template>
            <!-- SOC: <span>{{ record.bms_type === 227 ? record.bms_soc : record.bms_soc / 50 }}</span> -->
             SOC: <span>{{ record.bms_type === 236 ? record.bms_soc / 50 : record.bms_soc }}</span>
            <br />
            SOH: <span>{{ record.bms_soh }}</span>
            <br />
            {{ $t('list.device.info.batteryCycle') }}: <span>{{ record.bms_battery_cycle }}</span>
            <br />
            {{ $t('list.device.info.softwareVersion') }}: <span>{{ record.bms_software_version }}</span>
            <br />
            {{ $t('list.device.info.hardwareVersion') }}: <span>{{ record.bms_hardware_version }}</span>
          </template>
        </span>

        <span slot="model_info" slot-scope="text, record">
          <template>
            {{ $t('list.device.info.batteryModel') }}: <span>{{ record.bms_product_no }}</span>
            <br />
            {{ $t('list.device.info.deviceModel') }}: <span>{{ record.model_name }}</span>
            <br />
            {{ $t('list.device.info.btCode') }}: <span>{{ record.bms_bt }}</span>
          </template>
        </span>

        <span slot="version_info" slot-scope="text, record">
          <template>
            {{ $t('list.device.info.hardwareShort') }}: <span>{{ record.s_ver }}</span>
            <br />
            {{ $t('list.device.info.softwareShort') }}: <span>{{ record.h_ver }}</span>
          </template>
        </span>

        <span slot='location_time' slot-scope='text, record'>
          <template>
            {{ record.location_time ? formatTime(record.location_time) : '' }}
            <br />
            {{ $t('list.device.info.signalStrength') }}: <span>{{ record.signal }}</span>
            <br />
            {{ $t('list.device.info.satellites') }}: <span>{{ record.satellites }}</span>
          </template>
        </span>

        <span slot="other_time" slot-scope="text, record">
          <template>
            <!-- 上次基站定位: <span>{{ record.last_cell_location_time ? localTime(record.last_cell_location_time) : '' }}</span> -->
            <!-- <br /> -->
            {{ $t('list.device.info.lastCommunication') }}: <span>{{ record.last_communication_time ? localTime(record.last_communication_time) : '' }}</span>
            <!-- <br /> -->
            <!-- 第一次 GPS 定位: <span>{{ record.first_gps_location_time ? localTime(record.first_gps_location_time) : '' }}</span> -->
            <!-- <br /> -->
            <!-- 第一次基站定位: <span>{{ record.first_cell_location_time ? localTime(record.first_cell_location_time) : '' }}</span> -->
          </template>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleBatteryInfo(record)">{{ $t('list.device.menu.batteryDetails') }}</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">{{ $t('common.more') }}<a-icon type="down"/>
              </a>
              <a-menu slot="overlay">
                <a-menu-item v-if='is_sysadmin'>
                  <a v-if="is_sysadmin" data-testid="device-edit-button" @click="handleEdit(record)">{{ $t('common.edit') }}</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleMap(record)">{{ $t('list.device.menu.historyRoute') }}</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleLocationHistory(record)">{{ $t('list.device.menu.historyMileage') }}</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleSendCommand(record)">{{ $t('list.device.menu.sendCommand') }}</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleProtocolLog(record)">{{ $t('list.device.menu.protocolLog') }}</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click='handleRefreshOnlineStatus(record)'>{{ $t('list.device.menu.refreshStatus') }}</a>
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

      <send-bt-code
        ref='sendBtCode'
        :visible="send_bt_code_visible"
        :loading="false"
        @cancel="handleSendBtCodeCancel"
        @ok="handleSendBtCodeOk"
      />
      <SelectParams
        :visible="select_params"
        :loading="false"
        @cancel="handleSelectParamsCancel"
        @ok="handleSelectParamsOk"
      />

      <send-command-manager-devices
        ref="sendCommandManagerDevices"
        :visible="showBatchCommandManagerDevices"
        :currentBatchSendCommandId='currentBatchSendCommandId'
        @ok="() => { showBatchCommandManagerDevices = false }"
        @cancel="() => { showBatchCommandManagerDevices = false }"
      />

      <step-by-step-modal v-if="table_visible" ref="modal" @ok="handleCreateFormOk"/>

      <a-modal
        :visible="battery_detail_visible"
        width="90vw"
        centered
        :footer="null"
        :destroyOnClose="true"
        @cancel="handleBatteryInfoCancel"
      >
        <battery-info
          v-if="battery_detail_visible"
          ref="batteryInfo"
          :device-id="device_id"
          :bms-bt="bms_bt"
          @cancel="handleBatteryInfoCancel"
          @ok="handleBatteryInfoOk"
        />
      </a-modal>

      <a-modal
        :visible="map_visible"
        :footer="null"
        :closable="false"
        :keyboard="true"
        :maskClosable="false"
        width="100%"
        wrapClassName="full-screen-modal"
        :destroyOnClose="true"
        @cancel="handleMapClose"
      >
        <device-playback-panel
          v-if="map_visible"
          :device-id="device_id"
          @back="handleMapClose"
        />
      </a-modal>

    <div v-if='packet_log_visible'>
      <a-modal
        :title="$t('list.device.modal.protocolLog')"
        width='90vw'
        centered
        :visible="packet_log_visible"
        @cancel='packet_log_visible = false'
        @ok='packet_log_visible = false'
      >
        <packet-log
          ref='protocolLog'
          :visible="packet_log_visible"
          :device-id='device_id'
          @cancel='handlePacketLogCancel'
          @ok='handlePacketLogOk'
        />
      </a-modal>
    </div>
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

    <a-modal
      :title="$t('list.device.modal.historyMileage')"
      width="90%"
      :visible="locationHistoryVisible"
      @cancel="locationHistoryVisible = false"
      @ok="locationHistoryVisible = false"
    >
      <location-history
        v-if="locationHistoryVisible"
        :device-id="selectedDeviceId"
      />
    </a-modal>

    <location-history-table
      v-if="showLocationHistory"
      :device-status="deviceStatus"
      :query-params="queryData"
      @view-history="handleLocationHistory"
    />
  </a-card>
<!--  </page-header-wrapper-->
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis, OrgSelect } from '@/components'
import {
  addUpdateDeviceBatch,
  getAdminOrgTree,
  getDeviceList,
  getStatusCount, refreshOnlineStatus,
  updateDevice,
  refreshDevicePage,
  refreshDeviceOnlineStatusAll,
  api
} from '@/api/manage'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'
import SelectParams from './modules/SelectParams'
import SendCommandForm from '@/views/list/modules/SendCommandForm'
import SendCommandManager from '@/views/list/modules/SendCommandManager'
import SendBtCode from '@/views/list/modules/SendBtCode'
import SendCommandManagerDevices from './modules/SendCommandManagerDevices.vue'
import BatteryInfo from '@/views/list/components/BatteryInfo'
import storage from 'store'
import { ROLE, ACCESS_TOKEN } from '@/store/mutation-types'
import DeviceAlarm from '@/views/list/components/DeviceAlarm'
import PacketLog from '@/views/list/components/PacketLog'
import LocationHistory from '@/views/list/components/LocationHistory'
import LocationHistoryTable from './components/LocationHistoryTable'
import DevicePlaybackPanel from '@/views/list/components/DevicePlaybackPanel'

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || ''

export default {
  name: 'TableList',
  components: {
    SelectParams,
    SendCommandManager,
    SendBtCode,
    SendCommandManagerDevices,
    DeviceAlarm,
    STable,
    Ellipsis,
    CreateForm,
    OrgSelect,
    SendCommandForm,
    StepByStepModal,
    BatteryInfo,
    PacketLog,
    LocationHistory,
    LocationHistoryTable,
    DevicePlaybackPanel
  },
  data() {
    return {
      activeTab: 'table',
      // create model
      is_sysadmin: false,
      device_create_form_visible: false,
      table_visible: true,
      send_command_form_visible: false,
      select_params: false,
      send_bt_code_visible: false,
      packet_log_visible: false,
      battery_detail_visible: false,
      map_visible: false,
      confirmLoading: false,
      device_create_form_data: null,
      send_command_form_data: null,
      device_id: null,
      bms_bt: null,
      device_ids: [],
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
        organization_id: null,
        bt_code: null,
        iccid: null,
        soh: null,
        soc: null,
        alarm: null,
        contains_search: false
      },
      showMoreParam: false,
      showExporting: false,
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const arg = Object.assign(parameter, this.queryData)
        arg.page_no = arg.pageNo
        arg.page_size = arg.pageSize
        arg.location_only = false
        delete arg.pageNo
        delete arg.pageSize
        if (this.deviceStatus) {
          arg.device_status = this.deviceStatus
        }
        console.log('loadData request arg:', arg)
        return getDeviceList(arg)
          .then(res => {
            console.log('device list', res)
            if (!this.isAutoRefreshing) {
              this.setupAutoRefresh()
            }
            this.isAutoRefreshing = false
            const pages = Math.ceil(res.data.total / res.data.page_size)
            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              totalPage: pages,
              data: res.data.records
            }
          })
          .catch(err => {
            this.isAutoRefreshing = false
            throw err
          })
      },
      selectedRowKeys: [],
      selectedRows: [],
      orgList: [],
      recentOrgs: [],
      orgListLoading: false,
      statusCount: {},
      deviceStatus: 'online',
      showBatchCommandManager: false,
      showBatchCommandManagerDevices: false,
      currentBatchSendCommandId: 0,
      exportProgress: 0,
      locationHistoryVisible: false,
      selectedDeviceId: null,
      isSyncingFromRoute: false,
      lastExportedDeviceId: null,
      csvContent: null,
      exportError: null,
      exportedCount: null,
      totalExportCount: null,
      autoRefreshTimer: null,
      isAutoRefreshing: false,
      justMounted: false,
    }
  },

  created() {
    // getRoleList({ t: new Date() })
    const role = storage.get(ROLE)
    console.log('role', role)
    if (role === 'sysadmin' || role === 'org-manager') {
      this.is_sysadmin = true
    }
  },
  mounted() {
    this.recentOrgs = storage.get('recent_orgs') || []
    this.syncFormFromRouteQuery()
    this.getStatusCount()
    this.getAdminOrgList()
    this.justMounted = true
  },
  activated() {
    if (this.justMounted) {
      this.justMounted = false
    } else {
      this.getAdminOrgList()
    }
  },
  beforeDestroy() {
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer)
    }
  },
  computed: {
    showTableTab() {
      return this.activeTab === 'table'
    },
    showAlarm() {
      return this.activeTab === 'alarm'
    },
    showLocationHistory() {
      return this.activeTab === 'location-history'
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    },
    columns() {
      return [
        // {
        //   title: '#',
        //   scopedSlots: { customRender: 'serial' }
        // },
        {
          title: this.$t('list.device.columns.code'),
          dataIndex: 'code',
          scopedSlots: { customRender: 'device_info' }
        },
        {
          title: this.$t('list.table.columns.status'),
          dataIndex: 'online',
          scopedSlots: { customRender: 'online' },
          width: '100px'
        },
        {
          title: this.$t('list.device.columns.organizationInfo'),
          dataIndex: 'organization_name',
          scopedSlots: { customRender: 'organization_info' }
        },
        {
          title: 'BMS',
          dataIndex: 'bms',
          scopedSlots: { customRender: 'bms_info' }
        },
        {
          title: this.$t('list.device.columns.deviceModel'),
          dataIndex: 'model_name',
          scopedSlots: { customRender: 'model_info' }
        },
        {
          title: this.$t('list.device.columns.versionInfo'),
          dataIndex: 'version',
          scopedSlots: { customRender: 'version_info' }
        },
        {
          title: this.$t('list.device.columns.gpsLocationTime'),
          dataIndex: 'location_time',
          scopedSlots: { customRender: 'location_time' },
          width: '136px'
        },
        {
          title: this.$t('list.device.columns.registerTime'),
          dataIndex: 'register_time',
          scopedSlots: { customRender: 'register_time' },
          width: '136px'
        },
        {
          title: this.$t('list.device.columns.createTime'),
          dataIndex: 'create_date',
          scopedSlots: { customRender: 'create_date' },
          width: '136px'
        },
        {
          title: this.$t('list.device.columns.otherTime'),
          dataIndex: 'other_time',
          scopedSlots: { customRender: 'other_time' }
        },
        // {
        //   title: '第一次 GPS 定位时间',
        //   dataIndex: 'first_gps_location_time',
        //   width: '136px'
        // },
        // {
        //   title: '第一次基站定位时间',
        //   dataIndex: 'first_cell_location_time',
        //   width: '136px'
        // },
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

        {
          title: this.$t('list.device.columns.action'),
          dataIndex: 'action23',
          scopedSlots: { customRender: 'action' },
          fixed: 'right'
        }
      ]
    },
    statusMap() {
      return {
        0: {
          status: 'default',
          text: this.$t('list.device.status.closed')
        },
        1: {
          status: 'processing',
          text: this.$t('list.device.status.running')
        },
        2: {
          status: 'success',
          text: this.$t('list.device.status.online')
        },
        3: {
          status: 'error',
          text: this.$t('list.device.status.abnormal')
        }
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
    displayOrganizationName(record) {
      if (record.organization_name && record.organization_name !== 'NULL') {
        return record.organization_name
      }
      if (record.organization_id) {
        const org = this.findOrgInTree(this.orgList, record.organization_id)
        if (org) {
          return org.title || org.name
        }
      }
      return record.organization_name || ''
    },
    findOrgInTree(nodes, id) {
      if (!nodes) return null
      const targetId = String(id)
      for (const node of nodes) {
        if (String(node.id) === targetId || String(node.value) === targetId) {
          return node
        }
        const children = node.children || node.childs
        if (children && children.length > 0) {
          const found = this.findOrgInTree(children, id)
          if (found) return found
        }
      }
      return null
    },
    addRecentOrg(id) {
      if (!id) return
      const orgId = String(id)
      const org = this.findOrgInTree(this.orgList, orgId)
      if (org) {
        const name = org.title || org.name
        const recent = [...this.recentOrgs]
        const index = recent.findIndex(item => String(item.id) === orgId)
        if (index > -1) {
          // If already exists, move to top if name is the same, or update name
          recent.splice(index, 1)
        }
        recent.unshift({ id: orgId, name })
        this.recentOrgs = recent.slice(0, 3)
        storage.set('recent_orgs', this.recentOrgs)
      }
    },
    handleAdd () {
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
      handleSelectParams() {
        this.select_params = true
      },
    handleSendBtCode () {
      console.log('handleSendBtCode')
      this.send_bt_code_visible = true
      // after 1s refresh
      // setTimeout(() => {
        // this.$refs.sendBtCode.refresh()
      // }, 100)
    },
    setupAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearTimeout(this.autoRefreshTimer)
      }
      // Temporarily disabled
      /*
      this.autoRefreshTimer = setTimeout(() => {
        console.log('Auto refresh online status')
        this.handleRefreshOnlineStatusPage(true)
      }, 3000)
      */
    },
    handleRefreshOnlineStatusPage (isAuto = false) {
        if (isAuto) {
          this.isAutoRefreshing = true
        }
        const arg = Object.assign({}, this.queryData)
        arg.page_no = arg.pageNo
        arg.page_size = arg.pageSize
        arg.location_only = false
        delete arg.pageNo
        delete arg.pageSize
        if (this.deviceStatus) {
          arg.device_status = this.deviceStatus
        }
        refreshDevicePage(arg).then(res => {
          console.log('refreshDevicePage', res)
          if (isAuto !== true) {
            this.$message.info(res.data)
          }
          this.refreshTable(!isAuto)
        }).catch(err => {
          console.log('refreshDevicePage', err)
          this.isAutoRefreshing = false
          if (isAuto !== true) {
            this.$message.error(err.msg)
          }
        })
    },
    handleRefreshOnlineStatusAll () {
      refreshDeviceOnlineStatusAll().then(res => {
        console.log('refreshDeviceOnlineStatusAll', res)
        this.$message.info(res.data)
        this.refreshTable(true)
      }).catch(err => {
        console.log('refreshDeviceOnlineStatusAll', err)
        this.$message.error(err.msg)
      })
    },
    async handleExport() {
      console.log('handleExport')
      this.showExporting = true
      this.exportProgress = 0
      this.exportError = null

      // Check if there's a previous failed export
      const lastExportState = localStorage.getItem('deviceExportState')
      let lastDeviceId = null
      let resumeExport = false

      if (lastExportState) {
        try {
          const exportState = JSON.parse(lastExportState)
          if (exportState.timestamp && (Date.now() - exportState.timestamp < 24 * 60 * 60 * 1000)) {
            // Only offer to resume if the export was within the last 24 hours
            lastDeviceId = exportState.lastDeviceId
            this.lastExportedDeviceId = lastDeviceId
            this.showExporting = true
            const totalCount = exportState.totalCount
            const exportedCount = exportState.exportedCount
            this.exportedCount = exportedCount
            this.totalExportCount = totalCount

            if (lastDeviceId && totalCount > 0) {
              // Ask user if they want to resume the export using the extracted method
              resumeExport = await this.confirmResumeExport(exportedCount, totalCount);
            }
          }
        } catch (e) {
          console.error('Error parsing last export state', e)
          localStorage.removeItem('deviceExportState')
        }
      }

      try {
        await this.processExport(resumeExport, lastDeviceId)
        // 导出成功后清除错误状态
        this.exportError = null
      } catch (err) {
        console.error('Export error:', err)
        // 设置错误状态
        this.exportError = err.message
        console.log('设置exportError:', this.exportError) // 添加日志
        this.$message.info('您可以点击"恢复导出"按钮继续未完成的导出')
      } finally {
        setTimeout(() => {
          // 不再自动隐藏导出状态，让用户可以看到错误信息和恢复按钮
          // this.showExporting = false
          // this.exportProgress = 0
          console.log('deviceExportState', localStorage.getItem('deviceExportState'))
          console.log('deviceExportCount', localStorage.getItem('deviceExportCount'))
          console.log('deviceExportHeaders', localStorage.getItem('deviceExportHeaders'))
          console.log('exportError状态:', this.exportError) // 添加日志
        }, 2000)
      }
    },
    handleImport () {
      console.log('handleImport')
    },
    handleEdit (record) {
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
                reject(err.data.message)
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
              addUpdateDeviceBatch(values)
                .then(res => {
                  console.log(res)
                  resolve(res)
                }).catch(err => {
                console.log('add device', err)
                this.confirmLoading = false
                this.$message.error(err.data.message)
                reject(err)
              })
            }).then(res => {
              console.log('resolve', res)
              this.device_create_form_visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              // this.$refs.table.refresh()
              this.refreshTable(null)

              this.$message.info('新增成功: ' + res.data[0] + '，修改成功: ' + res.data[1])
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
    handleSendCommandFormCancel() {
      this.send_command_form_visible = false
    },
      handleSelectParamsCancel() {
        this.select_params = false;
      },
      handleSelectParamsOk() {
        this.select_params = false;
      },
    handleSendCommandFormOk(id) {
      console.log('handleSendCommandFormOk', id)
      this.send_command_form_visible = false
      this.currentBatchSendCommandId = id
      this.showBatchCommandManagerDevices = true
    },
    handleSendCommandManagerCancel() {
      this.showBatchCommandManager = false
    },
    handleSendBtCodeCancel() {
      this.send_bt_code_visible = false
    },
    handleSendBtCodeOk() {
      this.send_bt_code_visible = false
    },
    handlePacketLogCancel () {
      this.packet_log_visible = false
    },
    handlePacketLogOk () {
      this.packet_log_visible = false
    },
    handleSendCommandManagerOk() {
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
      console.log(this.$refs)
      // batteryInfo 因为不可见，在这个循环里面，还没有被创建，所以 refs 里面没有
      // 需要在下一个循环里面执行 batteryInfo 的代码
      this.$nextTick(() => {
        console.log(this.$refs)
        this.$refs.batteryInfo.getBatteryInfoHandle(record.code)
      })
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
    },
    handleMap(record) {
      this.device_id = record.code
      this.map_visible = true
    },
    handleSendCommand(record) {
      this.device_id = record.code
      this.device_ids = [{ 'deviceId': record.code }]
      console.log('send command')
      this.send_command_form_visible = true
    },
    handleProtocolLog (record) {
      console.log('handleProtocolLog')
      this.device_id = record.code
      this.packet_log_visible = true
    },
    handleRefreshOnlineStatus(record) {
      console.log('refresh online status')
      refreshOnlineStatus(record.code)
        .then(res => {
          console.log(res)
          let status = '设备状态:'
          if (res.data) {
            status += '在线'
            this.$set(record, 'online', true)
          } else {
            status += '离线'
            this.$set(record, 'online', false)
          }
          this.$message.info(`${record.code} 刷新成功. ${status}`)
          this.getStatusCount()
        }).catch(err => {
        console.log('refresh online status', err)
        this.$message.error(err.data.message)
      })
    },
    handleSendCommandBatch() {
      this.device_ids = this.selectedRows.map(item => {
        return { 'deviceId': item.code }
      })
      console.log('send command batch')
      this.send_command_form_visible = true
    },
    getAdminOrgList() {
      this.orgListLoading = true
      return getAdminOrgTree(this.queryParam)
        .then(res => {
          console.log('org list', res)
          this.orgList = res.data ? [res.data] : []
          if (this.queryData.organization_id) {
            this.addRecentOrg(this.queryData.organization_id)
          }
        })
        .catch(err => {
          console.log('org list error', err)
          // retry after 3s
          setTimeout(() => {
            this.getAdminOrgList()
          }, 3000)
        })
        .finally(() => {
          this.orgListLoading = false
        })
    },
    refreshTable(param) {
      // make sure table is visible
      this.handleBatteryInfoCancel()

      if (this.$refs.table) {
        this.$refs.table.refresh(param)
      }
      // refresh status count
      this.getStatusCount()
      if (this.$refs.alarm) {
        this.$refs.alarm.query()
      }
    },
    getStatusCount() {
      console.log('query data', this.queryData)
      if (this.queryData.device_id === '') {
        this.queryData.device_id = null
      }
      return getStatusCount({
        'device_id': this.queryData.device_id,
        'organization_id': this.queryData.organization_id
      })
        .then(res => {
          console.log('status count', res)
          this.statusCount = res.data
        })
    },
    onAlarmChange() {
      console.log('alarm change', this.showAlarm);
    },
    onDeviceStatusChange() {
      console.log('device status change', this.deviceStatus);
      this.refreshTable(true);
    },
    onTabChange(tab) {
      console.log('tab change', tab)
      if (tab === 'table') {
        this.refreshTable(true)
      } else if (tab === 'alarm') {
        if (this.$refs.alarm) {
          this.$refs.alarm.query()
        }
      }
    },
    formatTime(time) {
      return moment.parseZone(time).format('YYYY-MM-DD HH:mm:ss')
    },
    localTime(time) {
      return moment.utc(time).local().format('YYYY-MM-DD HH:mm:ss')
    },
    localTimePlus8(time) {
      return moment.utc(time).local().add(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
    },
    handleLocationHistory(record) {
      this.selectedDeviceId = record.code
      this.locationHistoryVisible = true
    },
    // New method to handle the confirmation dialog for resuming export
    async confirmResumeExport(exportedCount, totalCount) {
      try {
        // Use await directly with $confirm to pause execution until user responds
        await this.$confirm(
          `发现未完成的导出任务 (已导出 ${exportedCount}/${totalCount} 条记录)，是否继续上次的导出?`,
          '继续导出',
          {
            confirmButtonText: '继续导出',
            cancelButtonText: '重新导出',
            type: 'info'
          }
        );
        // If we get here, user confirmed, so return true
        console.log('User confirmed to resume export');
        return true;
      } catch (e) {
        // If we get here, user cancelled, so clean up and return false
        localStorage.removeItem('deviceExportState');
        localStorage.removeItem('deviceExportCount');
        localStorage.removeItem('deviceExportHeaders');
        console.log('User cancelled resume export');
        return false;
      }
    },
    // 提取的导出处理函数
    async processExport(resumeExport, lastDeviceId) {
      const arg = Object.assign({}, this.queryData)
      Object.keys(arg).forEach(key => {
        if (arg[key] === null) {
          delete arg[key]
        }
      })
      delete arg.start_date
      delete arg.start_time
      arg.location_only = false
      arg.device_status = this.deviceStatus

      const buildExportUrl = (params) => {
        const baseUrl = apiBaseUrl.replace(/\/$/, '')
        return `${baseUrl}${api.device_export}?${params}`
      }

      const readResponseText = async (response) => {
        if (response && typeof response.text === 'function') {
          return response.text()
        }
        return ''
      }

      const assertExportResponse = async (response, expectedType, stepName) => {
        if (!response.ok) {
          const errorText = await readResponseText(response)
          throw new Error(`${stepName}失败，HTTP ${response.status}${errorText ? `: ${errorText.slice(0, 120)}` : ''}`)
        }

        const contentType = response.headers && typeof response.headers.get === 'function'
          ? (response.headers.get('content-type') || '')
          : ''
        if (expectedType === 'json' && !contentType.includes('json')) {
          const errorText = await readResponseText(response)
          throw new Error(`${stepName}返回了非 JSON 响应，请检查接口地址或登录状态${errorText ? `: ${errorText.slice(0, 80)}` : ''}`)
        }
        if (expectedType === 'csv' && contentType && !contentType.includes('csv')) {
          const errorText = await readResponseText(response)
          throw new Error(`${stepName}返回了非 CSV 响应，请检查接口地址或登录状态${errorText ? `: ${errorText.slice(0, 80)}` : ''}`)
        }
      }

      // 添加带超时的fetch函数
      const fetchWithTimeout = async (url, options, timeout = 30000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          // if (error.name === 'AbortError') {
            // throw new Error(`请求超时 (${timeout / 1000}秒)`);
          // }
          // throw error;
          // return a error response with status 500
          return {
            ok: false,
            status: 500,
            statusText: '请求超时'
          }
        }
      };

      // First, get the total count to calculate slices
      const countParams = new URLSearchParams(arg)
      countParams.set('count_only', 'true')
      countParams.set('page_size', '1')

      const countResponse = await fetchWithTimeout(buildExportUrl(countParams), {
        method: 'GET',
        headers: {
          'Access-Token': storage.get(ACCESS_TOKEN),
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }, 15000) // 15秒超时

      await assertExportResponse(countResponse, 'json', '获取导出总数')

      const countData = await countResponse.json()
      console.log('countData', countData)
      const totalCount = countData.data.total || 0
      this.totalExportCount = totalCount

      if (totalCount === 0) {
        this.$message.info('没有符合条件的设备可导出')
        return
      }

      // Set up for sliced export
      const SLICE_SIZE = 100
      const totalSlices = Math.ceil(totalCount / SLICE_SIZE)
      let currentSlice = 1
      let exportedCount = 0
      let csvHeaders = ''

      // If resuming, adjust the starting point
      if (resumeExport && lastDeviceId) {
        // arg.after_device_id = lastDeviceId
        exportedCount = parseInt(localStorage.getItem('deviceExportCount') || '0')
        this.exportedCount = exportedCount

        // Get the headers from storage
        csvHeaders = localStorage.getItem('deviceExportHeaders') || ''

        // If we have headers, we can skip the first request for headers
        if (csvHeaders) {
          currentSlice = Math.floor(exportedCount / SLICE_SIZE) + 1
        }
      }

      // Update progress display
      // this.$message.info(`开始导出 ${totalCount} 条记录，分 ${totalSlices} 批处理`)

      // Process each slice
      while (currentSlice <= totalSlices) {
        const sliceArg = { ...arg, page_size: SLICE_SIZE, page_no: currentSlice }
        const sliceParams = new URLSearchParams(sliceArg)

        // this.$message.info(`正在处理第 ${currentSlice}/${totalSlices} 批`)

        const sliceResponse = await fetchWithTimeout(buildExportUrl(sliceParams), {
          method: 'GET',
          headers: {
            'Access-Token': storage.get(ACCESS_TOKEN),
            'Accept': 'text/csv',
            'Cache-Control': 'no-cache'
          }
        }, 60000) // 60秒超时，导出数据可能需要更长时间

        await assertExportResponse(sliceResponse, 'csv', `导出第 ${currentSlice} 批`)

        const sliceText = await sliceResponse.text()

        // log the first device id and the last device id for debug
        const firstId = sliceText.split('\n')[1].split(',')[0]
        const lastId = sliceText.split('\n')[sliceText.split('\n').length - 2].split(',')[0]
        console.log(firstId, lastId)

        // For the first slice, keep the headers
        if (currentSlice === 1) {
          this.csvContent = sliceText

          // Extract headers (first line) and save them
          const headerEndIndex = this.csvContent.indexOf('\n') + 1
          if (headerEndIndex > 0) {
            csvHeaders = this.csvContent.substring(0, headerEndIndex)
            localStorage.setItem('deviceExportHeaders', csvHeaders)
          }
        } else {
          // For subsequent slices, skip the header row
          const dataStartIndex = sliceText.indexOf('\n') + 1
          if (dataStartIndex > 0 && dataStartIndex < sliceText.length) {
            this.csvContent += sliceText.substring(dataStartIndex)
          }
        }

        // Count rows in this slice
        const rowsInSlice = (sliceText.match(/\n/g) || []).length - 1 // Subtract 1 for header
        exportedCount += rowsInSlice
        this.exportedCount = exportedCount

        // Update progress
        this.exportProgress = Math.min((exportedCount / totalCount) * 100, 99.9)

        // Save state after each successful slice
        if (sliceText && sliceText.length > 0) {
          // Get the last device ID from the last line
          const lines = sliceText.trim().split('\n')
          if (lines.length > 1) {
            const lastLine = lines[lines.length - 1]
            const fields = lastLine.split(',')
            if (fields.length > 0) {
              // Assuming device ID is in the first column - adjust if needed
              lastDeviceId = fields[0].replace(/"/g, '')

              // Save export state
              const exportState = {
                lastDeviceId,
                deviceStatus: this.deviceStatus,
                totalCount,
                exportedCount,
                timestamp: Date.now()
              }
              localStorage.setItem('deviceExportState', JSON.stringify(exportState))
              localStorage.setItem('deviceExportCount', exportedCount.toString())
              this.lastExportedDeviceId = lastDeviceId
            }
          }
        }

        currentSlice++
      }

      // Create blob and trigger download
      const blob = new Blob([this.csvContent], { type: 'text/csv;charset=utf-8' })
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create and click link in a more reliable way
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = downloadUrl
      link.download = `devices_${Date.now()}.csv` // Add timestamp to prevent caching

      // Ensure link is removed after download starts
      link.addEventListener('click', () => {
        setTimeout(() => {
          console.log('remove link')
          window.URL.revokeObjectURL(downloadUrl)
          document.body.removeChild(link)
        }, 1000)
      })

      document.body.appendChild(link)
      link.click()

      // Clear export state on successful completion
      localStorage.removeItem('deviceExportState')
      localStorage.removeItem('deviceExportCount')
      localStorage.removeItem('deviceExportHeaders')

      this.$message.success(`成功导出 ${exportedCount} 条记录`)
      this.exportProgress = 100

      // 导出完成后，隐藏导出状态
      setTimeout(() => {
        this.showExporting = false
        this.exportProgress = 0
        this.exportedCount = null
        this.totalExportCount = null
        this.lastExportedDeviceId = null
      }, 3000)
    },
    syncFormFromRouteQuery() {
      this.isSyncingFromRoute = true
      const query = this.$route.query

      // Update form fields from URL
      this.deviceStatus = query.deviceStatus || 'online'
      this.queryData.device_id = query.device_id || ''
      this.queryData.organization_id = query.organization_id ? String(query.organization_id) : null

      this.isSyncingFromRoute = false
    },
    updateRouteQuery() {
      const query = {
        ...this.$route.query,
        deviceStatus: this.deviceStatus !== 'online' ? this.deviceStatus : undefined,
        device_id: this.queryData.device_id || undefined,
        organization_id: this.queryData.organization_id || undefined
      }

      // Clean undefined values
      Object.keys(query).forEach(key => query[key] === undefined && delete query[key])

      this.$router.replace({ query }).catch(err => {
        if (err.name !== 'NavigationDuplicated') throw err
      })
    },
    resumeExporting() {
      this.handleExport()
    }
  },
  watch: {
    deviceStatus(newVal) {
      if (!this.isSyncingFromRoute) this.updateRouteQuery()
    },
    'queryData.device_id'(newVal) {
      if (!this.isSyncingFromRoute) this.updateRouteQuery()
    },
    'queryData.organization_id'(newVal) {
      if (!this.isSyncingFromRoute) this.updateRouteQuery()
      if (newVal) {
        this.addRecentOrg(newVal)
      }
    },
    $route() {
      this.syncFormFromRouteQuery()
    }
  }
}
</script>

<style>
.fullscreen-modal {
  width: 95%;
  max-width: 95%;
  height: 95%;
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
.fullscreen-modal .vm-content .scrollable-content {
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
.ant-modal {
  height: -webkit-fill-available;
  max-width: 90vw;
  max-height: 90vh;
}
.ant-modal-content {
  max-width: 90vw;
  margin: auto;
  overflow: auto;
  border-radius: 8px;
}
.ant-modal-centered::before {
  content: unset;
}

/* Enhanced UI Styles */
.table-page-search-wrapper {
  padding: 24px 24px 8px;
  background: rgba(255, 255, 255, 0.95);
  margin-bottom: 20px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 16px -6px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
}

.table-page-search-wrapper:hover,
.table-page-search-wrapper:focus-within {
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
}

/* Premium Segment Control for Radio Buttons */
.table-page-search-wrapper .ant-form-item .ant-radio-group {
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  border: none;
  flex-wrap: wrap;
  gap: 4px;
}

.table-page-search-wrapper .ant-form-item .ant-radio-button-wrapper {
  background: transparent;
  border: none !important;
  color: #64748b;
  border-radius: 8px !important;
  box-shadow: none !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 550;
  position: relative;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-page-search-wrapper .ant-form-item .ant-radio-button-wrapper::before {
  display: none !important;
}

.table-page-search-wrapper .ant-form-item .ant-radio-button-wrapper-checked {
  font-weight: 600;
}

.table-page-search-wrapper .ant-form-item .ant-radio-button-wrapper:hover:not(.ant-radio-button-wrapper-checked) {
  color: #0f172a;
}

/* Modern Input, Tree-select, and Select element styles */
.table-page-search-wrapper .ant-input,
.table-page-search-wrapper .ant-select-selection,
.table-page-search-wrapper .ant-select,
.table-page-search-wrapper .ant-tree-select .ant-select-selection {
  border-radius: 8px !important;
  border: 1.5px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  height: 38px !important;
  line-height: 38px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  color: #1e293b;
  font-weight: 500;
  box-shadow: none !important;
}

.table-page-search-wrapper .ant-input::placeholder {
  color: #94a3b8;
}

.table-page-search-wrapper .ant-input:hover,
.table-page-search-wrapper .ant-select-selection:hover,
.table-page-search-wrapper .ant-select:hover,
.table-page-search-wrapper .ant-tree-select .ant-select-selection:hover {
  border-color: #cbd5e1 !important;
}

.table-page-search-wrapper .ant-input:focus,
.table-page-search-wrapper .ant-select-focused .ant-select-selection,
.table-page-search-wrapper .ant-select-selection:focus,
.table-page-search-wrapper .ant-select-open .ant-select-selection,
.table-page-search-wrapper .ant-tree-select-open .ant-select-selection {
  border-color: #3b82f6 !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 3.5px rgba(59, 130, 246, 0.15) !important;
}

.table-page-search-wrapper .ant-select-selection--single {
  height: 38px !important;
  line-height: 38px !important;
}

.table-page-search-wrapper .ant-select-selection__rendered {
  line-height: 34px !important;
  margin-left: 12px !important;
  margin-right: 12px !important;
}

/* Custom Labels Style */
.table-page-search-wrapper .ant-form-item-label {
  line-height: 1.5;
  padding-bottom: 6px;
}

.table-page-search-wrapper .ant-form-item-label > label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.01em;
}

/* More Parameters Link Refinement */
.table-page-search-wrapper .ant-dropdown-link {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  margin-top: 4px;
}

.table-page-search-wrapper .ant-dropdown-link:hover {
  background-color: #e2e8f0;
  color: #1e293b;
  text-decoration: none;
}

.table-page-search-wrapper .ant-dropdown-link .anticon {
  margin-left: 6px;
  transition: transform 0.2s ease;
}

/* Submit and Search buttons styling */
.table-page-search-submitButtons .ant-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  height: 38px !important;
  padding: 0 24px !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(29, 78, 216, 0.25) !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  transform: translateY(0);
}

.table-page-search-submitButtons .ant-btn-primary:hover,
.table-page-search-submitButtons .ant-btn-primary:focus {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%) !important;
  box-shadow: 0 6px 16px rgba(29, 78, 216, 0.35) !important;
  transform: translateY(-1.5px);
  color: #ffffff !important;
}

.table-page-search-submitButtons .ant-btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2) !important;
}

/* Checkbox Style */
.table-page-search-wrapper .ant-checkbox-wrapper {
  font-weight: 550;
  color: #475569;
  font-size: 13px;
  transition: color 0.2s ease;
}

.table-page-search-wrapper .ant-checkbox-wrapper:hover {
  color: #1e293b;
}

.table-page-search-wrapper .ant-checkbox-inner {
  border-radius: 4px;
  border: 1.5px solid #cbd5e1;
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.table-page-search-wrapper .ant-checkbox-checked .ant-checkbox-inner {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Operator Area & Buttons styling */
.table-operator {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  background: #f8fafc;
  padding: 14px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.table-operator .ant-btn-primary {
  background: #ffffff !important;
  color: #2563eb !important;
  border: 1.5px solid #bfdbfe !important;
  border-radius: 8px !important;
  height: 36px !important;
  padding: 0 16px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.03) !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  transform: translateY(0);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-operator .ant-btn-primary .anticon {
  margin-right: 6px;
}

.table-operator .ant-btn-primary:hover,
.table-operator .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  transform: translateY(-1.5px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.22) !important;
}

.table-operator .ant-btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15) !important;
}

/* Distinguish Add/Edit as the primary positive action (Emerald Green) */
.table-operator .ant-btn-primary[icon='plus'],
.table-operator .ant-btn-primary:first-child {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25) !important;
}

.table-operator .ant-btn-primary[icon='plus']:hover,
.table-operator .ant-btn-primary[icon='plus']:focus,
.table-operator .ant-btn-primary:first-child:hover,
.table-operator .ant-btn-primary:first-child:focus {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35) !important;
  transform: translateY(-1.5px);
}

.table-operator .ant-btn-primary[icon='plus']:active,
.table-operator .ant-btn-primary:first-child:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2) !important;
}

/* Premium Modern Line Tabs UI */
.device-list-tabs {
  margin-bottom: 24px;
}

.device-list-tabs .ant-tabs-bar {
  border-bottom: 2px solid #e2e8f0 !important;
  margin-bottom: 24px !important;
  background-color: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  display: block !important;
}

.device-list-tabs .ant-tabs-nav-container {
  margin-bottom: -2px !important; /* Elegant overlap to cover the border line cleanly */
}

.device-list-tabs .ant-tabs-nav .ant-tabs-tab {
  font-size: 14px;
  font-weight: 550;
  color: #64748b;
  padding: 10px 16px 14px 16px !important;
  margin-right: 16px !important;
  margin-left: 0 !important;
  border-radius: 6px 6px 0 0 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  border: none !important;
  background: transparent !important;
}

.device-list-tabs .ant-tabs-nav .ant-tabs-tab i,
.device-list-tabs .ant-tabs-nav .ant-tabs-tab .anticon {
  margin-right: 0 !important;
  font-size: 16px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s ease;
  color: #64748b;
}

.device-list-tabs .ant-tabs-nav .ant-tabs-tab:hover {
  color: #2563eb !important;
  background-color: rgba(37, 99, 235, 0.04) !important;
}

.device-list-tabs .ant-tabs-nav .ant-tabs-tab:hover i,
.device-list-tabs .ant-tabs-nav .ant-tabs-tab:hover .anticon {
  color: #2563eb;
  transform: translateY(-1px);
}

.device-list-tabs .ant-tabs-nav .ant-tabs-tab-active {
  color: #2563eb !important;
  font-weight: 650;
  background-color: transparent !important;
}

.device-list-tabs .ant-tabs-nav .ant-tabs-tab-active i,
.device-list-tabs .ant-tabs-nav .ant-tabs-tab-active .anticon {
  color: #2563eb !important;
  transform: scale(1.05);
}

/* Glowing sliding active underline */
.device-list-tabs .ant-tabs-ink-bar {
  display: block !important;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%) !important;
  height: 3px !important;
  border-radius: 3px 3px 0 0 !important;
  box-shadow: 0 -1px 6px rgba(37, 99, 235, 0.3) !important;
  bottom: 0 !important;
}

.export-status {
  margin-top: 10px;
  padding: 10px 14px;
  background-color: #f8fafc;
  border-radius: 8px;
  font-size: 13.5px;
  color: #475569;
  border: 1px solid #e2e8f0;
  word-break: break-all;
}

.export-status span {
  margin-right: 12px;
}

.export-error-actions {
  margin: 10px 0;
  padding: 10px 14px;
  background-color: #fff1f0;
  border: 1.5px solid #ffccc7;
  border-radius: 8px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.export-error-actions .ant-btn {
  margin-left: 10px;
}

/* Premium Segmented Controls and Status Colors */
.more-params-wrapper {
  margin-top: 29px;
  display: flex;
  align-items: center;
  height: 38px;
}

/* Status Indicator Dots inside segment controls */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-dot.total {
  background-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.status-dot.online {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.status-dot.offline {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
}

.status-dot.standby {
  background-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}

/* Elegant badges for status counts */
.status-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  height: 18px;
  min-width: 20px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border-radius: 10px;
  margin-left: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Default / Unchecked segment colors */
.status-count-badge.total {
  background-color: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
}

.status-count-badge.online {
  background-color: rgba(16, 185, 129, 0.08);
  color: #10b981;
}

.status-count-badge.offline {
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.status-count-badge.standby {
  background-color: rgba(245, 158, 11, 0.08);
  color: #d97706;
}

/* Checked States - Custom text and shadows for each segment */
.table-page-search-wrapper .ant-form-item .status-btn-total.ant-radio-button-wrapper-checked {
  color: #2563eb !important;
  background-color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.12), 0 2px 4px rgba(37, 99, 235, 0.06) !important;
}

.table-page-search-wrapper .ant-form-item .status-btn-online.ant-radio-button-wrapper-checked {
  color: #10b981 !important;
  background-color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.12), 0 2px 4px rgba(16, 185, 129, 0.06) !important;
}

.table-page-search-wrapper .ant-form-item .status-btn-offline.ant-radio-button-wrapper-checked {
  color: #ef4444 !important;
  background-color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.12), 0 2px 4px rgba(239, 68, 68, 0.06) !important;
}

.table-page-search-wrapper .ant-form-item .status-btn-standby.ant-radio-button-wrapper-checked {
  color: #d97706 !important;
  background-color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.12), 0 2px 4px rgba(245, 158, 11, 0.06) !important;
}

/* Active Badge Colors when selected */
.status-btn-total.ant-radio-button-wrapper-checked .status-count-badge.total {
  background-color: #2563eb;
  color: #ffffff;
}

.status-btn-online.ant-radio-button-wrapper-checked .status-count-badge.online {
  background-color: #10b981;
  color: #ffffff;
}

.status-btn-offline.ant-radio-button-wrapper-checked .status-count-badge.offline {
  background-color: #ef4444;
  color: #ffffff;
}

.status-btn-standby.ant-radio-button-wrapper-checked .status-count-badge.standby {
  background-color: #d97706;
  color: #ffffff;
}

/* Pulse/Transform Animations for active status indicators */
.status-btn-total.ant-radio-button-wrapper-checked .status-dot.total {
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.status-btn-online.ant-radio-button-wrapper-checked .status-dot.online {
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: status-pulse-green 2s infinite;
}

.status-btn-offline.ant-radio-button-wrapper-checked .status-dot.offline {
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.status-btn-standby.ant-radio-button-wrapper-checked .status-dot.standby {
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
}

@keyframes status-pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.recent-org-shortcuts {
  margin-top: 4px;
  line-height: 22px;
}
.recent-org-tag {
  display: inline-block;
  height: auto;
  margin-right: 8px;
  padding: 0 7px;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}
.recent-org-tag:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* Full Screen Modal Styling */
.full-screen-modal {
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  padding: 0 !important;
  margin: 0 !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

.full-screen-modal .ant-modal {
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100vh !important;
  padding: 0 !important;
  margin: 0 !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

.full-screen-modal .ant-modal-content {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  border-radius: 0 !important;
  display: flex;
  flex-direction: column;
  box-shadow: none !important;
  background-color: transparent !important;
}

.full-screen-modal .ant-modal-body {
  flex: 1 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100vh !important;
  max-height: 100vh !important;
  overflow: hidden !important;
}

/* Floating custom styled close button for premium map experience */
.full-screen-modal .ant-modal-close {
  top: 14px !important;
  right: 16px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 50% !important;
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
}

.full-screen-modal .ant-modal-close:hover {
  background: #ffffff !important;
  transform: scale(1.08) !important;
  color: #1890ff !important;
}

.full-screen-modal .ant-modal-close-x {
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  font-size: 16px !important;
  color: rgba(0, 0, 0, 0.65) !important;
}
</style>
