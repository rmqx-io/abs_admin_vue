<template>
  <a-modal
    :visible="visible"
    :title="getModalTitle()"
    width="600px"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <div v-if="data" class="repair-process">
      <!-- 报修信息摘要 -->
      <a-card size="small" class="summary-card">
        <div class="repair-summary">
          <div class="summary-item">
            <span class="label">报修单号：</span>
            <span class="value">RP{{ String(data.id).padStart(6, '0') }}</span>
          </div>
          <div class="summary-item">
            <span class="label">设备名称：</span>
            <span class="value">{{ data.device_name }}</span>
          </div>
          <div class="summary-item">
            <span class="label">故障描述：</span>
            <span class="value">{{ data.description }}</span>
          </div>
          <div class="summary-item">
            <span class="label">紧急程度：</span>
            <a-tag :color="getPriorityColor(data.priority)">
              {{ getPriorityText(data.priority) }}
            </a-tag>
          </div>
        </div>
      </a-card>

      <!-- 处理表单 -->
      <a-form :form="form" layout="vertical" class="process-form">
        <!-- 接受处理 -->
        <template v-if="action === 'accept'">
          <a-form-item label="预计处理时长">
            <a-input-number
              v-decorator="['estimated_duration', {
                rules: [{ required: true, message: '请输入预计处理时长' }]
              }]"
              placeholder="请输入预计处理时长"
              :min="0.5"
              :max="168"
              :step="0.5"
              style="width: 200px"
            />
            <span style="margin-left: 8px">小时</span>
          </a-form-item>

          <a-form-item label="分配给">
            <a-select
              v-decorator="['assigned_to', {
                rules: [{ required: true, message: '请选择处理人员' }]
              }]"
              placeholder="请选择处理人员"
              showSearch
              optionFilterProp="children"
            >
              <a-select-option
                v-for="user in maintainers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }} ({{ user.department }})
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="处理计划">
            <a-textarea
              v-decorator="['process_plan', {
                rules: [{ required: true, message: '请输入处理计划' }]
              }]"
              placeholder="请详细描述处理计划和步骤"
              :rows="4"
            />
          </a-form-item>
        </template>

        <!-- 完成处理 -->
        <template v-if="action === 'complete'">
          <a-form-item label="实际处理时长">
            <a-input-number
              v-decorator="['actual_duration', {
                rules: [{ required: true, message: '请输入实际处理时长' }]
              }]"
              placeholder="请输入实际处理时长"
              :min="0.1"
              :max="168"
              :step="0.1"
              style="width: 200px"
            />
            <span style="margin-left: 8px">小时</span>
          </a-form-item>

          <a-form-item label="故障原因">
            <a-select
              v-decorator="['fault_cause', {
                rules: [{ required: true, message: '请选择故障原因' }]
              }]"
              placeholder="请选择故障原因"
            >
              <a-select-option value="hardware_aging">硬件老化</a-select-option>
              <a-select-option value="software_bug">软件缺陷</a-select-option>
              <a-select-option value="network_issue">网络问题</a-select-option>
              <a-select-option value="power_problem">电源问题</a-select-option>
              <a-select-option value="environment">环境因素</a-select-option>
              <a-select-option value="human_error">人为操作</a-select-option>
              <a-select-option value="other">其他原因</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="解决方案">
            <a-textarea
              v-decorator="['solution', {
                rules: [{ required: true, message: '请输入解决方案' }]
              }]"
              placeholder="请详细描述具体的解决方案和处理过程"
              :rows="4"
            />
          </a-form-item>

          <a-form-item label="更换配件">
            <a-input
              v-decorator="['replaced_parts']"
              placeholder="如有更换配件，请填写配件信息"
            />
          </a-form-item>

          <a-form-item label="维修费用">
            <a-input-number
              v-decorator="['repair_cost']"
              placeholder="请输入维修费用"
              :min="0"
              :precision="2"
              style="width: 200px"
            />
            <span style="margin-left: 8px">元</span>
          </a-form-item>

          <a-form-item label="质保期">
            <a-input-number
              v-decorator="['warranty_days']"
              placeholder="质保天数"
              :min="0"
              :max="365"
              style="width: 200px"
            />
            <span style="margin-left: 8px">天</span>
          </a-form-item>
        </template>

        <!-- 拒绝处理 -->
        <template v-if="action === 'reject'">
          <a-form-item label="拒绝原因">
            <a-select
              v-decorator="['reject_reason', {
                rules: [{ required: true, message: '请选择拒绝原因' }]
              }]"
              placeholder="请选择拒绝原因"
            >
              <a-select-option value="insufficient_info">信息不足</a-select-option>
              <a-select-option value="not_covered">不在保修范围</a-select-option>
              <a-select-option value="user_error">用户操作不当</a-select-option>
              <a-select-option value="duplicate">重复报修</a-select-option>
              <a-select-option value="resource_unavailable">资源不足</a-select-option>
              <a-select-option value="other">其他原因</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="详细说明">
            <a-textarea
              v-decorator="['reject_note', {
                rules: [{ required: true, message: '请输入详细说明' }]
              }]"
              placeholder="请详细说明拒绝原因，以便用户了解"
              :rows="4"
            />
          </a-form-item>

          <a-form-item label="建议方案">
            <a-textarea
              v-decorator="['suggestions']"
              placeholder="请提供建议的解决方案或替代方案"
              :rows="3"
            />
          </a-form-item>
        </template>

        <!-- 通用字段 -->
        <a-form-item label="备注信息">
          <a-textarea
            v-decorator="['note']"
            placeholder="请输入其他备注信息"
            :rows="3"
          />
        </a-form-item>

        <!-- 附件上传 -->
        <a-form-item label="相关附件">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            :remove="handleRemoveFile"
            multiple
            :show-upload-list="true"
          >
            <a-button>
              <a-icon type="upload" />
              上传附件
            </a-button>
          </a-upload>
          <div class="upload-hint">
            支持上传图片、文档等文件，单个文件不超过10MB
          </div>
        </a-form-item>

        <!-- 通知设置 -->
        <a-form-item label="通知设置">
          <a-checkbox-group v-decorator="['notifications', { initialValue: ['sms', 'email'] }]">
            <a-checkbox value="sms">短信通知</a-checkbox>
            <a-checkbox value="email">邮件通知</a-checkbox>
            <a-checkbox value="app">APP推送</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'RepairProcessModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    action: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      fileList: [],
      maintainers: [
        { id: 1, name: '张师傅', department: '电气维修组' },
        { id: 2, name: '李师傅', department: '网络维修组' },
        { id: 3, name: '王师傅', department: '硬件维修组' },
        { id: 4, name: '赵师傅', department: '综合维修组' }
      ]
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
    getModalTitle() {
      const titleMap = {
        accept: '接受处理',
        complete: '完成处理',
        reject: '拒绝处理'
      }
      return titleMap[this.action] || '处理报修'
    },

    resetForm() {
      this.form.resetFields()
      this.fileList = []
    },

    async handleOk() {
      try {
        const values = await this.form.validateFields()
        this.loading = true

        // 处理文件上传
        const attachments = this.fileList.map(file => ({
          name: file.name,
          url: file.url || file.response?.url,
          type: this.getFileType(file.name)
        }))

        const processData = {
          ...values,
          action: this.action,
          repair_id: this.data.id,
          attachments: attachments
        }

        // 模拟API调用
        await this.processRepair(processData)

        this.$message.success(this.getSuccessMessage())
        this.$emit('refresh')
        this.handleCancel()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('处理失败:', error)
        this.$message.error('处理失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleCancel() {
      this.$emit('close')
    },

    async processRepair(data) {
      // 模拟API处理
      return new Promise((resolve) => {
        setTimeout(resolve, 1000)
      })
    },

    getSuccessMessage() {
      const messageMap = {
        accept: '已接受处理，将通知相关人员',
        complete: '处理完成，已通知报修人',
        reject: '已拒绝处理，已通知报修人'
      }
      return messageMap[this.action] || '处理成功'
    },

    beforeUpload(file) {
      const isValidType = this.isValidFileType(file.name)
      if (!isValidType) {
        this.$message.error('不支持的文件格式')
        return false
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB')
        return false
      }

      // 添加到文件列表
      this.fileList.push({
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      })

      return false // 阻止自动上传
    },

    handleRemoveFile(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.fileList.splice(index, 1)
      }
    },

    isValidFileType(fileName) {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.avi']
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      return validExtensions.includes(extension)
    },

    getFileType(fileName) {
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      const typeMap = {
        '.jpg': 'image',
        '.jpeg': 'image',
        '.png': 'image',
        '.pdf': 'pdf',
        '.doc': 'doc',
        '.docx': 'doc',
        '.txt': 'text',
        '.mp4': 'video',
        '.avi': 'video'
      }
      return typeMap[extension] || 'file'
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
    }
  }
}
</script>

<style scoped>
.repair-process {
  .summary-card {
    margin-bottom: 16px;
    background: #fafafa;

    .repair-summary {
      .summary-item {
        display: flex;
        margin-bottom: 8px;
        align-items: center;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 80px;
          color: #595959;
          font-weight: 500;
        }

        .value {
          color: #262626;
          flex: 1;
        }
      }
    }
  }

  .process-form {
    .upload-hint {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 4px;
    }
  }
}

@media (max-width: 768px) {
  .repair-process {
    .summary-item {
      flex-direction: column;
      align-items: flex-start;

      .label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>
