<template>
  <div class="smart-light-dashboard">
    <a-row :gutter="[24, 24]">
      <!-- 设备统计卡片 -->
      <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <chart-card
          :loading="loading.devices"
          title="设备统计"
          :total="deviceStats.total"
        >
          <template slot="action">
            <a-tooltip title="设备总数量">
              <a-icon type="desktop" />
            </a-tooltip>
          </template>
          <template slot="footer">
            <div class="stats-footer">
              <div class="stat-item">
                <span class="stat-label">在线设备</span>
                <span class="stat-value online">{{ deviceStats.online }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">今日新装</span>
                <span class="stat-value new">{{ deviceStats.newToday }}</span>
              </div>
            </div>
          </template>
        </chart-card>
      </a-col>

      <!-- 用户统计卡片 -->
      <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <chart-card
          :loading="loading.users"
          title="用户统计"
          :total="userStats.total"
        >
          <template slot="action">
            <a-tooltip title="用户总数量">
              <a-icon type="user" />
            </a-tooltip>
          </template>
          <template slot="footer">
            <div class="stats-footer">
              <div class="stat-item">
                <span class="stat-label">今日上线</span>
                <span class="stat-value active">{{ userStats.activeToday }}</span>
              </div>
            </div>
          </template>
        </chart-card>
      </a-col>

      <!-- 节能统计卡片 -->
      <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <chart-card
          :loading="loading.energy"
          title="节能统计"
          :total="energyStats.totalSavedKWH + ' KWH'"
        >
          <template slot="action">
            <a-tooltip title="累计节能">
              <a-icon type="thunderbolt" />
            </a-tooltip>
          </template>
          <template slot="footer">
            <div class="stats-footer">
              <div class="stat-item">
                <span class="stat-label">累计省钱</span>
                <span class="stat-value money">¥{{ energyStats.totalSavedMoney }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">今日节能</span>
                <span class="stat-value today">{{ energyStats.todaySavedKWH }} KWH</span>
              </div>
            </div>
          </template>
        </chart-card>
      </a-col>
    </a-row>

    <!-- 详细图表区域 -->
    <a-row :gutter="[24, 24]" style="margin-top: 24px">
      <!-- 设备状态分布图 -->
      <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <a-card title="设备状态分布" :loading="loading.deviceChart">
          <div style="height: 300px;">
            <pie-chart
              v-if="!loading.deviceChart"
              :chart-options="deviceChartOptions"
              :chart-data="deviceChartData"
              :height="300"
            />
          </div>
        </a-card>
      </a-col>

      <!-- 节能趋势图 -->
      <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <a-card title="节能趋势" :loading="loading.energyChart">
          <div style="height: 300px;">
            <line-chart
              v-if="!loading.energyChart"
              :chart-options="energyChartOptions"
              :chart-data="energyChartData"
              :height="300"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 实时监控区域 -->
    <a-row :gutter="[24, 24]" style="margin-top: 24px">
      <a-col :span="24">
        <a-card title="实时监控数据">
          <div class="real-time-stats">
            <div class="stat-box">
              <div class="stat-title">当前功率</div>
              <div class="stat-number">{{ realtimeStats.currentPower }} W</div>
              <div class="stat-trend" :class="{ positive: realtimeStats.powerTrend > 0, negative: realtimeStats.powerTrend < 0 }">
                <a-icon :type="realtimeStats.powerTrend > 0 ? 'arrow-up' : 'arrow-down'" />
                {{ Math.abs(realtimeStats.powerTrend) }}%
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-title">在线率</div>
              <div class="stat-number">{{ realtimeStats.onlineRate }}%</div>
              <div class="stat-trend positive">
                <a-icon type="check-circle" />
                良好
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-title">响应时间</div>
              <div class="stat-number">{{ realtimeStats.responseTime }} ms</div>
              <div class="stat-trend" :class="{ positive: realtimeStats.responseTime < 100, negative: realtimeStats.responseTime >= 100 }">
                <a-icon :type="realtimeStats.responseTime < 100 ? 'check-circle' : 'exclamation-circle'" />
                {{ realtimeStats.responseTime < 100 ? '优秀' : '一般' }}
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-title">故障设备</div>
              <div class="stat-number">{{ realtimeStats.faultDevices }}</div>
              <div class="stat-trend" :class="{ positive: realtimeStats.faultDevices === 0, negative: realtimeStats.faultDevices > 0 }">
                <a-icon :type="realtimeStats.faultDevices === 0 ? 'check-circle' : 'warning'" />
                {{ realtimeStats.faultDevices === 0 ? '正常' : '需关注' }}
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { ChartCard } from '@/components'
import { Pie, Line } from 'vue-chartjs/legacy'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'
import {
  getSmartLightDeviceStats,
  getSmartLightUserStats,
  getSmartLightEnergyStats,
  getSmartLightRealtimeStats
} from '@/api/smartLight'

// 注册 Chart.js 组件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

// 临时API调用函数 - 在API未实现时使用模拟数据
const mockApiCall = (data, delay = 800) => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ data }), delay)
  })
}

