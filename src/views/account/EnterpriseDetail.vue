<template>
  <div class="enterprise-detail">
    <a-card :loading="loading">
      <!-- 企业头部信息 -->
      <div class="enterprise-header">
        <div class="enterprise-logo">
          <a-avatar
            :size="80"
            :src="enterpriseInfo.logo"
            :style="{ backgroundColor: '#1890ff' }"
          >
            {{ enterpriseInfo.name?.charAt(0) || 'E' }}
          </a-avatar>
        </div>
        <div class="enterprise-basic">
          <h2>{{ enterpriseInfo.name }}</h2>
          <div class="enterprise-tags">
            <a-tag color="blue">企业账号</a-tag>
            <a-tag :color="getStatusColor(accountInfo.status)">
              {{ getStatusText(accountInfo.status) }}
            </a-tag>
          </div>
          <div class="enterprise-contact">
            <div><a-icon type="phone" /> {{ enterpriseInfo.contact_phone }}</div>
            <div><a-icon type="mail" /> {{ accountInfo.email }}</div>
            <div><a-icon type="environment" /> {{ enterpriseInfo.address }}</div>
          </div>
        </div>
        <div class="enterprise-actions">
          <a-button type="primary" @click="handleEdit">
            <a-icon type="edit" />
            编辑企业信息
          </a-button>
          <a-button @click="handleManageSubAccounts">
            <a-icon type="team" />
            管理子账号 ({{ subAccountCount }})
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 详细信息卡片 -->
    <a-row :gutter="[24, 24]" style="margin-top: 24px">
      <!-- 企业信息 -->
      <a-col :xs="24" :lg="12">
        <a-card title="企业详细信息" size="small">
          <div class="info-section">
            <div class="info-item">
              <label>企业全称：</label>
              <span>{{ enterpriseInfo.name }}</span>
            </div>
            <div class="info-item">
              <label>主营业务：</label>
              <span>{{ enterpriseInfo.business_scope || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>营业执照：</label>
              <span>{{ enterpriseInfo.business_license || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>法定代表人：</label>
              <span>{{ enterpriseInfo.legal_representative || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>注册资本：</label>
              <span>{{ formatCapital(enterpriseInfo.registered_capital) }}</span>
            </div>
            <div class="info-item">
              <label>企业地址：</label>
              <span>{{ enterpriseInfo.address }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 账号信息 -->
      <a-col :xs="24" :lg="12">
        <a-card title="账号信息" size="small">
          <div class="info-section">
            <div class="info-item">
              <label>账号邮箱：</label>
              <span>{{ accountInfo.email }}</span>
            </div>
            <div class="info-item">
              <label>联系电话：</label>
              <span>{{ accountInfo.phone }}</span>
            </div>
            <div class="info-item">
              <label>账号状态：</label>
              <a-tag :color="getStatusColor(accountInfo.status)">
                {{ getStatusText(accountInfo.status) }}
              </a-tag>
            </div>
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDate(accountInfo.created_at) }}</span>
            </div>
            <div class="info-item">
              <label>最后登录：</label>
              <span>{{ formatDate(accountInfo.last_login) }}</span>
            </div>
            <div class="info-item">
              <label>子账号数量：</label>
              <span>{{ subAccountCount }} 个</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 子账号列表 -->
    <a-card title="子账号列表" style="margin-top: 24px">
      <template slot="extra">
        <a-button type="primary" size="small" @click="handleAddSubAccount">
          <a-icon type="plus" />
          新增子账号
        </a-button>
      </template>
      
      <a-table
        :columns="subAccountColumns"
        :dataSource="subAccountList"
        :loading="subAccountLoading"
        :pagination="false"
        rowKey="id"
        size="small"
      >
        <span slot="avatar" slot-scope="text, record">
          <a-avatar :size="32" :src="record.avatar">
            {{ record.name?.charAt(0) || 'U' }}
          </a-avatar>
        </span>
        
        <span slot="name" slot-scope="text, record">
          <div>
            <div class="sub-account-name">{{ record.name }}</div>
            <div class="sub-account-email">{{ record.email }}</div>
          </div>
        </span>
        
        <span slot="role" slot-scope="text">
          <a-tag color="blue">{{ getRoleName(text) }}</a-tag>
        </span>
        
        <span slot="status" slot-scope="text">
          <a-badge
            :status="text === 'active' ? 'success' : 'error'"
            :text="text === 'active' ? '正常' : '禁用'"
          />
        </span>
        
        <span slot="last_login" slot-scope="text">
          {{ formatDate(text) }}
        </span>
        
        <span slot="action" slot-scope="text, record">
          <a @click="handleEditSubAccount(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleToggleSubAccountStatus(record)">
            {{ record.status === 'active' ? '禁用' : '启用' }}
          </a>
        </span>
      </a-table>
    </a-card>

    <!-- 编辑企业信息弹窗 -->
    <account-form-modal
      ref="accountModal"
      :visible="editModalVisible"
      :loading="editModalLoading"
      :model="accountInfo"
      @cancel="handleEditCancel"
      @ok="handleEditOk"
    />

    <!-- 子账号管理弹窗 -->
    <sub-account-modal
      ref="subAccountModal"
      :visible="subAccountModalVisible"
      :parent-account="accountInfo"
      @cancel="handleSubAccountCancel"
      @refresh="loadData"
    />
  </div>
</template>

<script>
import { getAccountList, getSubAccountList } from '@/api/account'
import AccountFormModal from './components/AccountFormModal'
import SubAccountModal from './components/SubAccountModal'
import moment from 'moment'

const subAccountColumns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    width: 60,
    scopedSlots: { customRender: 'avatar' }
  },
  {
    title: '账号信息',
    dataIndex: 'name',
    width: 200,
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '角色',
    dataIndex: 'role_id',
    width: 100,
    scopedSlots: { customRender: 'role' }
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '最后登录',
    dataIndex: 'last_login',
    width: 120,
    scopedSlots: { customRender: 'last_login' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 120,
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'EnterpriseDetail',
  components: {
    AccountFormModal,
    SubAccountModal
  },
  data() {
    this.subAccountColumns = subAccountColumns
    return {
      loading: false,
      accountInfo: {},
      enterpriseInfo: {},
      subAccountList: [],
      subAccountCount: 0,
      subAccountLoading: false,
      
      // 编辑弹窗
      editModalVisible: false,
      editModalLoading: false,
      
      // 子账号弹窗
      subAccountModalVisible: false
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const accountId = this.$route.params.id
      if (!accountId) {
        this.$message.error('账号ID无效')
        this.$router.go(-1)
        return
      }
      
      this.loading = true
      try {
        // 加载账号信息
        const accountResponse = await getAccountList({
          id: accountId,
          page_size: 1
        })
        
        if (accountResponse.data.records?.length > 0) {
          const account = accountResponse.data.records[0]
          this.accountInfo = account
          
          // 解析企业信息
          if (account.enterprise_info) {
            if (typeof account.enterprise_info === 'string') {
              try {
                this.enterpriseInfo = JSON.parse(account.enterprise_info)
              } catch (e) {
                console.warn('Failed to parse enterprise_info:', e)
                this.enterpriseInfo = {}
              }
            } else {
              this.enterpriseInfo = account.enterprise_info
            }
          }
          
          // 加载子账号列表
          this.loadSubAccounts(accountId)
        } else {
          this.$message.error('账号不存在')
          this.$router.go(-1)
        }
      } catch (error) {
        console.error('Failed to load account:', error)
        this.$message.error('加载账号信息失败')
      } finally {
        this.loading = false
      }
    },
    
    async loadSubAccounts(parentAccountId) {
      this.subAccountLoading = true
      try {
        const response = await getSubAccountList({
          parent_account_id: parentAccountId,
          page_size: 50 // 显示前50个子账号
        })
        
        this.subAccountList = response.data.records || []
        this.subAccountCount = response.data.total || 0
      } catch (error) {
        console.error('Failed to load sub accounts:', error)
        this.$message.error('加载子账号失败')
      } finally {
        this.subAccountLoading = false
      }
    },
    
    handleEdit() {
      this.editModalVisible = true
    },
    
    handleEditCancel() {
      this.editModalVisible = false
    },
    
    handleEditOk() {
      this.editModalVisible = false
      this.loadData()
    },
    
    handleManageSubAccounts() {
      this.subAccountModalVisible = true
    },
    
    handleAddSubAccount() {
      this.subAccountModalVisible = true
    },
    
    handleSubAccountCancel() {
      this.subAccountModalVisible = false
    },
    
    handleEditSubAccount(record) {
      // 在子账号弹窗中编辑
      this.subAccountModalVisible = true
      this.$nextTick(() => {
        this.$refs.subAccountModal?.handleEditSubAccount(record)
      })
    },
    
    handleToggleSubAccountStatus(record) {
      // 实现状态切换逻辑
      console.log('Toggle sub account status:', record)
    },
    
    getStatusColor(status) {
      const colorMap = {
        'active': 'green',
        'inactive': 'red',
        'pending': 'orange'
      }
      return colorMap[status] || 'default'
    },
    
    getStatusText(status) {
      const textMap = {
        'active': '正常',
        'inactive': '禁用',
        'pending': '待审核'
      }
      return textMap[status] || status
    },
    
    getRoleName(roleId) {
      const roleMap = {
        'installer': '安装维修员',
        'shop_manager': '店长',
        'operator': '操作员'
      }
      return roleMap[roleId] || roleId
    },
    
    formatDate(dateString) {
      return dateString ? moment(dateString).format('YYYY-MM-DD HH:mm') : '-'
    },
    
    formatCapital(capital) {
      if (!capital) return '暂无'
      return `${capital.toLocaleString()} 万元`
    }
  }
}
</script>

<style scoped>
.enterprise-detail {
  .enterprise-header {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    
    .enterprise-logo {
      flex-shrink: 0;
    }
    
    .enterprise-basic {
      flex: 1;
      
      h2 {
        margin: 0 0 8px 0;
        color: #262626;
      }
      
      .enterprise-tags {
        margin-bottom: 12px;
      }
      
      .enterprise-contact {
        color: #595959;
        
        div {
          margin-bottom: 4px;
          
          .anticon {
            margin-right: 8px;
            color: #8c8c8c;
          }
        }
      }
    }
    
    .enterprise-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
  
  .info-section {
    .info-item {
      display: flex;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      label {
        min-width: 100px;
        font-weight: 500;
        color: #262626;
      }
      
      span {
        color: #595959;
        flex: 1;
      }
    }
  }
  
  .sub-account-name {
    font-weight: 500;
    color: #262626;
  }
  
  .sub-account-email {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 2px;
  }
}

@media (max-width: 768px) {
  .enterprise-detail {
    .enterprise-header {
      flex-direction: column;
      gap: 16px;
      
      .enterprise-actions {
        flex-direction: row;
        align-self: stretch;
      }
    }
  }
}
</style>