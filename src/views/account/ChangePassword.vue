<template>
  <div class="change-password">
    <a-card title="修改密码" :bordered="false">
      <div class="password-form-wrapper">
        <a-form
          :form="form"
          @submit="handleSubmit"
          layout="vertical"
          :hideRequiredMark="true"
        >
          <a-row :gutter="24">
            <a-col :span="24" :md="12">
              <a-form-item label="当前密码">
                <a-input-password
                  v-decorator="[
                    'old_password',
                    {
                      rules: [
                        { required: true, message: '请输入当前密码' }
                      ]
                    }
                  ]"
                  placeholder="请输入当前密码"
                  autocomplete="current-password"
                />
              </a-form-item>
              
              <a-form-item label="新密码">
                <a-input-password
                  v-decorator="[
                    'new_password',
                    {
                      rules: [
                        { required: true, message: '请输入新密码' },
                        { min: 6, message: '密码长度至少6位' },
                        { max: 20, message: '密码长度不能超过20位' },
                        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字' }
                      ]
                    }
                  ]"
                  placeholder="请输入新密码"
                  autocomplete="new-password"
                />
                <div class="password-tips">
                  <p>密码要求：</p>
                  <ul>
                    <li>长度6-20位</li>
                    <li>必须包含大小写字母</li>
                    <li>必须包含数字</li>
                    <li>可以包含特殊字符 @$!%*?&</li>
                  </ul>
                </div>
              </a-form-item>
              
              <a-form-item label="确认新密码">
                <a-input-password
                  v-decorator="[
                    'confirm_password',
                    {
                      rules: [
                        { required: true, message: '请确认新密码' },
                        { validator: validatePasswordConfirm }
                      ]
                    }
                  ]"
                  placeholder="请再次输入新密码"
                  autocomplete="new-password"
                />
              </a-form-item>
              
              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  :loading="submitting"
                  class="submit-btn"
                >
                  修改密码
                </a-button>
                <a-button
                  style="margin-left: 8px"
                  @click="handleReset"
                >
                  重置
                </a-button>
              </a-form-item>
            </a-col>
            
            <a-col :span="24" :md="12">
              <div class="security-tips">
                <h3><a-icon type="safety" /> 安全提示</h3>
                <div class="tip-item">
                  <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
                  <span>定期更换密码，建议每3个月更换一次</span>
                </div>
                <div class="tip-item">
                  <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
                  <span>不要使用与其他网站相同的密码</span>
                </div>
                <div class="tip-item">
                  <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
                  <span>不要在公共场所输入密码</span>
                </div>
                <div class="tip-item">
                  <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
                  <span>发现异常登录行为请及时修改密码</span>
                </div>
              </div>
              
              <div class="password-history">
                <h3><a-icon type="history" /> 最近密码修改记录</h3>
                <a-list
                  :data-source="passwordHistory"
                  :loading="historyLoading"
                  size="small"
                >
                  <a-list-item slot="renderItem" slot-scope="item">
                    <a-list-item-meta>
                      <div slot="title">
                        {{ formatDate(item.change_time) }}
                      </div>
                      <div slot="description">
                        IP: {{ item.ip_address }} | 设备: {{ item.device_info }}
                      </div>
                    </a-list-item-meta>
                    <div slot="actions">
                      <a-tag :color="item.status === 'success' ? 'green' : 'red'">
                        {{ item.status === 'success' ? '成功' : '失败' }}
                      </a-tag>
                    </div>
                  </a-list-item>
                </a-list>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    
    <!-- 成功提示弹窗 -->
    <a-modal
      title="密码修改成功"
      :visible="successModalVisible"
      :footer="null"
      :closable="false"
      :maskClosable="false"
      centered
    >
      <div class="success-content">
        <a-result
          status="success"
          title="密码修改成功"
          sub-title="为了账号安全，请重新登录"
        >
          <template #extra>
            <a-button type="primary" @click="handleRelogin">
              重新登录
            </a-button>
          </template>
        </a-result>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { changePassword } from '@/api/account'
import { mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'ChangePassword',
  data() {
    return {
      form: this.$form.createForm(this),
      submitting: false,
      successModalVisible: false,
      historyLoading: false,
      passwordHistory: []
    }
  },
  created() {
    this.loadPasswordHistory()
  },
  methods: {
    ...mapActions(['Logout']),
    
    handleSubmit(e) {
      e.preventDefault()
      
      this.form.validateFields(async (err, values) => {
        if (err) {
          return
        }
        
        this.submitting = true
        try {
          await changePassword({
            old_password: values.old_password,
            new_password: values.new_password
          })
          
          this.$message.success('密码修改成功')
          this.successModalVisible = true
          
          // 清空表单
          this.form.resetFields()
        } catch (error) {
          console.error('Change password failed:', error)
          
          // 根据错误类型显示不同的提示
          if (error.response?.status === 400) {
            this.$message.error('当前密码错误')
          } else if (error.response?.status === 422) {
            this.$message.error('新密码不符合安全要求')
          } else {
            this.$message.error('密码修改失败，请稍后重试')
          }
        } finally {
          this.submitting = false
        }
      })
    },
    
    handleReset() {
      this.form.resetFields()
    },
    
    async handleRelogin() {
      try {
        await this.Logout()
        this.$router.push({ name: 'login' })
      } catch (error) {
        console.error('Logout failed:', error)
        // 强制跳转到登录页
        this.$router.push({ name: 'login' })
      }
    },
    
    validatePasswordConfirm(rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('new_password')) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    
    async loadPasswordHistory() {
      this.historyLoading = true
      try {
        // 模拟密码修改历史数据
        // 实际项目中应该调用相应的API
        const mockHistory = [
          {
            id: 1,
            change_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30天前
            ip_address: '192.168.1.100',
            device_info: 'Chrome/Windows',
            status: 'success'
          },
          {
            id: 2,
            change_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90天前
            ip_address: '192.168.1.101',
            device_info: 'Safari/MacOS',
            status: 'success'
          }
        ]
        
        this.passwordHistory = mockHistory
      } catch (error) {
        console.error('Failed to load password history:', error)
      } finally {
        this.historyLoading = false
      }
    },
    
    formatDate(dateString) {
      return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.change-password {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.password-form-wrapper {
  padding: 24px 0;
}

.submit-btn {
  width: 120px;
}

.password-tips {
  margin-top: 8px;
  padding: 12px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  
  p {
    margin: 0 0 8px 0;
    font-weight: 500;
    color: #389e0d;
  }
  
  ul {
    margin: 0;
    padding-left: 16px;
    
    li {
      color: #52c41a;
      font-size: 12px;
      line-height: 1.5;
    }
  }
}

.security-tips {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 16px 0;
    color: #1890ff;
    font-size: 16px;
  }
  
  .tip-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .anticon {
      margin-right: 8px;
      flex-shrink: 0;
    }
    
    span {
      color: #595959;
      font-size: 14px;
    }
  }
}

.password-history {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  
  h3 {
    margin: 0 0 16px 0;
    color: #722ed1;
    font-size: 16px;
  }
}

.success-content {
  text-align: center;
}

@media (max-width: 768px) {
  .change-password {
    padding: 16px;
  }
  
  .password-tips {
    ul {
      padding-left: 12px;
    }
  }
  
  .security-tips,
  .password-history {
    padding: 16px;
    margin-bottom: 16px;
  }
}
</style>