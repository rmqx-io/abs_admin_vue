<template>
  <div class="map-view">
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
            <a-tooltip title="全屏显示">
              <a-button
                icon="fullscreen"
                @click="toggleFullscreen"
              />
            </a-tooltip>
            <a-divider type="vertical" />
            <span class="device-count">设备总数: {{ totalDevices }}</span>
            <span class="online-count">在线: {{ onlineDevices }}</span>
            <span class="offline-count">离线: {{ offlineDevices }}</span>
          </a-space>
        </div>
      </div>

      <!-- 地图容器 -->
      <div id="mapContainer" class="map-container" ref="mapContainer"></div>

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
import AMapLoader from '@amap/amap-jsapi-loader'
import DeviceDetailCard from './components/DeviceDetailCard'
import moment from 'moment'

// 声明全局AMap变量
/* global AMap */

export default {
  name: 'MapView',
  components: {
    DeviceDetailCard
  },
  data() {
    return {
      map: null,
      AMap: null,
      markers: [],
      loading: false,
      deviceDetailVisible: false,
      selectedDevice: null,
      
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
        { code: '150000', name: '内蒙古自治区' },
        { code: '210000', name: '辽宁省' },
        { code: '220000', name: '吉林省' },
        { code: '230000', name: '黑龙江省' },
        { code: '310000', name: '上海市' },
        { code: '320000', name: '江苏省' },
        { code: '330000', name: '浙江省' },
        { code: '340000', name: '安徽省' },
        { code: '350000', name: '福建省' },
        { code: '360000', name: '江西省' },
        { code: '370000', name: '山东省' },
        { code: '410000', name: '河南省' },
        { code: '420000', name: '湖北省' },
        { code: '430000', name: '湖南省' },
        { code: '440000', name: '广东省' },
        { code: '450000', name: '广西壮族自治区' }
      ],
      cities: [],
      
      // 模拟设备数据
      devices: []
    }
  },
  async mounted() {
    await this.initMap()
    this.loadDeviceData()
  },
  beforeDestroy() {
    if (this.map) {
      this.map.destroy()
    }
  },
  methods: {
    async initMap() {
      try {
        const AMap = await AMapLoader.load({
          key: 'your-amap-key', // 需要替换为实际的高德地图API key
          version: '2.0',
          plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.HawkEye', 'AMap.MapType']
        })
        
        // 将AMap存储在组件实例中
        this.AMap = AMap
        
        this.map = new AMap.Map('mapContainer', {
          zoom: 10,
          center: [116.397428, 39.90923], // 北京
          mapStyle: 'amap://styles/grey'
        })

        // 添加地图控件
        this.map.addControl(new AMap.ToolBar())
        this.map.addControl(new AMap.Scale())
        
        // 地图点击事件
        this.map.on('click', this.handleMapClick)
      } catch (error) {
        console.error('地图初始化失败:', error)
        this.$message.error('地图加载失败，请刷新页面重试')
      }
    },

    loadDeviceData() {
      this.loading = true
      
      // 模拟设备数据
      const mockDevices = [
        {
          id: '001',
          name: '智能开关_001',
          type: 'smart_switch',
          status: 'online',
          latitude: 39.9042,
          longitude: 116.4074,
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
          latitude: 39.9142,
          longitude: 116.4174,
          province: '北京市',
          city: '海淀区',
          address: '北京市海淀区中关村大街1号',
          install_time: '2024-02-20 14:15:00',
          work_duration: 6500,
          energy_saved: 890.3,
          model: 'SL-2024-002',
          power: '1.8KW',
          last_online: new Date(Date.now() - 1000 * 60 * 30) // 30分钟前
        },
        {
          id: '003',
          name: '智能电表_003',
          type: 'smart_meter',
          status: 'warning',
          latitude: 39.8942,
          longitude: 116.3874,
          province: '北京市',
          city: '西城区',
          address: '北京市西城区西单大街1号',
          install_time: '2024-03-10 09:45:00',
          work_duration: 5200,
          energy_saved: 2100.8,
          model: 'SM-2024-003',
          power: '5.0KW',
          last_online: new Date(Date.now() - 1000 * 60 * 5) // 5分钟前
        },
        {
          id: '004',
          name: '智能开关_004',
          type: 'smart_switch',
          status: 'maintenance',
          latitude: 39.8842,
          longitude: 116.4274,
          province: '北京市',
          city: '东城区',
          address: '北京市东城区王府井大街1号',
          install_time: '2024-04-05 16:20:00',
          work_duration: 3800,
          energy_saved: 680.2,
          model: 'SW-2024-004',
          power: '3.2KW',
          last_online: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2小时前
        }
      ]

      this.devices = mockDevices
      this.updateStatistics()
      this.updateMapMarkers()
      
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },

    updateStatistics() {
      this.totalDevices = this.devices.length
      this.onlineDevices = this.devices.filter(d => d.status === 'online').length
      this.offlineDevices = this.devices.filter(d => d.status === 'offline').length
    },

    updateMapMarkers() {
      if (!this.map) return

      // 清除现有标记
      this.clearMarkers()

      // 根据筛选条件过滤设备
      let filteredDevices = this.devices
      
      if (this.selectedProvince) {
        filteredDevices = filteredDevices.filter(d => d.province.includes(this.getProvinceName(this.selectedProvince)))
      }
      
      if (this.selectedCity) {
        filteredDevices = filteredDevices.filter(d => d.city.includes(this.getCityName(this.selectedCity)))
      }
      
      if (this.deviceType) {
        filteredDevices = filteredDevices.filter(d => d.type === this.deviceType)
      }

      // 创建标记
      filteredDevices.forEach(device => {
        this.createDeviceMarker(device)
      })

      // 调整地图视野
      if (filteredDevices.length > 0 && this.AMap) {
        const bounds = new this.AMap.Bounds()
        filteredDevices.forEach(device => {
          bounds.extend([device.longitude, device.latitude])
        })
        this.map.setBounds(bounds)
      }
    },

    createDeviceMarker(device) {
      if (!this.AMap) return
      
      const iconUrl = this.getDeviceIcon(device.type, device.status)
      
      const marker = new this.AMap.Marker({
        position: [device.longitude, device.latitude],
        icon: new this.AMap.Icon({
          size: new this.AMap.Size(32, 32),
          image: iconUrl,
          imageSize: new this.AMap.Size(32, 32)
        }),
        title: device.name,
        extData: device
      })

      // 创建信息窗体
      const infoWindow = new this.AMap.InfoWindow({
        content: this.createInfoWindowContent(device),
        offset: new this.AMap.Pixel(0, -32)
      })

      // 鼠标悬停事件
      marker.on('mouseover', () => {
        infoWindow.open(this.map, marker.getPosition())
      })

      // 鼠标离开事件
      marker.on('mouseout', () => {
        infoWindow.close()
      })

      // 点击事件
      marker.on('click', () => {
        this.showDeviceDetail(device)
      })

      this.map.add(marker)
      this.markers.push(marker)
    },

    createInfoWindowContent(device) {
      const workDurationYears = (device.work_duration / 8760).toFixed(1)
      const shortAddress = this.getShortAddress(device.address)
      
      return `
        <div class="device-info-popup">
          <div class="info-header">
            <span class="device-name">${device.name}</span>
            <span class="device-status ${device.status}">${this.getStatusText(device.status)}</span>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">${shortAddress}</span>
            </div>
            <div class="info-row">
              <span class="label">安装时间：</span>
              <span class="value">${moment(device.install_time).format('YYYY-MM-DD')}</span>
            </div>
            <div class="info-row">
              <span class="label">工作时长：</span>
              <span class="value">${workDurationYears}年</span>
            </div>
            <div class="info-row">
              <span class="label">节能：</span>
              <span class="value">${device.energy_saved}KWH</span>
            </div>
          </div>
          <div class="info-footer">
            <span class="click-tip">点击查看详情</span>
          </div>
        </div>
      `
    },

    getDeviceIcon(type, status) {
      const baseUrl = '/icons/devices/'
      const typeMap = {
        'smart_switch': 'switch',
        'smart_light': 'light',
        'smart_meter': 'meter'
      }
      return `${baseUrl}${typeMap[type]}_${status}.png`
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
      // 提取省市区信息
      const match = fullAddress.match(/^(.{2,3}(?:省|市|自治区)).+?(.{2,3}(?:市|区|县))/)
      if (match) {
        return `${match[1]}${match[2]}`
      }
      return fullAddress.substring(0, 10) + '...'
    },

    clearMarkers() {
      this.markers.forEach(marker => {
        this.map.remove(marker)
      })
      this.markers = []
    },

    showDeviceDetail(device) {
      this.selectedDevice = device
      this.deviceDetailVisible = true
    },

    handleDetailCancel() {
      this.deviceDetailVisible = false
      this.selectedDevice = null
    },

    handleProvinceChange(provinceCode) {
      this.selectedCity = undefined
      if (provinceCode) {
        this.loadCitiesByProvince(provinceCode)
      } else {
        this.cities = []
      }
      this.updateMapMarkers()
    },

    handleCityChange() {
      this.updateMapMarkers()
    },

    handleDeviceTypeChange() {
      this.updateMapMarkers()
    },

    loadCitiesByProvince(provinceCode) {
      // 模拟城市数据，实际项目中应该从API获取
      const cityMap = {
        '110000': [
          { code: '110100', name: '市辖区' },
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' },
          { code: '110106', name: '丰台区' },
          { code: '110107', name: '石景山区' },
          { code: '110108', name: '海淀区' }
        ],
        '320000': [
          { code: '320100', name: '南京市' },
          { code: '320200', name: '无锡市' },
          { code: '320300', name: '徐州市' },
          { code: '320400', name: '常州市' },
          { code: '320500', name: '苏州市' }
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
    },

    toggleFullscreen() {
      const mapContainer = this.$refs.mapContainer
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        mapContainer.requestFullscreen()
      }
    },

    handleMapClick() {
      // 地图点击事件处理
    }
  }
}
</script>

<style scoped>
.map-view {
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

/* 信息窗体样式 */
:global(.device-info-popup) {
  width: 280px;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;

    .device-name {
      font-weight: 500;
      font-size: 14px;
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
        border: 1px solid #b7eb8f;
      }

      &.offline {
        background-color: #fff2f0;
        color: #ff4d4f;
        border: 1px solid #ffccc7;
      }

      &.warning {
        background-color: #fffbe6;
        color: #faad14;
        border: 1px solid #ffe58f;
      }

      &.maintenance {
        background-color: #f9f0ff;
        color: #722ed1;
        border: 1px solid #d3adf7;
      }
    }
  }

  .info-content {
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;

      .label {
        color: #8c8c8c;
        min-width: 70px;
      }

      .value {
        color: #262626;
        font-weight: 500;
        text-align: right;
        flex: 1;
      }
    }
  }

  .info-footer {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
    text-align: center;

    .click-tip {
      font-size: 12px;
      color: #1890ff;
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
