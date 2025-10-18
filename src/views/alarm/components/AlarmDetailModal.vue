<template>
  <a-modal
    title="预警详情"
    :visible="visible"
    :footer="null"
    @cancel="handleClose"
    width="800px"
    :destroyOnClose="true"
  >
    <div class="alarm-detail" v-if="alarm">
      <!-- 预警概述 -->
      <div class="alarm-summary">
        <div class="summary-header">
          <div class="alarm-level">
            <a-tag :color="getLevelColor(alarm.alarm_level)" size="large">
              <a-icon :type="getLevelIcon(alarm.alarm_level)" />
              {{ getLevelText(alarm.alarm_level) }}
            </a-tag>
          </div>
          <div class="alarm-status">
            <a-badge 
              :status="getStatusBadge(alarm.status)" 
              :text="getStatusText(alarm.status)"
            />
          </div>
        </div>
        <h3 class="alarm-title">{{ getAlarmTypeText(alarm.alarm_type) }}</h3>
        <p class="alarm-message">{{ alarm.message }}</p>
      </div>

      <a-divider />

      <!-- 详细信息 -->
      <a-row :gutter="24">
        <a-col :span="12">
          <div class="detail-section">
            <h4><a-icon type="desktop" /> 设备信息</h4>
            <div class="detail-item">
              <span class="label">设备名称：</span>
              <span class="value">
                <a @click="viewDevice">{{ alarm.device_name }}</a>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">设备ID：</span>
              <span class="value">{{ alarm.device_id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">设备位置：</span>
              <span class="value">{{ alarm.device_location }}</span>
            </div>
          </div>
        </a-col>

        <a-col :span="12">
          <div class="detail-section">
            <h4><a-icon type="clock-circle" /> 时间信息</h4>
            <div class="detail-item">
              <span class="label">发生时间：</span>
              <span class="value">{{ formatFullDate(alarm.created_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">持续时间：</span>
              <span class="value" :class="getDurationClass(alarm.created_at, alarm.resolved_at)">
                {{ calculateDuration(alarm.created_at, alarm.resolved_at) }}
              </span>
            </div>
            <div class="detail-item" v-if="alarm.resolved_at">
              <span class="label">解决时间：</span>
              <span class="value">{{ formatFullDate(alarm.resolved_at) }}</span>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 处理信息 -->
      <div class="detail-section" v-if="alarm.assignee || alarm.resolver">
        <h4><a-icon type="user" /> 处理信息</h4>
        <a-row :gutter="24}>
          <a-col :span="12" v-if="alarm.assignee">
            <div class="detail-item">
              <span class="label">指派人员：</span>
              <span class="value">{{ alarm.assignee }}</span>
            </div>
          </a-col>
          <a-col :span="12" v-if="alarm.resolver">
            <div class="detail-item">
              <span class="label">解决人员：</span>
              <span class="value">{{ alarm.resolver }}</span>
            </div>
          </a-col>
        </a-row>
        <div class="detail-item" v-if="alarm.resolution_note">
          <span class="label">处理说明：</span>
          <div class="value resolution-note">{{ alarm.resolution_note }}</div>
        </div>
      </div>

      <!-- 操作历史 -->
      <div class="detail-section">
        <h4><a-icon type="history" /> 操作历史</h4>
        <a-timeline>
          <a-timeline-item
            v-for="(history, index) in operationHistory"
            :key="index"
            :color="getHistoryColor(history.action)"
          >
            <div class="history-item">
              <div class="history-header">
                <span class="history-action">{{ history.action }}</span>
                <span class="history-time">{{ formatFullDate(history.timestamp) }}</span>
              </div>
              <div class="history-operator">操作人：{{ history.operator }}</div>
              <div class="history-note" v-if="history.note">{{ history.note }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>

      <!-- 操作按钮 -->
      <div class="detail-actions">
        <a-space>
          <a-button
            type="primary"
            @click="handleProcess"
            v-if="alarm.status === 'pending'"
          >
            <a-icon type="check" />
            处理预警
          </a-button>
          <a-button
            @click="handleIgnore"
            v-if="alarm.status === 'pending'"
          >
            <a-icon type="stop" />
            忽略预警
          </a-button>
          <a-button
            type="primary"
            @click="handleReopen"
            v-if="alarm.status === 'ignored'"
          >
            <a-icon type="redo" />
            重新处理
          </a-button>
          <a-button @click="handleClose">
            关闭
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AlarmDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    alarm: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      operationHistory: []
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.alarm) {
        this.loadOperationHistory()
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },

    handleProcess() {
      this.$emit('process', { action: 'process', alarm: this.alarm })
    },

    handleIgnore() {
      this.$confirm({
        title: '确认忽略预警',
        content: '确定要忽略这条预警吗？',
        onOk: () => {
          this.$emit('process', { action: 'ignore', alarm: this.alarm })
        }
      })
    },

    handleReopen() {
      this.$confirm({
        title: '确认重新处理',
        content: '确定要重新处理这条预警吗？',
        onOk: () => {
          this.$emit('process', { action: 'reopen', alarm: this.alarm })
        }
      })
    },

    viewDevice() {
      this.$router.push(`/list/device-list/info/${this.alarm.device_id}`)
    },

    loadOperationHistory() {
      // 模拟操作历史数据
      this.operationHistory = [
        {
          action: '创建预警',
          operator: '系统',
          timestamp: this.alarm.created_at,
          note: '设备异常触发预警'
        },
        {
          action: '指派处理',
          operator: '管理员',
          timestamp: moment(this.alarm.created_at).add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
          note: '指派给技术人员处理'
        }
      ]

      if (this.alarm.resolved_at) {
        this.operationHistory.push({
          action: '预警解决',
          operator: this.alarm.resolver || '技术人员',
          timestamp: this.alarm.resolved_at,
          note: '问题已解决，设备恢复正常'
        })
      }
    },

    getLevelColor(level) {
      const colorMap = {
        'critical': 'red',
        'warning': 'orange',
        'info': 'blue'
      }
      return colorMap[level] || 'default'
    },

    getLevelIcon(level) {
      const iconMap = {
        'critical': 'exclamation-circle',
        'warning': 'warning',
        'info': 'info-circle'
      }
      return iconMap[level] || 'question-circle'
    },

    getLevelText(level) {
      const textMap = {
        'critical': '严重',
        'warning': '警告',
        'info': '信息'
      }
      return textMap[level] || level
    },

    getAlarmTypeText(type) {
      const textMap = {
        'offline': '离线预警',
        'fault': '故障预警',
        'overload': '过载预警',
        'temperature': '温度预警',
        'voltage': '电压预警',
        'communication': '通信预警'
      }
      return textMap[type] || type
    },

    getStatusBadge(status) {
      const badgeMap = {
        'pending': 'error',
        'processing': 'processing',
        'resolved': 'success',
        'ignored': 'default'
      }
      return badgeMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决',
        'ignored': '已忽略'
      }
      return textMap[status] || status
    },

    formatFullDate(dateString) {
      return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
    },

    calculateDuration(startTime, endTime) {
      const start = moment(startTime)
      const end = endTime ? moment(endTime) : moment()
      const duration = moment.duration(end.diff(start))
      
      if (duration.asDays() >= 1) {
        return `${Math.floor(duration.asDays())}天${Math.floor(duration.asHours() % 24)}小时`
      } else if (duration.asHours() >= 1) {
        return `${Math.floor(duration.asHours())}小时${Math.floor(duration.asMinutes() % 60)}分钟`
      } else {
        return `${Math.floor(duration.asMinutes())}分钟`
      }
    },

    getDurationClass(startTime, endTime) {
      if (endTime) return 'duration-resolved'
      
      const duration = moment().diff(moment(startTime), 'hours')
      if (duration >= 24) return 'duration-critical'
      if (duration >= 4) return 'duration-warning'
      return 'duration-normal'
    },

    getHistoryColor(action) {
      const colorMap = {
        '创建预警': 'red',
        '指派处理': 'blue',
        '预警解决': 'green',
        '忽略预警': 'gray',
        '重新处理': 'orange'
      }
      return colorMap[action] || 'blue'
    }
  }
}
</script>

<style scoped>
.alarm-detail {
  .alarm-summary {
    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .alarm-title {
      margin: 8px 0;
      color: #262626;
    }

    .alarm-message {
      color: #595959;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 0;
    }
  }

  .detail-section {
    margin-bottom: 24px;

    h4 {
      color: #1890ff;
      margin-bottom: 16px;
      
      .anticon {
        margin-right: 8px;
      }
    }

    .detail-item {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-start;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        min-width: 100px;
        color: #8c8c8c;
        font-size: 14px;
      }

      .value {
        color: #262626;
        font-size: 14px;
        flex: 1;

        a {
          color: #1890ff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .resolution-note {
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        padding: 8px 12px;
        border-radius: 4px;
        line-height: 1.5;
      }
    }
  }

  .history-item {
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      .history-action {
        font-weight: 500;
        color: #262626;
      }

      .history-time {
        color: #8c8c8c;
        font-size: 12px;
      }
    }

    .history-operator {
      color: #595959;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .history-note {
      color: #8c8c8c;
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .detail-actions {
    margin-top: 24px;
    text-align: right;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .duration-critical {
    color: #ff4d4f;
    font-weight: 500;
  }

  .duration-warning {
    color: #fa8c16;
    font-weight: 500;
  }

  .duration-normal {
    color: #1890ff;
  }

  .duration-resolved {
    color: #52c41a;
  }
}

@media (max-width: 768px) {
  .alarm-detail {
    .alarm-summary {
      .summary-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .detail-item {
      flex-direction: column;

      .label {
        min-width: auto;
        margin-bottom: 4px;
      }
    }

    .history-item {
      .history-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}
</style>