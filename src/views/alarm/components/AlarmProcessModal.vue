<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="loading"
    width="600px"
    :destroyOnClose="true"
  >
    <a-form :form="form" layout="vertical">
      <div v-if="batch">
        <a-alert
          :message="`批量处理 ${selectedIds.length} 条预警`"
          type="info" 
          show-icon
          style="margin-bottom: 16px"
        />
      </div>
      
      <div v-else-if="alarm" class="alarm-info">
        <h4>{{ getAlarmTypeText(alarm.alarm_type) }}</h4>
        <p>{{ alarm.message }}</p>
        <div class="alarm-meta">
          <span>设备：{{ alarm.device_name }}</span>
          <span>级别：{{ getLevelText(alarm.alarm_level) }}</span>
          <span>时间：{{ formatDate(alarm.created_at) }}</span>
        </div>
      </div>

      <a-form-item label="处理动作">
        <a-radio-group v-decorator="['action', { initialValue: 'resolve' }]" @change="handleActionChange">
          <a-radio value="resolve">解决预警</a-radio>
          <a-radio value="assign">指派处理</a-radio>
          <a-radio value="ignore">忽略预警</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="指派人员" v-if="selectedAction === 'assign'">
        <a-select
          v-decorator="['assignee', {
            rules: [{ required: selectedAction === 'assign', message: '请选择指派人员' }]
          }]"
          placeholder="请选择指派人员"
          showSearch
          optionFilterProp="children"
        >
          <a-select-option
            v-for="user in availableUsers"
            :key="user.id"
            :value="user.id"
          >
            {{ user.name }} ({{ user.department }})
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="处理说明">
        <a-textarea
          v-decorator="['note', {
            rules: [{ required: true, message: '请输入处理说明' }]
          }]"
          placeholder="请详细说明处理过程和结果..."
          :rows="4"
          :maxLength="500"
          showCount
        />
      </a-form-item>

      <a-form-item label="优先级" v-if="selectedAction === 'assign'">
        <a-select
          v-decorator="['priority', { initialValue: 'normal' }]"
          placeholder="请选择优先级"
        >
          <a-select-option value="high">高</a-select-option>
          <a-select-option value="normal">普通</a-select-option>
          <a-select-option value="low">低</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="预计完成时间" v-if="selectedAction === 'assign'">
        <a-date-picker
          v-decorator="['expected_time']"
          placeholder="请选择预计完成时间"
          showTime
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="上传附件" v-if="selectedAction === 'resolve'">
        <a-upload
          :fileList="fileList"
          @change="handleFileChange"
          :beforeUpload="beforeUpload"
          :customRequest="customUpload"
          multiple
        >
          <a-button>
            <a-icon type="upload" />
            上传附件
          </a-button>
        </a-upload>
        <div class="upload-hint">支持上传图片、文档等文件，最大10MB</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AlarmProcessModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    alarm: {
      type: Object,
      default: null
    },
    batch: {
      type: Boolean,
      default: false
    },
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      selectedAction: 'resolve',
      fileList: [],
      availableUsers: [
        { id: '1', name: '张三', department: '技术部' },
        { id: '2', name: '李四', department: '运维部' },
        { id: '3', name: '王五', department: '技术部' },
        { id: '4', name: '赵六', department: '设备部' }
      ]
    }
  },
  computed: {
    modalTitle() {
      if (this.batch) {
        return '批量处理预警'
      }
      return '处理预警'
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm()
      }
    }
  },
  methods: {
    resetForm() {
      this.form.resetFields()
      this.selectedAction = 'resolve'
      this.fileList = []
    },

    handleActionChange(e) {
      this.selectedAction = e.target.value
    },

    async handleOk() {
      try {
        const values = await this.form.validateFields()
        this.loading = true

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))

        const result = {
          action: values.action,
          note: values.note,
          assignee: values.assignee,
          priority: values.priority,
          expected_time: values.expected_time ? values.expected_time.format('YYYY-MM-DD HH:mm:ss') : null,
          attachments: this.fileList.map(file => file.response?.url || file.url).filter(Boolean)
        }

        if (this.batch) {
          result.alarm_ids = this.selectedIds
        } else {
          result.alarm_id = this.alarm.id
        }

        this.$message.success(this.getSuccessMessage(values.action))
        this.$emit('success', result)
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('Process alarm failed:', error)
        this.$message.error('处理失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleCancel() {
      this.$emit('close')
    },

    getSuccessMessage(action) {
      const messageMap = {
        'resolve': this.batch ? '批量解决成功' : '预警已解决',
        'assign': this.batch ? '批量指派成功' : '预警已指派',
        'ignore': this.batch ? '批量忽略成功' : '预警已忽略'
      }
      return messageMap[action] || '处理成功'
    },

    handleFileChange({ fileList }) {
      this.fileList = fileList
    },

    beforeUpload(file) {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      if (!isValidType) {
        this.$message.error('只能上传图片、PDF或Word文档')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB')
        return false
      }
      return false // 阻止默认上传，使用自定义上传
    },

    customUpload({ file, onSuccess, onError }) {
      // 模拟文件上传
      setTimeout(() => {
        const response = {
          url: `https://example.com/files/${file.name}`,
          name: file.name
        }
        onSuccess(response)
      }, 1000)
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

    getLevelText(level) {
      const textMap = {
        'critical': '严重',
        'warning': '警告',
        'info': '信息'
      }
      return textMap[level] || level
    },

    formatDate(dateString) {
      return moment(dateString).format('MM-DD HH:mm')
    }
  }
}
</script>

<style scoped>
.alarm-info {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 16px;

  h4 {
    margin: 0 0 8px 0;
    color: #1890ff;
  }

  p {
    margin: 0 0 12px 0;
    color: #595959;
    line-height: 1.5;
  }

  .alarm-meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #8c8c8c;

    span {
      &:not(:last-child)::after {
        content: '|';
        margin-left: 8px;
        color: #d9d9d9;
      }
    }
  }
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

@media (max-width: 768px) {
  .alarm-info {
    .alarm-meta {
      flex-direction: column;
      gap: 4px;

      span::after {
        display: none;
      }
    }
  }
}
</style>