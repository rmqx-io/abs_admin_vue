<template>
  <div class="device-playback-panel">
    <div class="playback-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Left Sidebar Panel -->
      <div class="sidebar">
        <!-- Title bar -->
        <div class="sidebar-header-title">
          <a-icon type="left" style="cursor: pointer; margin-right: 8px;" @click="$emit('back')" />
          轨迹回放
        </div>

        <div class="sidebar-content">
          <!-- Search Row -->
          <div class="sidebar-section">
            <div class="device-search-row">
              <a-input
                v-model="localDeviceId"
                placeholder="请输入设备名/IMEI号"
                @pressEnter="loadPlayback"
                size="small"
              >
                <a-icon slot="suffix" type="search" style="cursor: pointer;" @click="loadPlayback" />
              </a-input>
            </div>
          </div>

          <!-- Calendar Row -->
          <div class="sidebar-section">
            <!-- Month navigation -->
            <div class="calendar-month-nav">
              <a-button type="link" size="small" @click="prevCalendarMonth">
                <a-icon type="left" />
              </a-button>
              <span class="calendar-month-title">{{ formatCalendarMonth() }}</span>
              <a-button type="link" size="small" @click="nextCalendarMonth">
                <a-icon type="right" />
              </a-button>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-wrapper">
              <div class="calendar-weekdays">
                <span class="weekday-cell">日</span>
                <span class="weekday-cell">一</span>
                <span class="weekday-cell">二</span>
                <span class="weekday-cell">三</span>
                <span class="weekday-cell">四</span>
                <span class="weekday-cell">五</span>
                <span class="weekday-cell">六</span>
              </div>
              <div class="calendar-days-grid">
                <div
                  v-for="(day, idx) in calendarDays"
                  :key="`day-${idx}`"
                  class="calendar-day-cell"
                  :class="{
                    'other-month': !day.isCurrentMonth,
                    'current-month': day.isCurrentMonth,
                    'selected': isDaySelected(day.date)
                  }"
                  @click="day.isCurrentMonth ? selectCalendarDay(day) : null"
                >
                  <span class="day-number">{{ day.date.date() }}</span>
                  <span class="day-mileage" v-if="day.isCurrentMonth && day.mileage">
                    {{ day.mileage }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time pickers -->
          <div class="sidebar-section">
            <div class="time-pickers-container">
              <div class="time-picker-row">
                <span class="required-star">*</span>
                <span class="time-label">开始时间:</span>
                <a-date-picker
                  v-model="queryData.start_date"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  style="flex: 1;"
                  size="small"
                  :allow-clear="false"
                />
              </div>
              <div class="time-picker-row mt-2">
                <span class="required-star">*</span>
                <span class="time-label">结束时间:</span>
                <a-date-picker
                  v-model="queryData.end_date"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  style="flex: 1;"
                  size="small"
                  :allow-clear="false"
                />
              </div>
            </div>
          </div>

          <!-- Speed & Stay Filters -->
          <div class="sidebar-section">
            <div class="filter-row">
              <div class="speed-control">
                <span class="filter-label">速度:</span>
                <span class="speed-word">慢</span>
                <a-slider
                  v-model="playbackSpeed"
                  :min="0.5"
                  :max="8"
                  :step="0.5"
                  style="flex: 1; margin: 0 8px;"
                  :tooltip-visible="false"
                />
                <span class="speed-word">快</span>
              </div>
              <div class="stay-control">
                <span class="filter-label">停留标示:</span>
                <a-select v-model="stayLimitMinutes" size="small" style="width: 85px;" @change="computeStops">
                  <a-select-option :value="5">5分钟</a-select-option>
                  <a-select-option :value="10">10分钟</a-select-option>
                  <a-select-option :value="30">30分钟</a-select-option>
                  <a-select-option :value="60">1小时</a-select-option>
                  <a-select-option :value="120">2小时</a-select-option>
                </a-select>
              </div>
            </div>

            <!-- Speed bands color bar -->
            <div class="speed-range-bar-container">
              <div class="speed-range-labels">
                <span class="speed-label-badge slow">20Km/H</span>
                <span class="speed-label-badge normal">100Km/H</span>
                <span class="speed-label-badge fast">180Km/H</span>
              </div>
              <div class="speed-range-bar">
                <div class="speed-bar-segment slow-bar"></div>
                <div class="speed-bar-segment normal-bar"></div>
                <div class="speed-bar-segment fast-bar"></div>
              </div>
            </div>
          </div>

          <!-- Quick Date Buttons -->
          <div class="sidebar-section">
            <div class="quick-dates-row">
              <a-button size="small" @click="setQuickDateRange('last_week')">上周</a-button>
              <a-button size="small" @click="setQuickDateRange('this_week')">本周</a-button>
              <a-button size="small" @click="setQuickDateRange('before_yesterday')">前天</a-button>
              <a-button size="small" @click="setQuickDateRange('yesterday')">昨天</a-button>
              <a-button size="small" @click="setQuickDateRange('today')">今天</a-button>
            </div>
          </div>

          <!-- Action Playback Button -->
          <div class="sidebar-section">
            <a-button
              type="primary"
              block
              size="large"
              @click="togglePlayback"
              :disabled="!hasPoints"
              class="start-playback-btn"
            >
              {{ playbackActive ? '停止回放' : '开始回放' }}
            </a-button>
          </div>

          <!-- Bottom Tabs (Stops/Events) -->
          <div class="sidebar-tabs-container">
            <div class="playback-tabs">
              <div
                class="playback-tab"
                :class="{ active: activeTab === 'stops' }"
                @click="activeTab = 'stops'"
              >
                停留({{ stops.length }})
              </div>
              <div
                class="playback-tab"
                :class="{ active: activeTab === 'events' }"
                @click="activeTab = 'events'"
              >
                事件(0)
              </div>
            </div>

            <!-- List Body -->
            <div v-if="activeTab === 'stops'" class="stops-list">
              <div v-if="stops.length === 0" class="stops-empty">
                暂无停留数据
              </div>
              <div
                v-else
                v-for="(stop, idx) in stops"
                :key="`stop-${idx}`"
                :id="`stop-item-${stop.id}`"
                class="stop-item"
                :class="{ 'active': activeStop && activeStop.id === stop.id }"
                @click="selectStop(stop)"
              >
                <div class="stop-header">
                  <span class="stop-badge">{{ stop.duration }}</span>
                  <span class="stop-time">{{ formatStopDate(stop.startTime) }} - {{ formatStopDate(stop.endTime) }}</span>
                </div>
                <div class="stop-address">
                  <span class="stop-id">{{ stop.id }}</span> {{ stop.address }}
                </div>
              </div>
            </div>
            <div v-else class="events-empty">
              暂无事件数据
            </div>
          </div>
        </div>
      </div>

      <!-- Right Map Panel -->
      <div class="map-panel">
        <!-- Sidebar Toggle Button -->
        <div class="sidebar-toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <a-icon :type="sidebarCollapsed ? 'right' : 'left'" />
        </div>

        <!-- Progress Bar Slider -->
        <div class="map-progress-bar">
          <a-slider
            v-model="playbackIndex"
            :min="0"
            :max="Math.max(points.length - 1, 0)"
            :step="1"
            @change="seekPlayback"
            :disabled="!hasPoints"
            style="width: 100%;"
            :tooltip-visible="false"
          />
        </div>

        <!-- Map Legend & Actions Bar -->
        <div class="map-header-bar">
          <!-- Left: Legend -->
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-color-block slow"></span>
              <span class="legend-text">慢速</span>
            </div>
            <div class="legend-item">
              <span class="legend-color-block normal"></span>
              <span class="legend-text">正常</span>
            </div>
            <div class="legend-item">
              <span class="legend-color-block overspeed"></span>
              <span class="legend-text">超速</span>
            </div>
            <div class="legend-item">
              <span class="legend-color-block fast"></span>
              <span class="legend-text">超速 (1.5)</span>
            </div>
          </div>
          <!-- Right: Actions -->
          <div class="map-actions">
            <a-button
              size="small"
              class="action-btn"
              :type="autoFollow ? 'primary' : 'default'"
              @click="autoFollow = !autoFollow"
              v-if="playbackActive"
            >
              {{ autoFollow ? '停止跟随' : '跟随设备' }}
            </a-button>
            <a-button size="small" class="action-btn" @click="zoomToFit" :disabled="!hasPoints">查看全部位置</a-button>
            <a-button size="small" class="action-btn" @click="showSpeedChart" :disabled="!hasPoints">查看速度曲线</a-button>
            <a-button size="small" class="action-btn" @click="detailsVisible = true" :disabled="!hasPoints">明细</a-button>
            <a-button size="small" class="action-btn" @click="printMap">打印</a-button>
          </div>
        </div>

        <a-spin :spinning="map_loading" style="height: 100%;">
          <div v-if="!localDeviceId" class="empty-state">
            请输入设备名或IMEI号加载轨迹。
          </div>
          <div v-else class="map-view">
            <!-- Map Type Switcher -->
            <div class="map-type-switcher" v-if="!useLeaflet && refresh_map">
              <a-select v-model="mapProvider" size="small" style="width: 90px; margin-right: 8px;">
                <a-select-option value="amap">高德地图</a-select-option>
                <a-select-option value="baidu" disabled>百度地图</a-select-option>
              </a-select>
              <div class="map-type-buttons">
                <button
                  class="map-type-btn"
                  :class="{ active: mapType === 'normal' }"
                  @click="setMapType('normal')"
                >
                  地图
                </button>
                <button
                  class="map-type-btn"
                  :class="{ active: mapType === 'satellite' }"
                  @click="setMapType('satellite')"
                >
                  卫星
                </button>
              </div>
            </div>

            <!-- Custom Zoom & Navigation Panel -->
            <div class="map-navigation-panel" v-if="refresh_map">
              <div class="navigation-dpad">
                <button class="dpad-btn up" @click="panMap('up')" title="向上平移">
                  <a-icon type="up" />
                </button>
                <button class="dpad-btn left" @click="panMap('left')" title="向左平移">
                  <a-icon type="left" />
                </button>
                <button class="dpad-btn center-btn" @click="recenterMap" title="居中设备/重置">
                  <a-icon type="aim" />
                </button>
                <button class="dpad-btn right" @click="panMap('right')" title="向右平移">
                  <a-icon type="right" />
                </button>
                <button class="dpad-btn down" @click="panMap('down')" title="向下平移">
                  <a-icon type="down" />
                </button>
              </div>
              <div class="navigation-zoom">
                <button class="zoom-btn plus" @click="zoomIn" title="放大">
                  <a-icon type="plus" />
                </button>
                <div class="zoom-divider"></div>
                <button class="zoom-btn minus" @click="zoomOut" title="缩小">
                  <a-icon type="minus" />
                </button>
              </div>
            </div>

            <!-- AMap for Chinese users -->
            <amap
              v-if="!useLeaflet && refresh_map"
              ref="amap"
              :zoom="zoom"
              :center="center"
              style="height: calc(100vh - 60px); width: 100%"
              @complete="onMapComplete"
            >
              <!-- Polyline segments for speed color rendering -->
              <amap-polyline
                v-for="(segment, idx) in polylineSegments"
                :key="`segment-${idx}`"
                :path="segment.path"
                :stroke-color="segment.color"
                :stroke-opacity="1"
                :stroke-weight="6"
                stroke-style="solid"
              />

              <!-- Stop point markers (P-markers) -->
              <amap-marker
                v-for="(stop, idx) in stops"
                :key="`stop-marker-${idx}`"
                :position="[stop.longitude, stop.latitude]"
                :offset="[-12, -12]"
              >
                <div class="map-stop-marker" @click="activeStop = stop">
                  <span class="stop-marker-p">P</span>
                </div>
              </amap-marker>

              <!-- Stop point info window -->
              <amap-info-window
                v-if="activeStop"
                :position="[activeStop.longitude, activeStop.latitude]"
                :visible="activeStop !== null"
                @close="activeStop = null"
                :offset="[0, -15]"
              >
                <div class="stop-info-window">
                  <div class="info-row"><b>序号:</b> {{ activeStop.id }}</div>
                  <div class="info-row"><b>设备名称:</b> {{ localDeviceId }}</div>
                  <div class="info-row"><b>停留:</b> {{ activeStop.duration }}</div>
                  <div class="info-row"><b>开始:</b> {{ formatStopDateLong(activeStop.startTime) }}</div>
                  <div class="info-row"><b>结束:</b> {{ formatStopDateLong(activeStop.endTime) }}</div>
                  <div class="info-action" @click="showStopDetail(activeStop)" style="cursor: pointer;">点击可查看详情</div>
                </div>
              </amap-info-window>

              <!-- Current Playback moving vehicle marker -->
              <amap-marker
                v-if="currentPoint"
                :position="[currentPoint.longitude, currentPoint.latitude]"
                :offset="[-12, -12]"
              >
                <div class="playback-vehicle-marker" :style="{ transform: `rotate(${currentPoint.heading || 0}deg)` }">
                  <div class="vehicle-arrow"></div>
                </div>
              </amap-marker>

              <!-- Vehicle active info window -->
              <amap-info-window
                v-if="currentPoint"
                :position="[currentPoint.longitude, currentPoint.latitude]"
                :visible="true"
                :offset="[0, -20]"
                :is-custom="true"
              >
                <div class="vehicle-tooltip">
                  <div>设备名称:{{ localDeviceId }}</div>
                  <div>速度:{{ (currentPoint.speed || 0).toFixed(1) }}公里/小时</div>
                  <div>追踪距离:{{ (currentPoint.cumulativeDistance || 0).toFixed(3) }}公里 <span class="blue-help-btn">[?]</span></div>
                  <div>定位:{{ formatStopDateLong(currentPoint.time_tracking) }}</div>
                  <div>运行:{{ formatRunningTime() }}</div>
                </div>
              </amap-info-window>
            </amap>

            <!-- Leaflet for English users -->
            <l-map
              v-else-if="useLeaflet && refresh_map"
              ref="leafletMap"
              :zoom="zoom"
              :center="center"
              :zoom-control="false"
              height="calc(100vh - 60px)"
              @ready="onLeafletMapReady"
              @complete="onMapComplete"
            />
          </div>
        </a-spin>
      </div>
    </div>

    <!-- Speed chart modal -->
    <a-modal
      title="速度曲线"
      :visible="speedChartVisible"
      width="70%"
      @cancel="speedChartVisible = false"
      :footer="null"
      :destroyOnClose="true"
    >
      <div ref="speedChart" style="height: 400px; width: 100%;"></div>
    </a-modal>

    <!-- Stop details modal -->
    <a-modal
      :title="$i18n.locale && $i18n.locale.startsWith('en') ? 'Stop Details' : '停留详情'"
      :visible="stopDetailVisible"
      width="500px"
      @cancel="stopDetailVisible = false"
      :footer="null"
      :destroyOnClose="true"
    >
      <div v-if="selectedStopDetail" class="stop-detail-modal-content">
        <a-descriptions bordered :column="1" size="small">
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'Device Name' : '设备名称'">
            {{ localDeviceId }}
          </a-descriptions-item>
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'Stop ID' : '停留序号'">
            {{ selectedStopDetail.id }}
          </a-descriptions-item>
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'Duration' : '停留时间'">
            {{ selectedStopDetail.duration }}
          </a-descriptions-item>
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'Start Time' : '开始时间'">
            {{ formatStopDateLong(selectedStopDetail.startTime) }}
          </a-descriptions-item>
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'End Time' : '结束时间'">
            {{ formatStopDateLong(selectedStopDetail.endTime) }}
          </a-descriptions-item>
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'Coordinates' : '停留坐标'">
            {{ (selectedStopDetail.longitude || 0).toFixed(6) }}, {{ (selectedStopDetail.latitude || 0).toFixed(6) }}
          </a-descriptions-item>
          <a-descriptions-item :label="$i18n.locale && $i18n.locale.startsWith('en') ? 'Address' : '停留地址'">
            {{ selectedStopDetail.address }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- Track details drawer -->
    <a-drawer
      title="轨迹明细"
      placement="right"
      :width="600"
      :visible="detailsVisible"
      @close="detailsVisible = false"
    >
      <a-table
        :columns="detailsColumns"
        :data-source="points"
        :rowKey="(record, idx) => `point-${idx}`"
        size="small"
        :pagination="{ pageSize: 20 }"
      >
        <template slot="time" slot-scope="text">
          {{ formatStopDateLong(text) }}
        </template>
        <template slot="speed" slot-scope="text">
          {{ (text || 0).toFixed(1) }} km/h
        </template>
        <template slot="coords" slot-scope="text, record">
          {{ (record.longitude || 0).toFixed(5) }}, {{ (record.latitude || 0).toFixed(5) }}
        </template>
      </a-table>
    </a-drawer>
  </div>
</template>

<script>
import moment from 'moment'
import { getLocation } from '@/api/manage'
import LMap from '@/components/leaflet/LMap.vue'
import * as echarts from 'echarts'

export default {
  name: 'DevicePlaybackPanel',
  components: {
    LMap
  },
  props: {
    deviceId: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      sidebarCollapsed: false,
      map_loading: false,
      refresh_map: true,
      zoom: 12,
      center: [116.397428, 39.90923],
      localDeviceId: '',
      queryData: {
        start_date: moment().startOf('day'),
        end_date: moment().endOf('day')
      },
      points: [],
      polylineSegments: [],
      playbackActive: false,
      playbackSpeed: 1,
      playbackIndex: 0,
      playbackTimer: null,
      stayLimitMinutes: 5,
      calendarMonth: moment(),
      activeTab: 'stops',
      stops: [],
      activeStop: null,
      speedChartVisible: false,
      detailsVisible: false,
      stopDetailVisible: false,
      selectedStopDetail: null,
      myChart: null,
      mapProvider: 'amap',
      mapType: 'normal',
      satelliteLayer: null,
      roadNetLayer: null,
      leafletLayers: [],
      leafletCurrentMarker: null,
      detailsColumns: [
        { title: '时间', dataIndex: 'time_tracking', scopedSlots: { customRender: 'time' } },
        { title: '速度', dataIndex: 'speed', scopedSlots: { customRender: 'speed' } },
        { title: '经纬度', scopedSlots: { customRender: 'coords' } }
      ],
      mileageCache: {}, // { 'deviceId': { 'YYYY-MM-DD': mileage } }
      autoFollow: true
    }
  },
  computed: {
    hasPoints () {
      return this.points.length > 0
    },
    currentPoint () {
      return this.points[this.playbackIndex] || null
    },
    useLeaflet () {
      return this.$i18n.locale && this.$i18n.locale.startsWith('en')
    },
    calendarDays () {
      const startOfMonth = moment(this.calendarMonth).startOf('month')
      const endOfMonth = moment(this.calendarMonth).endOf('month')
      const startDayOfWeek = startOfMonth.day() // Sunday = 0
      const daysInMonth = startOfMonth.daysInMonth()

      const days = []

      // Filler days from previous month
      const prevMonth = moment(startOfMonth).subtract(1, 'month')
      const daysInPrevMonth = prevMonth.daysInMonth()
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = moment(prevMonth).date(daysInPrevMonth - i)
        days.push({
          date: day,
          isCurrentMonth: false,
          mileage: null
        })
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const day = moment(startOfMonth).date(i)
        days.push({
          date: day,
          isCurrentMonth: true,
          mileage: this.getDailyMileage(day)
        })
      }

      // Filler days from next month
      const remaining = 42 - days.length
      const nextMonth = moment(startOfMonth).add(1, 'month')
      for (let i = 1; i <= remaining; i++) {
        const day = moment(nextMonth).date(i)
        days.push({
          date: day,
          isCurrentMonth: false,
          mileage: null
        })
      }

      return days
    }
  },
  watch: {
    playbackActive (value) {
      if (value) {
        this.startPlaybackLoop()
      } else {
        this.stopPlaybackLoop()
      }
    },
    playbackSpeed () {
      if (this.playbackActive) {
        this.startPlaybackLoop()
      }
    },
    deviceId: {
      immediate: true,
      handler (val) {
        this.localDeviceId = val
        if (val) {
          this.$nextTick(() => {
            this.loadPlayback()
          })
        }
      }
    },
    'queryData.start_date' (newVal) {
      if (newVal) {
        this.calendarMonth = moment(newVal)
      }
    },
    sidebarCollapsed (val) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.useLeaflet && this.leafletMap) {
            this.leafletMap.invalidateSize()
          }
          window.dispatchEvent(new Event('resize'))
        }, 350)
      })
    },
    activeStop (newStop) {
      if (newStop) {
        this.$nextTick(() => {
          const el = document.getElementById(`stop-item-${newStop.id}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        })
      }
    }
  },
  mounted () {
    if (this.deviceId) {
      this.localDeviceId = this.deviceId
      this.loadPlayback()
    }
  },
  beforeDestroy () {
    this.stopPlaybackLoop()
    if (this.myChart) {
      this.myChart.dispose()
    }
  },
  methods: {
    loadPlayback () {
      if (!this.localDeviceId) {
        return
      }
      // Stop ongoing playback and clear current results to avoid stale data
      this.playbackActive = false
      this.points = []
      this.polylineSegments = []
      this.stops = []
      this.playbackIndex = 0

      this.map_loading = true
      const payload = this.buildQueryPayload()

      getLocation(this.localDeviceId, payload)
        .then(res => {
          const rawPoints = Array.isArray(res.data) ? res.data : []
          const validPoints = rawPoints
            .filter(item => item.mars_longitude && item.mars_latitude)
            .map(item => {
              const speed = Number(item.speed || 0) / 10.0
              const mileage = Number(item.mileage || 0) / 10.0
              return {
                longitude: Number(item.mars_longitude),
                latitude: Number(item.mars_latitude),
                speed: speed,
                heading: Number(item.heading || 0),
                time_tracking: item.time_tracking || '',
                mileage: mileage
              }
            })

          // Calculate cumulative haversine distances
          let cumulative = 0
          for (let i = 0; i < validPoints.length; i++) {
            if (i > 0) {
              const prev = validPoints[i - 1]
              const curr = validPoints[i]
              const dist = this.calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
              cumulative += dist
            }
            validPoints[i].cumulativeDistance = cumulative
          }

          this.points = validPoints

          // Cache the daily mileage
          if (validPoints.length > 0) {
            const lastPoint = validPoints[validPoints.length - 1]
            const dayKey = moment(this.queryData.start_date).format('YYYY-MM-DD')
            if (!this.mileageCache[this.localDeviceId]) {
              this.$set(this.mileageCache, this.localDeviceId, {})
            }
            this.$set(this.mileageCache[this.localDeviceId], dayKey, lastPoint.cumulativeDistance.toFixed(2))
          }

          this.playbackIndex = 0
          this.buildSegments()
          this.computeStops()
          this.autoFollow = true

          if (this.currentPoint) {
            this.center = [this.currentPoint.longitude, this.currentPoint.latitude]
          }
          this.refresh_map = false
          this.$nextTick(() => {
            this.refresh_map = true
            this.updateLeafletElements()
          })
        })
        .catch(err => {
          console.error('Failed to load playback track:', err)
          this.$message.error('Failed to load playback track.')
        })
        .finally(() => {
          this.map_loading = false
        })
    },
    buildQueryPayload () {
      const payload = {}
      if (this.queryData.start_date) {
        const startISO = moment(this.queryData.start_date).toISOString()
        payload.start_date = startISO
        payload.start_time = startISO
      }
      if (this.queryData.end_date) {
        const endISO = moment(this.queryData.end_date).toISOString()
        payload.end_date = endISO
        payload.end_time = endISO
      }
      return payload
    },
    calculateDistance (lat1, lon1, lat2, lon2) {
      const R = 6371 // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },
    buildSegments () {
      const segments = []
      let currentSegment = null
      let lastCategory = null

      this.points.forEach(point => {
        const category = this.getSpeedCategory(point.speed)
        const color = this.getSegmentColor(point.speed)

        if (!currentSegment || lastCategory !== category) {
          const lastPoint = currentSegment && currentSegment.path.length > 0
            ? currentSegment.path[currentSegment.path.length - 1]
            : null
          currentSegment = {
            path: [],
            color
          }
          if (lastPoint) {
            currentSegment.path.push(lastPoint)
          }
          segments.push(currentSegment)
        }

        currentSegment.path.push([point.longitude, point.latitude])
        lastCategory = category
      })

      this.polylineSegments = segments
    },
    getSpeedCategory (speed) {
      if (speed < 20) return 'slow'
      if (speed < 100) return 'normal'
      if (speed < 180) return 'overspeed'
      return 'fast'
    },
    getSegmentColor (speed) {
      if (speed < 20) return '#2f54eb' // Slow = Royal Blue
      if (speed < 100) return '#52c41a' // Normal = Green
      if (speed < 180) return '#f5222d' // Overspeed = Red
      return '#820014' // Fast = Dark Red
    },
    computeStops () {
      if (this.points.length === 0) {
        this.stops = []
        return
      }

      const stops = []
      const limitMs = this.stayLimitMinutes * 60 * 1000
      let startIdx = null

      for (let i = 0; i < this.points.length; i++) {
        const isLowSpeed = this.points[i].speed <= 1.0

        if (isLowSpeed) {
          if (startIdx === null) {
            startIdx = i
          }
        } else {
          if (startIdx !== null) {
            const durationMs = moment(this.points[i - 1].time_tracking).diff(moment(this.points[startIdx].time_tracking))
            if (durationMs >= limitMs) {
              stops.push(this.createStopObject(stops.length + 1, startIdx, i - 1, durationMs))
            }
            startIdx = null
          }
        }
      }

      // Final segment check
      if (startIdx !== null) {
        const durationMs = moment(this.points[this.points.length - 1].time_tracking).diff(moment(this.points[startIdx].time_tracking))
        if (durationMs >= limitMs) {
          stops.push(this.createStopObject(stops.length + 1, startIdx, this.points.length - 1, durationMs))
        }
      }

      this.stops = stops
      this.fetchAddressForStops()
    },
    createStopObject (index, startIdx, endIdx, durationMs) {
      const startPoint = this.points[startIdx]
      const loadingText = (this.$i18n.locale && this.$i18n.locale.startsWith('en')) ? 'Loading address...' : '正在加载地址...'
      return {
        id: `P${index}`,
        startIndex: startIdx,
        endIndex: endIdx,
        startTime: startPoint.time_tracking,
        endTime: this.points[endIdx].time_tracking,
        duration: this.formatDuration(durationMs),
        longitude: startPoint.longitude,
        latitude: startPoint.latitude,
        address: loadingText
      }
    },
    formatDuration (ms) {
      const duration = moment.duration(ms)
      const hours = Math.floor(duration.asHours())
      const minutes = duration.minutes()
      const seconds = duration.seconds()

      const parts = []
      if (hours > 0) parts.push(`${hours}小时`)
      if (minutes > 0 || hours > 0) parts.push(`${minutes}分钟`)
      parts.push(`${seconds}秒`)
      return parts.join('')
    },
    fetchAddressForStops () {
      this.stops.forEach(stop => {
        this.getAddress(stop.longitude, stop.latitude, (addr) => {
          stop.address = addr
        })
      })
    },
    getAddress (lng, lat, callback) {
      if (window.AMap && window.AMap.Geocoder) {
        const geocoder = new window.AMap.Geocoder()
        geocoder.getAddress([lng, lat], (status, result) => {
          if (status === 'complete' && result.regeocode) {
            callback(result.regeocode.formattedAddress)
          } else {
            this.fallbackGetAddress(lng, lat, callback)
          }
        })
      } else {
        this.fallbackGetAddress(lng, lat, callback)
      }
    },
    fallbackGetAddress (lng, lat, callback) {
      const isEn = this.$i18n.locale && this.$i18n.locale.startsWith('en')
      const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}${isEn ? '&lang=en' : ''}`
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok')
          return res.json()
        })
        .then(data => {
          if (data && data.features && data.features.length > 0) {
            const p = data.features[0].properties
            const parts = []

            const name = p.name
            const housenumber = p.housenumber
            const street = p.street
            const district = p.district
            const city = p.city
            const state = p.state
            const country = p.country

            if (isEn) {
              if (name) parts.push(name)
              if (housenumber) parts.push(housenumber)
              if (street && street !== name) parts.push(street)
              if (district) parts.push(district)
              if (city) parts.push(city)
              if (state) parts.push(state)
              if (country) parts.push(country)
              callback(parts.join(', '))
            } else {
              if (country) parts.push(country)
              if (state) parts.push(state)
              if (city && city !== state) parts.push(city)
              if (district) parts.push(district)
              if (street) parts.push(street)
              if (housenumber) parts.push(housenumber)
              if (name && name !== street) parts.push(name)
              callback(parts.join(''))
            }
          } else {
            const errText = isEn ? 'Address lookup failed' : '获取地址失败'
            callback(errText)
          }
        })
        .catch(() => {
          const errText = isEn ? 'Address lookup failed' : '获取地址失败'
          callback(errText)
        })
    },
    selectStop (stop) {
      this.center = [stop.longitude, stop.latitude]
      this.zoom = 15
      this.activeStop = stop
    },
    showStopDetail (stop) {
      this.selectedStopDetail = stop
      this.stopDetailVisible = true
    },
    togglePlayback () {
      if (!this.hasPoints) {
        return
      }
      this.playbackActive = !this.playbackActive
    },
    startPlaybackLoop () {
      this.stopPlaybackLoop()
      this.playbackTimer = setInterval(() => {
        if (this.playbackIndex < this.points.length - 1) {
          this.playbackIndex = Math.min(this.playbackIndex + 1, this.points.length - 1)
          if (this.autoFollow) {
            this.center = [this.currentPoint.longitude, this.currentPoint.latitude]
          }

          if (this.useLeaflet && this.leafletCurrentMarker) {
            this.leafletCurrentMarker.setLatLng([this.currentPoint.latitude, this.currentPoint.longitude])
            this.leafletCurrentMarker.setPopupContent(`
              <div>
                <p><b>设备名称:</b> ${this.localDeviceId}</p>
                <p><b>速度:</b> ${this.currentPoint.speed.toFixed(1)} km/h</p>
                <p><b>追踪距离:</b> ${this.currentPoint.cumulativeDistance.toFixed(3)} km</p>
                <p><b>定位:</b> ${this.formatStopDateLong(this.currentPoint.time_tracking)}</p>
              </div>
            `)
          }
        } else {
          this.playbackActive = false
        }
      }, 1000 / this.playbackSpeed)
    },
    stopPlaybackLoop () {
      if (this.playbackTimer) {
        clearInterval(this.playbackTimer)
        this.playbackTimer = null
      }
    },
    seekPlayback (value) {
      this.playbackIndex = Number(value)
      if (this.currentPoint) {
        this.center = [this.currentPoint.longitude, this.currentPoint.latitude]
      }
    },
    zoomToFit () {
      if (!this.hasPoints) {
        return
      }

      this.autoFollow = false

      // Calculate the bounding box for all points
      let minLng = Infinity; let maxLng = -Infinity
      let minLat = Infinity; let maxLat = -Infinity
      for (const p of this.points) {
        if (p.longitude < minLng) minLng = p.longitude
        if (p.longitude > maxLng) maxLng = p.longitude
        if (p.latitude < minLat) minLat = p.latitude
        if (p.latitude > maxLat) maxLat = p.latitude
      }

      // Leaflet: pure imperative fitBounds, no Vue reactivity needed
      if (this.useLeaflet && this.leafletMap) {
        this.leafletMap.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [50, 50] })
        return
      }

      // AMap: call setBounds directly on the map instance — bypass Vue prop binding
      // entirely so that repeated clicks always work regardless of this.center state.
      // @amap/amap-vue exposes the underlying AMap.Map via .$map (computed) or
      // .$amap.context.target; $$getInstance / .map are not part of this package's API.
      if (!this.useLeaflet && this.$refs.amap) {
        const mapInstance = this.$refs.amap.$map ||
          (this.$refs.amap.$amap && this.$refs.amap.$amap.context && this.$refs.amap.$amap.context.target) ||
          (this.$refs.amap.$$getInstance ? this.$refs.amap.$$getInstance() : this.$refs.amap.map)
        if (mapInstance && window.AMap) {
          if (window.AMap.Bounds && window.AMap.LngLat) {
            // Preferred path: explicit bounds object, reliable for repeated calls
            const sw = new window.AMap.LngLat(minLng, minLat)
            const ne = new window.AMap.LngLat(maxLng, maxLat)
            mapInstance.setBounds(new window.AMap.Bounds(sw, ne), false, [50, 50, 50, 50])
          } else if (typeof mapInstance.setFitView === 'function') {
            // Fallback to setFitView with all overlays
            mapInstance.setFitView(mapInstance.getAllOverlays(), false, [50, 50, 50, 50])
          }
          return
        }
      }

      // Last resort: drive via Vue reactivity using zoom heuristic
      this.center = [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
      const maxDiff = Math.max(maxLat - minLat, maxLng - minLng)
      if (maxDiff < 0.005) this.zoom = 16
      else if (maxDiff < 0.02) this.zoom = 14
      else if (maxDiff < 0.05) this.zoom = 13
      else if (maxDiff < 0.1) this.zoom = 12
      else if (maxDiff < 0.5) this.zoom = 10
      else if (maxDiff < 1) this.zoom = 8
      else this.zoom = 6
    },
    zoomIn () {
      const maxZoom = this.useLeaflet ? 19 : 18
      if (this.zoom < maxZoom) {
        this.zoom += 1
      }
    },
    zoomOut () {
      if (this.zoom > 3) {
        this.zoom -= 1
      }
    },
    panMap (direction) {
      const latStep = 0.005 * Math.pow(2, 15 - this.zoom)
      const lngStep = 0.005 * Math.pow(2, 15 - this.zoom)
      let [lng, lat] = this.center
      if (direction === 'up') lat += latStep
      else if (direction === 'down') lat -= latStep
      else if (direction === 'left') lng -= lngStep
      else if (direction === 'right') lng += lngStep

      this.center = [lng, lat]

      // For Leaflet, setView explicitly to be fast and responsive
      if (this.useLeaflet && this.leafletMap) {
        this.leafletMap.setView([lat, lng], this.zoom)
      }
    },
    recenterMap () {
      if (this.currentPoint) {
        this.center = [this.currentPoint.longitude, this.currentPoint.latitude]
        if (this.useLeaflet && this.leafletMap) {
          this.leafletMap.setView([this.currentPoint.latitude, this.currentPoint.longitude], this.zoom)
        }
      } else if (this.hasPoints) {
        this.zoomToFit()
      }
    },
    formatRunningTime () {
      if (this.points.length === 0 || !this.currentPoint) return '0分0秒'
      const start = moment(this.points[0].time_tracking)
      const current = moment(this.currentPoint.time_tracking)
      const diffMs = current.diff(start)
      const duration = moment.duration(diffMs)

      const hours = Math.floor(duration.asHours())
      const minutes = duration.minutes()
      const seconds = duration.seconds()

      if (hours > 0) {
        return `${hours}小时${minutes}分${seconds}秒`
      }
      return `${minutes}分${seconds}秒`
    },
    getDailyMileage (date) {
      if (!this.localDeviceId) return null

      const dayKey = date.format('YYYY-MM-DD')
      if (this.mileageCache[this.localDeviceId] && this.mileageCache[this.localDeviceId][dayKey]) {
        return this.mileageCache[this.localDeviceId][dayKey]
      }

      // Fallback: If loaded track matches this date, return actual cumulative distance
      // We also verify that the points actually belong to the requested date
      if (this.points.length > 0 && date.isSame(this.queryData.start_date, 'day')) {
        const firstPointDate = this.points[0].time_tracking
        if (firstPointDate && moment(firstPointDate).isSame(date, 'day')) {
          const totalDistance = this.points[this.points.length - 1].cumulativeDistance
          const formattedMileage = totalDistance > 0 ? totalDistance.toFixed(2) : '0.00'

          // Also update cache if we found it through current points
          if (!this.mileageCache[this.localDeviceId]) {
            this.$set(this.mileageCache, this.localDeviceId, {})
          }
          this.$set(this.mileageCache[this.localDeviceId], dayKey, formattedMileage)

          return formattedMileage
        }
      }

      return null
    },
    isDaySelected (date) {
      return date.isSame(this.queryData.start_date, 'day')
    },
    selectCalendarDay (day) {
      const start = moment(day.date).startOf('day')
      const end = moment(day.date).endOf('day')

      this.queryData.start_date = start
      this.queryData.end_date = end

      this.loadPlayback()
    },
    prevCalendarMonth () {
      this.calendarMonth = moment(this.calendarMonth).subtract(1, 'month')
    },
    nextCalendarMonth () {
      this.calendarMonth = moment(this.calendarMonth).add(1, 'month')
    },
    formatCalendarMonth () {
      return this.calendarMonth.format('YYYY年M月')
    },
    setQuickDateRange (type) {
      let start, end
      if (type === 'today') {
        start = moment().startOf('day')
        end = moment().endOf('day')
      } else if (type === 'yesterday') {
        start = moment().subtract(1, 'days').startOf('day')
        end = moment().subtract(1, 'days').endOf('day')
      } else if (type === 'before_yesterday') {
        start = moment().subtract(2, 'days').startOf('day')
        end = moment().subtract(2, 'days').endOf('day')
      } else if (type === 'this_week') {
        start = moment().startOf('week')
        end = moment().endOf('week')
      } else if (type === 'last_week') {
        start = moment().subtract(1, 'weeks').startOf('week')
        end = moment().subtract(1, 'weeks').endOf('week')
      }

      this.queryData.start_date = start
      this.queryData.end_date = end

      this.loadPlayback()
    },
    formatStopDate (dateStr) {
      if (!dateStr) return ''
      return moment(dateStr).format('YYYY/M/D HH:mm:ss')
    },
    formatStopDateLong (dateStr) {
      if (!dateStr) return ''
      return moment(dateStr).format('YYYY/M/D HH:mm:ss')
    },
    showSpeedChart () {
      this.speedChartVisible = true
      this.$nextTick(() => {
        const chartDom = this.$refs.speedChart
        if (!chartDom) return

        if (this.myChart) {
          this.myChart.dispose()
        }

        this.myChart = echarts.init(chartDom)

        const xAxisData = this.points.map(p => moment(p.time_tracking).format('HH:mm:ss'))
        const seriesData = this.points.map(p => p.speed)

        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>速度: {c} km/h'
          },
          xAxis: {
            type: 'category',
            data: xAxisData,
            name: '时间'
          },
          yAxis: {
            type: 'value',
            name: '速度(km/h)'
          },
          series: [
            {
              data: seriesData,
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#1890ff'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(24,144,255,0.3)' },
                  { offset: 1, color: 'rgba(24,144,255,0)' }
                ])
              }
            }
          ]
        }

        this.myChart.setOption(option)
      })
    },
    printMap () {
      window.print()
    },
    setMapType (type) {
      this.mapType = type
      const mapComponent = this.$refs.amap
      if (!mapComponent) return

      const map = mapComponent.$map || (mapComponent.$amap && mapComponent.$amap.context && mapComponent.$amap.context.target)
      if (!map) return

      if (type === 'satellite') {
        if (!this.satelliteLayer) {
          this.satelliteLayer = new window.AMap.TileLayer.Satellite()
          this.roadNetLayer = new window.AMap.TileLayer.RoadNet()
        }
        map.add([this.satelliteLayer, this.roadNetLayer])
      } else {
        if (this.satelliteLayer) {
          map.remove([this.satelliteLayer, this.roadNetLayer])
        }
      }
    },
    onMapComplete () {
      // Setup default map layer type
      if (this.mapType === 'satellite') {
        this.setMapType('satellite')
      }

      // Register event listeners to sync zoom and center
      const mapComponent = this.$refs.amap
      if (mapComponent) {
        const map = mapComponent.$map || (mapComponent.$amap && mapComponent.$amap.context && mapComponent.$amap.context.target)
        if (map) {
          map.on('zoomchange', () => {
            this.zoom = map.getZoom()
          })
          map.on('moveend', () => {
            const c = map.getCenter()
            this.center = [c.lng, c.lat]
          })
        }
      }
    },
    onLeafletMapReady (map) {
      this.leafletMap = map
      this.leafletMap.on('popupopen', (e) => {
        const popupEl = e.popup.getElement()
        if (popupEl) {
          const btn = popupEl.querySelector('.leaflet-detail-btn')
          if (btn && this.activeStop) {
            btn.onclick = () => {
              this.showStopDetail(this.activeStop)
            }
          }
        }
      })
      this.leafletMap.on('zoomend', () => {
        this.zoom = this.leafletMap.getZoom()
      })
      this.leafletMap.on('moveend', () => {
        const c = this.leafletMap.getCenter()
        this.center = [c.lng, c.lat]
      })
      this.updateLeafletElements()
    },
    updateLeafletElements () {
      if (!this.useLeaflet || !this.leafletMap) return

      if (this.leafletLayers) {
        this.leafletLayers.forEach(layer => this.leafletMap.removeLayer(layer))
      }
      this.leafletLayers = []

      // Draw polyline segments
      this.polylineSegments.forEach(segment => {
        const leafletPath = segment.path.map(p => [p[1], p[0]])
        const polyline = L.polyline(leafletPath, {
          color: segment.color,
          weight: 6,
          opacity: 1
        }).addTo(this.leafletMap)
        this.leafletLayers.push(polyline)
      })

      // Draw stop markers
      this.stops.forEach(stop => {
        const marker = L.circleMarker([stop.latitude, stop.longitude], {
          radius: 12,
          fillColor: '#ff7a45',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(this.leafletMap)

        marker.on('click', () => {
          this.activeStop = stop
        })

        const isEn = this.$i18n.locale && this.$i18n.locale.startsWith('en')
        const detailsText = isEn ? 'Click to view details' : '点击可查看详情'

        marker.bindPopup(`
          <div class="stop-info-window">
            <div class="info-row"><b>${isEn ? 'ID' : '序号'}:</b> ${stop.id}</div>
            <div class="info-row"><b>${isEn ? 'Device Name' : '设备名称'}:</b> ${this.localDeviceId}</div>
            <div class="info-row"><b>${isEn ? 'Stay' : '停留'}:</b> ${stop.duration}</div>
            <div class="info-row"><b>${isEn ? 'Start' : '开始'}:</b> ${this.formatStopDateLong(stop.startTime)}</div>
            <div class="info-row"><b>${isEn ? 'End' : '结束'}:</b> ${this.formatStopDateLong(stop.endTime)}</div>
            <div class="info-action leaflet-detail-btn" style="cursor: pointer; margin-top: 6px;">${detailsText}</div>
          </div>
        `)

        this.leafletLayers.push(marker)
      })

      // Draw current marker
      if (this.currentPoint) {
        this.leafletCurrentMarker = L.circleMarker([this.currentPoint.latitude, this.currentPoint.longitude], {
          radius: 8,
          fillColor: '#ff7a45',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(this.leafletMap)

        this.leafletCurrentMarker.bindPopup(`
          <div>
            <p><b>设备名称:</b> ${this.localDeviceId}</p>
            <p><b>速度:</b> ${this.currentPoint.speed.toFixed(1)} km/h</p>
            <p><b>追踪距离:</b> ${this.currentPoint.cumulativeDistance.toFixed(3)} km</p>
            <p><b>定位:</b> ${this.formatStopDateLong(this.currentPoint.time_tracking)}</p>
          </div>
        `)

        this.leafletLayers.push(this.leafletCurrentMarker)
      }
    }
  }
}
</script>

<style scoped>
.device-playback-panel {
  width: 100%;
  height: 100%;
}
.playback-layout {
  display: flex;
  background-color: #f0f2f5;
  border-radius: 0;
  overflow: hidden;
  height: 100vh;
}

/* Sidebar Styling */
.sidebar {
  width: 360px;
  min-width: 360px;
  background-color: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: all 0.3s ease;
  overflow: hidden;
}
.playback-layout.sidebar-collapsed .sidebar {
  width: 0;
  min-width: 0;
  border-right: none;
}
.sidebar-header-title {
  background-color: #1890ff;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  padding: 14px 16px;
  letter-spacing: 1px;
}
.sidebar-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  gap: 14px;
}
.sidebar-section {
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

/* Search Row */
.device-search-row .ant-input {
  border-radius: 4px;
}

/* Custom Calendar Styling */
.calendar-month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.calendar-month-title {
  font-size: 13px;
  font-weight: bold;
  color: rgba(0,0,0,0.85);
}
.calendar-wrapper {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fafafa;
}
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f5f5;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
.weekday-cell {
  font-size: 11px;
  font-weight: bold;
  color: #52c41a;
  padding: 4px 0;
}
.calendar-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.calendar-day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 40px;
  padding: 4px 1px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  transition: all 0.2s;
}
.calendar-day-cell:nth-child(7n) {
  border-right: none;
}
.calendar-day-cell:hover:not(.other-month) {
  background-color: #e6f7ff;
}
.calendar-day-cell.other-month {
  color: #bfbfbf;
  cursor: not-allowed;
}
.calendar-day-cell.current-month {
  color: #52c41a;
}
.calendar-day-cell.selected {
  background-color: #1890ff !important;
  color: #ffffff !important;
}
.calendar-day-cell.selected .day-mileage {
  color: #ffffff !important;
}
.day-number {
  font-size: 12px;
  font-weight: bold;
}
.day-mileage {
  font-size: 9px;
  color: #8c8c8c;
  line-height: 1.1;
  margin-top: 1px;
}

/* Time Pickers */
.time-picker-row {
  display: flex;
  align-items: center;
}
.required-star {
  color: #ff4d4f;
  margin-right: 4px;
  font-weight: bold;
}
.time-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  width: 65px;
  white-space: nowrap;
}

