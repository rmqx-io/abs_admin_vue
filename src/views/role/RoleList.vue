<template>
  <a-card :bordered="false" :style="{ height: '100%' }">
    <a-row :gutter="24">
      <a-col :md="6">
        <div class="role-list-header">
          <h3>角色列表</h3>
          <a-button type="primary" size="small" icon="plus" @click="add">新增角色</a-button>
        </div>
        <a-list itemLayout="vertical" :dataSource="roles" :loading="loading">
          <a-list-item
            slot="renderItem"
            slot-scope="item, index"
            :key="index"
            :class="{ 'role-item-active': mdl.id === item.id }"
            class="role-item"
            @click="edit(item)"
          >
            <a-list-item-meta>
              <div slot="title" class="role-title">
                <a-tag v-if="item.color" :color="item.color" size="small">
                  {{ item.name }}
                </a-tag>
                <span v-else>{{ item.name }}</span>
                <a-badge
                  v-if="item.level"
                  :count="'L' + item.level"
                  :number-style="{ backgroundColor: '#f0f0f0', color: '#999' }"
                  style="margin-left: 8px;"
                />
              </div>
              <div slot="description" class="role-description">
                {{ item.describe }}
                <br>
                <small class="role-permission-count">
                  {{ getRolePermissionSummary(item) }}
                </small>
              </div>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </a-col>
      <a-col :md="18">
        <div class="role-form-container">
          <a-divider v-if="isMobile()" />
          
          <div class="role-form-header">
            <div v-if="mdl.id">
              <h3 class="role-form-title">
                编辑角色：{{ mdl.name }}
                <a-tag v-if="mdl.color" :color="mdl.color" style="margin-left: 8px;">
                  {{ isPredefinedRole(mdl) ? '系统预定义' : '自定义' }}
                </a-tag>
              </h3>
            </div>
            <div v-else>
              <h3 class="role-form-title">新增角色</h3>
            </div>
            
            <div class="role-form-actions">
              <a-button type="primary" @click="save" :loading="confirmLoading">
                <a-icon type="save" />保存
              </a-button>
              <a-button
                v-if="mdl.id && mdl.id !== '-1' && !isPredefinedRole(mdl)"
                type="danger"
                @click="deleteRole"
                style="margin-left: 8px;"
              >
                <a-icon type="delete" />删除
              </a-button>
            </div>
          </div>
          
          <a-form :form="form" :layout="isMobile() ? 'vertical' : 'horizontal'" class="role-form">
            <a-row :gutter="24">
              <a-col :md="12">
                <a-form-item label="角色ID">
                  <a-input
                    v-decorator="['id', {rules: [{ required: true, message: '请输入角色ID' }]}]"
                    placeholder="请输入角色唯一标识"
                    :disabled="isPredefinedRole(mdl)"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="12">
                <a-form-item label="角色名称">
                  <a-input
                    v-decorator="['name', {rules: [{ required: true, message: '请输入角色名称' }]}]"
                    placeholder="请输入角色名称"
                    :disabled="isPredefinedRole(mdl)"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :md="12">
                <a-form-item label="状态">
                  <a-select v-decorator="['status', {initialValue: 1}]">
                    <a-select-option :value="1">正常</a-select-option>
                    <a-select-option :value="0">禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="12">
                <a-form-item label="角色级别">
                  <a-input-number
                    v-model="mdl.level"
                    :min="1"
                    :max="10"
                    placeholder="角色级别（1-10）"
                    :disabled="isPredefinedRole(mdl)"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="角色描述">
              <a-textarea
                :rows="3"
                v-decorator="['describe', {rules: [{ required: true, message: '请输入角色描述' }]}]"
                placeholder="请输入角色的详细描述"
                :disabled="isPredefinedRole(mdl)"
              />
            </a-form-item>

            <a-divider>权限配置</a-divider>
            
            <div v-if="isPredefinedRole(mdl) && mdl.id === 'super_admin'" class="permission-notice">
              <a-alert
                message="超级管理员拥有系统所有权限"
                type="info"
                show-icon
                style="margin-bottom: 16px;"
              />
            </div>
            
            <div v-else class="permissions-container">
              <a-row :gutter="16" v-for="(permission, index) in permissions" :key="index" class="permission-row">
                <a-col :xl="4" :lg="6" :md="24" class="permission-name">
                  <strong>{{ permission.name }}</strong>
                </a-col>
                <a-col :xl="20" :lg="18" :md="24" class="permission-actions">
                  <a-checkbox
                    v-if="permission.actionsOptions.length > 0"
                    :indeterminate="permission.indeterminate"
                    :checked="permission.checkedAll"
                    :disabled="isPredefinedRole(mdl)"
                    @change="onChangeCheckAll($event, permission)"
                    class="select-all-checkbox"
                  >
                    全选
                  </a-checkbox>
                  <a-checkbox-group
                    :options="permission.actionsOptions"
                    v-model="permission.selected"
                    :disabled="isPredefinedRole(mdl)"
                    @change="onChangeCheck(permission)"
                    class="permission-checkbox-group"
                  />
                </a-col>
              </a-row>
            </div>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import { getRoleList, getPermissions } from '@/api/manage'
