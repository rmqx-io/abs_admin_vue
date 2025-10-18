<template>
  <a-modal
    :title="getModalTitle()"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <!-- 账号类型选择 -->
      <a-form-item label="账号类型">
        <a-radio-group
          v-decorator="['account_type', {
            rules: [{ required: true, message: '请选择账号类型' }],
            initialValue: 'personal'
          }]"
          :disabled="isEditMode"
          @change="handleAccountTypeChange"
        >
          <a-radio value="personal">个人账号</a-radio>
          <a-radio value="enterprise">企业账号</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 基本信息 -->
      <a-divider orientation="left">基本信息</a-divider>
      
      <a-form-item v-if="accountType === 'personal'" label="姓名">
        <a-input
          v-decorator="['name', {
            rules: [{ required: true, message: '请输入姓名' }]
          }]"
          placeholder="请输入真实姓名"
          :disabled="readonly"
        />
      </a-form-item>
      
      <a-form-item label="邮箱">
        <a-input
          v-decorator="['email', {
            rules: [
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]
          }]"
          placeholder="请输入邮箱地址"
          :disabled="readonly || isEditMode"
        />
      </a-form-item>
      
      <a-form-item label="手机号">
        <a-input
          v-decorator="['phone', {
            rules: [
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]
          }]"
          placeholder="请输入手机号码"
          :disabled="readonly"
        />
      </a-form-item>
      
      <a-form-item v-if="!isEditMode" label="密码">
        <a-input-password
          v-decorator="['password', {
            rules: [
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]
          }]"
          placeholder="请输入登录密码"
          :disabled="readonly"
        />
      </a-form-item>
      
      <a-form-item label="状态">
        <a-select
          v-decorator="['status', {
            initialValue: 'active'
          }]"
          :disabled="readonly"
        >
          <a-select-option value="active">正常</a-select-option>
          <a-select-option value="inactive">禁用</a-select-option>
          <a-select-option value="pending">待审核</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 企业信息 -->
      <template v-if="accountType === 'enterprise'">
        <a-divider orientation="left">企业信息</a-divider>
        
        <a-form-item label="企业名称">
          <a-input
            v-decorator="['enterprise_info.name', {
              rules: [{ required: true, message: '请输入企业名称' }]
            }]"
            placeholder="请输入企业全称"
            :disabled="readonly"
          />
        </a-form-item>
        
        <a-form-item label="企业地址">
          <address-selector
            v-decorator="['enterprise_info.address', {
              rules: [{
                required: true,
                validator: validateAddress,
                message: '请完整填写企业地址'
              }]
            }]"
            :disabled="readonly"
          />
        </a-form-item>
        
        <a-form-item label="主营业务">
          <a-input
            v-decorator="['enterprise_info.business_scope']"
            placeholder="请输入主营业务范围"
            :disabled="readonly"
          />
        </a-form-item>
        
        <a-form-item label="联系电话">
          <a-input
            v-decorator="['enterprise_info.contact_phone', {
              rules: [{ required: true, message: '请输入联系电话' }]
            }]"
            placeholder="请输入企业联系电话"
            :disabled="readonly"
          />
        </a-form-item>
        
        <a-form-item label="企业LOGO">
          <div class="logo-upload-section">
            <a-upload
              name="logo"
              list-type="picture-card"
              class="logo-uploader"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              :custom-request="customUpload"
              :disabled="readonly"
            >
              <img v-if="logoUrl" :src="logoUrl" alt="logo" class="uploaded-logo" />
              <div v-else class="upload-placeholder">
                <a-icon :type="uploading ? 'loading' : 'plus'" />
                <div class="ant-upload-text">上传LOGO</div>
              </div>
            </a-upload>
            <div class="upload-tips">
              <p>支持 JPG、PNG 格式，建议尺寸 200x200 像素</p>
            </div>
          </div>
        </a-form-item>
        
        <a-form-item label="营业执照">
          <a-input
            v-decorator="['enterprise_info.business_license']"
            placeholder="请输入营业执照号码"
            :disabled="readonly"
          />
        </a-form-item>
        
        <a-form-item label="法定代表人">
          <a-input
            v-decorator="['enterprise_info.legal_representative']"
            placeholder="请输入法定代表人姓名"
            :disabled="readonly"
          />
        </a-form-item>
        
        <a-form-item label="注册资本">
          <a-input-number
            v-decorator="['enterprise_info.registered_capital']"
            placeholder="注册资本"
            :min="0"
            :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="value => value.replace(/\$\s?|(,*)/g, '')"
            style="width: 100%"
            :disabled="readonly"
          />
          <span style="margin-left: 8px">万元</span>
        </a-form-item>
      </template>

      <!-- 备注信息 -->
      <a-form-item label="备注">
        <a-textarea
          v-decorator="['remark']"
          placeholder="请输入备注信息（可选）"
          :rows="3"
          :disabled="readonly"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { addAccount, updateAccount, uploadFile } from '@/api/account'
