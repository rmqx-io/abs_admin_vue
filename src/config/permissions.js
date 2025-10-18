/**
 * 角色权限配置文件
 * 定义系统中所有角色及其对应的权限
 */

// 权限常量定义
export const PERMISSIONS = {
  // 系统管理权限
  SYSTEM: {
    CONFIG: 'system_config', // 系统配置
    BACKUP: 'system_backup', // 数据备份
    LOG: 'system_log', // 系统日志
    UPDATE: 'system_update' // 系统更新
  },
  
  // 用户管理权限
  USER: {
    VIEW: 'user_view', // 查看用户
    ADD: 'user_add', // 添加用户
    EDIT: 'user_edit', // 编辑用户
    DELETE: 'user_delete', // 删除用户
    RESET_PASSWORD: 'user_reset_password' // 重置密码
  },
  
  // 角色管理权限
  ROLE: {
    VIEW: 'role_view', // 查看角色
    ADD: 'role_add', // 添加角色
    EDIT: 'role_edit', // 编辑角色
    DELETE: 'role_delete', // 删除角色
    ASSIGN: 'role_assign' // 分配权限
  },
  
  // 设备管理权限
  DEVICE: {
    VIEW: 'device_view', // 查看设备
    ADD: 'device_add', // 添加设备
    EDIT: 'device_edit', // 编辑设备
    DELETE: 'device_delete', // 删除设备
    INSTALL: 'device_install', // 设备安装
    MAINTENANCE: 'device_maintenance', // 设备维修
    FACTORY: 'device_factory', // 设备出厂
    IMPORT: 'device_import', // 批量导入
    EXPORT: 'device_export' // 批量导出
  },
  
  // 型号管理权限
  MODEL: {
    VIEW: 'model_view', // 查看型号
    ADD: 'model_add', // 添加型号
    EDIT: 'model_edit', // 编辑型号
    DELETE: 'model_delete' // 删除型号
  },
  
  // 组织管理权限
  ORG: {
    VIEW: 'org_view', // 查看组织
    ADD: 'org_add', // 添加组织
    EDIT: 'org_edit', // 编辑组织
    DELETE: 'org_delete' // 删除组织
  },
  
  // 仪表板权限
  DASHBOARD: {
    VIEW: 'dashboard_view', // 查看仪表板
    EXPORT: 'dashboard_export' // 导出数据
  },
  
  // 报表管理权限
  REPORT: {
    VIEW: 'report_view', // 查看报表
    EXPORT: 'report_export', // 导出报表
    SCHEDULE: 'report_schedule' // 定时报表
  }
}