import { actionToObject } from '@/utils/permissions'
import { baseMixin } from '@/store/app-mixin'

export default {
  name: 'RoleList',
  mixins: [baseMixin],
  components: {},
  data () {
    return {
      form: this.$form.createForm(this),
      mdl: {},
      loading: false,
      confirmLoading: false,

      roles: [],
      permissions: [],
      
      // 预定义角色及其权限
      predefinedRoles: [
        {
          id: 'super_admin',
          name: '超级管理员',
          describe: '拥有系统所有权限，包括系统配置、用户管理等',
          status: 1,
          level: 1,
          permissions: ['*'], // 所有权限
          color: '#f50'
        },
        {
          id: 'admin',
          name: '管理员',
          describe: '除系统配置外的所有权限，负责日常管理工作',
          status: 1,
          level: 2,
          permissions: ['dashboard', 'device', 'user', 'org', 'report'],
          color: '#2db7f5'
        },
        {
          id: 'production_admin',
          name: '生产管理员',
          describe: '负责设备出厂管理，可导入设备数据',
          status: 1,
          level: 3,
          permissions: ['device_factory', 'device_import', 'device_export'],
          color: '#87d068'
        },
        {
          id: 'installer',
          name: '安装维修员',
          describe: '可添加设备和修改设备信息，负责现场安装维修',
          status: 1,
          level: 4,
          permissions: ['device_add', 'device_edit', 'device_install', 'device_maintenance'],
          color: '#108ee9'
        },
        {
          id: 'enterprise_admin',
          name: '企业管理员',
          describe: '查看管理企业内所有店铺的设备情况',
          status: 1,
          level: 5,
          permissions: ['enterprise_view', 'shop_view', 'device_view', 'report_view'],
          color: '#f56a00'
        },
        {
          id: 'shop_manager',
          name: '店长',
          describe: '查看管理自己店铺的设备情况',
          status: 1,
          level: 6,
          permissions: ['shop_own_view', 'device_own_view', 'report_own_view'],
          color: '#7265e6'
        },
        {
          id: 'guest',
          name: '游客用户',
          describe: '只能查看基本信息，无操作权限',
          status: 1,
          level: 7,
          permissions: ['basic_view'],
          color: '#bfbfbf'
        }
      ],
      
      // 详细权限定义
      detailedPermissions: [
        {
          id: 'system',
          name: '系统管理',
          actions: [
            { action: 'config', describe: '系统配置' },
            { action: 'backup', describe: '数据备份' },
            { action: 'log', describe: '系统日志' },
            { action: 'update', describe: '系统更新' }
          ]
        },
        {
          id: 'user',
          name: '用户管理',
          actions: [
            { action: 'view', describe: '查看用户' },
            { action: 'add', describe: '添加用户' },
            { action: 'edit', describe: '编辑用户' },
            { action: 'delete', describe: '删除用户' },
            { action: 'reset_password', describe: '重置密码' }
          ]
        },
        {
          id: 'role',
          name: '角色管理',
          actions: [
            { action: 'view', describe: '查看角色' },
            { action: 'add', describe: '添加角色' },
            { action: 'edit', describe: '编辑角色' },
            { action: 'delete', describe: '删除角色' },
            { action: 'assign', describe: '分配权限' }
          ]
        },
        {
          id: 'device',
          name: '设备管理',
          actions: [
            { action: 'view', describe: '查看设备' },
            { action: 'add', describe: '添加设备' },
            { action: 'edit', describe: '编辑设备' },
            { action: 'delete', describe: '删除设备' },
            { action: 'install', describe: '设备安装' },
            { action: 'maintenance', describe: '设备维修' },
            { action: 'factory', describe: '设备出厂' },
            { action: 'import', describe: '批量导入' },
            { action: 'export', describe: '批量导出' }
          ]
        },
        {
          id: 'model',
          name: '型号管理',
          actions: [
            { action: 'view', describe: '查看型号' },
            { action: 'add', describe: '添加型号' },
            { action: 'edit', describe: '编辑型号' },
            { action: 'delete', describe: '删除型号' }
          ]
        },
        {
          id: 'org',
          name: '组织管理',
          actions: [
            { action: 'view', describe: '查看组织' },
            { action: 'add', describe: '添加组织' },
            { action: 'edit', describe: '编辑组织' },
            { action: 'delete', describe: '删除组织' }
          ]
        },
        {
          id: 'dashboard',
          name: '仪表板',
          actions: [
            { action: 'view', describe: '查看仪表板' },
            { action: 'export', describe: '导出数据' }
          ]
        },
        {
          id: 'report',
          name: '报表管理',
          actions: [
            { action: 'view', describe: '查看报表' },
            { action: 'export', describe: '导出报表' },
            { action: 'schedule', describe: '定时报表' }
          ]
        }
      ]
    }
  },
  created () {
    this.loadRoles()
    this.loadPermissions()
  },
  methods: {
    loadRoles () {
      this.loading = true
      getRoleList().then((res) => {
        // 合并系统预定义角色和自定义角色
        const customRoles = res.result?.data || []
        this.roles = [...this.predefinedRoles, ...customRoles]
        
        // 添加新增角色选项
        this.roles.push({
          id: '-1',
          name: '新增角色',
          describe: '新增一个自定义角色',
          color: '#52c41a'
        })
        
        // 默认选择第一个角色
        if (this.roles.length > 0) {
          this.edit(this.roles[0])
        }
      }).catch(err => {
        console.error('Failed to load roles:', err)
        this.$message.error('加载角色列表失败')
        // 如果API失败，只显示预定义角色
        this.roles = [...this.predefinedRoles]
      }).finally(() => {
        this.loading = false
      })
    },

    add () {
      this.edit({
        id: 0,
        name: '',
        describe: '',
        status: 1,
        level: 8,
        permissions: []
      })
    },

    edit (record) {
      this.mdl = Object.assign({}, record)
      
      // 处理权限勾选
      this.setRolePermissions(record)
      
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.mdl, 'id', 'name', 'status', 'describe'))
      })
    },
    
    setRolePermissions (role) {
      if (!role.permissions || !this.permissions) return
      
      // 重置所有权限选择状态
      this.permissions.forEach(permission => {
        permission.selected = []
        permission.indeterminate = false
        permission.checkedAll = false
      })
      
      // 如果是超级管理员，选中所有权限
      if (role.id === 'super_admin' || (role.permissions && role.permissions.includes('*'))) {
        this.permissions.forEach(permission => {
          permission.selected = permission.actionsOptions.map(opt => opt.value)
          permission.checkedAll = true
          permission.indeterminate = false
        })
        return
      }
      
      // 根据角色权限设置勾选状态
      const rolePermissions = role.permissions || []
      this.permissions.forEach(permission => {
        const hasPermission = rolePermissions.some(rp =>
          rp.startsWith(permission.id) || rp === permission.id
        )
        
        if (hasPermission) {
          // 根据具体权限设置选中状态
          const selectedActions = rolePermissions
            .filter(rp => rp.startsWith(permission.id + '_'))
            .map(rp => rp.replace(permission.id + '_', ''))
          
          if (selectedActions.length === 0 && rolePermissions.includes(permission.id)) {
            // 如果只有模块权限，选中查看权限
            permission.selected = ['view']
          } else {
            permission.selected = selectedActions
          }
          
          this.onChangeCheck(permission)
        }
      })
    },

    onChangeCheck (permission) {
      permission.indeterminate = !!permission.selected.length && (permission.selected.length < permission.actionsOptions.length)
      permission.checkedAll = permission.selected.length === permission.actionsOptions.length
    },
    
    onChangeCheckAll (e, permission) {
      Object.assign(permission, {
        selected: e.target.checked ? permission.actionsOptions.map(obj => obj.value) : [],
        indeterminate: false,
        checkedAll: e.target.checked
      })
    },
    
    loadPermissions () {
      // 使用详细权限定义
      this.permissions = this.detailedPermissions.map(permission => {
        const actionsOptions = permission.actions.map(action => ({
          label: action.describe,
          value: action.action
        }))
        
        return {
          ...permission,
          checkedAll: false,
          selected: [],
          indeterminate: false,
          actionsOptions
        }
      })
      
      // 也尝试从API加载权限（作为补充）
      getPermissions().then(res => {
        const apiPermissions = res.result || []
        // 合并API权限到现有权限中
        apiPermissions.forEach(apiPerm => {
          const existingPerm = this.permissions.find(p => p.id === apiPerm.id)
          if (!existingPerm) {
            const options = actionToObject(apiPerm.actionData || [])
            this.permissions.push({
              ...apiPerm,
              checkedAll: false,
              selected: [],
              indeterminate: false,
              actionsOptions: options.map(option => ({
                label: option.describe,
                value: option.action
              }))
            })
          }
        })
      }).catch(err => {
        console.warn('Failed to load API permissions:', err)
      })
    },
    
    save () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.confirmLoading = true
          
          // 收集选中的权限
          const selectedPermissions = []
          this.permissions.forEach(permission => {
            if (permission.selected && permission.selected.length > 0) {
              permission.selected.forEach(action => {
                selectedPermissions.push(`${permission.id}_${action}`)
              })
            }
          })
          
          const roleData = {
            ...values,
            permissions: selectedPermissions,
            level: this.mdl.level || 8
          }
          
          console.log('Saving role:', roleData)
          
          // 这里应该调用保存API
          setTimeout(() => {
            this.$message.success('角色保存成功')
            this.confirmLoading = false
            this.loadRoles()
          }, 1000)
        }
      })
    },
    
    deleteRole () {
      if (this.isPredefinedRole(this.mdl)) {
        this.$message.warning('预定义角色不能删除')
        return
      }
      
      this.$confirm({
        title: '确认删除',
        content: `确定要删除角色 "${this.mdl.name}" 吗？`,
        onOk: () => {
          console.log('Deleting role:', this.mdl.id)
          this.$message.success('角色删除成功')
          this.loadRoles()
        }
      })
    },
    
    isPredefinedRole (role) {
      return this.predefinedRoles.some(pr => pr.id === role.id)
    },
    
    getRolePermissionSummary (role) {
      if (!role.permissions) return '无权限'
      if (role.permissions.includes('*')) return '所有权限'
      return `${role.permissions.length} 项权限`
    }
  }
}
</script>

