<template>
  <a-modal
    :visible="visible"
    title="批量操作"
    width="600px"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <div class="batch-operation">
      <!-- 选中的服务器 -->
      <a-card title="选中的服务器" size="small" class="selected-servers">
        <div v-if="selectedServers.length === 0" class="no-selection">
          <a-empty description="未选择任何服务器" />
        </div>
        <div v-else class="server-list">
          <a-list
            :data-source="selectedServers"
            :pagination="false"
            size="small"
          >
            <a-list-item slot="renderItem" slot-scope="item">
              <div class="server-item">
                <div class="server-info">
                  <a-icon :type="getTypeIcon(item.server_type)" />
                  <span class="server-name">{{ item.server_name }}</span>
                  <a-tag :color="getTypeColor(item.server_type)" size="small">
                    {{ getTypeText(item.server_type) }}
                  </a-tag>
                </div>
                <div class="server-status">
                  <a-badge
                    :status="getStatusBadge(item.status)"
                    :text="getStatusText(item.status)"
                  />
                </div>
              </div>
            </a-list-item>
          </a-list>
        </div>
      </a-card>

      <!-- 操作选择 -->
      <a-card title="选择操作" size="small" class="operation-card">
        <a-form :form="form" layout="vertical">
          <a-form-item label="批量操作类型">
            <a-radio-group
              v-decorator="['operationType', { initialValue: 'status' }]"
              @change="handleOperationChange"
            >
              <a-radio value="status">状态变更</a-radio>
              <a-radio value="config">配置更新</a-radio>
              <a-radio value="monitor">监控设置</a-radio>
              <a-radio value="delete">批量删除</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 状态变更 -->
          <div v-if="operationType === 'status'">
            <a-form-item label="目标状态">
              <a-select
                v-decorator="['targetStatus', {
                  rules: [{ required: true, message: '请选择目标状态' }]
                }]"
                placeholder="选择要设置的状态"
              >
                <a-select-option value="online">
                  <a-badge status="success" text="在线" />
                </a-select-option>
                <a-select-option value="offline">
                  <a-badge status="error" text="离线" />
                </a-select-option>
                <a-select-option value="warning">
                  <a-badge status="warning" text="异常" />
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="变更原因">
              <a-textarea
                v-decorator="['statusReason']"
                placeholder="请输入状态变更的原因"
                :rows="2"
              />
            </a-form-item>
          </div>

          <!-- 配置更新 -->
          <div v-if="operationType === 'config'">
            <a-form-item label="更新配置">
              <a-checkbox-group v-decorator="['configUpdates']">
                <a-row>
                  <a-col :span="12">
                    <a-checkbox value="ssl">启用SSL</a-checkbox>
                  </a-col>
                  <a-col :span="12">
                    <a-checkbox value="auth">启用认证</a-checkbox>
                  </a-col>
                  <a-col :span="12">
                    <a-checkbox value="monitoring">启用监控</a-checkbox>
                  </a-col>
                  <a-col :span="12">
                    <a-checkbox value="logging">更新日志级别</a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-form-item>

            <a-form-item label="日志级别" v-if="configUpdates.includes('logging')">
              <a-select
                v-decorator="['logLevel']"
                placeholder="选择日志级别"
              >
                <a-select-option value="debug">Debug</a-select-option>
                <a-select-option value="info">Info</a-select-option>
                <a-select-option value="warn">Warn</a-select-option>
                <a-select-option value="error">Error</a-select-option>
              </a-select>
            </a-form-item>
          </div>

          <!-- 监控设置 -->
          <div v-if="operationType === 'monitor'">
            <a-form-item label="监控操作">
              <a-radio-group v-decorator="['monitorAction']">
                <a-radio value="enable">启用监控</a-radio>
                <a-radio value="disable">禁用监控</a-radio>
                <a-radio value="update_threshold">更新告警阈值</a-radio>
              </a-radio-group>
            </a-form-item>

            <div v-if="monitorAction === 'update_threshold'">
              <a-form-item label="CPU告警阈值(%)">
                <a-input-number
                  v-decorator="['cpuThreshold']"
                  :min="50"
                  :max="95"
                  style="width: 100%"
                />
              </a-form-item>
              <a-form-item label="内存告警阈值(%)">
                <a-input-number
                  v-decorator="['memoryThreshold']"
                  :min="50"
                  :max="95"
                  style="width: 100%"
                />
              </a-form-item>
            </div>
          </div>

          <!-- 批量删除 -->
          <div v-if="operationType === 'delete'">
            <a-alert
              message="危险操作"
              description="批量删除操作不可逆，请确保已备份重要配置。删除后的服务器配置将无法恢复。"
              type="error"
              show-icon
              style="margin-bottom: 16px"
            />
            <a-form-item label="确认删除">
              <a-checkbox
                v-decorator="['confirmDelete', {
                  rules: [{ required: true, message: '请确认删除操作' }],
                  valuePropName: 'checked'
                }]"
              >
                我确认要删除选中的 {{ selectedServers.length }} 个服务器配置
              </a-checkbox>
            </a-form-item>
          </div>

          <!-- 通用字段 -->
          <a-form-item label="操作备注">
            <a-textarea
              v-decorator="['notes']"
              placeholder="请输入本次批量操作的备注信息"
              :rows="2"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 操作预览 -->
      <a-card title="操作预览" size="small" class="preview-card" v-if="operationPreview">
        <div class="preview-content">
          <div class="preview-summary">
            <a-statistic
              title="影响服务器数量"
              :value="selectedServers.length"
              :value-style="{ color: '#1890ff' }"
            />
          </div>
          <div class="preview-details">
            <h4>操作详情：</h4>
            <ul>
              <li v-for="detail in operationPreview" :key="detail">{{ detail }}</li>
            </ul>
          </div>
        </div>
      </a-card>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'BatchOperationModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedServers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      operationType: 'status',
      configUpdates: [],
      monitorAction: 'enable'
    }
  },
  computed: {
    operationPreview() {
      if (this.selectedServers.length === 0) return null

      const previews = []
      const count = this.selectedServers.length

      switch (this.operationType) {
        case 'status':
          previews.push(`将 ${count} 个服务器状态设置为指定状态`)
          previews.push('同时记录状态变更原因')
          break
        case 'config':
          if (this.configUpdates.length > 0) {
            previews.push(`更新 ${count} 个服务器的配置项`)
            previews.push(`包含: ${this.configUpdates.join(', ')}`)
          }
          break
        case 'monitor':
          previews.push(`${count} 个服务器的监控设置将被更新`)
          break
        case 'delete':
          previews.push(`⚠️ 将永久删除 ${count} 个服务器配置`)
          previews.push('此操作不可撤销')
          break
      }

      return previews
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm()
      }
    }
  },
  methods: {
    resetForm() {
      this.form.resetFields()
      this.operationType = 'status'
      this.configUpdates = []
      this.monitorAction = 'enable'
    },

    handleOperationChange(e) {
      this.operationType = e.target.value
    },

    async handleOk() {
      if (this.selectedServers.length === 0) {
        this.$message.warning('请先选择要操作的服务器')
        return
      }

      try {
        const values = await this.form.validateFields()
        
        // 危险操作二次确认
        if (this.operationType === 'delete') {
          const confirmed = await this.showDeleteConfirm()
          if (!confirmed) return
        }

        this.loading = true

        const operationData = {
          operation_type: this.operationType,
          server_ids: this.selectedServers.map(server => server.id),
          ...values
        }

        // 执行批量操作
        await this.executeBatchOperation(operationData)

        this.$message.success('批量操作执行成功')
        this.$emit('refresh')
        this.handleCancel()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('批量操作失败:', error)
        this.$message.error('批量操作失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleCancel() {
      this.resetForm()
      this.$emit('close')
    },

    showDeleteConfirm() {
      return new Promise((resolve) => {
        this.$confirm({
          title: '确认批量删除',
          content: `您确定要删除选中的 ${this.selectedServers.length} 个服务器配置吗？此操作不可撤销！`,
          okText: '确认删除',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            resolve(true)
          },
          onCancel() {
            resolve(false)
          }
        })
      })
    },

    async executeBatchOperation(data) {
      // 模拟批量操作执行
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('执行批量操作:', data)
          resolve()
        }, 2000)
      })
    },

    // 工具方法
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

    getTypeText(type) {
      const texts = {
        web: 'Web',
        database: '数据库',
        cache: '缓存',
        message: '消息',
        file: '文件',
        monitor: '监控'
      }
      return texts[type] || type
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
    }
  }
}
</script>

<style scoped>
.batch-operation {
  .selected-servers {
    margin-bottom: 16px;

    .no-selection {
      text-align: center;
      padding: 20px;
    }

    .server-list {
      max-height: 200px;
      overflow-y: auto;

      .server-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .server-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .server-name {
            font-weight: 500;
            color: #262626;
          }
        }
      }
    }
  }

  .operation-card {
    margin-bottom: 16px;
  }

  .preview-card {
    .preview-content {
      .preview-summary {
        text-align: center;
        margin-bottom: 16px;
      }

      .preview-details {
        h4 {
          margin: 0 0 8px 0;
          color: #262626;
        }

        ul {
          margin: 0;
          padding-left: 20px;
          color: #595959;

          li {
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}
</style>
