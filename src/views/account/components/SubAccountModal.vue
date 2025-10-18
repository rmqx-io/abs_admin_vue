<template>
  <a-modal
    :title="`管理子账号 - ${parentAccount?.enterprise_info?.name || parentAccount?.name}`"
    :width="1000"
    :visible="visible"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="sub-account-management">
      <!-- 操作栏 -->
      <div class="action-bar">
        <a-button type="primary" icon="plus" @click="handleAddSubAccount">
          新增子账号
        </a-button>
        <a-button icon="reload" @click="refreshList">
          刷新
        </a-button>
        <div class="search-box">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索子账号"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </div>

      <!-- 子账号列表 -->
      <a-table
        :columns="subAccountColumns"
        :dataSource="subAccountList"
        :loading="loading"
        :pagination="pagination"
        rowKey="id"
        size="middle"
        @change="handleTableChange"
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
        
        <span slot="permissions" slot-scope="text, record">
          <a-tooltip>
            <template slot="title">
              <div v-for="permission in record.permissions" :key="permission">
                {{ getPermissionName(permission) }}
              </div>
            </template>
            <a-tag>{{ record.permissions?.length || 0 }} 项权限</a-tag>
          </a-tooltip>
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
          <a @click="handleResetPassword(record)">重置密码</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleToggleStatus(record)">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item>
                <a @click="handleDeleteSubAccount(record)" style="color: #ff4d4f">
                  删除账号
                </a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>

    <!-- 新增/编辑子账号弹窗 -->
    <a-modal
      title="子账号信息"
      :visible="subAccountModalVisible"
      :confirmLoading="subAccountLoading"
      @ok="handleSubAccountSubmit"
      @cancel="handleSubAccountCancel"
    >
      <a-form :form="subAccountForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="姓名">
          <a-input
            v-decorator="['name', {
              rules: [{ required: true, message: '请输入姓名' }]
            }]"
            placeholder="请输入姓名"
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
            :disabled="!!currentSubAccount"
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
          />
        </a-form-item>
        
        <a-form-item v-if="!currentSubAccount" label="密码">
          <a-input-password
            v-decorator="['password', {
              rules: [
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]
            }]"
            placeholder="请输入登录密码"
          />
        </a-form-item>
        
        <a-form-item label="角色">
          <a-select
            v-decorator="['role_id', {
              rules: [{ required: true, message: '请选择角色' }]
            }]"
            placeholder="请选择角色"
          >
            <a-select-option value="installer">安装维修员</a-select-option>
            <a-select-option value="shop_manager">店长</a-select-option>
            <a-select-option value="operator">操作员</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="权限">
          <a-checkbox-group v-decorator="['permissions']" :options="permissionOptions" />
        </a-form-item>
        
        <a-form-item label="状态">
          <a-select
            v-decorator="['status', {
              initialValue: 'active'
            }]"
          >
            <a-select-option value="active">正常</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea
            v-decorator="['remark']"
            placeholder="请输入备注信息（可选）"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-modal>
</template>

