<template>
  <a-card :bordered="false">
    <div class="account-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2>账号管理</h2>
          <p>管理个人账号和企业账号，支持子账号创建和权限分配</p>
        </div>
        <div class="header-actions">
          <a-button type="primary" icon="plus" @click="handleAddAccount">
            新增账号
          </a-button>
          <a-button icon="reload" @click="refreshData">
            刷新
          </a-button>
        </div>
      </div>

      <!-- 搜索过滤区域 -->
      <div class="search-section">
        <a-form layout="inline" :form="searchForm">
          <a-form-item label="账号类型">
            <a-select
              v-model="searchParams.account_type"
              placeholder="请选择账号类型"
              style="width: 150px"
              allowClear
            >
              <a-select-option value="personal">个人账号</a-select-option>
              <a-select-option value="enterprise">企业账号</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="账号状态">
            <a-select
              v-model="searchParams.status"
              placeholder="请选择状态"
              style="width: 120px"
              allowClear
            >
              <a-select-option value="active">正常</a-select-option>
              <a-select-option value="inactive">禁用</a-select-option>
              <a-select-option value="pending">待审核</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="搜索">
            <a-input-search
              v-model="searchParams.keyword"
              placeholder="账号名称/邮箱/手机号"
              style="width: 250px"
              @search="handleSearch"
            />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              查询
            </a-button>
            <a-button style="margin-left: 8px" @click="resetSearch">
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 账号列表 -->
      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto"
        :scroll="{ x: 1500 }"
      >
        <span slot="account_type" slot-scope="text">
          <a-tag :color="text === 'enterprise' ? 'blue' : 'green'">
            {{ text === 'enterprise' ? '企业账号' : '个人账号' }}
          </a-tag>
        </span>
        
        <span slot="avatar" slot-scope="text, record">
          <a-avatar
            :size="40"
            :src="record.account_type === 'enterprise' ? record.enterprise_info?.logo : record.avatar"
            :style="{ backgroundColor: record.account_type === 'enterprise' ? '#1890ff' : '#87d068' }"
          >
            {{ record.account_type === 'enterprise' ?
                (record.enterprise_info?.name?.charAt(0) || 'E') :
                (record.name?.charAt(0) || 'U')
            }}
          </a-avatar>
        </span>
        
        <span slot="name" slot-scope="text, record">
          <div class="account-name-cell">
            <div class="primary-name">
              {{ record.account_type === 'enterprise' ? record.enterprise_info?.name : record.name }}
            </div>
            <div class="sub-info">
              {{ record.email }}
            </div>
          </div>
        </span>
        
        <span slot="contact" slot-scope="text, record">
          <div class="contact-info">
            <div><a-icon type="phone" /> {{ record.phone }}</div>
            <div v-if="record.account_type === 'enterprise' && record.enterprise_info?.address">
              <a-icon type="environment" /> {{ record.enterprise_info.address }}
            </div>
          </div>
        </span>
        
        <span slot="sub_accounts" slot-scope="text, record">
          <div v-if="record.account_type === 'enterprise'">
            <a-badge :count="record.sub_account_count || 0" :number-style="{ backgroundColor: '#52c41a' }">
              <a-button size="small" @click="viewSubAccounts(record)">
                子账号
              </a-button>
            </a-badge>
          </div>
          <span v-else class="text-muted">-</span>
        </span>
        
        <span slot="status" slot-scope="text">
          <a-badge
            :status="getStatusBadge(text).status"
            :text="getStatusBadge(text).text"
          />
        </span>
        
        <span slot="created_at" slot-scope="text">
          {{ formatDate(text) }}
        </span>
        
        <span slot="action" slot-scope="text, record">
          <div class="action-buttons">
            <a @click="handleView(record)">查看</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">
                更多 <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item v-if="record.account_type === 'enterprise'">
                  <a @click="handleManageSubAccounts(record)">
                    <a-icon type="team" /> 管理子账号
                  </a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleResetPassword(record)">
                    <a-icon type="key" /> 重置密码
                  </a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleToggleStatus(record)">
                    <a-icon :type="record.status === 'active' ? 'stop' : 'play-circle'" />
                    {{ record.status === 'active' ? '禁用' : '启用' }}
                  </a>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item>
                  <a @click="handleDelete(record)" style="color: #ff4d4f">
                    <a-icon type="delete" /> 删除账号
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </span>
      </s-table>
    </div>

    <!-- 账号详情/编辑弹窗 -->
    <account-form-modal
      ref="accountModal"
      :visible="modalVisible"
      :loading="modalLoading"
      :model="currentRecord"
      @cancel="handleModalCancel"
      @ok="handleModalOk"
    />

    <!-- 子账号管理弹窗 -->
    <sub-account-modal
      ref="subAccountModal"
      :visible="subAccountVisible"
      :parent-account="currentRecord"
      @cancel="handleSubAccountCancel"
      @refresh="refreshData"
    />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { 
  getAccountList, 
  addAccount, 
  updateAccount, 
  deleteAccount, 
  toggleAccountStatus,
  resetAccountPassword 
} from '@/api/account'
import AccountFormModal from './components/AccountFormModal'
import SubAccountModal from './components/SubAccountModal'
import moment from 'moment'

