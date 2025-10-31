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
      >
        <a-tab-pane key="table">
          <template #tab><a-icon type="table" /><span>{{ $t('list.device.tabs.table') }}</span></template>
        </a-tab-pane>
        <a-tab-pane key="map">
          <template #tab><a-icon type="environment" /><span>{{ $t('list.device.tabs.map') }}</span></template>
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
          <a-col :md="8" :sm="24">
            <a-form-item :label="$t('Status')">
              <a-radio-group v-model="deviceStatus" @change="onDeviceStatusChange">
                <a-radio-button value="total">{{ $t('Total') }} ({{ this.statusCount.total }})</a-radio-button>
                <a-radio-button value="online">{{ $t('Online') }} ({{ this.statusCount.online }})</a-radio-button>
                <a-radio-button value="offline">{{ $t('Offline') }} ({{ this.statusCount.offline }})</a-radio-button>
                <a-radio-button value="standby">{{ $t('Standby' ) }} ({{ this.statusCount.standby }})</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-form-item :label="$t('No')">
              <a-input
                v-model="queryData.device_id"
                placeholder=""
                @keyup.enter.native="refreshTable(true)"
              />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="12">
            <a-form-item :label="$t('Organization')">
              <a-tree-select
                show-search
                tree-default-expand-all
                :filterTreeNode="filterTreeNode"
                :treeData="orgList"
                v-model="queryData.organization_id"
              ></a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :md='4' :sm='12'>
            <div v-if='!showMoreParam' style='margin-bottom: 10px'>
              <a class="ant-dropdown-link" @click='showMoreParam = true'>{{ $t('list.device.filters.moreParams') }}<a-icon type="down"/></a>
            </div>
            <div v-if='showMoreParam'>
              <a
                class="ant-dropdown-link"
                @click='() => { showMoreParam = false; queryData.bt_code = ""; queryData.iccid = ""; queryData.soh = ""; queryData.soc = ""; queryData.alarm = "" }'
              >{{ $t('list.device.filters.collapseParams') }}<a-icon type="up"/></a>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter='48'>
          <div v-if='showMoreParam'>
            <a-col :md='4' :sm='12'><a-form-item :label="$t('BT Code')"><a-input v-model="queryData.bt_code" placeholder=""/></a-form-item></a-col>
            <a-col :md='4' :sm='12'><a-form-item :label="$t('ICCID')"><a-input v-model="queryData.iccid" placeholder=""/></a-form-item></a-col>
            <a-col :md='4' :sm='12'><a-form-item :label="$t('SOH')"><a-input v-model="queryData.soh" placeholder=""/></a-form-item></a-col>
            <a-col :md='4' :sm='12'><a-form-item :label="$t('SOC')"><a-input v-model="queryData.soc" placeholder=""/></a-form-item></a-col>