<script>
import {
  getSubAccountList,
  addSubAccount,
  updateSubAccount,
  deleteSubAccount,
  toggleSubAccountStatus,
  resetSubAccountPassword
} from '@/api/account'
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
    width: 150,
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '角色',
    dataIndex: 'role_id',
    width: 100,
    scopedSlots: { customRender: 'role' }
  },
  {
    title: '权限',
    dataIndex: 'permissions',
    width: 100,
    scopedSlots: { customRender: 'permissions' }
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
  name: 'SubAccountModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    parentAccount: {
      type: Object,
      default: null
    }
  },
  data() {
    this.subAccountColumns = subAccountColumns
    return {
      loading: false,
      searchKeyword: '',
      subAccountList: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true
      },
      
      // 子账号编辑弹窗
      subAccountModalVisible: false,
      subAccountLoading: false,
      subAccountForm: this.$form.createForm(this),
      currentSubAccount: null,
      
      // 权限选项
      permissionOptions: [
        { label: '查看设备', value: 'device_view' },
        { label: '添加设备', value: 'device_add' },
        { label: '编辑设备', value: 'device_edit' },
        { label: '删除设备', value: 'device_delete' },
        { label: '设备安装', value: 'device_install' },
        { label: '设备维修', value: 'device_maintenance' },
        { label: '查看报表', value: 'report_view' },
        { label: '导出数据', value: 'report_export' }
      ]
    }
  },
  watch: {
    visible(val) {
      if (val && this.parentAccount) {
        this.loadSubAccountList()
      }
    }
  },
  methods: {
    async loadSubAccountList() {
      if (!this.parentAccount?.id) return
      
      this.loading = true
      try {
        const params = {
          parent_account_id: this.parentAccount.id,
          page_no: this.pagination.current,
          page_size: this.pagination.pageSize,
          keyword: this.searchKeyword
        }
        
        const response = await getSubAccountList(params)
        this.subAccountList = response.data.records || []
        this.pagination.total = response.data.total || 0
      } catch (error) {
        console.error('Failed to load sub accounts:', error)
        this.$message.error('加载子账号列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleTableChange(pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.loadSubAccountList()
    },
    
    handleSearch() {
      this.pagination.current = 1
      this.loadSubAccountList()
    },
    
    refreshList() {
      this.loadSubAccountList()
    },
    
    handleAddSubAccount() {
      this.currentSubAccount = null
      this.subAccountForm.resetFields()
      this.subAccountModalVisible = true
    },
    
    handleEditSubAccount(record) {
      this.currentSubAccount = record
      this.$nextTick(() => {
        this.subAccountForm.setFieldsValue({
          ...record,
          permissions: record.permissions || []
        })
      })
      this.subAccountModalVisible = true
    },
    
    handleSubAccountSubmit() {
      this.subAccountForm.validateFields(async (errors, values) => {
        if (!errors) {
          this.subAccountLoading = true
          try {
            const data = {
              ...values,
              parent_account_id: this.parentAccount.id,
              account_type: 'sub_account'
            }
            
            if (this.currentSubAccount) {
              data.id = this.currentSubAccount.id
              await updateSubAccount(data)
              this.$message.success('修改成功')
            } else {
              await addSubAccount(data)
              this.$message.success('创建成功')
            }
            
            this.subAccountModalVisible = false
            this.loadSubAccountList()
            this.$emit('refresh')
          } catch (error) {
            console.error('Submit failed:', error)
            this.$message.error(this.currentSubAccount ? '修改失败' : '创建失败')
          } finally {
            this.subAccountLoading = false
          }
        }
      })
    },
    
    handleSubAccountCancel() {
      this.subAccountModalVisible = false
      this.currentSubAccount = null
    },
    
    handleResetPassword(record) {
      this.$confirm({
        title: '重置密码',
        content: `确定要重置 "${record.name}" 的密码吗？`,
        onOk: async () => {
          try {
            const response = await resetSubAccountPassword(record.id)
            this.$success({
              title: '密码重置成功',
              content: `新密码：${response.data.new_password}`,
              okText: '已复制'
            })
          } catch (error) {
            console.error('Reset password failed:', error)
            this.$message.error('重置密码失败')
          }
        }
      })
    },
    
    handleToggleStatus(record) {
      const action = record.status === 'active' ? '禁用' : '启用'
      this.$confirm({
        title: `${action}子账号`,
        content: `确定要${action} "${record.name}" 吗？`,
        onOk: async () => {
          try {
            await toggleSubAccountStatus(record.id)
            this.$message.success(`${action}成功`)
            this.loadSubAccountList()
          } catch (error) {
            console.error('Toggle status failed:', error)
            this.$message.error(`${action}失败`)
          }
        }
      })
    },
    
    handleDeleteSubAccount(record) {
      this.$confirm({
        title: '删除子账号',
        content: `确定要删除子账号 "${record.name}" 吗？删除后无法恢复。`,
        onOk: async () => {
          try {
            await deleteSubAccount(record.id)
            this.$message.success('删除成功')
            this.loadSubAccountList()
            this.$emit('refresh')
          } catch (error) {
            console.error('Delete failed:', error)
            this.$message.error('删除失败')
          }
        }
      })
    },
    
    handleCancel() {
      this.$emit('cancel')
    },
    
    getRoleName(roleId) {
      const roleMap = {
        'installer': '安装维修员',
        'shop_manager': '店长',
        'operator': '操作员'
      }
      return roleMap[roleId] || roleId
    },
    
    getPermissionName(permission) {
      const permissionMap = {
        'device_view': '查看设备',
        'device_add': '添加设备',
        'device_edit': '编辑设备',
        'device_delete': '删除设备',
        'device_install': '设备安装',
        'device_maintenance': '设备维修',
        'report_view': '查看报表',
        'report_export': '导出数据'
      }
      return permissionMap[permission] || permission
    },
    
    formatDate(dateString) {
      return dateString ? moment(dateString).format('MM-DD HH:mm') : '-'
    }
  }
}
</script>

<style scoped>
.sub-account-management {
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .search-box {
      margin-left: auto;
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
</style>