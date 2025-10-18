import request from '@/utils/request'

const prefix = '/admin'

export const accountApi = {
  // 主账号管理
  accounts: `${prefix}/accounts`,
  account_toggle_status: `${prefix}/accounts/{id}/toggle_status`,
  account_reset_password: `${prefix}/accounts/{id}/reset_password`,
  
  // 子账号管理
  sub_accounts: `${prefix}/sub_accounts`,
  sub_account_toggle_status: `${prefix}/sub_accounts/{id}/toggle_status`,
  sub_account_reset_password: `${prefix}/sub_accounts/{id}/reset_password`,
  
  // 文件上传
  upload: `${prefix}/upload`,
  
  // 用户密码管理
  change_password: `${prefix}/user/change_password`
}

// 主账号管理API
export function getAccountList(parameter) {
  return request({
    url: accountApi.accounts,
    method: 'post',
    data: parameter
  })
}

export function addAccount(parameter) {
  return request({
    url: accountApi.accounts,
    method: 'post',
    data: parameter
  })
}

export function updateAccount(parameter) {
  return request({
    url: `${accountApi.accounts}/${parameter.id}`,
    method: 'put',
    data: parameter
  })
}

export function deleteAccount(id) {
  return request({
    url: `${accountApi.accounts}/${id}`,
    method: 'delete'
  })
}

export function toggleAccountStatus(id) {
  return request({
    url: accountApi.account_toggle_status.replace('{id}', id),
    method: 'patch'
  })
}

export function resetAccountPassword(id) {
  return request({
    url: accountApi.account_reset_password.replace('{id}', id),
    method: 'post'
  })
}

// 子账号管理API
export function getSubAccountList(parameter) {
  return request({
    url: accountApi.sub_accounts,
    method: 'post',
    data: parameter
  })
}

export function addSubAccount(parameter) {
  return request({
    url: accountApi.sub_accounts,
    method: 'post',
    data: parameter
  })
}

export function updateSubAccount(parameter) {
  return request({
    url: `${accountApi.sub_accounts}/${parameter.id}`,
    method: 'put',
    data: parameter
  })
}

export function deleteSubAccount(id) {
  return request({
    url: `${accountApi.sub_accounts}/${id}`,
    method: 'delete'
  })
}

export function toggleSubAccountStatus(id) {
  return request({
    url: accountApi.sub_account_toggle_status.replace('{id}', id),
    method: 'patch'
  })
}

export function resetSubAccountPassword(id) {
  return request({
    url: accountApi.sub_account_reset_password.replace('{id}', id),
    method: 'post'
  })
}

// 文件上传API
// 重置密码
export function resetPassword(data) {
  const url = accountApi.account_reset_password.replace('{id}', data.account_id)
  return request({
    url,
    method: 'post',
    data
  })
}

// 用户修改密码
export function changePassword(data) {
  return request({
    url: accountApi.change_password,
    method: 'post',
    data
  })
}

// 文件上传（企业LOGO等）
export function uploadFile(data) {
  return request({
    url: accountApi.upload,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 账号验证API
export function validateEmail(email) {
  return request({
    url: `${accountApi.accounts}/validate/email`,
    method: 'post',
    data: { email }
  })
}

export function validatePhone(phone) {
  return request({
    url: `${accountApi.accounts}/validate/phone`,
    method: 'post',
    data: { phone }
  })
}

// 企业信息相关API
export function getEnterpriseInfo(accountId) {
  return request({
    url: `${accountApi.accounts}/${accountId}/enterprise_info`,
    method: 'get'
  })
}

export function updateEnterpriseInfo(accountId, enterpriseInfo) {
  return request({
    url: `${accountApi.accounts}/${accountId}/enterprise_info`,
    method: 'put',
    data: enterpriseInfo
  })
}

// 账号统计API
export function getAccountStatistics() {
  return request({
    url: `${accountApi.accounts}/statistics`,
    method: 'get'
  })
}

export function getSubAccountStatistics(parentAccountId) {
  return request({
    url: `${accountApi.sub_accounts}/statistics`,
    method: 'get',
    params: { parent_account_id: parentAccountId }
  })
}

// 批量操作API
export function batchToggleAccountStatus(ids, status) {
  return request({
    url: `${accountApi.accounts}/batch/toggle_status`,
    method: 'post',
    data: { ids, status }
  })
}

export function batchDeleteAccounts(ids) {
  return request({
    url: `${accountApi.accounts}/batch/delete`,
    method: 'post',
    data: { ids }
  })
}

// 导入导出API
export function exportAccounts(parameter) {
  return request({
    url: `${accountApi.accounts}/export`,
    method: 'post',
    data: parameter,
    responseType: 'blob'
  })
}

export function importAccounts(formData) {
  return request({
    url: `${accountApi.accounts}/import`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default {
  getAccountList,
  addAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
  resetAccountPassword,
  getSubAccountList,
  addSubAccount,
  updateSubAccount,
  deleteSubAccount,
  toggleSubAccountStatus,
  resetSubAccountPassword,
  changePassword,
  uploadFile,
  validateEmail,
  validatePhone,
  getEnterpriseInfo,
  updateEnterpriseInfo,
  getAccountStatistics,
  getSubAccountStatistics,
  batchToggleAccountStatus,
  batchDeleteAccounts,
  exportAccounts,
  importAccounts
}