/* Speed / Stay Filter Row */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.speed-control {
  display: flex;
  align-items: center;
  flex: 1;
}
.stay-control {
  display: flex;
  align-items: center;
  gap: 4px;
}
.filter-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  white-space: nowrap;
}
.speed-word {
  font-size: 11px;
  color: #1890ff;
}

/* Speed Range bar with labels */
.speed-range-bar-container {
  margin-top: 8px;
}
.speed-range-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}
.speed-label-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  color: #ffffff;
}
.speed-label-badge.slow { background-color: #2f54eb; }
.speed-label-badge.normal { background-color: #f5222d; }
.speed-label-badge.fast { background-color: #bfbfbf; }
.speed-range-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background-color: #e8e8e8;
}
.speed-bar-segment.slow-bar { flex: 10; background-color: #52c41a; }
.speed-bar-segment.normal-bar { flex: 8; background-color: #f5222d; }
.speed-bar-segment.fast-bar { flex: 4; background-color: #bfbfbf; }

/* Quick Dates Row */
.quick-dates-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}
.quick-dates-row .ant-btn {
  flex: 1;
  padding: 0 4px;
  font-size: 11px;
}

/* Playback Button */
.start-playback-btn {
  background-color: #1890ff;
  border-color: #1890ff;
  height: 36px;
  font-size: 14px;
  font-weight: bold;
}

/* Tabs and Lists */
.sidebar-tabs-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 200px;
}
.playback-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}
.playback-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  border-bottom: 2px solid transparent;
}
.playback-tab:hover {
  color: #1890ff;
}
.playback-tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}
.stops-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 8px;
}
.stops-empty, .events-empty {
  text-align: center;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
.stop-item {
  padding: 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}
.stop-item:hover {
  background-color: #e6f7ff;
}
.stop-item.active {
  background-color: #bae7ff;
  border-left-color: #1890ff;
}
.stop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}
.stop-badge {
  background-color: #1890ff;
  color: #ffffff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: bold;
}
.stop-time {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.45);
}
.stop-address {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.3;
}
.stop-id {
  font-weight: bold;
  color: #1890ff;
}

