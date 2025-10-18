<template>
  <a-card :bordered="false">
    <div class="page-header">
      <h2>新增设备</h2>
      <p>请填写设备基本信息，其他信息将由系统自动生成</p>
    </div>

    <a-form
      :form="form"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 12 }"
      class="device-form"
    >
      <a-divider orientation="left">基本信息</a-divider>
      
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
        <div class="field-hint">设备的唯一标识符，支持8-20位字母数字组合</div>
      </a-form-item>

      <a-form-item label="设备类型">
        <a-select
          v-decorator="['device_type', {
            rules: [{ required: true, message: '请选择设备类型' }]
          }]"
          placeholder="请选择设备类型"
          @change="handleDeviceTypeChange"
        >
          <a-select-option value="smart_switch">智能开关</a-select-option>
          <a-select-option value="smart_light">智能灯</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="设备型号">
        <a-select
          v-decorator="['device_model_id', {
            rules: [{ required: true, message: '请选择设备型号' }]
          }]"
          placeholder="请先选择设备类型"
          :disabled="!selectedDeviceType"
          :loading="loadingModels"
          @change="handleModelChange"
        >
          <a-select-option
            v-for="model in availableModels"
            :key="model.id"
            :value="model.id"
          >
            {{ model.name }} ({{ model.manufacturer }})
          </a-select-option>
        </a-select>
        <div class="field-hint">根据设备类型显示可选型号</div>
      </a-form-item>

      <!-- 智能开关特有字段 -->
      <a-form-item
        label="总功率"
        v-if="selectedDeviceType === 'smart_switch'"
      >
        <a-input-number
          v-decorator="['total_power', {
            rules: [{ required: true, message: '请输入总功率' }]
          }]"
          placeholder="请输入总功率"
          min="0"
          max="10000"
          step="0.1"
          style="width: 200px"
        />
        <span style="margin-left: 8px;">W</span>
        <div class="field-hint">智能开关控制的所有负载的总功率</div>
      </a-form-item>

      <a-divider orientation="left">安装信息</a-divider>

      <a-form-item label="安装地址">
        <address-selector
          v-decorator="['address', {
            rules: [{ 
              required: true, 
              validator: validateAddress,
              message: '请完整填写安装地址'
            }]
          }]"
          @change="handleAddressChange"
        />
        <div class="field-hint">请选择省市区并填写详细地址</div>
      </a-form-item>

      <a-form-item label="店铺名称">
        <a-input
          v-decorator="['shop_name']"
          placeholder="请输入店铺名称（可选）"
        />
        <div class="field-hint">如果是商铺设备，请填写店铺名称</div>
      </a-form-item>

      <a-divider orientation="left">电费信息</a-divider>

      <a-form-item label="电费单价">
        <a-input-number
          v-decorator="['electricity_rate', {
            rules: [{ required: true, message: '请输入电费单价' }],
            initialValue: 0.52
          }]"
          placeholder="请输入电费单价"
          min="0"
          max="10"
          step="0.01"
          precision="2"
          style="width: 200px"
        />
        <span style="margin-left: 8px;">元/度</span>
        <div class="field-hint">当地的电费单价，用于计算节能效益</div>
      </a-form-item>

      <a-divider orientation="left">安装人员</a-divider>

      <a-form-item label="安装人员">
        <a-input
          v-decorator="['installer_name', {
            rules: [{ required: true, message: '请输入安装人员姓名' }]
          }]"
          placeholder="请输入安装人员姓名"
        />
      </a-form-item>

      <a-form-item label="联系电话">
        <a-input
          v-decorator="['installer_phone', {
            rules: [
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]
          }]"
          placeholder="请输入安装人员联系电话"
        />
      </a-form-item>

      <a-divider orientation="left">系统自动生成信息</a-divider>

      <div class="auto-generated-info">
        <a-row :gutter="24">
          <a-col :span="8">
            <div class="info-item">
              <label>安装日期：</label>
              <span>{{ currentDate }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <label>设备状态：</label>
              <a-tag color="green">待安装</a-tag>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <label>固件版本：</label>
              <span>{{ selectedModelInfo.firmware_version || '自动检测' }}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="8">
            <div class="info-item">
              <label>初始节能：</label>
              <span>0.0 KWH</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <label>累计工作时长：</label>
              <span>0 小时</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ currentDateTime }}</span>
            </div>
          </a-col>
        </a-row>
      </div>

      <a-form-item label="备注">
        <a-textarea
          v-decorator="['remark']"
          placeholder="请输入备注信息（可选）"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
        <a-button type="primary" @click="handleSubmit" :loading="submitting">
          提交
        </a-button>
        <a-button style="margin-left: 8px" @click="handleReset">
          重置
        </a-button>
        <a-button style="margin-left: 8px" @click="handleCancel">
          取消
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import moment from 'moment'
import AddressSelector from '@/components/AddressSelector'
import {
  getSmartSwitchModelList,
  getSmartLightModelList,
  addInstalledDevice
} from '@/api/smartLight'