<style scoped>
.role-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.role-list-header h3 {
  margin: 0;
  color: #262626;
}

.role-item {
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.role-item:hover {
  background: #f0f9ff;
  border-color: #1890ff;
}

.role-item-active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.role-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.role-description {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.role-permission-count {
  color: #1890ff;
  font-weight: 500;
}

.role-form-container {
  max-width: 1000px;
}

.role-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.role-form-title {
  margin: 0;
  color: #262626;
  display: flex;
  align-items: center;
}

.role-form-actions {
  display: flex;
  gap: 8px;
}

.role-form {
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
}

.permission-notice {
  margin: 16px 0;
}

.permissions-container {
  max-height: 500px;
  overflow-y: auto;
}

.permission-row {
  margin-bottom: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.permission-name {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.permission-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.select-all-checkbox {
  margin-right: 16px;
  font-weight: 500;
}

.permission-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-checkbox-group .ant-checkbox-wrapper {
  margin-right: 0;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
}

.permission-checkbox-group .ant-checkbox-wrapper:hover {
  background: #e6f7ff;
}

.permission-checkbox-group .ant-checkbox-wrapper.ant-checkbox-wrapper-checked {
  background: #bae7ff;
  color: #1890ff;
}

@media (max-width: 768px) {
  .role-form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .permission-actions {
    margin-top: 8px;
  }
  
  .permission-checkbox-group {
    width: 100%;
  }
}
</style>