/* Map Panel Styling */
.map-panel {
  position: relative;
  height: 100vh;
  background-color: #e8e8e8;
  flex: 1;
  min-width: 0;
}

.sidebar-toggle-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  width: 20px;
  height: 50px;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  color: rgba(0, 0, 0, 0.65);
}
.sidebar-toggle-btn:hover {
  background-color: #1890ff;
  color: #ffffff;
}

/* Overlays on the Map */
.map-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  z-index: 10;
  background-color: #ffffff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.map-header-bar {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 10;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}
.map-legend {
  display: flex;
  gap: 14px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.legend-color-block {
  width: 14px;
  height: 8px;
  border-radius: 1px;
}
.legend-color-block.slow { background-color: #2f54eb; }
.legend-color-block.normal { background-color: #52c41a; }
.legend-color-block.overspeed { background-color: #f5222d; }
.legend-color-block.fast { background-color: #820014; }
.legend-text {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.65);
}
.map-actions {
  display: flex;
  gap: 6px;
}
.action-btn {
  font-size: 11px;
}

.map-view {
  position: relative;
  padding-top: 60px;
  height: 100%;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.45);
  background: #fafafa;
  font-size: 14px;
}

/* Map Type Switcher Overlays */
.map-type-switcher {
  position: absolute;
  top: 76px;
  right: 16px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 3px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
}
.map-type-buttons {
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  overflow: hidden;
}
.map-type-btn {
  background-color: #ffffff;
  border: none;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  outline: none;
}
.map-type-btn.active {
  background-color: #1890ff;
  color: #ffffff;
}

/* Custom Marker Styling */
.map-stop-marker {
  background-color: #ff7a45;
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 11px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  cursor: pointer;
}
.playback-vehicle-marker {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vehicle-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 12px solid #ff7a45;
  filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3));
}

/* Tooltip and Info Window Styles */
.stop-info-window {
  padding: 6px;
  font-size: 11px;
  color: #333333;
  line-height: 1.5;
  min-width: 180px;
}
.info-row {
  margin-bottom: 2px;
}
.info-action {
  margin-top: 6px;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d46b08;
  padding: 1px 6px;
  border-radius: 3px;
  text-align: center;
  font-size: 10px;
}
.vehicle-tooltip {
  background-color: #ffffff;
  border: 1px solid #999999;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  color: #333333;
  line-height: 1.4;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  position: relative;
  white-space: nowrap;
}
.vehicle-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background-color: #ffffff;
  border-right: 1px solid #999999;
  border-bottom: 1px solid #999999;
}
.blue-help-btn {
  color: #1890ff;
  cursor: pointer;
  margin-left: 2px;
}

