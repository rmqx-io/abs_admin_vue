<template>
  <a-modal
    :visible="visible"
    title="分配处理人员"
    width="500px"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <div v-if="data" class="assign-user">
      <!-- 报修信息 -->
      <a-card size="small" class="repair-info">
        <div class="info-row">
          <span class="label">报修单号：</span>
          <span class="value">RP{{ String(data.id).padStart(6, '0') }}</span>
        </div>
        <div class="info-row">
          <span class="label">设备名称：</span>
          <span class="value">{{ data.device_name }}</span>
        </div>
        <div class="info-row">
          <span class="label">故障描述：</span>
          <span class="value">{{ data.description }}</span>
        </div>
        <div class="info-row">
          <span class="label">紧急程度：</span>
          <a-tag :color="getPriorityColor(data.priority)">
            {{ getPriorityText(data.priority) }}
          </a-tag>
        </div>
      </a-card>

      <!-- 分配表单 -->
      <a-form :form="form" layout="vertical">
        <a-form-item label="选择处理人员" required>
          <a-select
            v-decorator="['assigned_to', {
              rules: [{ required: true, message: '请选择处理人员' }]
            }]"
            placeholder="请选择处理人员"
            showSearch
            optionFilterProp="children"
            @change="handleUserChange"
          >
            <a-select-option
              v-for="user in availableUsers"
              :key="user.id"
              :value="user.id"
              :disabled="user.is_busy"
            >
              <div class="user-option">
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-dept">{{ user.department }}</span>
                </div>
                <div class="user-status">
                  <a-tag
                    :color="user.is_busy ? 'red' : 'green'"
                    size="small"
                  >
                    {{ user.is_busy ? '忙碌' : '空闲' }}
                  </a-tag>
                  <span class="task-count">{{ user.current_tasks }}个任务</span>
                </div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 选中用户的详细信息 -->
        <div v-if="selectedUser" class="user-detail">
          <a-card size="small" title="人员详情">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">专业技能：</span>
                <div class="skill-tags">
                  <a-tag
                    v-for="skill in selectedUser.skills"
                    :key="skill"
                    color="blue"
                    size="small"
                  >
                    {{ skill }}
                  </a-tag>
                </div>
              </div>
              <div class="detail-item">
                <span class="detail-label">工作经验：</span>
                <span class="detail-value">{{ selectedUser.experience }}年</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">好评率：</span>
                <span class="detail-value">{{ selectedUser.rating }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">当前任务：</span>
                <span class="detail-value">{{ selectedUser.current_tasks }}个</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">联系电话：</span>
                <span class="detail-value">{{ selectedUser.phone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">工作状态：</span>
                <a-tag :color="selectedUser.is_busy ? 'red' : 'green'">
                  {{ selectedUser.is_busy ? '忙碌' : '空闲' }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </div>

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

        <a-form-item label="优先级调整">
          <a-select
            v-decorator="['priority', { initialValue: data.priority }]"
            placeholder="请选择优先级"
          >
            <a-select-option value="low">
              <a-tag color="green">低</a-tag>
            </a-select-option>
            <a-select-option value="medium">
              <a-tag color="blue">中</a-tag>
            </a-select-option>
            <a-select-option value="high">
              <a-tag color="orange">高</a-tag>
            </a-select-option>
            <a-select-option value="urgent">
              <a-tag color="red">紧急</a-tag>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="分配说明">
          <a-textarea
            v-decorator="['assignment_note']"
            placeholder="请输入分配说明或特殊要求"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="通知方式">
          <a-checkbox-group v-decorator="['notification_methods', { initialValue: ['sms', 'app'] }]">
            <a-checkbox value="sms">短信通知</a-checkbox>
            <a-checkbox value="email">邮件通知</a-checkbox>
            <a-checkbox value="app">APP推送</a-checkbox>
            <a-checkbox value="call">电话通知</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'AssignUserModal',
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
      form: this.$form.createForm(this),
      loading: false,
      selectedUserId: null,
      availableUsers: [
        {
          id: 1,
          name: '张师傅',
          department: '电气维修组',
          skills: ['电气故障', '线路维修', '配电柜'],
          experience: 8,
          rating: 95,
          current_tasks: 2,
          phone: '138****1234',
          is_busy: false
        },
        {
          id: 2,
          name: '李师傅',
          department: '网络维修组',
          skills: ['网络设备', '路由器', '交换机', '光纤'],
          experience: 6,
          rating: 92,
          current_tasks: 4,
          phone: '139****5678',
          is_busy: true
        },
        {
          id: 3,
          name: '王师傅',
          department: '硬件维修组',
          skills: ['计算机硬件', '服务器', '打印机'],
          experience: 10,
          rating: 98,
          current_tasks: 1,
          phone: '136****9012',
          is_busy: false
        },
        {
          id: 4,
          name: '赵师傅',
          department: '综合维修组',
          skills: ['综合维修', '设备保养', '故障诊断'],
          experience: 12,
          rating: 96,
          current_tasks: 3,
          phone: '137****3456',
          is_busy: false
        },
        {
          id: 5,
          name: '刘师傅',
          department: '电气维修组',
          skills: ['高压电气', '变压器', '发电机'],
          experience: 15,
          rating: 99,
          current_tasks: 0,
          phone: '135****7890',
          is_busy: false
        }
      ]
    }
  },
  computed: {
    selectedUser() {
      return this.availableUsers.find(user => user.id === this.selectedUserId)
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
      this.selectedUserId = null
    },

    handleUserChange(userId) {
      this.selectedUserId = userId
    },

    async handleOk() {
      try {
        const values = await this.form.validateFields()
        this.loading = true

        const assignData = {
          repair_id: this.data.id,
          assigned_to: values.assigned_to,
          estimated_duration: values.estimated_duration,
          priority: values.priority,
          assignment_note: values.assignment_note,
          notification_methods: values.notification_methods
        }

        // 模拟API调用
        await this.assignRepair(assignData)

        this.$message.success('分配成功，已通知处理人员')
        this.$emit('refresh')
        this.handleCancel()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('分配失败:', error)
        this.$message.error('分配失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleCancel() {
      this.$emit('close')
    },

    async assignRepair(data) {
      // 模拟API处理
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('分配数据:', data)
          resolve()
        }, 1000)
      })
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
.assign-user {
  .repair-info {
    margin-bottom: 16px;
    background: #f8f9fa;

    .info-row {
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

  .user-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .user-info {
      display: flex;
      flex-direction: column;

      .user-name {
        font-weight: 500;
        color: #262626;
      }

      .user-dept {
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .user-status {
      display: flex;
      align-items: center;
      gap: 8px;

      .task-count {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }

  .user-detail {
    margin: 16px 0;

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      .detail-item {
        display: flex;
        align-items: center;

        .detail-label {
          width: 80px;
          color: #595959;
          font-size: 13px;
        }

        .detail-value {
          color: #262626;
          font-weight: 500;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .assign-user {
    .user-option {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .detail-item {
      flex-direction: column;
      align-items: flex-start;

      .detail-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>