import AddressSelector from '@/components/AddressSelector'

export default {
  name: 'AccountFormModal',
  components: {
    AddressSelector
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    model: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      accountType: 'personal',
      logoUrl: '',
      uploading: false
    }
  },
  computed: {
    isEditMode() {
      return this.model && this.model.id
    },
    readonly() {
      return this.model && this.model.readonly
    }
  },
  watch: {
    visible(val) {
      if (val && this.model) {
        this.$nextTick(() => {
          this.setFormData()
        })
      } else if (!val) {
        this.resetForm()
      }
    }
  },
  methods: {
    getModalTitle() {
      if (this.readonly) {
        return '查看账号'
      }
      return this.isEditMode ? '编辑账号' : '新增账号'
    },
    
    handleAccountTypeChange(e) {
      this.accountType = e.target.value
    },

    validateAddress(rule, value, callback) {
      if (!value || !value.provinceCode || !value.cityCode || !value.districtCode || !value.detailAddress) {
        callback(new Error('请完整填写省市区和详细地址'))
      } else if (value.detailAddress.length < 5) {
        callback(new Error('详细地址至少需要5个字符'))
      } else {
        callback()
      }
    },
    
    setFormData() {
      if (!this.model) return
      
      this.accountType = this.model.account_type || 'personal'
      
      // 设置表单值
      const formData = { ...this.model }
      
      // 处理企业信息
      if (formData.enterprise_info && typeof formData.enterprise_info === 'string') {
        try {
          formData.enterprise_info = JSON.parse(formData.enterprise_info)
        } catch (e) {
          console.warn('Failed to parse enterprise_info:', e)
        }
      }
      
      // 设置LOGO URL
      if (formData.enterprise_info?.logo) {
        this.logoUrl = formData.enterprise_info.logo
      }
      
      this.form.setFieldsValue(formData)
    },
    
    resetForm() {
      this.form.resetFields()
      this.accountType = 'personal'
      this.logoUrl = ''
      this.uploading = false
    },
    
    beforeUpload(file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        this.$message.error('只支持 JPG/PNG 格式的图片')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB')
        return false
      }
      return true
    },
    
    customUpload({ file }) {
      this.uploading = true
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')
      
      uploadFile(formData).then(res => {
        this.logoUrl = res.data.url
        this.form.setFieldsValue({
          'enterprise_info.logo': res.data.url
        })
        this.$message.success('上传成功')
      }).catch(err => {
        console.error('Upload failed:', err)
        this.$message.error('上传失败')
      }).finally(() => {
        this.uploading = false
      })
    },
    
    handleSubmit() {
      if (this.readonly) {
        this.handleCancel()
        return
      }
      
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.$emit('loading', true)
          
          // 处理企业信息
          if (values.account_type === 'enterprise' && values.enterprise_info) {
            values.enterprise_info = {
              ...values.enterprise_info,
              logo: this.logoUrl
            }
          }
          
          const apiCall = this.isEditMode
            ? updateAccount({ ...values, id: this.model.id })
            : addAccount(values)
          
          apiCall.then(() => {
            this.$message.success(this.isEditMode ? '修改成功' : '创建成功')
            this.$emit('ok')
          }).catch(err => {
            console.error('Submit failed:', err)
            this.$message.error(this.isEditMode ? '修改失败' : '创建失败')
          }).finally(() => {
            this.$emit('loading', false)
          })
        }
      })
    },
    
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.logo-upload-section {
  .logo-uploader {
    .uploaded-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
  
  .upload-tips {
    margin-top: 8px;
    
    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 12px;
    }
  }
}

.ant-divider-horizontal.ant-divider-with-text-left {
  margin: 32px 0 24px 0;
}
</style>
