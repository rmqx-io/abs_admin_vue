<template>
  <a-modal
    :visible="visible"
    title="日志详情"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <div v-if="data" class="log-detail">
      <!-- 基本信息 -->
      <a-card title="基本信息" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">日志ID：</span>
              <span class="value">{{ data.id }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">日志类型：</span>
              <a-tag :color="getLogTypeColor(data.log_type)">
                <a-icon :type="getLogTypeIcon(data.log_type)" />
                {{ getLogTypeText(data.log_type) }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">日志级别：</span>
              <a-tag :color="getLevelColor(data.level)">
                {{ getLevelText(data.level) }}
              </a-tag>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">来源名称：</span>
              <span class="value">{{ data.source_name }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">来源ID：</span>
              <span class="value">{{ data.source_id }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">IP地址：</span>
              <a-tag v-if="data.ip_address" color="blue">{{ data.ip_address }}</a-tag>
              <span v-else class="no-data">-</span>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="24">
            <div class="detail-item">
              <span class="label">记录时间：</span>
              <span class="value timestamp">{{ formatTimestamp(data.timestamp) }}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 日志内容 -->
      <a-card title="日志内容" size="small" class="detail-card">
        <div class="log-content">
          <pre>{{ data.content }}</pre>
        </div>
      </a-card>

      <!-- 请求信息 -->
      <a-card
        v-if="data.user_agent || data.extra_data"
        title="附加信息"
        size="small"
        class="detail-card"
      >
        <div v-if="data.user_agent" class="detail-item">
          <span class="label">User Agent：</span>
          <div class="value user-agent">{{ data.user_agent }}</div>
        </div>

        <div v-if="data.extra_data && Object.keys(data.extra_data).length > 0" class="detail-item">
          <span class="label">扩展数据：</span>
          <div class="extra-data">
            <pre>{{ JSON.stringify(data.extra_data, null, 2) }}</pre>
          </div>
        </div>
      </a-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button @click="copyLogContent">
          <a-icon type="copy" />
          复制内容
        </a-button>
        <a-button @click="downloadLog">
          <a-icon type="download" />
          下载日志
        </a-button>
        <a-button v-if="data.log_type === 'maintenance'" type="primary" @click="editLog">
          <a-icon type="edit" />
          编辑日志
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'LogDetailModal',
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
  methods: {
    handleCancel() {
      this.$emit('close')
    },

    // 复制日志内容
    copyLogContent() {
      if (!this.data) return
      
      const content = `
日志ID: ${this.data.id}
日志类型: ${this.getLogTypeText(this.data.log_type)}
日志级别: ${this.getLevelText(this.data.level)}
来源: ${this.data.source_name} (${this.data.source_id})
IP地址: ${this.data.ip_address || '-'}
时间: ${this.formatTimestamp(this.data.timestamp)}
内容: ${this.data.content}
      `.trim()

      if (navigator.clipboard) {
        navigator.clipboard.writeText(content).then(() => {
          this.$message.success('日志内容已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(content)
        })
      } else {
        this.fallbackCopy(content)
      }
    },

    // 备用复制方法
    fallbackCopy(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success('日志内容已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }
      document.body.removeChild(textArea)
    },

    // 下载日志
    downloadLog() {
      if (!this.data) return

      const content = JSON.stringify(this.data, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `log_${this.data.id}_${moment().format('YYYYMMDD_HHmmss')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      this.$message.success('日志下载成功')
    },

    // 编辑日志
    editLog() {
      this.$emit('edit', this.data)
      this.handleCancel()
    },

    // 获取日志类型颜色
    getLogTypeColor(type) {
      const colors = {
        device: 'blue',
        user: 'green',
        admin: 'purple',
        operation: 'orange',
        maintenance: 'red'
      }
      return colors[type] || 'default'
    },

    // 获取日志类型图标
    getLogTypeIcon(type) {
      const icons = {
        device: 'laptop',
        user: 'user',
        admin: 'setting',
        operation: 'interaction',
        maintenance: 'tool'
      }
      return icons[type] || 'file'
    },

    // 获取日志类型文本
    getLogTypeText(type) {
      const texts = {
        device: '设备日志',
        user: '用户日志',
        admin: '后台日志',
        operation: '操作日志',
        maintenance: '维修日志'
      }
      return texts[type] || type
    },

    // 获取级别颜色
    getLevelColor(level) {
      const colors = {
        info: 'blue',
        warn: 'orange',
        error: 'red',
        debug: 'gray'
      }
      return colors[level] || 'default'
    },

    // 获取级别文本
    getLevelText(level) {
      const texts = {
        info: '信息',
        warn: '警告',
        error: '错误',
        debug: '调试'
      }
      return texts[level] || level
    },

    // 格式化时间戳
    formatTimestamp(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.log-detail {
  .detail-card {
    margin-bottom: 16px;

    .detail-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 100px;
        color: #595959;
        font-weight: 500;
        flex-shrink: 0;
      }

      .value {
        color: #262626;
        flex: 1;

        &.timestamp {
          font-family: 'Monaco', 'Consolas', monospace;
          color: #1890ff;
        }

        &.user-agent {
          word-break: break-all;
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .no-data {
        color: #bfbfbf;
      }
    }

    .log-content {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 12px;

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #262626;
      }
    }

    .extra-data {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 12px;
      margin-top: 8px;

      pre {
        margin: 0;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        line-height: 1.4;
        color: #595959;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .log-detail {
    .detail-item {
      flex-direction: column;

      .label {
        margin-bottom: 4px;
      }
    }

    .action-buttons {
      flex-direction: column;

      .ant-btn {
        width: 100%;
      }
    }
  }
}
</style>