/* Print styles */
@media print {
  .sidebar, .map-progress-bar, .map-header-bar, .map-type-switcher, .panel-header, .map-navigation-panel {
    display: none !important;
  }
  .playback-layout {
    grid-template-columns: 1fr !important;
    box-shadow: none !important;
  }
  .map-panel {
    height: 100vh !important;
    width: 100vw !important;
  }
  .map-view {
    padding-top: 0 !important;
  }
}

/* Custom Zoom & Navigation Panel styling */
.map-navigation-panel {
  position: absolute;
  top: 130px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none; /* Let clicks pass through to map where not over buttons */
}

.map-navigation-panel * {
  pointer-events: auto; /* Enable pointer events on buttons */
}

/* D-Pad Container styling */
.navigation-dpad {
  width: 96px;
  height: 96px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 50%;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.navigation-dpad:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  border-color: rgba(24, 144, 255, 0.4);
}

/* D-Pad individual buttons */
.dpad-btn {
  position: absolute;
  border: none;
  background: transparent;
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555555;
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 50%;
  outline: none;
}

.dpad-btn:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.08);
  transform: scale(1.15);
}

/* Placement of D-Pad arrows */
.dpad-btn.up {
  top: 4px;
  left: 35px;
}

.dpad-btn.down {
  bottom: 4px;
  left: 35px;
}

.dpad-btn.left {
  left: 4px;
  top: 35px;
}

.dpad-btn.right {
  right: 4px;
  top: 35px;
}

/* Center aim/locate button */
.dpad-btn.center-btn {
  top: 32px;
  left: 32px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.35);
  border-radius: 50%;
}

.dpad-btn.center-btn:hover {
  transform: scale(1.1) rotate(45deg);
  background: linear-gradient(135deg, #40a9ff, #096dd9);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.5);
  color: #ffffff;
}

/* Zoom Container styling */
.navigation-zoom {
  width: 32px;
  height: 72px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 4px 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.navigation-zoom:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  border-color: rgba(24, 144, 255, 0.4);
}

/* Zoom individual buttons */
.zoom-btn {
  border: none;
  background: transparent;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555555;
  font-size: 13px;
  transition: all 0.2s ease;
  border-radius: 50%;
  outline: none;
}

.zoom-btn:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.08);
  transform: scale(1.15);
}

.zoom-divider {
  width: 16px;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.06);
}
</style>
