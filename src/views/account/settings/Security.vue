<template>
  <div class="security-settings">
    <a-list
      itemLayout="horizontal"
      :dataSource="data"
    >
      <a-list-item slot="renderItem" slot-scope="item, index" :key="index">
        <a-list-item-meta>
          <a slot="title">{{ item.title }}</a>
          <span slot="description">
            <span class="security-list-description">{{ item.description }}</span>
            <span v-if="item.value"> : </span>
            <span class="security-list-value">{{ item.value }}</span>
          </span>
        </a-list-item-meta>
        <template v-if="item.actions">
          <a slot="actions" @click="item.actions.callback">{{ item.actions.title }}</a>
        </template>
      </a-list-item>
    </a-list>

    <!-- 修改密码弹窗 -->
    <a-modal
      title="修改密码"
      :visible="passwordModalVisible"
      :confirmLoading="passwordLoading"
      @ok="handlePasswordOk"
      @cancel="handlePasswordCancel"
      width="500px"
    >
      <a-form :form="passwordForm" layout="vertical">
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
              <li>必须包含大小写字母和数字</li>
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
      </a-form>
    </a-modal>

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
  name: 'SecuritySettings',
  data() {
    return {
      passwordModalVisible: false,
      passwordLoading: false,
      successModalVisible: false,
      passwordForm: this.$form.createForm(this)
    }
  },
  computed: {
    data() {
      return [
        {
          title: this.$t('account.settings.security.password'),
          description: this.$t('account.settings.security.password-description'),
          value: '强',
          actions: {
            title: this.$t('account.settings.security.modify'),
            callback: this.showPasswordModal
          }
        },
        {
          title: this.$t('account.settings.security.phone'),
          description: this.$t('account.settings.security.phone-description'),
          value: '138****8293',
          actions: {
            title: this.$t('account.settings.security.modify'),
            callback: () => { this.$message.info('手机号修改功能开发中') }
          }
        },
        {
          title: this.$t('account.settings.security.question'),
          description: this.$t('account.settings.security.question-description'),
          value: '',
          actions: {
            title: this.$t('account.settings.security.set'),
            callback: () => { this.$message.info('密保问题设置功能开发中') }
          }
        },
        {
          title: this.$t('account.settings.security.email'),
          description: this.$t('account.settings.security.email-description'),
          value: 'ant***sign.com',
          actions: {
            title: this.$t('account.settings.security.modify'),
            callback: () => { this.$message.info('邮箱修改功能开发中') }
          }
        },
        {
          title: this.$t('account.settings.security.mfa'),
          description: this.$t('account.settings.security.mfa-description'),
          value: '',
          actions: {
            title: this.$t('account.settings.security.bind'),
            callback: () => { this.$message.info('多因素认证功能开发中') }
          }
        }
      ]
    }
  },
  methods: {
    ...mapActions(['Logout']),

    showPasswordModal() {
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
        this.passwordLoading = true

        await changePassword({
          old_password: values.old_password,
          new_password: values.new_password
        })

        this.$message.success('密码修改成功')
        this.passwordModalVisible = false
        this.successModalVisible = true
        this.passwordForm.resetFields()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }

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
        this.passwordLoading = false
      }
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
      const form = this.passwordForm
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
.security-settings {
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

  .success-content {
    text-align: center;
  }
}

.security-list-description {
  color: rgba(0, 0, 0, 0.45);
}

.security-list-value {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}
</style>
