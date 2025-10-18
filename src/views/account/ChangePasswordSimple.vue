<template>
  <div class="change-password-simple">
    <a-card title="修改密码" :bordered="false">
      <a-form
        :form="form"
        @submit="handleSubmit"
        layout="vertical"
        :hideRequiredMark="true"
      >
        <a-row :gutter="24">
          <a-col :span="24" :md="16">
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
          
          <a-col :span="24" :md="8">
            <div class="password-tips">
              <h4><a-icon type="info-circle" /> 密码要求</h4>
              <ul>
                <li>长度6-20位</li>
                <li>必须包含大小写字母</li>
                <li>必须包含数字</li>
                <li>可以包含特殊字符 @$!%*?&</li>
              </ul>
            </div>
            
            <div class="security-tips">
              <h4><a-icon type="safety" /> 安全提示</h4>
              <ul>
                <li>定期更换密码</li>
                <li>不要使用弱密码</li>
                <li>不要在公共场所输入密码</li>
                <li>发现异常及时修改密码</li>
              </ul>
            </div>
          </a-col>
        </a-row>
      </a-form>
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

export default {
  name: 'ChangePasswordSimple',
  data() {
    return {
      form: this.$form.createForm(this),
      submitting: false,
      successModalVisible: false
    }
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
    }
  }
}
</script>

<style scoped>
.change-password-simple {
  .submit-btn {
    width: 120px;
  }
  
  .password-tips,
  .security-tips {
    padding: 16px;
    margin-bottom: 16px;
    background-color: #fafafa;
    border-radius: 8px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #1890ff;
      font-size: 14px;
      font-weight: 500;
    }
    
    ul {
      margin: 0;
      padding-left: 16px;
      
      li {
        color: #595959;
        font-size: 13px;
        line-height: 1.6;
        margin-bottom: 4px;
      }
    }
  }
  
  .password-tips {
    border-left: 3px solid #52c41a;
    
    h4 {
      color: #52c41a;
    }
  }
  
  .security-tips {
    border-left: 3px solid #1890ff;
  }
  
  .success-content {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .change-password-simple {
    .password-tips,
    .security-tips {
      padding: 12px;
      margin-bottom: 12px;
    }
  }
}
</style>