export default {
  name: 'AddNewDevice',
  components: {
    AddressSelector
  },
  data() {
    return {
      form: this.$form.createForm(this),
      submitting: false,
      loadingModels: false,
      
      // 设备类型和型号
      selectedDeviceType: null,
      availableModels: [],
      selectedModelInfo: {},
      
      // 地址信息
      selectedAddress: {},
      
      // 时间信息
      currentDate: moment().format('YYYY-MM-DD'),
      currentDateTime: moment().format('YYYY-MM-DD HH:mm:ss')
    }
  },
  methods: {
    async handleDeviceTypeChange(deviceType) {
      this.selectedDeviceType = deviceType
      this.availableModels = []
      this.selectedModelInfo = {}
      
      // 重置设备型号字段
      this.form.setFieldsValue({
        device_model_id: undefined
      })
      
      // 加载对应的设备型号
      await this.loadDeviceModels(deviceType)
    },
    
    async loadDeviceModels(deviceType) {
      this.loadingModels = true
      try {
        const apiCall = deviceType === 'smart_switch' 
          ? getSmartSwitchModelList 
          : getSmartLightModelList
          
        const response = await apiCall({
          page_no: 1,
          page_size: 100,
          status: 1 // 只获取启用的型号
        })
        
        this.availableModels = response.data.records || []
      } catch (error) {
        console.error('Failed to load device models:', error)
        this.$message.error('加载设备型号失败')
        this.availableModels = []
      } finally {
        this.loadingModels = false
      }
    },
    
    handleModelChange(modelId) {
      const model = this.availableModels.find(m => m.id === modelId)
      if (model) {
        this.selectedModelInfo = model
      }
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

    handleAddressChange(addressData) {
      this.selectedAddress = addressData
    },
    
    handleSubmit() {
      this.form.validateFields(async (errors, values) => {
        if (!errors) {
          this.submitting = true
          
          try {
            // 使用新的地址数据结构
            const addressInfo = values.address || {}
            
            // 组装设备数据
            const deviceData = {
              ...values,
              province_code: addressInfo.provinceCode,
              province_name: addressInfo.provinceName,
              city_code: addressInfo.cityCode,
              city_name: addressInfo.cityName,
              district_code: addressInfo.districtCode,
              district_name: addressInfo.districtName,
              detail_address: addressInfo.detailAddress,
              full_address: addressInfo.fullAddress,
              address_summary: this.generateAddressSummary(addressInfo.fullAddress, values.shop_name),
              model_name: this.selectedModelInfo.name,
              manufacturer: this.selectedModelInfo.manufacturer,
              firmware_version: this.selectedModelInfo.firmware_version || 'V1.0.0',
              install_date: this.currentDate,
              status: 'pending_install', // 待安装状态
              energy_saved: 0,
              total_working_hours: 0,
              avg_daily_usage: 0,
              installer_account: values.installer_name
            }
            
            await addInstalledDevice(deviceData)
            
            this.$message.success('设备添加成功')
            this.$router.push('/list/installed-devices')
            
          } catch (error) {
            console.error('Failed to add device:', error)
            this.$message.error('设备添加失败')
          } finally {
            this.submitting = false
          }
        }
      })
    },
    
    handleReset() {
      this.form.resetFields()
      this.selectedDeviceType = null
      this.availableModels = []
      this.selectedModelInfo = {}
      this.availableCities = []
      this.availableDistricts = []
      this.selectedProvince = null
      this.selectedCity = null
    },
    
    handleCancel() {
      this.$router.go(-1)
    },
    
    generateAddressSummary(fullAddress, shopName) {
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
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #262626;
}

.page-header p {
  margin: 0;
  color: #595959;
}

.device-form {
  max-width: 800px;
}

.field-hint {
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 4px;
}

.auto-generated-info {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 8px;
}

.info-item label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-right: 8px;
}

.info-item span {
  color: rgba(0, 0, 0, 0.65);
}

.ant-divider-horizontal.ant-divider-with-text-left {
  margin: 32px 0 24px 0;
}

.ant-form-item {
  margin-bottom: 24px;
}
</style>