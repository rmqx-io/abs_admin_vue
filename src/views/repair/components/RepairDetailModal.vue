<template>
  <a-modal
    :visible="visible"
    title="报修详情"
    width="800px"
    :footer="null"
    @cancel="handleClose"
    :destroyOnClose="true"
  >
    <div v-if="data" class="repair-detail">
      <!-- 基本信息 -->
      <a-card title="基本信息" size="small" class="info-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="info-item">
              <span class="label">报修单号：</span>
              <span class="value">{{ data.id | formatRepairNo }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">报修时间：</span>
              <span class="value">{{ data.created_at | formatDateTime }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">紧急程度：</span>
              <a-tag :color="getPriorityColor(data.priority)">
                {{ getPriorityText(data.priority) }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">报修类型：</span>
              <a-tag :color="getRepairTypeColor(data.repair_type)">
                {{ getRepairTypeText(data.repair_type) }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="info-item">
              <span class="label">故障描述：</span>
              <div class="value description">{{ data.description }}</div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 设备信息 -->
      <a-card title="设备信息" size="small" class="info-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="info-item">
              <span class="label">设备名称：</span>
              <span class="value">
                <a-icon :type="getDeviceIcon(data.device_type)" />
                {{ data.device_name }}
              </span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">设备编号：</span>
              <span class="value">{{ data.device_id }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">设备类型：</span>
              <span class="value">{{ getDeviceTypeText(data.device_type) }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">安装位置：</span>
              <span class="value">{{ data.device_location }}</span>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="info-item">
              <span class="label">设备状态：</span>
              <a-badge
                :status="getDeviceStatusBadge(data.device_status)"
                :text="getDeviceStatusText(data.device_status)"
              />
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 报修人信息 -->
      <a-card title="报修人信息" size="small" class="info-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ data.reporter_name }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value">{{ data.reporter_phone }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">角色：</span>
              <span class="value">{{ data.reporter_role || '用户' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ data.reporter_email || '-' }}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 处理状态 -->
      <a-card title="处理状态" size="small" class="info-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="info-item">
              <span class="label">当前状态：</span>
              <a-badge
                :status="getStatusBadge(data.status)"
                :text="getStatusText(data.status)"
              />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">处理人员：</span>
              <span class="value">{{ data.processor_name || '未分配' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">响应时间：</span>
              <span class="value">{{ data.response_time ? data.response_time + '分钟' : '-' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <span class="label">处理时长：</span>
              <span class="value">{{ data.process_duration ? data.process_duration + '小时' : '-' }}</span>
            </div>
          </a-col>
          <a-col :span="24" v-if="data.processed_at">
            <div class="info-item">
              <span class="label">处理时间：</span>
              <span class="value">{{ data.processed_at | formatDateTime }}</span>
            </div>
          </a-col>
          <a-col :span="24" v-if="data.process_note">
            <div class="info-item">
              <span class="label">处理备注：</span>
              <div class="value description">{{ data.process_note }}</div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 附件信息 -->
      <a-card
        v-if="data.attachments && data.attachments.length > 0"
        title="附件信息"
        size="small"
        class="info-card"
      >
        <div class="attachments-grid">
          <div
            v-for="(attachment, index) in data.attachments"
            :key="index"
            class="attachment-item"
          >
            <div class="attachment-preview">
              <img
                v-if="isImage(attachment)"
                :src="attachment.url"
                :alt="attachment.name"
                @click="viewAttachment(index)"
              />
              <div
                v-else
                class="file-icon"
                @click="viewAttachment(index)"
              >
                <a-icon :type="getFileIcon(attachment)" />
              </div>
            </div>
            <div class="attachment-info">
              <div class="attachment-name" :title="attachment.name">
                {{ attachment.name }}
              </div>
              <div class="attachment-size">
                {{ formatFileSize(attachment.size) }}
              </div>
              <div class="attachment-actions">
                <a-button size="small" @click="viewAttachment(index)">
                  <a-icon type="eye" />
                  预览
                </a-button>
                <a-button size="small" @click="downloadAttachment(attachment)">
                  <a-icon type="download" />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 处理历史 -->
      <a-card title="处理历史" size="small" class="info-card">
        <a-timeline>
          <a-timeline-item
            v-for="(history, index) in processHistory"
            :key="index"
            :color="getHistoryColor(history.action)"
          >
            <div class="history-item">
              <div class="history-header">
                <span class="history-action">{{ history.action_text }}</span>
                <span class="history-time">{{ history.created_at | formatDateTime }}</span>
              </div>
              <div class="history-user">操作人：{{ history.operator_name }}</div>
              <div v-if="history.note" class="history-note">{{ history.note }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </a-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button
          v-if="data.status === 'pending'"
          type="primary"
          @click="handleAction('accept')"
        >
          接受处理
        </a-button>
        <a-button
          v-if="data.status === 'processing'"
          type="primary"
          @click="handleAction('complete')"
        >
          完成处理
        </a-button>
        <a-button
          v-if="['pending', 'processing'].includes(data.status)"
          @click="handleAction('reject')"
        >
          拒绝处理
        </a-button>
        <a-button @click="handleAction('assign')">
          {{ data.processor_name ? '重新分配' : '分配人员' }}
        </a-button>
        <a-button @click="handleAddComment">
          添加备注
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'RepairDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  computed: {
    processHistory() {
      if (!this.data) return []
      
      // 模拟处理历史数据
      const history = [
        {
          action: 'created',
          action_text: '报修单创建',
          operator_name: this.data.reporter_name,
          created_at: this.data.created_at,
          note: '用户提交报修申请'
        }
      ]
      
      if (this.data.status !== 'pending') {
        history.push({
          action: 'accepted',
          action_text: '开始处理',
          operator_name: this.data.processor_name,
          created_at: this.data.processed_at,
          note: '维修人员接受处理'
        })
      }
      
      if (this.data.status === 'completed') {
        history.push({
          action: 'completed',
          action_text: '处理完成',
          operator_name: this.data.processor_name,
          created_at: this.data.processed_at,
          note: this.data.process_note || '维修完成'
        })
      }
      
      if (this.data.status === 'rejected') {
        history.push({
          action: 'rejected',
          action_text: '拒绝处理',
          operator_name: this.data.processor_name,
          created_at: this.data.processed_at,
          note: this.data.process_note || '拒绝处理'
        })
      }
      
      return history
    }
  },
  filters: {
    formatDateTime(date) {
      return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    formatRepairNo(id) {
      return `RP${String(id).padStart(6, '0')}`
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },

    handleAction(action) {
      this.$emit('action', { action, data: this.data })
      this.handleClose()
    },

    handleAddComment() {
      this.$emit('add-comment', this.data)
    },

    handlePreviewAttachment(attachment) {
      if (attachment.type === 'image') {
        // 预览图片
        this.$message.info('图片预览功能开发中')
      } else {
        // 下载文件
        this.handleDownloadAttachment(attachment)
      }
    },

    handleDownloadAttachment(attachment) {
      // 下载附件
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      link.click()
    },

    // 工具方法
    getDeviceIcon(type) {
      const iconMap = {
        smart_switch: 'control',
        smart_light: 'bulb',
        smart_meter: 'dashboard'
      }
      return iconMap[type] || 'question'
    },

    getDeviceTypeText(type) {
      const textMap = {
        smart_switch: '智能开关',
        smart_light: '智能灯',
        smart_meter: '智能电表'
      }
      return textMap[type] || type
    },

    getDeviceStatusBadge(status) {
      const badgeMap = {
        online: 'success',
        offline: 'error',
        warning: 'warning'
      }
      return badgeMap[status] || 'default'
    },

    getDeviceStatusText(status) {
      const textMap = {
        online: '在线',
        offline: '离线',
        warning: '告警'
      }
      return textMap[status] || status
    },

    getPriorityColor(priority) {
      const colorMap = {
        low: 'green',
        medium: 'blue',
        high: 'orange',
        urgent: 'red'
      }
      return colorMap[priority] || 'default'
    },

    getPriorityText(priority) {
      const textMap = {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      }
      return textMap[priority] || priority
    },

    getRepairTypeColor(type) {
      const colorMap = {
        hardware: 'red',
        software: 'blue',
        network: 'orange',
        power: 'purple',
        other: 'default'
      }
      return colorMap[type] || 'default'
    },

    getRepairTypeText(type) {
      const textMap = {
        hardware: '硬件故障',
        software: '软件故障',
        network: '网络问题',
        power: '电源问题',
        other: '其他'
      }
      return textMap[type] || type
    },

    getStatusBadge(status) {
      const badgeMap = {
        pending: 'error',
        processing: 'processing',
        completed: 'success',
        rejected: 'default'
      }
      return badgeMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        rejected: '已拒绝'
      }
      return textMap[status] || status
    },

    getAttachmentIcon(type) {
      const iconMap = {
        image: 'file-image',
        video: 'video-camera',
        pdf: 'file-pdf',
        doc: 'file-word',
        excel: 'file-excel',
        zip: 'file-zip'
      }
      return iconMap[type] || 'file'
    },

    getHistoryColor(action) {
      const colorMap = {
        created: 'blue',
        accepted: 'orange',
        completed: 'green',
        rejected: 'red'
      }
      return colorMap[action] || 'gray'
    }
  }
}
</script>

<style scoped>
.repair-detail {
  .info-card {
    margin-bottom: 16px;

    .info-item {
      display: flex;
      margin-bottom: 8px;
      align-items: flex-start;

      .label {
        min-width: 80px;
        color: #595959;
        font-weight: 500;
      }

      .value {
        flex: 1;
        color: #262626;

        &.description {
          line-height: 1.6;
          padding: 8px 12px;
          background: #fafafa;
          border-radius: 4px;
          border: 1px solid #f0f0f0;
        }

        .anticon {
          margin-right: 4px;
          color: #1890ff;
        }
      }
    }
  }

  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;

    .attachment-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #1890ff;
        background: #f6ffed;
      }

      .attachment-icon {
        margin-right: 8px;
        font-size: 24px;
        color: #1890ff;
      }

      .attachment-info {
        flex: 1;
        min-width: 0;

        .attachment-name {
          font-weight: 500;
          color: #262626;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .attachment-size {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .attachment-actions {
        margin-left: 8px;
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
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .history-user {
      font-size: 12px;
      color: #595959;
      margin-bottom: 4px;
    }

    .history-note {
      font-size: 12px;
      color: #8c8c8c;
      font-style: italic;
    }
  }

  .action-buttons {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .ant-btn {
      margin: 0 4px;
    }
  }
}

@media (max-width: 768px) {
  .repair-detail {
    .attachments-grid {
      grid-template-columns: 1fr;
    }

    .info-item {
      flex-direction: column;

      .label {
        margin-bottom: 4px;
      }
    }

    .history-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-buttons {
      .ant-btn {
        margin: 4px;
        display: block;
        width: calc(100% - 8px);
      }
    }
  }
}
</style>