// 角色定义
export const ROLES = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: '超级管理员',
    describe: '拥有系统所有权限，包括系统配置、用户管理等',
    level: 1,
    color: '#f50',
    permissions: ['*'] // 所有权限
  },
  
  ADMIN: {
    id: 'admin',
    name: '管理员',
    describe: '除系统配置外的所有权限，负责日常管理工作',
    level: 2,
    color: '#2db7f5',
    permissions: [
      PERMISSIONS.USER.VIEW,
      PERMISSIONS.USER.ADD,
      PERMISSIONS.USER.EDIT,
      PERMISSIONS.USER.DELETE,
      PERMISSIONS.USER.RESET_PASSWORD,
      PERMISSIONS.ROLE.VIEW,
      PERMISSIONS.ROLE.ADD,
      PERMISSIONS.ROLE.EDIT,
      PERMISSIONS.ROLE.DELETE,
      PERMISSIONS.ROLE.ASSIGN,
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.DEVICE.ADD,
      PERMISSIONS.DEVICE.EDIT,
      PERMISSIONS.DEVICE.DELETE,
      PERMISSIONS.DEVICE.INSTALL,
      PERMISSIONS.DEVICE.MAINTENANCE,
      PERMISSIONS.DEVICE.IMPORT,
      PERMISSIONS.DEVICE.EXPORT,
      PERMISSIONS.MODEL.VIEW,
      PERMISSIONS.MODEL.ADD,
      PERMISSIONS.MODEL.EDIT,
      PERMISSIONS.MODEL.DELETE,
      PERMISSIONS.ORG.VIEW,
      PERMISSIONS.ORG.ADD,
      PERMISSIONS.ORG.EDIT,
      PERMISSIONS.ORG.DELETE,
      PERMISSIONS.DASHBOARD.VIEW,
      PERMISSIONS.DASHBOARD.EXPORT,
      PERMISSIONS.REPORT.VIEW,
      PERMISSIONS.REPORT.EXPORT,
      PERMISSIONS.REPORT.SCHEDULE
    ]
  },
  
  PRODUCTION_ADMIN: {
    id: 'production_admin',
    name: '生产管理员',
    describe: '负责设备出厂管理，可导入设备数据',
    level: 3,
    color: '#87d068',
    permissions: [
      PERMISSIONS.DEVICE.FACTORY,
      PERMISSIONS.DEVICE.IMPORT,
      PERMISSIONS.DEVICE.EXPORT,
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.MODEL.VIEW,
      PERMISSIONS.DASHBOARD.VIEW,
      PERMISSIONS.REPORT.VIEW
    ]
  },
  
  INSTALLER: {
    id: 'installer',
    name: '安装维修员',
    describe: '可添加设备和修改设备信息，负责现场安装维修',
    level: 4,
    color: '#108ee9',
    permissions: [
      PERMISSIONS.DEVICE.ADD,
      PERMISSIONS.DEVICE.EDIT,
      PERMISSIONS.DEVICE.INSTALL,
      PERMISSIONS.DEVICE.MAINTENANCE,
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.MODEL.VIEW,
      PERMISSIONS.DASHBOARD.VIEW
    ]
  },
  
  ENTERPRISE_ADMIN: {
    id: 'enterprise_admin',
    name: '企业管理员',
    describe: '查看管理企业内所有店铺的设备情况',
    level: 5,
    color: '#f56a00',
    permissions: [
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.ORG.VIEW,
      PERMISSIONS.DASHBOARD.VIEW,
      PERMISSIONS.REPORT.VIEW,
      PERMISSIONS.REPORT.EXPORT
    ]
  },
  
  SHOP_MANAGER: {
    id: 'shop_manager',
    name: '店长',
    describe: '查看管理自己店铺的设备情况',
    level: 6,
    color: '#7265e6',
    permissions: [
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.DASHBOARD.VIEW,
      PERMISSIONS.REPORT.VIEW
    ]
  },
  
  GUEST: {
    id: 'guest',
    name: '游客用户',
    describe: '只能查看基本信息，无操作权限',
    level: 7,
    color: '#bfbfbf',
    permissions: [
      PERMISSIONS.DASHBOARD.VIEW
    ]
  }
}

