<template>
  <a-modal
    :title="model && model.id ? '编辑智能灯型号' : '新增智能灯型号'"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="型号名称">
            <a-input
              v-decorator="['name', {
                rules: [{ required: true, message: '请输入型号名称' }]
              }]"
              placeholder="请输入型号名称"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="厂商">
            <a-input
              v-decorator="['manufacturer', {
                rules: [{ required: true, message: '请输入厂商' }]
              }]"
              placeholder="请输入厂商"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="功率范围">
            <a-input
              v-decorator="['power_range', {
                rules: [{ required: true, message: '请输入功率范围' }]
              }]"
              placeholder="例如: 5W-100W"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="支持调光">
            <a-switch
              v-decorator="['support_dimming', {
                valuePropName: 'checked',
                initialValue: false
              }]"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="色温范围">
            <a-input
              v-decorator="['color_temp_range', {
                rules: [{ required: true, message: '请输入色温范围' }]
              }]"
              placeholder="例如: 2700K-6500K"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="支持彩色">
            <a-switch
              v-decorator="['support_color', {
                valuePropName: 'checked',
                initialValue: false
              }]"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="灯具类型">
            <a-select
              v-decorator="['light_type', {
                rules: [{ required: true, message: '请选择灯具类型' }]
              }]"
              placeholder="请选择灯具类型"
            >
              <a-select-option value="bulb">灯泡</a-select-option>
              <a-select-option value="strip">灯带</a-select-option>
              <a-select-option value="panel">面板灯</a-select-option>
              <a-select-option value="tube">灯管</a-select-option>
              <a-select-option value="spotlight">射灯</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工作电压">
            <a-input
              v-decorator="['working_voltage', {
                rules: [{ required: true, message: '请输入工作电压' }]
              }]"
              placeholder="例如: AC220V 或 DC12V"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="通信协议">
            <a-select
              v-decorator="['communication_protocol', {
                rules: [{ required: true, message: '请选择通信协议' }]
              }]"
              placeholder="请选择通信协议"
            >
              <a-select-option value="WiFi">WiFi</a-select-option>
              <a-select-option value="Zigbee">Zigbee</a-select-option>
              <a-select-option value="Bluetooth">Bluetooth</a-select-option>
              <a-select-option value="LoRa">LoRa</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态">
            <a-select
              v-decorator="['status', {
                initialValue: 1
              }]"
              placeholder="请选择状态"
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="光通量">
            <a-input
              v-decorator="['luminous_flux']"
              placeholder="例如: 800lm"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="使用寿命">
            <a-input
              v-decorator="['lifespan']"
              placeholder="例如: 25000小时"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="型号描述">
        <a-textarea
          v-decorator="['description']"
          placeholder="请输入型号描述"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>

      <a-form-item label="技术规格">
        <a-textarea
          v-decorator="['specifications']"
          placeholder="请输入技术规格"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
export default {
  name: 'CreateSmartLightForm',
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
          this.form.setFieldsValue(this.model)
        })
      } else if (!val) {
        this.form.resetFields()
      }
    }
  },
  methods: {
    handleSubmit() {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          // 设置设备类型
          values.device_type = 'smart_light'
          
          // 如果是编辑模式，添加ID
          if (this.model && this.model.id) {
            values.id = this.model.id
          }
          
          this.$emit('ok', values)
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
.ant-form-item {
  margin-bottom: 16px;
}
</style>
