<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form>
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="型号名称">
              <a-input v-model="queryParam.name" placeholder="请输入型号名称"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="厂商">
              <a-input v-model="queryParam.manufacturer" placeholder="请输入厂商"/>
            </a-form-item>
          </a-col>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">新增智能开关型号</a-button>
      <a-button type="danger" icon="delete" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">批量删除</a-button>
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
      <span slot="status" slot-scope="text">
        <a-badge :status="text === 1 ? 'success' : 'error'" :text="text === 1 ? '启用' : '禁用'" />
      </span>
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleView(record)">查看</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除此型号吗？"
            @confirm="() => handleDelete(record.id)"
          >
            <a style="color: red">删除</a>
          </a-popconfirm>
        </template>
      </span>
    </s-table>

    <create-smart-switch-form
      ref="createModal"
      :visible="visible"
      :loading="confirmLoading"
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />

    <smart-switch-detail-modal
      ref="detailModal"
      :visible="detailVisible"
      :model="detailModel"
      @cancel="handleDetailCancel"
    />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { getSmartSwitchModelList, addSmartSwitchModel, updateSmartSwitchModel, deleteSmartSwitchModel } from '@/api/smartLight'
import CreateSmartSwitchForm from './CreateSmartSwitchForm'
import SmartSwitchDetailModal from './SmartSwitchDetailModal'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '型号名称',
    dataIndex: 'name',
    width: 150
  },
  {
    title: '厂商',
    dataIndex: 'manufacturer',
    width: 120
  },
  {
    title: '设备类型',
    dataIndex: 'device_type',
    width: 100,
    customRender: (text) => '智能开关'
  },
  {
    title: '开关数量',
    dataIndex: 'switch_count',
    width: 100
  },
  {
    title: '支持调光',
    dataIndex: 'support_dimming',
    width: 100,
    customRender: (text) => text ? '是' : '否'
  },
  {
    title: '功率范围',
    dataIndex: 'power_range',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180
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
  name: 'SmartSwitchList',
  components: {
    STable,
    CreateSmartSwitchForm,
    SmartSwitchDetailModal
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // detail modal
      detailVisible: false,
      detailModel: null,
      // 查询参数
      queryParam: {},
      queryData: {
        name: null,
        manufacturer: null,
        device_type: 'smart_switch', // 固定为智能开关
        page_no: 1,
        page_size: 10
      },
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam, this.queryData)
        requestParameters.page_no = parameter.pageNo || 1
        requestParameters.page_size = parameter.pageSize || 10
        
        console.log('loadData request parameters:', requestParameters)
        return getSmartSwitchModelList(requestParameters)
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
            console.error('Failed to load smart switch models:', err)
            this.$message.error('加载数据失败')
            return {
              pageSize: 10,
              pageNo: 1,
              totalCount: 0,
              totalPage: 0,
              data: []
            }
          })
      },
      selectedRowKeys: [],
      selectedRows: []
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
    
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },

    handleView (record) {
      this.detailModel = { ...record }
      this.detailVisible = true
    },

    handleDelete (id) {
      deleteSmartSwitchModel(id).then(res => {
        this.$message.success('删除成功')
        this.$refs.table.refresh()
      }).catch(err => {
        console.error('Delete failed:', err)
        this.$message.error('删除失败')
      })
    },

    handleBatchDelete () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要删除的项目')
        return
      }
      
      this.$confirm({
        title: '确定删除选中的型号吗？',
        content: `将删除 ${this.selectedRowKeys.length} 个型号`,
        onOk: () => {
          const deletePromises = this.selectedRowKeys.map(id => deleteSmartSwitchModel(id))
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
    
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('form values', values)
          
          // 设置设备类型为智能开关
          values.device_type = 'smart_switch'
          
          const request = values.id ? updateSmartSwitchModel(values) : addSmartSwitchModel(values)
          
          request.then(res => {
            this.visible = false
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
    
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields()
    },

    handleDetailCancel () {
      this.detailVisible = false
      this.detailModel = null
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
</style>