// 权限组定义
export const PERMISSION_GROUPS = [
  {
    id: 'system',
    name: '系统管理',
    permissions: [
      { key: PERMISSIONS.SYSTEM.CONFIG, name: '系统配置', description: '修改系统配置参数' },
      { key: PERMISSIONS.SYSTEM.BACKUP, name: '数据备份', description: '备份和恢复系统数据' },
      { key: PERMISSIONS.SYSTEM.LOG, name: '系统日志', description: '查看系统运行日志' },
      { key: PERMISSIONS.SYSTEM.UPDATE, name: '系统更新', description: '更新系统版本' }
    ]
  },
  {
    id: 'user',
    name: '用户管理',
    permissions: [
      { key: PERMISSIONS.USER.VIEW, name: '查看用户', description: '查看用户列表和详情' },
      { key: PERMISSIONS.USER.ADD, name: '添加用户', description: '创建新用户账户' },
      { key: PERMISSIONS.USER.EDIT, name: '编辑用户', description: '修改用户信息' },
      { key: PERMISSIONS.USER.DELETE, name: '删除用户', description: '删除用户账户' },
      { key: PERMISSIONS.USER.RESET_PASSWORD, name: '重置密码', description: '重置用户登录密码' }
    ]
  },
  {
    id: 'role',
    name: '角色管理',
    permissions: [
      { key: PERMISSIONS.ROLE.VIEW, name: '查看角色', description: '查看角色列表和权限' },
      { key: PERMISSIONS.ROLE.ADD, name: '添加角色', description: '创建新的用户角色' },
      { key: PERMISSIONS.ROLE.EDIT, name: '编辑角色', description: '修改角色信息' },
      { key: PERMISSIONS.ROLE.DELETE, name: '删除角色', description: '删除自定义角色' },
      { key: PERMISSIONS.ROLE.ASSIGN, name: '分配权限', description: '为角色分配权限' }
    ]
  },
  {
    id: 'device',
    name: '设备管理',
    permissions: [
      { key: PERMISSIONS.DEVICE.VIEW, name: '查看设备', description: '查看设备列表和详情' },
      { key: PERMISSIONS.DEVICE.ADD, name: '添加设备', description: '添加新设备' },
      { key: PERMISSIONS.DEVICE.EDIT, name: '编辑设备', description: '修改设备信息' },
      { key: PERMISSIONS.DEVICE.DELETE, name: '删除设备', description: '删除设备记录' },
      { key: PERMISSIONS.DEVICE.INSTALL, name: '设备安装', description: '执行设备安装操作' },
      { key: PERMISSIONS.DEVICE.MAINTENANCE, name: '设备维修', description: '执行设备维修操作' },
      { key: PERMISSIONS.DEVICE.FACTORY, name: '设备出厂', description: '管理设备出厂流程' },
      { key: PERMISSIONS.DEVICE.IMPORT, name: '批量导入', description: '批量导入设备数据' },
      { key: PERMISSIONS.DEVICE.EXPORT, name: '批量导出', description: '批量导出设备数据' }
    ]
  },
  {
    id: 'model',
    name: '型号管理',
    permissions: [
      { key: PERMISSIONS.MODEL.VIEW, name: '查看型号', description: '查看设备型号信息' },
      { key: PERMISSIONS.MODEL.ADD, name: '添加型号', description: '添加新设备型号' },
      { key: PERMISSIONS.MODEL.EDIT, name: '编辑型号', description: '修改设备型号信息' },
      { key: PERMISSIONS.MODEL.DELETE, name: '删除型号', description: '删除设备型号' }
    ]
  },
  {
    id: 'org',
    name: '组织管理',
    permissions: [
      { key: PERMISSIONS.ORG.VIEW, name: '查看组织', description: '查看组织架构' },
      { key: PERMISSIONS.ORG.ADD, name: '添加组织', description: '添加新的组织单位' },
      { key: PERMISSIONS.ORG.EDIT, name: '编辑组织', description: '修改组织信息' },
      { key: PERMISSIONS.ORG.DELETE, name: '删除组织', description: '删除组织单位' }
    ]
  },
  {
    id: 'dashboard',
    name: '仪表板',
    permissions: [
      { key: PERMISSIONS.DASHBOARD.VIEW, name: '查看仪表板', description: '查看数据仪表板' },
      { key: PERMISSIONS.DASHBOARD.EXPORT, name: '导出数据', description: '导出仪表板数据' }
    ]
  },
  {
    id: 'report',
    name: '报表管理',
    permissions: [
      { key: PERMISSIONS.REPORT.VIEW, name: '查看报表', description: '查看各类报表' },
      { key: PERMISSIONS.REPORT.EXPORT, name: '导出报表', description: '导出报表数据' },
      { key: PERMISSIONS.REPORT.SCHEDULE, name: '定时报表', description: '设置定时报表任务' }
    ]
  }
]

/**
 * 检查用户是否有指定权限
 * @param {Array} userPermissions 用户权限列表
 * @param {String} requiredPermission 需要的权限
 * @returns {Boolean}
 */
export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (userPermissions.includes('*')) {
    return true
  }
  
  return userPermissions.includes(requiredPermission)
}

/**
 * 检查用户是否有指定权限组中的任一权限
 * @param {Array} userPermissions 用户权限列表
 * @param {Array} requiredPermissions 需要的权限列表
 * @returns {Boolean}
 */
export function hasAnyPermission(userPermissions, requiredPermissions) {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (userPermissions.includes('*')) {
    return true
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

/**
 * 检查用户是否有指定权限组中的所有权限
 * @param {Array} userPermissions 用户权限列表
 * @param {Array} requiredPermissions 需要的权限列表
 * @returns {Boolean}
 */
export function hasAllPermissions(userPermissions, requiredPermissions) {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  
  // 超级管理员拥有所有权限
  if (userPermissions.includes('*')) {
    return true
  }
  
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

/**
 * 根据角色获取权限列表
 * @param {String} roleId 角色ID
 * @returns {Array} 权限列表
 */
export function getPermissionsByRole(roleId) {
  const role = Object.values(ROLES).find(r => r.id === roleId)
  return role ? role.permissions : []
}

/**
 * 获取角色信息
 * @param {String} roleId 角色ID
 * @returns {Object} 角色信息
 */
export function getRoleInfo(roleId) {
  return Object.values(ROLES).find(r => r.id === roleId) || null
}

export default {
  PERMISSIONS,
  ROLES,
  PERMISSION_GROUPS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsByRole,
  getRoleInfo
}