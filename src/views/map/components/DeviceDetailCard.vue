<template>
  <div class="device-detail-card">
    <div class="device-header">
      <div class="device-info">
        <h3>{{ device.name }}</h3>
        <a-tag :color="getStatusColor(device.status)" size="large">
          {{ getStatusText(device.status) }}
        </a-tag>
      </div>
      <div class="device-type">
        <a-icon :type="getDeviceIcon(device.type)" style="font-size: 24px; color: #1890ff;" />
        <span>{{ getDeviceTypeName(device.type) }}</span>
      </div>
    </div>

    <a-divider />

    <div class="device-content">
      <a-row :gutter="[24, 16]">
        <a-col :span="24" :md="12">
          <div class="info-section">
            <h4><a-icon type="environment" /> 位置信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">省份：</span>
                <span class="value">{{ device.province }}</span>
              </div>
              <div class="info-item">
                <span class="label">城市：</span>
                <span class="value">{{ device.city }}</span>
              </div>
              <div class="info-item">
                <span class="label">详细地址：</span>
                <span class="value">{{ device.address }}</span>
              </div>
              <div class="info-item">
                <span class="label">坐标：</span>
                <span class="value">{{ device.latitude }}, {{ device.longitude }}</span>
              </div>
            </div>
          </div>
        </a-col>

        <a-col :span="24" :md="12">
          <div class="info-section">
            <h4><a-icon type="clock-circle" /> 运行信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">安装时间：</span>
                <span class="value">{{ formatDate(device.install_time) }}</span>
              </div>
              <div class="info-item">
                <span class="label">运行天数：</span>
                <span class="value">{{ getRunningDays(device.install_time) }}天</span>
              </div>
              <div class="info-item">
                <span class="label">工作时长：</span>
                <span class="value">{{ formatWorkDuration(device.work_duration) }}</span>
              </div>
              <div class="info-item">
                <span class="label">最后在线：</span>
                <span class="value">{{ formatDate(device.last_online) }}</span>
              </div>
            </div>
          </div>
        </a-col>

        <a-col :span="24" :md="12">
          <div class="info-section">
            <h4><a-icon type="thunderbolt" /> 设备规格</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">设备型号：</span>
                <span class="value">{{ device.model }}</span>
              </div>
              <div class="info-item">
                <span class="label">额定功率：</span>
                <span class="value">{{ device.power }}</span>
              </div>
              <div class="info-item">
                <span class="label">设备编号：</span>
                <span class="value">{{ device.id }}</span>
              </div>
            </div>
          </div>
        </a-col>

        <a-col :span="24" :md="12">
          <div class="info-section energy-section">
            <h4><a-icon type="leaf" /> 节能统计</h4>
            <div class="energy-card">
              <div class="energy-value">
                <span class="number">{{ device.energy_saved }}</span>
                <span class="unit">KWH</span>
              </div>
              <div class="energy-desc">累计节约电能</div>
              <div class="energy-equivalent">
                <a-icon type="environment" theme="twoTone" two-tone-color="#52c41a" />
                相当于减少CO₂排放 {{ (device.energy_saved * 0.785).toFixed(1) }}kg
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <a-divider />

    <div class="device-actions">
      <a-space>
        <a-button type="primary" @click="handleControl">
          <a-icon type="control" />
          设备控制
        </a-button>
        <a-button @click="handleHistory">
          <a-icon type="line-chart" />
          历史数据
        </a-button>
        <a-button @click="handleMaintenance">
          <a-icon type="tool" />
          维护记录
        </a-button>
        <a-button type="danger" ghost @click="handleAlarm" v-if="device.status === 'warning'">
          <a-icon type="warning" />
          查看告警
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DeviceDetailCard',
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  methods: {
    getStatusColor(status) {
      const colorMap = {
        'online': 'green',
        'offline': 'red',
        'warning': 'orange',
        'maintenance': 'purple'
      }
      return colorMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        'online': '在线',
        'offline': '离线',
        'warning': '告警',
        'maintenance': '维护中'
      }
      return textMap[status] || status
    },

    getDeviceIcon(type) {
      const iconMap = {
        'smart_switch': 'control',
        'smart_light': 'bulb',
        'smart_meter': 'dashboard'
      }
      return iconMap[type] || 'question'
    },

    getDeviceTypeName(type) {
      const nameMap = {
        'smart_switch': '智能开关',
        'smart_light': '智能灯具',
        'smart_meter': '智能电表'
      }
      return nameMap[type] || type
    },

    formatDate(dateString) {
      return moment(dateString).format('YYYY-MM-DD HH:mm')
    },

    getRunningDays(installTime) {
      return moment().diff(moment(installTime), 'days')
    },

    formatWorkDuration(hours) {
      const years = Math.floor(hours / 8760)
      const remainingHours = hours % 8760
      const days = Math.floor(remainingHours / 24)
      const finalHours = remainingHours % 24

      let result = ''
      if (years > 0) result += `${years}年`
      if (days > 0) result += `${days}天`
      if (finalHours > 0) result += `${finalHours}小时`

      return result || '0小时'
    },

    handleControl() {
      this.$message.info('设备控制功能开发中')
    },

    handleHistory() {
      this.$message.info('历史数据功能开发中')
    },

    handleMaintenance() {
      this.$message.info('维护记录功能开发中')
    },

    handleAlarm() {
      this.$message.info('告警查看功能开发中')
    }
  }
}
</script>

<style scoped>
.device-detail-card {
  .device-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .device-info {
      flex: 1;

      h3 {
        margin: 0 0 8px 0;
        color: #262626;
        font-size: 18px;
      }
    }

    .device-type {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 80px;

      span {
        margin-top: 4px;
        font-size: 12px;
        color: #595959;
      }
    }
  }

  .device-content {
    .info-section {
      background: #fafafa;
      padding: 16px;
      border-radius: 8px;
      height: 100%;

      h4 {
        margin: 0 0 16px 0;
        color: #1890ff;
        font-size: 14px;
        font-weight: 500;

        .anticon {
          margin-right: 8px;
        }
      }

      .info-grid {
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #8c8c8c;
            font-size: 13px;
            min-width: 80px;
          }

          .value {
            color: #262626;
            font-size: 13px;
            font-weight: 500;
            text-align: right;
            flex: 1;
            word-break: break-all;
          }
        }
      }
    }

    .energy-section {
      background: linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%);
      border: 1px solid #b7eb8f;

      .energy-card {
        text-align: center;

        .energy-value {
          .number {
            font-size: 32px;
            font-weight: bold;
            color: #52c41a;
          }

          .unit {
            font-size: 16px;
            color: #52c41a;
            margin-left: 4px;
          }
        }

        .energy-desc {
          color: #595959;
          font-size: 14px;
          margin: 8px 0 12px 0;
        }

        .energy-equivalent {
          color: #52c41a;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .anticon {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .device-actions {
    text-align: center;
    padding-top: 8px;
  }
}

@media (max-width: 768px) {
  .device-detail-card {
    .device-header {
      flex-direction: column;

      .device-type {
        align-self: flex-end;
        flex-direction: row;
        align-items: center;
        margin-top: 8px;

        span {
          margin-top: 0;
          margin-left: 8px;
        }
      }
    }

    .device-actions {
      .ant-space {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}
</style>
