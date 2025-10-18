<template>
  <a-modal
    :title="model && model.id ? '编辑设备' : '新增设备'"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="设备编号">
            <a-input
              v-decorator="['device_id', {
                rules: [
                  { required: true, message: '请输入设备编号' },
                  { pattern: /^[A-Za-z0-9]{8,20}$/, message: '设备编号为8-20位字母数字组合' }
                ]
              }]"
              placeholder="请输入设备编号"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="设备类型">
            <a-select
              v-decorator="['device_type', {
                rules: [{ required: true, message: '请选择设备类型' }]
              }]"
              placeholder="请选择设备类型"
            >
              <a-select-option value="smart_switch">智能开关</a-select-option>
              <a-select-option value="smart_light">智能灯</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="设备型号">
            <a-input
              v-decorator="['model_name', {
                rules: [{ required: true, message: '请输入设备型号' }]
              }]"
              placeholder="请输入设备型号"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="固件版本">
            <a-input
              v-decorator="['firmware_version', {
                rules: [{ required: true, message: '请输入固件版本' }]
              }]"
              placeholder="请输入固件版本"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="安装日期">
            <a-date-picker
              v-decorator="['install_date', {
                rules: [{ required: true, message: '请选择安装日期' }]
              }]"
              placeholder="请选择安装日期"
              format="YYYY-MM-DD"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="安装人员账号">
            <a-input
              v-decorator="['installer_account', {
                rules: [{ required: true, message: '请输入安装人员账号' }]
              }]"
              placeholder="请输入安装人员账号"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="联系电话">
            <a-input
              v-decorator="['installer_phone', {
                rules: [
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]
              }]"
              placeholder="请输入联系电话"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="门牌号">
            <a-input
              v-decorator="['house_number', {
                rules: [{ required: true, message: '请输入门牌号' }]
              }]"
              placeholder="请输入门牌号"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="店铺名称">
            <a-input
              v-decorator="['shop_name']"
              placeholder="请输入店铺名称（可选）"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="初始节能">
            <a-input-number
              v-decorator="['energy_saved', {
                initialValue: 0
              }]"
              placeholder="初始节能值"
              min="0"
              step="0.1"
              style="width: 100%"
            />
            <span style="margin-left: 8px; color: #999;">KWH</span>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="详细地址">
        <a-textarea
          v-decorator="['full_address', {
            rules: [{ required: true, message: '请输入详细地址' }]
          }]"
          placeholder="请输入详细的安装地址"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>

      <a-form-item label="备注">
        <a-textarea
          v-decorator="['remark']"
          placeholder="请输入备注信息（可选）"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: 'InstalledDeviceForm',
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
      form: this.$form.createForm(this)
    }
  },
  watch: {
    visible(val) {
      if (val && this.model) {
        this.$nextTick(() => {
          // 编辑模式，设置表单值
          const formData = { ...this.model }
          // 转换日期格式
          if (formData.install_date) {
            formData.install_date = this.$moment(formData.install_date)
          }
          this.form.setFieldsValue(formData)
        })
      } else if (!val) {
        // 关闭弹窗时重置表单
        this.form.resetFields()
      }
    }
  },
  methods: {
    handleSubmit() {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          // 处理日期格式
          if (values.install_date && values.install_date.format) {
            values.install_date = values.install_date.format('YYYY-MM-DD')
          }
          
          // 如果是编辑模式，添加ID
          if (this.model && this.model.id) {
            values.id = this.model.id
          }
          
          // 生成地址摘要
          values.address_summary = this.generateAddressSummary(values.full_address, values.shop_name)
          
          this.$emit('ok', values)
        }
      })
    },
    
    handleCancel() {
      this.$emit('cancel')
    },
    
    generateAddressSummary(fullAddress, shopName) {
      if (!fullAddress) return ''
      
      let summary = fullAddress
      if (summary.length > 30) {
        summary = summary.substring(0, 30) + '...'
      }
      
      if (shopName) {
        summary += ` (${shopName})`
      }
      
      return summary
    }
  }
}
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}
</style>