const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    width: 80,
    scopedSlots: { customRender: 'avatar' }
  },
  {
    title: '账号信息',
    dataIndex: 'name',
    width: 200,
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '账号类型',
    dataIndex: 'account_type',
    width: 100,
    scopedSlots: { customRender: 'account_type' }
  },
  {
    title: '联系方式',
    dataIndex: 'contact',
    width: 180,
    scopedSlots: { customRender: 'contact' }
  },
  {
    title: '子账号',
    dataIndex: 'sub_accounts',
    width: 100,
    scopedSlots: { customRender: 'sub_accounts' }
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
    width: 150,
    scopedSlots: { customRender: 'created_at' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'AccountManagement',
  components: {
    STable,
    AccountFormModal,
    SubAccountModal
  },
  data() {
    this.columns = columns
    return {
      // 搜索参数
      searchForm: this.$form.createForm(this),
      searchParams: {
        account_type: undefined,
        status: undefined,
        keyword: ''
      },
      
      // 弹窗状态
      modalVisible: false,
      modalLoading: false,
      subAccountVisible: false,
      currentRecord: null,
      
      // 表格选择
      selectedRowKeys: [],
      selectedRows: [],
      
      // 数据加载函数
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.searchParams)
        requestParameters.page_no = parameter.pageNo || 1
        requestParameters.page_size = parameter.pageSize || 10
        
        return getAccountList(requestParameters)
          .then(res => {
            return {
              pageSize: res.data.page_size,
              pageNo: res.data.page_no,
              totalCount: res.data.total,
              totalPage: Math.ceil(res.data.total / res.data.page_size),
              data: res.data.records || []
            }
          }).catch(err => {
            console.error('Failed to load accounts:', err)
            this.$message.error('加载账号列表失败')
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
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    
    handleSearch() {
      this.$refs.table.refresh(true)
    },
    
    resetSearch() {
      this.searchParams = {
        account_type: undefined,
        status: undefined,
        keyword: ''
      }
      this.$refs.table.refresh(true)
    },
    
    refreshData() {
      this.$refs.table.refresh()
    },
    
    handleAddAccount() {
      this.currentRecord = null
      this.modalVisible = true
    },
    
    handleView(record) {
      if (record.account_type === 'enterprise') {
        // 跳转到企业详情页
        this.$router.push({
          name: 'EnterpriseDetail',
          params: { id: record.id }
        })
      } else {
        // 跳转到个人账号详情页
        this.$router.push({
          name: 'PersonalDetail',
          params: { id: record.id }
        })
      }
    },
    
    handleEdit(record) {
      this.currentRecord = { ...record }
      this.modalVisible = true
    },
    
    handleDelete(record) {
      this.$confirm({
        title: '确认删除',
        content: `确定要删除账号 "${record.name}" 吗？删除后无法恢复。`,
        onOk: () => {
          return deleteAccount(record.id).then(() => {
            this.$message.success('删除成功')
            this.refreshData()
          }).catch(err => {
            console.error('Delete failed:', err)
            this.$message.error('删除失败')
          })
        }
      })
    },
    
    handleResetPassword(record) {
      this.$confirm({
        title: '重置密码',
        content: `确定要重置账号 "${record.name}" 的密码吗？`,
        onOk: () => {
          return resetAccountPassword(record.id).then(res => {
            this.$success({
              title: '密码重置成功',
              content: `新密码：${res.data.new_password}`,
              okText: '已复制'
            })
          }).catch(err => {
            console.error('Reset password failed:', err)
            this.$message.error('重置密码失败')
          })
        }
      })
    },
    
    handleToggleStatus(record) {
      const action = record.status === 'active' ? '禁用' : '启用'
      this.$confirm({
        title: `${action}账号`,
        content: `确定要${action}账号 "${record.name}" 吗？`,
        onOk: () => {
          return toggleAccountStatus(record.id).then(() => {
            this.$message.success(`${action}成功`)
            this.refreshData()
          }).catch(err => {
            console.error('Toggle status failed:', err)
            this.$message.error(`${action}失败`)
          })
        }
      })
    },
    
    handleManageSubAccounts(record) {
      this.currentRecord = record
      this.subAccountVisible = true
    },
    
    viewSubAccounts(record) {
      this.handleManageSubAccounts(record)
    },
    
    handleModalCancel() {
      this.modalVisible = false
      this.currentRecord = null
    },
    
    handleModalOk() {
      // 由子组件处理提交逻辑
      this.refreshData()
      this.modalVisible = false
      this.currentRecord = null
    },
    
    handleSubAccountCancel() {
      this.subAccountVisible = false
      this.currentRecord = null
    },
    
    getStatusBadge(status) {
      const statusMap = {
        'active': { status: 'success', text: '正常' },
        'inactive': { status: 'error', text: '禁用' },
        'pending': { status: 'warning', text: '待审核' }
      }
      return statusMap[status] || { status: 'default', text: status }
    },
    
    formatDate(dateString) {
      return dateString ? moment(dateString).format('YYYY-MM-DD HH:mm') : '-'
    }
  }
}
</script>

<style scoped>
.account-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .header-content h2 {
    margin: 0 0 4px 0;
    color: #262626;
  }
  
  .header-content p {
    margin: 0;
    color: #8c8c8c;
    font-size: 14px;
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .search-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  
  .account-name-cell {
    .primary-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 2px;
    }
    
    .sub-info {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
  
  .contact-info {
    font-size: 12px;
    color: #595959;
    
    div {
      margin-bottom: 2px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .anticon {
      margin-right: 4px;
      color: #8c8c8c;
    }
  }
  
  .action-buttons {
    a {
      margin-right: 0;
    }
  }
  
  .text-muted {
    color: #bfbfbf;
  }
}

@media (max-width: 768px) {
  .account-management {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .search-section .ant-form-inline .ant-form-item {
      margin-bottom: 8px;
    }
  }
}
</style>