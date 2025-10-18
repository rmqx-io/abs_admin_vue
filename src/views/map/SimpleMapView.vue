<template>
  <div class="simple-map-view">
    <a-card :bordered="false" :bodyStyle="{ padding: 0, height: '100vh' }">
      <!-- 地图工具栏 -->
      <div class="map-toolbar">
        <div class="toolbar-left">
          <a-space>
            <a-select
              v-model="selectedProvince"
              placeholder="选择省份"
              style="width: 120px"
              @change="handleProvinceChange"
              allowClear
            >
              <a-select-option
                v-for="province in provinces"
                :key="province.code"
                :value="province.code"
              >
                {{ province.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-model="selectedCity"
              placeholder="选择城市"
              style="width: 120px"
              @change="handleCityChange"
              allowClear
            >
              <a-select-option
                v-for="city in cities"
                :key="city.code"
                :value="city.code"
              >
                {{ city.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-model="deviceType"
              placeholder="设备类型"
              style="width: 120px"
              @change="handleDeviceTypeChange"
              allowClear
            >
              <a-select-option value="smart_switch">智能开关</a-select-option>
              <a-select-option value="smart_light">智能灯</a-select-option>
              <a-select-option value="smart_meter">智能电表</a-select-option>
            </a-select>
          </a-space>
        </div>
        <div class="toolbar-right">
          <a-space>
            <a-tooltip title="刷新数据">
              <a-button
                type="primary"
                icon="reload"
                @click="refreshData"
                :loading="loading"
              >
                刷新
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" />
            <span class="device-count">设备总数: {{ totalDevices }}</span>
            <span class="online-count">在线: {{ onlineDevices }}</span>
            <span class="offline-count">离线: {{ offlineDevices }}</span>
          </a-space>
        </div>
      </div>

      <!-- 地图容器 - 使用列表+卡片模拟地图视图 -->
      <div class="map-container" ref="mapContainer">
        <div class="device-grid">
          <div
            v-for="device in filteredDevices"
            :key="device.id"
            class="device-marker"
            :class="device.status"
            @click="showDeviceDetail(device)"
            @mouseenter="showTooltip(device, $event)"
            @mouseleave="hideTooltip"
          >
            <div class="marker-icon">
              <a-icon :type="getDeviceIcon(device.type)" />
            </div>
            <div class="marker-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-location">{{ getShortAddress(device.address) }}</div>
            </div>
            <div class="status-indicator" :class="device.status"></div>
          </div>
        </div>
      </div>

      <!-- 悬浮提示 -->
      <div
        v-if="tooltipVisible"
        class="device-tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-header">
          <span class="device-name">{{ tooltipDevice.name }}</span>
          <span class="device-status" :class="tooltipDevice.status">
            {{ getStatusText(tooltipDevice.status) }}
          </span>
        </div>
        <div class="tooltip-content">
          <div class="info-row">
            <span class="label">地址：</span>
            <span class="value">{{ getShortAddress(tooltipDevice.address) }}</span>
          </div>
          <div class="info-row">
            <span class="label">安装时间：</span>
            <span class="value">{{ formatDate(tooltipDevice.install_time, 'YYYY-MM-DD') }}</span>
          </div>
          <div class="info-row">
            <span class="label">工作时长：</span>
            <span class="value">{{ formatWorkDuration(tooltipDevice.work_duration) }}</span>
          </div>
          <div class="info-row">
            <span class="label">节能：</span>
            <span class="value">{{ tooltipDevice.energy_saved }}KWH</span>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-icon online"></div>
          <span>在线设备</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon offline"></div>
          <span>离线设备</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon warning"></div>
          <span>告警设备</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon maintenance"></div>
          <span>维护中</span>
        </div>
      </div>
    </a-card>

    <!-- 设备详情弹窗 -->
    <a-modal
      title="设备详情"
      :visible="deviceDetailVisible"
      :footer="null"
      @cancel="handleDetailCancel"
      width="600px"
      :destroyOnClose="true"
    >
      <device-detail-card
        v-if="selectedDevice"
        :device="selectedDevice"
        @close="handleDetailCancel"
      />
    </a-modal>
  </div>
</template>

<script>
import DeviceDetailCard from './components/DeviceDetailCard'
import moment from 'moment'

export default {
  name: 'SimpleMapView',
  components: {
    DeviceDetailCard
  },
  data() {
    return {
      loading: false,
      deviceDetailVisible: false,
      selectedDevice: null,
      
      // 悬浮提示
      tooltipVisible: false,
      tooltipDevice: {},
      tooltipStyle: {},
      
      // 筛选条件
      selectedProvince: undefined,
      selectedCity: undefined,
      deviceType: undefined,
      
      // 统计数据
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      
      // 地区数据
      provinces: [
        { code: '110000', name: '北京市' },
        { code: '120000', name: '天津市' },
        { code: '130000', name: '河北省' },
        { code: '140000', name: '山西省' },
        { code: '310000', name: '上海市' },
        { code: '320000', name: '江苏省' },
        { code: '330000', name: '浙江省' },
        { code: '440000', name: '广东省' }
      ],
      cities: [],
      
      // 模拟设备数据
      devices: []
    }
  },
  computed: {
    filteredDevices() {
      let filtered = this.devices
      
      if (this.selectedProvince) {
        filtered = filtered.filter(d => d.province.includes(this.getProvinceName(this.selectedProvince)))
      }
      
      if (this.selectedCity) {
        filtered = filtered.filter(d => d.city.includes(this.getCityName(this.selectedCity)))
      }
      
      if (this.deviceType) {
        filtered = filtered.filter(d => d.type === this.deviceType)
      }
      
      return filtered
    }
  },
  mounted() {
    this.loadDeviceData()
  },
  methods: {
    loadDeviceData() {
      this.loading = true
      
      // 模拟设备数据
      const mockDevices = [
        {
          id: '001',
          name: '智能开关_001',
          type: 'smart_switch',
          status: 'online',
          province: '北京市',
          city: '朝阳区',
          address: '北京市朝阳区建国门外大街1号',
          install_time: '2024-01-15 10:30:00',
          work_duration: 8760, // 小时
          energy_saved: 1250.5, // KWH
          model: 'SW-2024-001',
          power: '2.5KW',
          last_online: new Date()
        },
        {
          id: '002',
          name: '智能灯_002',
          type: 'smart_light',
          status: 'offline',
          province: '北京市',
          city: '海淀区',
          address: '北京市海淀区中关村大街1号',
          install_time: '2024-02-20 14:15:00',
          work_duration: 6500,
          energy_saved: 890.3,
          model: 'SL-2024-002',
          power: '1.8KW',
          last_online: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: '003',
          name: '智能电表_003',
          type: 'smart_meter',
          status: 'warning',
          province: '上海市',
          city: '浦东新区',
          address: '上海市浦东新区陆家嘴金融街1号',
          install_time: '2024-03-10 09:45:00',
          work_duration: 5200,
          energy_saved: 2100.8,
          model: 'SM-2024-003',
          power: '5.0KW',
          last_online: new Date(Date.now() - 1000 * 60 * 5)
        },
        {
          id: '004',
          name: '智能开关_004',
          type: 'smart_switch',
          status: 'maintenance',
          province: '广东省',
          city: '深圳市',
          address: '广东省深圳市南山区科技园1号',
          install_time: '2024-04-05 16:20:00',
          work_duration: 3800,
          energy_saved: 680.2,
          model: 'SW-2024-004',
          power: '3.2KW',
          last_online: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
          id: '005',
          name: '智能灯_005',
          type: 'smart_light',
          status: 'online',
          province: '江苏省',
          city: '南京市',
          address: '江苏省南京市鼓楼区中山路1号',
          install_time: '2024-05-12 11:30:00',
          work_duration: 2400,
          energy_saved: 450.6,
          model: 'SL-2024-005',
          power: '2.0KW',
          last_online: new Date()
        },
        {
          id: '006',
          name: '智能电表_006',
          type: 'smart_meter',
          status: 'online',
          province: '浙江省',
          city: '杭州市',
          address: '浙江省杭州市西湖区文三路1号',
          install_time: '2024-06-08 14:45:00',
          work_duration: 1800,
          energy_saved: 320.4,
          model: 'SM-2024-006',
          power: '3.5KW',
          last_online: new Date()
        }
      ]

      this.devices = mockDevices
      this.updateStatistics()
      
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },

    updateStatistics() {
      this.totalDevices = this.devices.length
      this.onlineDevices = this.devices.filter(d => d.status === 'online').length
      this.offlineDevices = this.devices.filter(d => d.status === 'offline').length
    },

    showTooltip(device, event) {
      this.tooltipDevice = device
      this.tooltipStyle = {
        left: event.pageX + 10 + 'px',
        top: event.pageY - 10 + 'px'
      }
      this.tooltipVisible = true
    },

    hideTooltip() {
      this.tooltipVisible = false
    },

    showDeviceDetail(device) {
      this.selectedDevice = device
      this.deviceDetailVisible = true
    },

    handleDetailCancel() {
      this.deviceDetailVisible = false
      this.selectedDevice = null
    },

    getDeviceIcon(type) {
      const iconMap = {
        'smart_switch': 'control',
        'smart_light': 'bulb',
        'smart_meter': 'dashboard'
      }
      return iconMap[type] || 'question'
    },

    getStatusText(status) {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'warning': '告警',
        'maintenance': '维护中'
      }
      return statusMap[status] || status
    },

    getShortAddress(fullAddress) {
      const match = fullAddress.match(/^(.{2,3}(?:省|市|自治区)).+?(.{2,3}(?:市|区|县))/)
      if (match) {
        return `${match[1]}${match[2]}`
      }
      return fullAddress.substring(0, 15) + '...'
    },

    formatDate(dateString, format = 'YYYY-MM-DD HH:mm') {
      return moment(dateString).format(format)
    },

    formatWorkDuration(hours) {
      const years = Math.floor(hours / 8760)
      const remainingHours = hours % 8760
      const days = Math.floor(remainingHours / 24)

      let result = ''
      if (years > 0) result += `${years}年`
      if (days > 0) result += `${days}天`

      return result || '少于1天'
    },

    handleProvinceChange(provinceCode) {
      this.selectedCity = undefined
      if (provinceCode) {
        this.loadCitiesByProvince(provinceCode)
      } else {
        this.cities = []
      }
    },

    handleCityChange() {
      // 城市改变时的处理
    },

    handleDeviceTypeChange() {
      // 设备类型改变时的处理
    },

    loadCitiesByProvince(provinceCode) {
      const cityMap = {
        '110000': [
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' },
          { code: '110108', name: '海淀区' }
        ],
        '310000': [
          { code: '310101', name: '黄浦区' },
          { code: '310104', name: '徐汇区' },
          { code: '310115', name: '浦东新区' }
        ],
        '320000': [
          { code: '320100', name: '南京市' },
          { code: '320200', name: '无锡市' },
          { code: '320500', name: '苏州市' }
        ],
        '330000': [
          { code: '330100', name: '杭州市' },
          { code: '330200', name: '宁波市' },
          { code: '330300', name: '温州市' }
        ],
        '440000': [
          { code: '440100', name: '广州市' },
          { code: '440300', name: '深圳市' },
          { code: '440600', name: '佛山市' }
        ]
      }
      this.cities = cityMap[provinceCode] || []
    },

    getProvinceName(code) {
      const province = this.provinces.find(p => p.code === code)
      return province ? province.name : ''
    },

    getCityName(code) {
      const city = this.cities.find(c => c.code === code)
      return city ? city.name : ''
    },

    refreshData() {
      this.loadDeviceData()
    }
  }
}
</script>

<style scoped>
.simple-map-view {
  height: 100vh;
  position: relative;
}

.map-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

.toolbar-right {
  .device-count,
  .online-count,
  .offline-count {
    font-size: 14px;
    margin-left: 16px;
  }
  
  .online-count {
    color: #52c41a;
  }
  
  .offline-count {
    color: #ff4d4f;
  }
}

.map-container {
  height: calc(100vh - 60px);
  margin-top: 60px;
  padding: 20px;
  background: #f5f5f5;
  overflow-y: auto;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.device-marker {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  position: relative;
  border-left: 4px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  &.online {
    border-left-color: #52c41a;
  }

  &.offline {
    border-left-color: #ff4d4f;
  }

  &.warning {
    border-left-color: #faad14;
  }

  &.maintenance {
    border-left-color: #722ed1;
  }

  .marker-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 20px;
    color: #1890ff;
  }

  .marker-info {
    flex: 1;

    .device-name {
      font-size: 16px;
      font-weight: 500;
      color: #262626;
      margin-bottom: 4px;
    }

    .device-location {
      font-size: 13px;
      color: #8c8c8c;
    }
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: absolute;
    top: 12px;
    right: 12px;

    &.online {
      background-color: #52c41a;
    }

    &.offline {
      background-color: #ff4d4f;
    }

    &.warning {
      background-color: #faad14;
    }

    &.maintenance {
      background-color: #722ed1;
    }
  }
}

.device-tooltip {
  position: fixed;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  min-width: 250px;
  pointer-events: none;

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;

    .device-name {
      font-weight: 500;
      color: #262626;
    }

    .device-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.online {
        background-color: #f6ffed;
        color: #52c41a;
      }

      &.offline {
        background-color: #fff2f0;
        color: #ff4d4f;
      }

      &.warning {
        background-color: #fffbe6;
        color: #faad14;
      }

      &.maintenance {
        background-color: #f9f0ff;
        color: #722ed1;
      }
    }
  }

  .tooltip-content {
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;

      .label {
        color: #8c8c8c;
      }

      .value {
        color: #262626;
        font-weight: 500;
      }
    }
  }
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .legend-icon {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;

      &.online {
        background-color: #52c41a;
      }

      &.offline {
        background-color: #ff4d4f;
      }

      &.warning {
        background-color: #faad14;
      }

      &.maintenance {
        background-color: #722ed1;
      }
    }

    span {
      font-size: 12px;
      color: #595959;
    }
  }
}

@media (max-width: 768px) {
  .map-toolbar {
    height: auto;
    flex-direction: column;
    padding: 12px;
    
    .toolbar-left,
    .toolbar-right {
      width: 100%;
      justify-content: center;
      margin-bottom: 8px;
    }
  }

  .map-container {
    margin-top: 100px;
    height: calc(100vh - 100px);
    padding: 12px;
  }

  .device-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .map-legend {
    bottom: 10px;
    right: 10px;
    left: 10px;
    padding: 12px;

    .legend-item {
      display: inline-flex;
      margin-right: 16px;
      margin-bottom: 4px;
    }
  }
}
</style>
