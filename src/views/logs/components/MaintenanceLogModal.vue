<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    width="700px"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
  >
    <a-form :form="form" layout="vertical">
      <!-- 基本信息 -->
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="维修人员">
            <a-input
              v-decorator="['maintainer_name', {
                rules: [{ required: true, message: '请输入维修人员姓名' }]
              }]"
              placeholder="请输入维修人员姓名"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="维修日期">
            <a-date-picker
              v-decorator="['maintenance_date', {
                rules: [{ required: true, message: '请选择维修日期' }]
              }]"
              style="width: 100%"
              :show-time="{ format: 'HH:mm' }"
              format="YYYY-MM-DD HH:mm"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="设备ID">
            <a-input
              v-decorator="['device_id', {
                rules: [{ required: true, message: '请输入设备ID' }]
              }]"
              placeholder="请输入设备ID"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="设备名称">
            <a-input
              v-decorator="['device_name', {
                rules: [{ required: true, message: '请输入设备名称' }]
              }]"
              placeholder="请输入设备名称"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 维修信息 -->
      <a-form-item label="维修类型">
        <a-select
          v-decorator="['maintenance_type', {
            rules: [{ required: true, message: '请选择维修类型' }]
          }]"
          placeholder="请选择维修类型"
        >
          <a-select-option value="preventive">预防性维修</a-select-option>
          <a-select-option value="corrective">故障维修</a-select-option>
          <a-select-option value="emergency">紧急维修</a-select-option>
          <a-select-option value="upgrade">设备升级</a-select-option>
          <a-select-option value="inspection">设备巡检</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="故障现象">
        <a-textarea
          v-decorator="['fault_description', {
            rules: [{ required: true, message: '请描述故障现象' }]
          }]"
          placeholder="请详细描述设备故障现象或维修原因"
          :rows="3"
        />
      </a-form-item>

      <a-form-item label="维修过程">
        <a-textarea
          v-decorator="['maintenance_process', {
            rules: [{ required: true, message: '请描述维修过程' }]
          }]"
          placeholder="请详细描述维修步骤和操作过程"
          :rows="4"
        />
      </a-form-item>

      <a-form-item label="解决方案">
        <a-textarea
          v-decorator="['solution', {
            rules: [{ required: true, message: '请描述解决方案' }]
          }]"
          placeholder="请描述最终的解决方案"
          :rows="3"
        />
      </a-form-item>

      <!-- 更换配件 -->
      <a-form-item label="更换配件">
        <div class="parts-section">
          <div
            v-for="(part, index) in parts"
            :key="index"
            class="part-item"
          >
            <a-row :gutter="8">
              <a-col :span="8">
                <a-input
                  v-model="part.name"
                  placeholder="配件名称"
                />
              </a-col>
              <a-col :span="6">
                <a-input
                  v-model="part.model"
                  placeholder="型号"
                />
              </a-col>
              <a-col :span="4">
                <a-input-number
                  v-model="part.quantity"
                  placeholder="数量"
                  :min="1"
                  style="width: 100%"
                />
              </a-col>
              <a-col :span="4">
                <a-input-number
                  v-model="part.price"
                  placeholder="单价"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </a-col>
              <a-col :span="2">
                <a-button
                  type="danger"
                  size="small"
                  icon="delete"
                  @click="removePart(index)"
                />
              </a-col>
            </a-row>
          </div>
          <a-button @click="addPart" type="dashed" style="width: 100%; margin-top: 8px">
            <a-icon type="plus" />
            添加配件
          </a-button>
        </div>
      </a-form-item>

      <!-- 成本信息 -->
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="人工费用(元)">
            <a-input-number
              v-decorator="['labor_cost']"
              placeholder="人工费用"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="维修时长(小时)">
            <a-input-number
              v-decorator="['duration']"
              placeholder="维修时长"
              :min="0.1"
              :step="0.1"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="维修状态">
            <a-select
              v-decorator="['status', { initialValue: 'completed' }]"
              placeholder="请选择状态"
            >
              <a-select-option value="in_progress">进行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="pending">待处理</a-select-option>
              <a-select-option value="cancelled">已取消</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 质保信息 -->
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="质保期(天)">
            <a-input-number
              v-decorator="['warranty_days']"
              placeholder="质保天数"
              :min="0"
              :max="365"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="下次检查日期">
            <a-date-picker
              v-decorator="['next_check_date']"
              style="width: 100%"
              placeholder="选择下次检查日期"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="备注信息">
        <a-textarea
          v-decorator="['notes']"
          placeholder="其他备注信息"
          :rows="2"
        />
      </a-form-item>

      <!-- 附件上传 -->
      <a-form-item label="相关附件">
        <a-upload
          :file-list="fileList"
          :before-upload="beforeUpload"
          :remove="handleRemoveFile"
          multiple
        >
          <a-button>
            <a-icon type="upload" />
            上传附件
          </a-button>
        </a-upload>
        <div class="upload-hint">
          支持上传维修照片、报告等文件，单个文件不超过10MB
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'MaintenanceLogModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'create' // create | edit
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      loading: false,
      fileList: [],
      parts: []
    }
  },
  computed: {
    modalTitle() {
      return this.mode === 'edit' ? '编辑维修日志' : '新建维修日志'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    }
  },
  methods: {
    initForm() {
      this.parts = []
      this.fileList = []
      
      if (this.mode === 'edit' && this.data) {
        // 编辑模式，填充现有数据
        const formData = {
          maintainer_name: this.data.source_name,
          maintenance_date: moment(this.data.timestamp),
          device_id: this.data.source_id,
          device_name: this.data.source_name,
          maintenance_type: 'corrective',
          fault_description: this.data.content,
          maintenance_process: '',
          solution: '',
          labor_cost: 0,
          duration: 1,
          status: 'completed',
          warranty_days: 30,
          next_check_date: moment().add(30, 'days'),
          notes: ''
        }
        
        this.$nextTick(() => {
          this.form.setFieldsValue(formData)
        })
      } else {
        // 新建模式，设置默认值
        this.$nextTick(() => {
          this.form.setFieldsValue({
            maintenance_date: moment(),
            maintenance_type: 'corrective',
            status: 'completed',
            warranty_days: 30,
            next_check_date: moment().add(30, 'days')
          })
        })
      }
    },

    async handleOk() {
      try {
        const values = await this.form.validateFields()
        this.loading = true

        // 计算配件总费用
        const partsCost = this.parts.reduce((total, part) => {
          return total + (part.price || 0) * (part.quantity || 0)
        }, 0)

        const logData = {
          ...values,
          parts: this.parts.filter(part => part.name),
          parts_cost: partsCost,
          total_cost: (values.labor_cost || 0) + partsCost,
          attachments: this.fileList.map(file => ({
            name: file.name,
            url: file.url || file.response?.url,
            type: this.getFileType(file.name)
          })),
          maintenance_date: values.maintenance_date.format('YYYY-MM-DD HH:mm:ss'),
          next_check_date: values.next_check_date?.format('YYYY-MM-DD')
        }

        // 模拟API调用
        await this.saveMaintenanceLog(logData)

        this.$message.success(this.mode === 'edit' ? '维修日志更新成功' : '维修日志创建成功')
        this.$emit('refresh')
        this.handleCancel()
      } catch (error) {
        if (error.errorFields) {
          return // 表单验证失败
        }
        console.error('保存失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleCancel() {
      this.form.resetFields()
      this.parts = []
      this.fileList = []
      this.$emit('close')
    },

    async saveMaintenanceLog(data) {
      // 模拟API保存
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('保存维修日志:', data)
          resolve()
        }, 1000)
      })
    },

    // 配件管理
    addPart() {
      this.parts.push({
        name: '',
        model: '',
        quantity: 1,
        price: 0
      })
    },

    removePart(index) {
      this.parts.splice(index, 1)
    },

    // 文件上传
    beforeUpload(file) {
      const isValidType = this.isValidFileType(file.name)
      if (!isValidType) {
        this.$message.error('不支持的文件格式')
        return false
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB')
        return false
      }

      this.fileList.push({
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      })

      return false // 阻止自动上传
    },

    handleRemoveFile(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.fileList.splice(index, 1)
      }
    },

    isValidFileType(fileName) {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.txt']
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      return validExtensions.includes(extension)
    },

    getFileType(fileName) {
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      const typeMap = {
        '.jpg': 'image',
        '.jpeg': 'image',
        '.png': 'image',
        '.pdf': 'pdf',
        '.doc': 'doc',
        '.docx': 'doc',
        '.txt': 'text'
      }
      return typeMap[extension] || 'file'
    }
  }
}
</script>

<style scoped>
.parts-section {
  .part-item {
    margin-bottom: 8px;
    padding: 8px;
    background: #fafafa;
    border-radius: 4px;
  }
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
</style>
