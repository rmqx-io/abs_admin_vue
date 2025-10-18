<template>
  <a-modal
    :visible="visible"
    title="服务器详情"
    width="900px"
    :footer="null"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <div v-if="data" class="server-detail">
      <!-- 基本信息 -->
      <a-card title="基本信息" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">服务器名称：</span>
              <span class="value">{{ data.server_name }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">服务器类型：</span>
              <a-tag :color="getTypeColor(data.server_type)">
                <a-icon :type="getTypeIcon(data.server_type)" />
                {{ getTypeText(data.server_type) }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">运行状态：</span>
              <a-badge
                :status="getStatusBadge(data.status)"
                :text="getStatusText(data.status)"
              />
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">运行环境：</span>
              <a-tag :color="getEnvColor(data.environment)">
                {{ getEnvText(data.environment) }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">版本号：</span>
              <span class="value">{{ data.version || '-' }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatTime(data.created_at) }}</span>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="24">
            <div class="detail-item">
              <span class="label">服务器描述：</span>
              <span class="value">{{ data.description || '-' }}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 连接配置 -->
      <a-card title="连接配置" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">IP地址：</span>
              <a-tag color="blue">{{ data.ip_address }}</a-tag>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">端口号：</span>
              <span class="value">{{ data.port }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">协议类型：</span>
              <a-tag :color="getProtocolColor(data.protocol)">
                {{ data.protocol }}
              </a-tag>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="24">
            <div class="detail-item">
              <span class="label">连接URL：</span>
              <a-tag color="geekblue" class="url-tag">
                {{ getConnectionUrl(data) }}
              </a-tag>
              <a-button size="small" @click="copyUrl(getConnectionUrl(data))" style="margin-left: 8px">
                <a-icon type="copy" />
                复制
              </a-button>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 安全配置 -->
      <a-card title="安全配置" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="detail-item">
              <span class="label">SSL加密：</span>
              <a-icon
                :type="data.ssl_enabled ? 'lock' : 'unlock'"
                :style="{ color: data.ssl_enabled ? '#52c41a' : '#f5222d', marginRight: '4px' }"
              />
              <span class="value">{{ data.ssl_enabled ? 'SSL启用' : 'SSL禁用' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="label">身份认证：</span>
              <a-icon
                :type="data.auth_required ? 'safety-certificate' : 'stop'"
                :style="{ color: data.auth_required ? '#52c41a' : '#faad14', marginRight: '4px' }"
              />
              <span class="value">{{ data.auth_required ? '需要认证' : '无需认证' }}</span>
            </div>
          </a-col>
        </a-row>

        <div v-if="data.ssl_enabled" class="ssl-info">
          <h4>SSL证书信息</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <div class="detail-item">
                <span class="label">证书路径：</span>
                <span class="value">{{ data.ssl_cert_path || '-' }}</span>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <span class="label">私钥路径：</span>
                <span class="value">{{ data.ssl_key_path || '-' }}</span>
              </div>
            </a-col>
          </a-row>
        </div>

        <div v-if="data.auth_required" class="auth-info">
          <h4>认证信息</h4>
          <a-row :gutter="16">
            <a-col :span="8">
              <div class="detail-item">
                <span class="label">认证方式：</span>
                <span class="value">{{ getAuthTypeText(data.auth_type) }}</span>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="detail-item">
                <span class="label">用户名：</span>
                <span class="value">{{ data.auth_username || '-' }}</span>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="detail-item">
                <span class="label">密码状态：</span>
                <span class="value">{{ data.auth_password ? '已配置' : '未配置' }}</span>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-card>

      <!-- 性能监控 -->
      <a-card title="性能监控" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="performance-item">
              <div class="perf-label">CPU使用率</div>
              <a-progress
                :percent="data.cpu_usage"
                :status="data.cpu_usage > 80 ? 'exception' : 'active'"
                :stroke-color="getProgressColor(data.cpu_usage)"
              />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="performance-item">
              <div class="perf-label">内存使用率</div>
              <a-progress
                :percent="data.memory_usage"
                :status="data.memory_usage > 80 ? 'exception' : 'active'"
                :stroke-color="getProgressColor(data.memory_usage)"
              />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="performance-item">
              <div class="perf-label">磁盘使用率</div>
              <a-progress
                :percent="data.disk_usage"
                :status="data.disk_usage > 80 ? 'exception' : 'active'"
                :stroke-color="getProgressColor(data.disk_usage)"
              />
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 20px">
          <a-col :span="12">
            <div class="network-item">
              <a-statistic
                title="网络入流量"
                :value="data.network_in"
                suffix="KB/s"
                :value-style="{ color: '#3f8600' }"
              />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="network-item">
              <a-statistic
                title="网络出流量"
                :value="data.network_out"
                suffix="KB/s"
                :value-style="{ color: '#cf1322' }"
              />
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 高级配置 -->
      <a-card title="高级配置" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">最大连接数：</span>
              <span class="value">{{ data.config?.max_connections || '-' }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">连接超时：</span>
              <span class="value">{{ data.config?.timeout || '-' }}秒</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">重试次数：</span>
              <span class="value">{{ data.config?.retry_attempts || '-' }}</span>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <div class="detail-item">
              <span class="label">健康检查URL：</span>
              <span class="value">{{ data.health_check_url || '-' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="label">检查间隔：</span>
              <span class="value">{{ data.health_check_interval || '-' }}秒</span>
            </div>
          </a-col>
        </a-row>

        <div v-if="data.extra_config && Object.keys(data.extra_config).length > 0" class="extra-config">
          <h4>扩展配置</h4>
          <pre class="config-json">{{ JSON.stringify(data.extra_config, null, 2) }}</pre>
        </div>
      </a-card>

      <!-- 监控配置 -->
      <a-card title="监控配置" size="small" class="detail-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">监控状态：</span>
              <a-switch
                :checked="data.monitoring_enabled"
                disabled
              />
              <span style="margin-left: 8px">
                {{ data.monitoring_enabled ? '已启用' : '已禁用' }}
              </span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">日志级别：</span>
              <a-tag :color="getLogLevelColor(data.log_level)">
                {{ data.log_level?.toUpperCase() || 'INFO' }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-item">
              <span class="label">告警阈值：</span>
              <span class="value">{{ data.alert_threshold || 80 }}%</span>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="24">
            <div class="detail-item">
              <span class="label">最后更新时间：</span>
              <span class="value timestamp">{{ formatTime(data.last_update) }}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button @click="testConnection" :loading="testLoading">
          <a-icon type="api" />
          测试连接
        </a-button>
        <a-button @click="refreshData" :loading="refreshLoading">
          <a-icon type="reload" />
          刷新数据
        </a-button>
        <a-button type="primary" @click="editServer">
          <a-icon type="edit" />
          编辑配置
        </a-button>
        <a-button @click="exportConfig">
          <a-icon type="export" />
          导出配置
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ServerDetailModal',
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
  data() {
    return {
      testLoading: false,
      refreshLoading: false
    }
  },
  methods: {
    handleCancel() {
      this.$emit('close')
    },

    // 测试连接
    async testConnection() {
      if (!this.data) return
      
      this.testLoading = true
      try {
        // 模拟连接测试
        setTimeout(() => {
          const success = Math.random() > 0.3
          if (success) {
            this.$message.success(`${this.data.server_name} 连接测试成功`)
          } else {
            this.$message.error(`${this.data.server_name} 连接测试失败`)
          }
          this.testLoading = false
        }, 2000)
      } catch (error) {
        this.testLoading = false
        this.$message.error('连接测试失败')
      }
    },

    // 刷新数据
    async refreshData() {
      if (!this.data) return
      
      this.refreshLoading = true
      try {
        // 模拟数据刷新
        setTimeout(() => {
          this.$message.success('数据刷新成功')
          this.$emit('refresh')
          this.refreshLoading = false
        }, 1000)
      } catch (error) {
        this.refreshLoading = false
        this.$message.error('数据刷新失败')
      }
    },

    // 编辑服务器
    editServer() {
      this.$emit('edit', this.data)
      this.handleCancel()
    },

    // 导出配置
    exportConfig() {
      if (!this.data) return

      const configData = {
        ...this.data,
        exported_at: moment().format()
      }
      
      const blob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${this.data.server_name}_config_${moment().format('YYYYMMDD_HHmmss')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      this.$message.success('配置导出成功')
    },

    // 复制URL
    copyUrl(url) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          this.$message.success('URL已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(url)
        })
      } else {
        this.fallbackCopy(url)
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
        this.$message.success('URL已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }
      document.body.removeChild(textArea)
    },

    // 工具方法
    getConnectionUrl(data) {
      const protocolMap = {
        HTTP: 'http://',
        HTTPS: 'https://',
        TCP: 'tcp://',
        UDP: 'udp://',
        MQTT: 'mqtt://',
        WebSocket: 'ws://'
      }
      const prefix = protocolMap[data.protocol] || 'http://'
      return `${prefix}${data.ip_address}:${data.port}`
    },

    getStatusBadge(status) {
      const badges = {
        online: 'success',
        offline: 'error',
        warning: 'warning'
      }
      return badges[status] || 'default'
    },

    getStatusText(status) {
      const texts = {
        online: '在线',
        offline: '离线',
        warning: '异常'
      }
      return texts[status] || status
    },

    getTypeColor(type) {
      const colors = {
        web: 'blue',
        database: 'green',
        cache: 'orange',
        message: 'purple',
        file: 'cyan',
        monitor: 'red'
      }
      return colors[type] || 'default'
    },

    getTypeIcon(type) {
      const icons = {
        web: 'global',
        database: 'database',
        cache: 'thunderbolt',
        message: 'message',
        file: 'folder',
        monitor: 'monitor'
      }
      return icons[type] || 'server'
    },

    getTypeText(type) {
      const texts = {
        web: 'Web服务器',
        database: '数据库服务器',
        cache: '缓存服务器',
        message: '消息服务器',
        file: '文件服务器',
        monitor: '监控服务器'
      }
      return texts[type] || type
    },

    getEnvColor(env) {
      const colors = {
        production: 'red',
        staging: 'orange',
        development: 'green'
      }
      return colors[env] || 'default'
    },

    getEnvText(env) {
      const texts = {
        production: '生产环境',
        staging: '测试环境',
        development: '开发环境'
      }
      return texts[env] || env
    },

    getProtocolColor(protocol) {
      const colors = {
        HTTP: 'blue',
        HTTPS: 'green',
        TCP: 'orange',
        UDP: 'purple',
        MQTT: 'cyan',
        WebSocket: 'red'
      }
      return colors[protocol] || 'default'
    },

    getAuthTypeText(type) {
      const texts = {
        basic: 'Basic认证',
        token: 'Token认证',
        oauth: 'OAuth认证',
        certificate: '证书认证'
      }
      return texts[type] || type
    },

    getProgressColor(percent) {
      if (percent >= 90) return '#f5222d'
      if (percent >= 80) return '#faad14'
      if (percent >= 60) return '#1890ff'
      return '#52c41a'
    },

    getLogLevelColor(level) {
      const colors = {
        debug: 'gray',
        info: 'blue',
        warn: 'orange',
        error: 'red'
      }
      return colors[level] || 'blue'
    },

    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.server-detail {
  .detail-card {
    margin-bottom: 16px;

    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 120px;
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
      }
    }

    .url-tag {
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }

    .ssl-info,
    .auth-info {
      margin-top: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;

      h4 {
        margin: 0 0 12px 0;
        color: #262626;
        font-size: 14px;
      }
    }

    .performance-item {
      text-align: center;

      .perf-label {
        margin-bottom: 8px;
        color: #595959;
        font-size: 13px;
      }
    }

    .network-item {
      text-align: center;
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
    }

    .extra-config {
      margin-top: 16px;

      h4 {
        margin: 0 0 12px 0;
        color: #262626;
        font-size: 14px;
      }

      .config-json {
        background: #f5f5f5;
        border-radius: 4px;
        padding: 12px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        line-height: 1.4;
        color: #595959;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }
}

@media (max-width: 768px) {
  .server-detail {
    .detail-item {
      flex-direction: column;
      align-items: flex-start;

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
