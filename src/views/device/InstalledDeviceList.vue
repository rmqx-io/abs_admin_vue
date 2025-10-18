<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form>
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="设备编号">
              <a-input v-model="queryParam.device_id" placeholder="请输入设备编号"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="设备类型">
              <a-select v-model="queryParam.device_type" placeholder="请选择设备类型" allowClear>
                <a-select-option value="smart_switch">智能开关</a-select-option>
                <a-select-option value="smart_light">智能灯</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="安装日期">
              <a-range-picker
                v-model="queryParam.install_date_range"
                format="YYYY-MM-DD"
                placeholder="['开始日期', '结束日期']"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="安装地址">
              <a-input v-model="queryParam.address" placeholder="请输入安装地址"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="状态">
              <a-select v-model="queryParam.status" placeholder="请选择状态" allowClear>
                <a-select-option value="active">正常</a-select-option>
                <a-select-option value="deleted">已删除</a-select-option>
                <a-select-option value="pending_delete">待删除</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQuery">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">新增设备</a-button>
      <a-button icon="plus" @click="handleGoToAddDevice">添加新设备</a-button>
      <a-button type="danger" icon="delete" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">批量删除</a-button>
      <a-button icon="reload" @click="$refs.table.refresh()">刷新</a-button>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="id"
      :columns="columns"
      :data="loadData"
      :alert="true"
      :rowSelection="rowSelection"
      showPagination="auto"
    >
      <span slot="device_type" slot-scope="text">
        <a-tag :color="text === 'smart_switch' ? 'blue' : 'green'">
          {{ text === 'smart_switch' ? '智能开关' : '智能灯' }}
        </a-tag>
      </span>
      
      <span slot="energy_saved" slot-scope="text">
        <span style="color: #52c41a; font-weight: 500;">{{ text || 0 }} KWH</span>
      </span>
      
      <span slot="status" slot-scope="text">
        <a-badge
          :status="text === 'active' ? 'success' : text === 'pending_delete' ? 'warning' : 'error'"
          :text="getStatusText(text)"
        />
      </span>
      
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleView(record)">查看详情</a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)" v-if="record.status === 'active'">编辑</a>
          <a-divider type="vertical" v-if="record.status === 'active'" />
          <a-popconfirm
            v-if="record.status === 'active'"
            title="确定删除此设备吗？删除后7天内可恢复"
            @confirm="() => handleSoftDelete(record.id)"
          >
            <a style="color: red">删除</a>
          </a-popconfirm>
          <a
            v-if="record.status === 'pending_delete'"
            @click="handleRestore(record.id)"
            style="color: #1890ff"
          >
            恢复
          </a>
        </template>
      </span>
    </s-table>

    <!-- 设备详情弹窗 -->
    <a-modal
      :title="'设备详情 - ' + (detailModel.device_id || '')"
      :visible="detailVisible"
      width="800px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="detailModel" class="device-detail">
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="detail-item">
              <label>设备编号：</label>
              <span>{{ detailModel.device_id }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <label>设备型号：</label>
              <span>{{ detailModel.model_name }}</span>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="detail-item">
              <label>设备类型：</label>
              <a-tag :color="detailModel.device_type === 'smart_switch' ? 'blue' : 'green'">
                {{ detailModel.device_type === 'smart_switch' ? '智能开关' : '智能灯' }}
              </a-tag>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <label>固件版本：</label>
              <span>{{ detailModel.firmware_version }}</span>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="detail-item">
              <label>安装日期：</label>
              <span>{{ detailModel.install_date }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <label>累计工作时长：</label>
              <span style="color: #1890ff; font-weight: 500;">{{ detailModel.total_working_hours || 0 }} 小时</span>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="detail-item">
              <label>累计节能：</label>
              <span style="color: #52c41a; font-weight: 500;">{{ detailModel.energy_saved || 0 }} KWH</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <label>平均每天开机时长：</label>
              <span style="color: #fa8c16; font-weight: 500;">{{ detailModel.avg_daily_usage || 0 }} 小时</span>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="detail-item">
              <label>安装人员：</label>
              <span>{{ detailModel.installer_account }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <label>联系电话：</label>
              <span>{{ detailModel.installer_phone }}</span>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="24">
            <div class="detail-item">
              <label>安装地址：</label>
              <span>{{ detailModel.full_address }}</span>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="detail-item">
              <label>门牌号：</label>
              <span>{{ detailModel.house_number }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <label>店铺名称：</label>
              <span>{{ detailModel.shop_name || '无' }}</span>
            </div>
          </a-col>
        </a-row>
        
        <div class="detail-actions" style="margin-top: 24px; text-align: right;">
          <a-button @click="handleEdit(detailModel)" type="primary" style="margin-right: 8px;" v-if="detailModel.status === 'active'">
            编辑设备
          </a-button>
          <a-popconfirm
            v-if="detailModel.status === 'active'"
            title="确定删除此设备吗？删除后7天内可恢复"
            @confirm="() => handleSoftDelete(detailModel.id)"
          >
            <a-button type="danger">删除设备</a-button>
          </a-popconfirm>
        </div>
      </div>
    </a-modal>

    <!-- 添加/编辑设备弹窗 -->
    <installed-device-form
      ref="deviceForm"
      :visible="formVisible"
      :loading="confirmLoading"
      :model="formModel"
      @cancel="handleFormCancel"
      @ok="handleFormOk"
    />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import {
  getInstalledDeviceList,
  addInstalledDevice,
  updateInstalledDevice,
  softDeleteDevice,
  restoreDevice
} from '@/api/smartLight'
import InstalledDeviceForm from './InstalledDeviceForm'

const columns = [
  {
    title: '设备编号',
    dataIndex: 'device_id',
    width: 120,
    fixed: 'left'
  },
  {
    title: '设备类型',
    dataIndex: 'device_type',
    width: 100,
    scopedSlots: { customRender: 'device_type' }
  },
  {
    title: '设备型号',
    dataIndex: 'model_name',
    width: 150
  },
  {
    title: '安装日期',
    dataIndex: 'install_date',
    width: 120
  },
  {
    title: '累计节能',
    dataIndex: 'energy_saved',
    width: 120,
    scopedSlots: { customRender: 'energy_saved' }
  },
  {
    title: '安装地址',
    dataIndex: 'address_summary',
    width: 200,
    ellipsis: true
  },
  {
    title: '安装人员',
    dataIndex: 'installer_account',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 180,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'InstalledDeviceList',
  components: {
    STable,
    InstalledDeviceForm
  },
  data () {
    this.columns = columns
    return {
      // 查询参数
      queryParam: {},
      // 详情弹窗
      detailVisible: false,
      detailModel: {},
      // 表单弹窗
      formVisible: false,
      confirmLoading: false,
      formModel: null,
      // 表格选择
      selectedRowKeys: [],
      selectedRows: [],
      // 数据加载
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        requestParameters.page_no = parameter.pageNo || 1
        requestParameters.page_size = parameter.pageSize || 10
        
        console.log('loadData request parameters:', requestParameters)
        return getInstalledDeviceList(requestParameters)
          .then(res => {
            console.log('load data response', res)
            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              totalPage: Math.ceil(res.data.total / res.data.page_size),
              data: res.data.records || []
            }
          }).catch(err => {
            console.error('Failed to load installed devices:', err)
            this.$message.error('加载数据失败')
            return {
              pageSize: 10,
              pageNo: 1,
              totalCount: 0,
              totalPage: 0,
              data: []
            }
          })
      }
    }
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    
    resetQuery () {
      this.queryParam = {}
      this.$refs.table.refresh(true)
    },
    
    getStatusText (status) {
      const statusMap = {
        'active': '正常',
        'pending_delete': '待删除',
        'deleted': '已删除'
      }
      return statusMap[status] || status
    },
    
    handleAdd () {
      this.formModel = null
      this.formVisible = true
    },
    
    handleEdit (record) {
      this.formModel = { ...record }
      this.formVisible = true
      this.detailVisible = false // 关闭详情弹窗
    },
    
    handleView (record) {
      this.detailModel = { ...record }
      this.detailVisible = true
    },
    
    handleSoftDelete (id) {
      softDeleteDevice(id).then(res => {
        this.$message.success('设备已删除，7天后将永久删除')
        this.$refs.table.refresh()
        this.detailVisible = false
      }).catch(err => {
        console.error('Soft delete failed:', err)
        this.$message.error('删除失败')
      })
    },
    
    handleRestore (id) {
      restoreDevice(id).then(res => {
        this.$message.success('设备已恢复')
        this.$refs.table.refresh()
      }).catch(err => {
        console.error('Restore failed:', err)
        this.$message.error('恢复失败')
      })
    },
    
    handleBatchDelete () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要删除的设备')
        return
      }
      
      this.$confirm({
        title: '确定删除选中的设备吗？',
        content: `将删除 ${this.selectedRowKeys.length} 台设备，删除后7天内可恢复`,
        onOk: () => {
          const deletePromises = this.selectedRowKeys.map(id => softDeleteDevice(id))
          Promise.all(deletePromises).then(() => {
            this.$message.success('批量删除成功')
            this.selectedRowKeys = []
            this.selectedRows = []
            this.$refs.table.refresh()
          }).catch(err => {
            console.error('Batch delete failed:', err)
            this.$message.error('批量删除失败')
          })
        }
      })
    },
    
    handleDetailCancel () {
      this.detailVisible = false
      this.detailModel = {}
    },
    
    handleFormCancel () {
      this.formVisible = false
      this.formModel = null
    },
    
    handleFormOk () {
      const form = this.$refs.deviceForm.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('form values', values)
          
          const request = values.id ? updateInstalledDevice(values) : addInstalledDevice(values)
          
          request.then(res => {
            this.formVisible = false
            this.confirmLoading = false
            form.resetFields()
            this.$refs.table.refresh()
            this.$message.success(values.id ? '修改成功' : '新增成功')
          }).catch(err => {
            this.confirmLoading = false
            console.error('Save failed:', err)
            this.$message.error('保存失败')
          })
        } else {
          this.confirmLoading = false
        }
      })
    },

    handleGoToAddDevice () {
      this.$router.push('/device/add')
    }
  }
}
</script>

<style scoped>
.table-page-search-wrapper {
  margin-bottom: 16px;
}

.table-operator {
  margin-bottom: 18px;
}

.table-operator > button {
  margin-right: 8px;
}

.device-detail {
  .detail-item {
    margin-bottom: 16px;
    
    label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin-right: 8px;
      min-width: 100px;
      display: inline-block;
    }
    
    span {
      color: rgba(0, 0, 0, 0.65);
    }
  }
  
  .detail-actions {
    border-top: 1px solid #e8e8e8;
    padding-top: 16px;
  }
}
</style>