<!--            <a-col :md='4' :sm='12'><a-form-item :label="$t('Alarm')"><a-input v-model="queryData.alarm" placeholder=""/></a-form-item></a-col>-->
          </div>
        </a-row>
        <a-row>
          <a-col v-if="!showAlarm" :md="!advanced && 4 || 12" :sm="12">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="refreshTable(true)">{{ $t('common.search') }}</a-button>
              <!--                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>-->
              <!--              <a @click="toggleAdvanced" style="margin-left: 8px">-->
              <!--                {{ advanced ? '收起' : '展开' }}-->
              <!--                <a-icon :type="advanced ? 'up' : 'down'"/>-->
              <!--              </a>-->
            </span>
          </a-col>
          <!-- checkbox for contains_search -->
          <a-col :md="4" :sm="12">
            <a-form-item>
              <a-checkbox v-model="queryData.contains_search">{{ $t('list.device.filters.fuzzySearch') }}</a-checkbox>
            </a-form-item>
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
        <a-button type='primary' icon='plus' @click='handleAdd'>{{ $t('list.device.actions.addEdit') }}</a-button>
        <a-button type='primary' @click='handleBatchCommandManager'>{{ $t('list.device.actions.commandManager') }}</a-button>
        <a-button type='primary' @click='handleSelectParams'>{{ $t('list.device.actions.productionTest') }}</a-button>
        <a-button type='primary' @click='handleExport'>{{ $t('list.device.actions.export') }}</a-button>
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
          <a-badge :status="statusMap[text].status" :text="statusMap[text].text" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
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
            {{ $t('list.device.info.organization') }}: <span>{{ record.organization_name }}</span>
            <br />
            {{ $t('list.device.info.storehouse') }}: <span>{{ record.storehouse_name }}</span>
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
            {{ record.location_time ? localTime(record.location_time) : '' }}
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
                  <a v-if="is_sysadmin" @click="handleEdit(record)">{{ $t('common.edit') }}</a>
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

      <battery-info
        v-if="battery_detail_visible"
        ref="batteryInfo"
        :device-id="device_id"
        :bms-bt="bms_bt"
        @cancel="handleBatteryInfoCancel"
        @ok="handleBatteryInfoOk"
      />

      <div
        v-if="map_visible && !table_visible"
        style="width: 100%"
      >
        <div><a @click="handleMapClose()">{{ $t('list.device.map.back') }}</a></div>
        <div><br /></div>
        <div>{{ $t('list.device.map.device', { deviceId: device_id }) }}</div>
        <div><br /></div>
        <a-spin :spinning="map_loading">
          <a-form>
            <a-row :gutter="48">
              <a-col :md="4" :sm="24">
                <a-form-item :aria-label="$t('list.device.map.startDate')">
                  <a-date-picker v-model="queryData.start_date" style="width: 100%" :placeholder="$t('list.device.map.startDate')"/>
                </a-form-item>
              </a-col>
              <a-col :md="4" :sm="24">
                <a-form-item :aria-label="$t('list.device.map.startTime')">
                  <a-time-picker v-model="queryData.start_time" style="width: 100%" :placeholder="$t('list.device.map.startTime')"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="48">
              <a-col :md="4" :sm="24">
                <a-form-item :aria-label="$t('list.device.map.endDate')">
                  <a-date-picker
                    v-model="queryData.end_date"
                    style="width: 100%"
                    :placeholder="$t('list.device.map.endDate')"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="4" :sm="24">
                <a-form-item :aria-label="$t('list.device.map.endTime')">
                  <a-time-picker
                    v-model="queryData.end_time"
                    style="width: 100%"
                    :placeholder="$t('list.device.map.endTime')"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="4" :sm="24">
                <a-button type="primary" @click="refreshMap(device_id)">{{ $t('list.device.map.search') }}</a-button>
              </a-col>
            </a-row>
          </a-form>
        </a-spin>
        <amap
          v-if="refresh_map"
          ref="map"
          :zoom="zoom"
          :center="center"
          style='height: 70vh'
          @complete="onMapComplete"
        >
          <amap-polyline
            v-if="polyline.path && polyline.path.length > 0"
            :path="polyline.path"
            stroke-color="#3366FF"
            :stroke-opacity="1"
            :stroke-weight="6"
            stroke-style="solid"
            :line-join="'round'"
          />
          <amap-circle-marker
            v-for="(marker, index) in polyline.markers"
            :key="index"
            :center="marker"
            :radius="5"
            stroke-color="#FF33FF"
            :stroke-opacity="1"
            :stroke-weight="2"
            fill-color="#FF99FF"
            :fill-opacity="0.8"
            :z-index="10"
          />
        </amap>
      </div>
    </div>

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

    <div
      v-if="showMap"
      style="width: 100%; height: 70vh"
      class="map-container"
    >
      <div
        v-if="isGettingDeviceLocation"
        class='popup'
      >
        <a-progress
          :percent="getDevicesLocationPageNo/ getDevicesLocationPages * 100"
          :status="getDevicesLocationPageNo === getDevicesLocationPages ? 'success' : 'active'"
          :stroke-width="10"
          :format="percent => `${percent.toFixed(0)}%`"
        />
        <span>{{ getDevicesLocationPageNo }}</span> / <span>{{ getDevicesLocationPages }}</span>, <span>{{ markersFound }}</span>
      </div>
      <!-- TODO: use device map component -->
      <amap
        ref="clusterMap"
        :zoom="zoom"
        :center="center2"
        style='height: 70vh'
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
          :marker-options="getMarkerOptions"
        >
          <template slot-scope="record" slot="marker">
            <a-tooltip>
              <template #title>
                <div>
                  <p>{{ $t('list.device.map.tooltip.deviceCode') }}：{{ record.device.code }}</p>
                  <p>{{ $t('list.device.map.tooltip.batteryCode') }}：{{ record.device.bms_bt }}</p>
                  <p>{{ $t('list.device.map.tooltip.locationTime') }}：{{ record.device.location_time }}</p>
                </div>
              </template>
              <div class="custom-marker" />
            </a-tooltip>
          </template>
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
<!--  </page-header-wrapper>-->
</template>