export default {
  name: 'SmartLightDashboard',
  components: {
    ChartCard,
    PieChart: Pie,
    LineChart: Line
  },
  data() {
    return {
      loading: {
        devices: false,
        users: false,
        energy: false,
        deviceChart: false,
        energyChart: false
      },
      // 设备统计数据
      deviceStats: {
        total: 0,
        online: 0,
        newToday: 0
      },
      // 用户统计数据
      userStats: {
        total: 0,
        activeToday: 0
      },
      // 节能统计数据
      energyStats: {
        totalSavedKWH: 0,
        totalSavedMoney: 0,
        todaySavedKWH: 0
      },
      // 实时监控数据
      realtimeStats: {
        currentPower: 0,
        powerTrend: 0,
        onlineRate: 0,
        responseTime: 0,
        faultDevices: 0
      },
      // 设备状态分布图数据
      deviceChartData: {
        labels: ['在线', '离线', '故障', '维护'],
        datasets: [{
          backgroundColor: ['#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
          data: [0, 0, 0, 0]
        }]
      },
      deviceChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      },
      // 节能趋势图数据
      energyChartData: {
        labels: [],
        datasets: [{
          label: '每日节能 (KWH)',
          borderColor: '#1890ff',
          backgroundColor: 'rgba(24, 144, 255, 0.1)',
          data: []
        }]
      },
      energyChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    }
  },
  mounted() {
    this.loadDashboardData()
    // 设置定时刷新
    this.setupAutoRefresh()
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    async loadDashboardData() {
      await Promise.all([
        this.loadDeviceStats(),
        this.loadUserStats(),
        this.loadEnergyStats(),
        this.loadDeviceChart(),
        this.loadEnergyChart(),
        this.loadRealtimeStats()
      ])
    },
    
    async loadDeviceStats() {
      this.loading.devices = true
      try {
        const response = await getSmartLightDeviceStats()
        this.deviceStats = response.data
      } catch (error) {
        console.error('加载设备统计失败:', error)
        // 使用模拟数据作为fallback
        const fallback = await mockApiCall({
          total: 1284,
          online: 1156,
          newToday: 23
        })
        this.deviceStats = fallback.data
        this.$message.warning('使用模拟数据，请检查API连接')
      } finally {
        this.loading.devices = false
      }
    },

    async loadUserStats() {
      this.loading.users = true
      try {
        const response = await getSmartLightUserStats()
        this.userStats = response.data
      } catch (error) {
        console.error('加载用户统计失败:', error)
        // 使用模拟数据作为fallback
        const fallback = await mockApiCall({
          total: 856,
          activeToday: 234
        })
        this.userStats = fallback.data
        this.$message.warning('使用模拟数据，请检查API连接')
      } finally {
        this.loading.users = false
      }
    },

    async loadEnergyStats() {
      this.loading.energy = true
      try {
        const response = await getSmartLightEnergyStats()
        this.energyStats = response.data
      } catch (error) {
        console.error('加载节能统计失败:', error)
        // 使用模拟数据作为fallback
        const fallback = await mockApiCall({
          totalSavedKWH: 15678.5,
          totalSavedMoney: 12542.8,
          todaySavedKWH: 345.2
        })
        this.energyStats = fallback.data
        this.$message.warning('使用模拟数据，请检查API连接')
      } finally {
        this.loading.energy = false
      }
    },

    async loadDeviceChart() {
      this.loading.deviceChart = true
      try {
        // TODO: 替换为真实API调用
        const response = await mockApiCall({
          online: 1156,
          offline: 98,
          fault: 18,
          maintenance: 12
        })
        this.deviceChartData.datasets[0].data = [
          response.data.online,
          response.data.offline,
          response.data.fault,
          response.data.maintenance
        ]
      } catch (error) {
        console.error('加载设备图表失败:', error)
        this.$message.error('加载设备图表失败')
      } finally {
        this.loading.deviceChart = false
      }
    },

    async loadEnergyChart() {
      this.loading.energyChart = true
      try {
        // TODO: 替换为真实API调用 - 生成过去7天的数据
        const labels = []
        const data = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
          data.push(Math.floor(Math.random() * 200) + 250) // 250-450 KWH
        }
        
        this.energyChartData.labels = labels
        this.energyChartData.datasets[0].data = data
      } catch (error) {
        console.error('加载节能图表失败:', error)
        this.$message.error('加载节能图表失败')
      } finally {
        this.loading.energyChart = false
      }
    },

    async loadRealtimeStats() {
      try {
        const response = await getSmartLightRealtimeStats()
        this.realtimeStats = response.data
      } catch (error) {
        console.error('加载实时统计失败:', error)
        // 使用模拟数据作为fallback
        const fallback = await mockApiCall({
          currentPower: 8567,
          powerTrend: -2.3,
          onlineRate: 90.1,
          responseTime: 85,
          faultDevices: 3
        })
        this.realtimeStats = fallback.data
      }
    },

    setupAutoRefresh() {
      // 每30秒刷新实时数据
      this.refreshTimer = setInterval(() => {
        this.loadRealtimeStats()
      }, 30000)
    }
  }
}
</script>

<style lang="less" scoped>
.smart-light-dashboard {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;

  .stats-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 16px;
        font-weight: 500;
        
        &.online {
          color: #52c41a;
        }
        
        &.new {
          color: #1890ff;
        }
        
        &.active {
          color: #722ed1;
        }
        
        &.money {
          color: #fa8c16;
        }
        
        &.today {
          color: #13c2c2;
        }
      }
    }
  }

  .real-time-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    
    .stat-box {
      text-align: center;
      padding: 20px;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      background: #fff;
      
      .stat-title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        margin-bottom: 8px;
      }
      
      .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 8px;
      }
      
      .stat-trend {
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        
        &.positive {
          color: #52c41a;
        }
        
        &.negative {
          color: #ff4d4f;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .smart-light-dashboard {
    padding: 12px;
    
    .stats-footer {
      .stat-item {
        min-width: 80px;
      }
    }
    
    .real-time-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      
      .stat-box {
        padding: 16px;
        
        .stat-number {
          font-size: 24px;
        }
      }
    }
  }
}
</style>
