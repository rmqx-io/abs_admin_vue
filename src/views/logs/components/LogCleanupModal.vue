<template>
  <a-modal
    :visible="visible"
    title="日志清理"
    width="600px"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <div class="cleanup-content">
      <a-alert
        message="注意"
        description="日志清理操作不可逆，请谨慎操作。建议在清理前先导出重要日志。"
        type="warning"
        show-icon
        style="margin-bottom: 20px"
      />

      <!-- 清理策略 -->
      <a-form :form="form" layout="vertical">
        <a-form-item label="清理策略">
          <a-radio-group
            v-decorator="['cleanupStrategy', { initialValue: 'by_time' }]"
            @change="handleStrategyChange"
          >
            <a-radio value="by_time">按时间清理</a-radio>
            <a-radio value="by_size">按大小清理</a-radio>
            <a-radio value="by_count">按数量清理</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 按时间清理 -->
        <div v-if="cleanupStrategy === 'by_time'">
          <a-form-item label="保留时长">
            <a-select
              v-decorator="['retentionDays', { initialValue: 30 }]"
              placeholder="选择保留时长"
            >
              <a-select-option :value="7">7天</a-select-option>
              <a-select-option :value="15">15天</a-select-option>
              <a-select-option :value="30">30天</a-select-option>
              <a-select-option :value="60">60天</a-select-option>
              <a-select-option :value="90">90天</a-select-option>
              <a-select-option :value="180">180天</a-select-option>
              <a-select-option :value="365">365天</a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <!-- 按大小清理 -->
        <div v-if="cleanupStrategy === 'by_size'">
          <a-form-item label="最大存储空间">
            <a-input-number
              v-decorator="['maxSize', { initialValue: 1 }]"
              :min="0.1"
              :step="0.1"
              style="width: 200px"
            />
            <a-select
              v-decorator="['sizeUnit', { initialValue: 'GB' }]"
              style="width: 80px; margin-left: 8px"
            >
              <a-select-option value="MB">MB</a-select-option>
              <a-select-option value="GB">GB</a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <!-- 按数量清理 -->
        <div v-if="cleanupStrategy === 'by_count'">
          <a-form-item label="最大日志条数">
            <a-input-number
              v-decorator="['maxCount', { initialValue: 10000 }]"
              :min="1000"
              :step="1000"
              style="width: 200px"
            />
            <span style="margin-left: 8px">条</span>
          </a-form-item>
        </div>

        <!-- 日志类型选择 -->
        <a-form-item label="清理范围">
          <a-checkbox-group
            v-decorator="['logTypes', {
              initialValue: ['device', 'user', 'admin', 'operation', 'maintenance']
            }]"
          >
            <a-row>
              <a-col :span="8">
                <a-checkbox value="device">设备日志</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="user">用户日志</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="admin">后台日志</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="operation">操作日志</a-checkbox>
              </a-col>
              <a-col :span="8">
                <a-checkbox value="maintenance">维修日志</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>

        <!-- 日志级别选择 -->
        <a-form-item label="清理级别">
          <a-checkbox-group
            v-decorator="['logLevels', { initialValue: ['debug'] }]"
          >
            <a-checkbox value="debug">调试</a-checkbox>
            <a-checkbox value="info">信息</a-checkbox>
            <a-checkbox value="warn">警告</a-checkbox>
            <a-checkbox value="error">错误</a-checkbox>
          </a-checkbox-group>
          <div class="level-hint">
            建议只清理调试级别日志，保留重要的警告和错误日志
          </div>
        </a-form-item>

        <!-- 预览信息 -->
        <a-form-item label="清理预览">
          <div class="cleanup-preview">
            <a-spin :spinning="previewLoading">
              <div v-if="previewData" class="preview-stats">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <div class="stat-item">
                      <div class="stat-value">{{ previewData.totalCount }}</div>
                      <div class="stat-label">将清理日志条数</div>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="stat-item">
                      <div class="stat-value">{{ formatSize(previewData.totalSize) }}</div>
                      <div class="stat-label">将释放存储空间</div>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="stat-item">
                      <div class="stat-value">{{ previewData.oldestDate }}</div>
                      <div class="stat-label">最早日志时间</div>
                    </div>
                  </a-col>
                </a-row>
              </div>
              <a-button @click="previewCleanup" style="margin-top: 12px">
                <a-icon type="eye" />
                预览清理结果
              </a-button>
            </a-spin>
          </div>
        </a-form-item>

        <!-- 自动清理设置 -->
        <a-form-item label="自动清理">
          <a-switch
            v-decorator="['autoCleanup', { valuePropName: 'checked' }]"
            @change="handleAutoCleanupChange"
          />
          <span style="margin-left: 8px">启用自动清理</span>
          
          <div v-if="autoCleanupEnabled" style="margin-top: 12px">
            <a-form-item label="清理频率" :colon="false">
              <a-select
                v-decorator="['cleanupFrequency', { initialValue: 'weekly' }]"
                style="width: 200px"
              >
                <a-select-option value="daily">每天</a-select-option>
                <a-select-option value="weekly">每周</a-select-option>
                <a-select-option value="monthly">每月</a-select-option>
              </a-select>
            </a-form-item>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'LogCleanupModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      previewLoading: false,
      cleanupStrategy: 'by_time',
      autoCleanupEnabled: false,
      previewData: null
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
      this.cleanupStrategy = 'by_time'
      this.autoCleanupEnabled = false
      this.previewData = null
    },

    handleStrategyChange(e) {
      this.cleanupStrategy = e.target.value
      this.previewData = null
    },

    handleAutoCleanupChange(checked) {
      this.autoCleanupEnabled = checked
    },

    async previewCleanup() {
      try {
        const values = this.form.getFieldsValue()
        this.previewLoading = true

        // 模拟预览计算
        const previewData = await this.calculateCleanupPreview(values)
        this.previewData = previewData
      } catch (error) {
        console.error('预览失败:', error)
        this.$message.error('预览失败')
      } finally {
        this.previewLoading = false
      }
    },

    async calculateCleanupPreview(params) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟计算清理预览数据
          const mockData = {
            totalCount: Math.floor(Math.random() * 50000) + 10000,
            totalSize: Math.floor(Math.random() * 100) * 1024 * 1024, // MB
            oldestDate: moment().subtract(params.retentionDays || 30, 'days').format('YYYY-MM-DD')
          }
          resolve(mockData)
        }, 1000)
      })
    },

    async handleOk() {
      try {
        const values = await this.form.validateFields()
        
        // 确认清理操作
        const confirmed = await this.showConfirmDialog(values)
        if (!confirmed) return

        this.loading = true

        // 执行清理
        await this.executeCleanup(values)

        this.$message.success('日志清理完成')
        this.$emit('refresh')
        this.handleCancel()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('清理失败:', error)
        this.$message.error('清理失败，请重试')
      } finally {
        this.loading = false
      }
    },

    showConfirmDialog(params) {
      return new Promise((resolve) => {
        this.$confirm({
          title: '确认清理',
          content: `您确定要执行日志清理操作吗？此操作不可撤销。预计将清理 ${this.previewData?.totalCount || '未知'} 条日志。`,
          okText: '确认清理',
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

    async executeCleanup(params) {
      // 模拟清理执行
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('执行日志清理:', params)
          resolve()
        }, 2000)
      })
    },

    handleCancel() {
      this.resetForm()
      this.$emit('close')
    },

    formatSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.cleanup-content {
  .level-hint {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 4px;
  }

  .cleanup-preview {
    background: #f5f5f5;
    border-radius: 6px;
    padding: 16px;

    .preview-stats {
      .stat-item {
        text-align: center;

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #262626;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }
}
</style>