<script>
// import VueAMap from 'vue-amap'
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import {
  addUpdateDeviceBatch,
  getAdminOrgTree,
  getDeviceList,
  getLocation,
  getStatusCount, refreshOnlineStatus,
  updateDevice,
  refreshDevicePage,
  refreshDeviceOnlineStatusAll,
  wgs84togcj02,
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

function interpolate(u, begin, end) {
  if (u < 0) u = 0
  if (u > 1) u = 1
  u = Math.pow(u, 1 / 10)
  return u * (end - begin) + begin
}

// let amapManager = new VueAMap.AMapManager()

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
    SendCommandForm,
    StepByStepModal,
    BatteryInfo,
    PacketLog,
    LocationHistory,
    LocationHistoryTable
  },
  data() {
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
        { position: [116.402144, 39.910012], title: 'Marker 1' },
        { position: [116.391095, 39.904684], title: 'Marker 2' },
        { position: [116.418044, 39.957106], title: 'Marker 3' },
        { position: [116.373688, 39.931149], title: 'Marker 4' }
      ],
      deviceMarkers: [],
      // create model
      is_sysadmin: false,
      device_create_form_visible: false,
      table_visible: true,
      showMap: false,
      isGettingDeviceLocation: false,
      getDevicesLocationPages: 1,
      getDevicesLocationPageNo: 0,
      markersFound: 0,
      showMarkers: false,
      showTableTab: true,
      showAlarm: false,
      showLocationHistory: false,
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
        const pages = Math.ceil(this.data.total / this.data.page_size)
        return getDeviceList(arg)
          .then(res => {
            console.log('device list', res)
            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              totalPage: pages,
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
    }
  },

  created() {
    // getRoleList({ t: new Date() })
    const role = storage.get(ROLE)
    console.log('role', role)
    if (role === 'sysadmin') {
      this.is_sysadmin = true
    }
  },
  mounted() {
    this.syncFormFromRouteQuery()
    this.getStatusCount()
    this.getAdminOrgList()
  },
  computed: {
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
    handleRefreshOnlineStatusPage () {
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
          this.$message.info(res.data)
          this.refreshTable(true)
        }).catch(err => {
          console.log('refreshDevicePage', err)
          this.$message.error(err.msg)
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
      this.table_visible = false
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
      this.table_visible = true
    },
    handleMap(record) {
      this.device_id = record.code
      this.map_visible = true
      this.table_visible = false
      this.refreshMap(record.code)
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
          } else {
            status += '离线'
          }
          this.$message.info(`${record.code} 刷新成功. ${status}`)
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
    refreshMap(deviceId) {
      // Reset polyline data
      this.polyline = {
        path: [],
        markers: []
      };

      this.map_loading = true;
      const arg = Object.assign({}, this.queryData);
      console.log('loadData request arg:', arg);

      getLocation(deviceId, arg)
        .then(res => {
          this.map_loading = false;

          // Check if we have valid data
          if (!res.data || res.data.length === 0) {
            this.$message.info('No location data available for this device');
            return;
          }

          try {
            // Filter for valid coordinates
            const validLocations = res.data.filter(item =>
              item.mars_longitude && item.mars_latitude &&
              !isNaN(item.mars_longitude) && !isNaN(item.mars_latitude) &&
              item.mars_longitude !== 0 && item.mars_latitude !== 0
            );

            if (validLocations.length === 0) {
              this.$message.info('No valid location data available for this device');
              return;
            }

            // Set center point for the map
            this.center = [validLocations[0].mars_longitude, validLocations[0].mars_latitude];

            // Process coordinates
            const newPath = [];
            const newMarkers = [];

            validLocations.forEach(item => {
              const lon = parseFloat(item.mars_longitude);
              const lat = parseFloat(item.mars_latitude);
              newPath.push([lon, lat]);
              newMarkers.push([lon, lat]);
            });

            // Set the polyline data
            this.polyline = {
              path: newPath,
              markers: newMarkers
            };

            console.log('Path data prepared:', this.polyline.path);

            // Force map refresh to re-render components
            this.refresh_map = false;
            this.$nextTick(() => {
              this.refresh_map = true;
              // Fit map bounds to show all markers
              this.$nextTick(() => {
                this.fitMapBounds(newMarkers);
              });
            });
          } catch (error) {
            console.error('Error processing location data:', error);
            this.$message.error('Error processing location data');
          }
        })
        .catch(err => {
          console.log('get location data failed', err);
          this.map_loading = false;
          this.$message.error('Failed to load location data: ' + (err.message || 'Unknown error'));
        });
    },
    filterTreeNode(input, option) {
      return (
        option.data.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    getAdminOrgList() {
      return getAdminOrgTree(this.queryParam)
        .then(res => {
          console.log('org list', res)
          this.orgList = []
          this.orgList.push(res.data)
        })
        .catch(err => {
          console.log('org list', err)
          // retry after 3s
          setTimeout(() => {
            this.getAdminOrgList()
          }, 3000)
        })
    },
    getDeviceLocation(arg, page_no) {
      // get all device location
      console.log('loadData request arg:', arg)
      arg.page_no = page_no
      arg.location_only = true
      console.log('getDeviceLocation', arg, 'page_no', page_no)
      getDeviceList(arg)
        .then(res => {
          console.log('device list', res)

          const pages = Math.ceil(res.data.total / res.data.page_size)

          this.getDevicesLocationPageNo = page_no
          this.getDevicesLocationPages = pages

          // append device to deviceMarkers
          res.data.records.forEach((item, index) => {
            if (item.last_location_lng !== null && item.last_location_lat !== null) {
              this.markersFound += 1
              const gcj02 = wgs84togcj02(item.last_location_lng, item.last_location_lat)
              console.log('gcj02', gcj02)
              this.deviceMarkers.push({
                lnglat: gcj02,
                device: item
              })
            }
          })
          if (page_no >= pages || res.data.records.length === 0) {
            this.isGettingDeviceLocation = false
            this.getDevicesLocationPages = 1
            this.getDevicesLocationPageNo = 0
            console.log('markersFound', this.markersFound)
            // Fit map bounds to show all markers after loading all devices
            if (this.deviceMarkers.length > 0) {
              const markerPositions = this.deviceMarkers.map(m => m.lnglat)
              this.fitMapBounds(markerPositions)
            }
          } else {
            this.getDeviceLocation(arg, page_no + 1)
          }
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
      if (this.showMap) {
        if (this.isGettingDeviceLocation) {
          return
        }
        this.deviceMarkers = []
        this.markersFound = 0
        const arg = Object.assign({}, this.queryData)
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
    getStatusCount() {
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
    onMapComplete() {
      console.log('Map loaded and ready');
      this.map_loading = false;
    },
    fitMapBounds(markers) {
      console.log('fitMapBounds called with markers:', markers);

      if (!markers || markers.length === 0) {
        console.log('No markers to fit bounds');
        return;
      }

      const attemptFit = () => {
        const mapComponent = this.$refs.map || this.$refs.clusterMap;

        if (!mapComponent) {
          console.log('Map component reference not found');
          return;
        }

        // vue-amap exposes the AMap.Map instance via $map and the ready promise on $amap
        const context = mapComponent.$amap;
        const mapFromComponent = () => mapComponent.$map || (context && context.context && context.context.target) || null;

        const resolvedMap = mapFromComponent();
        if (resolvedMap) {
          this.applyFitToMap(resolvedMap, markers);
          return;
        }

        if (context && context.ready && context.ready.promise && typeof context.ready.promise.then === 'function') {
          console.log('Waiting for AMap ready promise to resolve');
          context.ready.promise.then(map => {
            this.applyFitToMap(map, markers);
          }).catch(err => {
            console.log('Failed to resolve AMap ready promise', err);
          });
          return;
        }

        console.log('AMap context not ready yet, skipping fit for now');
      };

      // Give the map time to mount before attempting to fit bounds
      this.$nextTick(() => {
        this.$nextTick(attemptFit);
      });
    },
    applyFitToMap(amapInstance, markers) {
      if (!amapInstance || typeof amapInstance.getZoom !== 'function') {
        console.log('Invalid or uninitialized AMap instance:', amapInstance);
        return;
      }

      if (markers.length === 1) {
        if (typeof amapInstance.setZoomAndCenter === 'function') {
          console.log('Fitting map to single marker via setZoomAndCenter');
          amapInstance.setZoomAndCenter(9, markers[0]);
        } else {
          if (typeof amapInstance.setCenter === 'function') {
            console.log('Fitting map to single marker via setCenter');
            amapInstance.setCenter(markers[0]);
          }
          if (typeof amapInstance.setZoom === 'function') {
            console.log('Fitting map to single marker via setZoom');
            amapInstance.setZoom(9);
          }
        }
      } else if (typeof amapInstance.setFitView === 'function') {
        console.log('Fitting map to multiple markers via setFitView');
        amapInstance.setFitView(null, false, [50, 50, 50, 50]);
      } else {
        console.log('setFitView not available, falling back to center/zoom calculation');
        const lngs = markers.map(point => point[0]);
        const lats = markers.map(point => point[1]);
        const avgLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const avgLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        if (typeof amapInstance.setCenter === 'function') {
          amapInstance.setCenter([avgLng, avgLat]);
        }
        if (typeof amapInstance.setZoom === 'function') {
          amapInstance.setZoom(10);
        }
      }
    },
    onMapChange() {
      console.log('map change', this.showMap);
      this.table_visible = !this.showMap;
      if (this.showMap) {
        this.showMarkers = true;
        if (this.deviceMarkers.length === 0) {
          this.refreshTable(true);
        }
      }
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
      if (tab === 'map') {
        console.log('show map')
        this.showTableTab = false
        this.showAlarm = false
        this.showLocationHistory = false
        this.showMap = true
        this.showMarkers = true
        if (this.deviceMarkers.length === 0) {
          this.refreshTable(true)
        }
        // refresh map to make sure it is displayed, by hide and show
        this.refresh_map = false
        this.$nextTick(() => {
            this.refresh_map = true
          }
        )
      } else if (tab === 'alarm') {
        console.log('show alarm')
        this.showTableTab = false
        this.showMap = false
        this.showMarkers = false
        this.showLocationHistory = false
        this.showAlarm = true
      } else if (tab === 'location-history') {
        this.showTableTab = false
        this.showMap = false
        this.showAlarm = false
        this.showLocationHistory = true
      } else {
        console.log('show table')
        this.showTableTab = true
        this.showMap = false
        this.showMarkers = false
        this.showAlarm = false
        this.showLocationHistory = false
      }
    },
    getClusterStyle(context) {
      const u = context.count / this.data.length
      const hue = ~~interpolate(u, 90, 0)
      const size = ~~interpolate(u, 30, 50)
      return {
        backgroundColor: `hsla(${hue}, 100%, 50%, 0.7)`,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
        borderRadius: `${size / 2}px`,
        border: `1px solid hsla(${hue}, 100%, 40%, 1)`,
        boxShadow: `0 0 1px hsla(${hue}, 100%, 50%, 1)`,
        color: `hsla(${hue}, 100%, 20%, 1)`,
        fontSize: '14px',
        textAlign: 'center'
      }
    },
    getMarkerOptions(point) {
      console.log('getMarkerOptions', point)
      return {
        // position: point.lnglat,
        offset: [-15, -15]
        // content: '<div class="custom-marker" />',
      }
      // return {
      //   offset: [-16, -37],
      //   url: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
      // }
      // return {
      //   position: point.lnglat,
      //   offset: [-15, -15],
      //   content: 'abc'
      // }
    },
    getClusterOptions(context) {
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

      const countResponse = await fetchWithTimeout(`${api.device_export}?${countParams}`, {
        method: 'GET',
        headers: {
          'Access-Token': storage.get(ACCESS_TOKEN),
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }, 15000) // 15秒超时

      if (!countResponse.ok) {
        throw new Error(`HTTP error! status: ${countResponse.status}`)
      }

      const countData = await countResponse.json()
      console.log('countData', countData)
      const totalCount = countData.data.total || 0
      this.totalExportCount = totalCount

      if (totalCount === 0) {
        this.$message.info('没有符合条件的设备可导出')
        return
      }

      // Set up for sliced export
      const SLICE_SIZE = 10
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

        const sliceResponse = await fetchWithTimeout(`${api.device_export}?${sliceParams}`, {
          method: 'GET',
          headers: {
            'Access-Token': storage.get(ACCESS_TOKEN),
            'Accept': 'text/csv',
            'Cache-Control': 'no-cache'
          }
        }, 60000) // 60秒超时，导出数据可能需要更长时间

        if (!sliceResponse.ok) {
          throw new Error(`HTTP error in slice ${currentSlice}! status: ${sliceResponse.status}`)
        }

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
      this.queryData.organization_id = query.organization_id ? parseInt(query.organization_id) : null

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
    },
    $route() {
      this.syncFormFromRouteQuery()
    }
  }
}
</script>

<style>
.popup {
  position: absolute;
  z-index: 1;
}
.custom-marker {
  background-color: hsla(180, 100%, 50%, 0.7);
  height: 28px;
  width: 28px;
  border: 2px solid hsl(180, 100%, 40%);
  border-radius: 50%;
  box-shadow: 0 0 4px hsla(180, 100%, 50%, 0.5);
  text-align: center;
  transition: all 0.3s ease;
}
.custom-marker:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px hsla(180, 100%, 50%, 0.7);
}
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
  padding: 24px 24px 0;
  background: #fff;
  margin-bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.table-operator {
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-operator .ant-btn {
  margin-right: 0;
}

.ant-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.ant-tabs-nav {
  margin-bottom: 16px;
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-radio-group {
  margin-bottom: 8px;
}

.ant-radio-button-wrapper {
  min-width: 100px;
  text-align: center;
}

.ant-radio-group {
  margin-bottom: 8px;
}

.ant-radio-button-wrapper {
  min-width: 100px;
  text-align: center;
}

.map-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.popup {
  position: absolute;
  z-index: 1;
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.alarm-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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

.ant-table-wrapper {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.ant-table {
  border-radius: 8px;
}

.ant-table-thead > tr > th {
  background: #fafafa;
  font-weight: 600;
}

.ant-btn {
  border-radius: 4px;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ant-btn .anticon {
  margin-right: 6px;
}

.ant-input,
.ant-select,
.ant-tree-select {
  border-radius: 4px;
}

.ant-form-item-label {
  font-weight: 500;
}

.export-status {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  word-break: break-all;
}

.export-status span {
  margin-right: 10px;
}

.export-error-actions {
  margin: 10px 0;
  padding: 8px 12px;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  display: flex;
  justify-content: flex-end;
}

.export-error-actions .ant-btn {
  margin-left: 10px;
}
</style>
