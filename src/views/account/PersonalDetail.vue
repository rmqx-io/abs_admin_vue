<template>
  <div class="personal-detail">
    <a-card :loading="loading">
      <!-- 个人头部信息 -->
      <div class="personal-header">
        <div class="personal-avatar">
          <a-avatar
            :size="80"
            :src="accountInfo.avatar"
            :style="{ backgroundColor: '#1890ff' }"
          >
            {{ accountInfo.name?.charAt(0) || 'U' }}
          </a-avatar>
        </div>
        <div class="personal-basic">
          <h2>{{ accountInfo.name || '未设置姓名' }}</h2>
          <div class="personal-tags">
            <a-tag color="green">个人账号</a-tag>
            <a-tag :color="getStatusColor(accountInfo.status)">
              {{ getStatusText(accountInfo.status) }}
            </a-tag>
          </div>
          <div class="personal-contact">
            <div><a-icon type="mail" /> {{ accountInfo.email }}</div>
            <div v-if="accountInfo.phone">
              <a-icon type="phone" /> {{ accountInfo.phone }}
            </div>
            <div v-if="personalInfo.address">
              <a-icon type="environment" /> {{ personalInfo.address }}
            </div>
          </div>
        </div>
        <div class="personal-actions">
          <a-button type="primary" @click="handleEdit">
            <a-icon type="edit" />
            编辑个人信息
          </a-button>
          <a-button @click="handlePasswordReset">
            <a-icon type="key" />
            重置密码
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 详细信息卡片 -->
    <a-row :gutter="[24, 24]" style="margin-top: 24px">
      <!-- 个人信息 -->
      <a-col :xs="24" :lg="12">
        <a-card title="个人详细信息" size="small">
          <div class="info-section">
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ accountInfo.name || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>性别：</label>
              <span>{{ formatGender(personalInfo.gender) }}</span>
            </div>
            <div class="info-item">
              <label>年龄：</label>
              <span>{{ personalInfo.age || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>身份证号：</label>
              <span>{{ formatIdCard(personalInfo.id_card) }}</span>
            </div>
            <div class="info-item">
              <label>居住地址：</label>
              <span>{{ personalInfo.address || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>紧急联系人：</label>
              <span>{{ personalInfo.emergency_contact || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>紧急联系电话：</label>
              <span>{{ personalInfo.emergency_phone || '暂无' }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 账号信息 -->
      <a-col :xs="24" :lg="12">
        <a-card title="账号信息" size="small">
          <div class="info-section">
            <div class="info-item">
              <label>登录邮箱：</label>
              <span>{{ accountInfo.email }}</span>
            </div>
            <div class="info-item">
              <label>手机号码：</label>
              <span>{{ accountInfo.phone || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>账号状态：</label>
              <a-tag :color="getStatusColor(accountInfo.status)">
                {{ getStatusText(accountInfo.status) }}
              </a-tag>
            </div>
            <div class="info-item">
              <label>注册时间：</label>
              <span>{{ formatDate(accountInfo.created_at) }}</span>
            </div>
            <div class="info-item">
              <label>最后登录：</label>
              <span>{{ formatDate(accountInfo.last_login) }}</span>
            </div>
            <div class="info-item">
              <label>登录次数：</label>
              <span>{{ accountInfo.login_count || 0 }} 次</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 操作记录 -->
    <a-card title="最近操作记录" style="margin-top: 24px">
      <a-table
        :columns="operationColumns"
        :dataSource="operationList"
        :loading="operationLoading"
        :pagination="{
          current: operationPage,
          pageSize: operationPageSize,
          total: operationTotal,
          showSizeChanger: false,
          showQuickJumper: true,
          onChange: handleOperationPageChange
        }"
        rowKey="id"
        size="small"
      >
        <span slot="operation_type" slot-scope="text">
          <a-tag :color="getOperationColor(text)">
            {{ getOperationText(text) }}
          </a-tag>
        </span>

        <span slot="result" slot-scope="text">
          <a-badge
            :status="text === 'success' ? 'success' : 'error'"
            :text="text === 'success' ? '成功' : '失败'"
          />
        </span>

        <span slot="operation_time" slot-scope="text">
          {{ formatDate(text) }}
        </span>
      </a-table>
    </a-card>

    <!-- 编辑个人信息弹窗 -->
    <account-form-modal
      ref="accountModal"
      :visible="editModalVisible"
      :loading="editModalLoading"
      :model="accountInfo"
      @cancel="handleEditCancel"
      @ok="handleEditOk"
    />

    <!-- 重置密码弹窗 -->
    <a-modal
      title="重置密码"
      :visible="passwordModalVisible"
      :loading="passwordModalLoading"
      @cancel="handlePasswordCancel"
      @ok="handlePasswordOk"
    >
      <a-form :form="passwordForm" layout="vertical">
        <a-form-item label="新密码">
          <a-input-password
            v-decorator="[
              'new_password',
              {
                rules: [
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' }
                ]
              }
            ]"
            placeholder="请输入新密码"
          />
        </a-form-item>
        <a-form-item label="确认密码">
          <a-input-password
            v-decorator="[
              'confirm_password',
              {
                rules: [
                  { required: true, message: '请确认密码' },
                  { validator: validatePasswordConfirm }
                ]
              }
            ]"
            placeholder="请再次输入新密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { getAccountList, resetPassword } from '@/api/account'
import AccountFormModal from './components/AccountFormModal'
import moment from 'moment'

const operationColumns = [
  {
    title: '操作类型',
    dataIndex: 'operation_type',
    width: 120,
    scopedSlots: { customRender: 'operation_type' }
  },
  {
    title: '操作描述',
    dataIndex: 'description',
    ellipsis: true
  },
  {
    title: 'IP地址',
    dataIndex: 'ip_address',
    width: 120
  },
  {
    title: '操作结果',
    dataIndex: 'result',
    width: 80,
    scopedSlots: { customRender: 'result' }
  },
  {
    title: '操作时间',
    dataIndex: 'operation_time',
    width: 160,
    scopedSlots: { customRender: 'operation_time' }
  }
]

export default {
  name: 'PersonalDetail',
  components: {
    AccountFormModal
  },
  data() {
    this.operationColumns = operationColumns
    return {
      loading: false,
      accountInfo: {},
      personalInfo: {},

      // 操作记录
      operationList: [],
      operationLoading: false,
      operationPage: 1,
      operationPageSize: 10,
      operationTotal: 0,

      // 编辑弹窗
      editModalVisible: false,
      editModalLoading: false,

      // 密码重置弹窗
      passwordModalVisible: false,
      passwordModalLoading: false,
      passwordForm: this.$form.createForm(this)
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const accountId = this.$route.params.id
      if (!accountId) {
        this.$message.error('账号ID无效')
        this.$router.go(-1)
        return
      }

      this.loading = true
      try {
        const response = await getAccountList({
          id: accountId,
          page_size: 1
        })

        if (response.data.records?.length > 0) {
          const account = response.data.records[0]
          this.accountInfo = account

          // 解析个人信息
          if (account.personal_info) {
            if (typeof account.personal_info === 'string') {
              try {
                this.personalInfo = JSON.parse(account.personal_info)
              } catch (e) {
                console.warn('Failed to parse personal_info:', e)
                this.personalInfo = {}
              }
            } else {
              this.personalInfo = account.personal_info
            }
          }

          // 加载操作记录
          this.loadOperationHistory(accountId)
        } else {
          this.$message.error('账号不存在')
          this.$router.go(-1)
        }
      } catch (error) {
        console.error('Failed to load account:', error)
        this.$message.error('加载账号信息失败')
      } finally {
        this.loading = false
      }
    },

    async loadOperationHistory(accountId) {
      this.operationLoading = true
      try {
        // 模拟操作记录数据
        const mockOperations = [
          {
            id: 1,
            operation_type: 'login',
            description: '用户登录系统',
            ip_address: '192.168.1.100',
            result: 'success',
            operation_time: new Date(Date.now() - 1000 * 60 * 30) // 30分钟前
          },
          {
            id: 2,
            operation_type: 'update_profile',
            description: '更新个人资料',
            ip_address: '192.168.1.100',
            result: 'success',
            operation_time: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2小时前
          },
          {
            id: 3,
            operation_type: 'change_password',
            description: '修改登录密码',
            ip_address: '192.168.1.100',
            result: 'success',
            operation_time: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1天前
          }
        ]

        this.operationList = mockOperations
        this.operationTotal = mockOperations.length
      } catch (error) {
        console.error('Failed to load operation history:', error)
        this.$message.error('加载操作记录失败')
      } finally {
        this.operationLoading = false
      }
    },

    handleOperationPageChange(page) {
      this.operationPage = page
      this.loadOperationHistory(this.accountInfo.id)
    },

    handleEdit() {
      this.editModalVisible = true
    },

    handleEditCancel() {
      this.editModalVisible = false
    },

    handleEditOk() {
      this.editModalVisible = false
      this.loadData()
    },

    handlePasswordReset() {
      this.passwordModalVisible = true
      this.passwordForm.resetFields()
    },

    handlePasswordCancel() {
      this.passwordModalVisible = false
      this.passwordForm.resetFields()
    },

    async handlePasswordOk() {
      try {
        const values = await this.passwordForm.validateFields()
        this.passwordModalLoading = true

        await resetPassword({
          account_id: this.accountInfo.id,
          new_password: values.new_password
        })

        this.$message.success('密码重置成功')
        this.passwordModalVisible = false
        this.passwordForm.resetFields()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('Reset password failed:', error)
        this.$message.error('密码重置失败')
      } finally {
        this.passwordModalLoading = false
      }
    },

    validatePasswordConfirm(rule, value, callback) {
      const form = this.passwordForm
      if (value && value !== form.getFieldValue('new_password')) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },

    getStatusColor(status) {
      const colorMap = {
        'active': 'green',
        'inactive': 'red',
        'pending': 'orange'
      }
      return colorMap[status] || 'default'
    },

    getStatusText(status) {
      const textMap = {
        'active': '正常',
        'inactive': '禁用',
        'pending': '待审核'
      }
      return textMap[status] || status
    },

    getOperationColor(type) {
      const colorMap = {
        'login': 'blue',
        'logout': 'default',
        'update_profile': 'green',
        'change_password': 'orange',
        'delete': 'red'
      }
      return colorMap[type] || 'default'
    },

    getOperationText(type) {
      const textMap = {
        'login': '登录',
        'logout': '登出',
        'update_profile': '更新资料',
        'change_password': '修改密码',
        'delete': '删除操作'
      }
      return textMap[type] || type
    },

    formatDate(dateString) {
      return dateString ? moment(dateString).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    formatGender(gender) {
      const genderMap = {
        'male': '男',
        'female': '女',
        'other': '其他'
      }
      return genderMap[gender] || '未设置'
    },

    formatIdCard(idCard) {
      if (!idCard) return '暂无'
      // 身份证号脱敏显示
      return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
    }
  }
}
</script>

<style scoped>
.personal-detail {
  .personal-header {
    display: flex;
    align-items: flex-start;
    gap: 24px;

    .personal-avatar {
      flex-shrink: 0;
    }

    .personal-basic {
      flex: 1;

      h2 {
        margin: 0 0 8px 0;
        color: #262626;
      }

      .personal-tags {
        margin-bottom: 12px;
      }

      .personal-contact {
        color: #595959;

        div {
          margin-bottom: 4px;

          .anticon {
            margin-right: 8px;
            color: #8c8c8c;
          }
        }
      }
    }

    .personal-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .info-section {
    .info-item {
      display: flex;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        min-width: 100px;
        font-weight: 500;
        color: #262626;
      }

      span {
        color: #595959;
        flex: 1;
      }
    }
  }
}

@media (max-width: 768px) {
  .personal-detail {
    .personal-header {
      flex-direction: column;
      gap: 16px;

      .personal-actions {
        flex-direction: row;
        align-self: stretch;
      }
    }
  }
}
</style>
