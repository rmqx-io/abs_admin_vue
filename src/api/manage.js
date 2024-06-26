import request from '@/utils/request'

const api = {
  sys_dict_page: '/admin/sys_dict_page',
  sys_dict_layer_top: '/admin/sys_dict_layer_top',
  sys_dict_add: '/admin/sys_dict_add',
  sys_dict_update: '/admin/sys_dict_update',
  sys_dict_delete: '/admin/sys_dict_remove',

  sys_res_page: '/admin/sys_res_page',
  sys_res_add: '/admin/sys_res_add',
  sys_res_update: '/admin/sys_res_update',
  sys_res_delete: '/admin/sys_res_remove',

  sys_role_page: '/admin/sys_role_page',
  sys_role_add: '/admin/sys_role_add',
  sys_role_update: '/admin/sys_role_update',
  sys_role_delete: '/admin/sys_role_delete',
  sys_res_all: '/admin/sys_res_all',
  sys_res_layer_top: '/admin/sys_res_layer_top',

  sys_user_page: '/admin/sys_user_page',
  sys_user_add: '/admin/sys_user_add',
  sys_user_update: '/admin/sys_user_update',
  sys_user_remove: '/admin/sys_user_remove',
  sys_role_layer_top: '/admin/sys_role_layer_top',

  user: '/admin/user',
  role: '/admin/role',
  service: '/service',
  device: '/admin/device',
  add_device: '/admin/device/add',
  update_device: '/admin/device/update',

  org: '/admin/org',
  add_org: '/admin/org/add',
  org_tree: '/admin/organization/tree',

  device_model: '/admin/device/model/page',
  battery_model: '/admin/battery/model/page',

  battery_info: '/admin/device/bms/info',
  battery_info_latest: '/admin/device/bms/info/latest',
  bms_config: '/admin/device/bms/config',
  bms_config_data_types: '/admin/device/bms/config/data_types',
  bms_config_data_types_map: '/admin/device/bms/config/data_types/map',
  location: '/admin/device/location',

  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return request({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return request({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getDeviceList (arg) {
  return request({
    url: api.device,
    method: 'post',
    data: arg
  })
}

export function addDevice (arg) {
  return request({
    url: api.add_device,
    method: 'post',
    data: arg
  })
}

export function updateDevice (arg) {
  return request({
    url: api.update_device,
    method: 'post',
    data: arg
  })
}

export function getPermissions (parameter) {
  return request({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgList (arg) {
  return request({
    url: api.org,
    method: 'post',
    data: arg
  })
}

export function addOrg (arg) {
  return request({
    url: api.add_org,
    method: 'post',
    data: arg
  })
}

export function getAdminOrgTree (parameter) {
  return request({
    url: api.org_tree,
    method: 'get',
    params: parameter
  })
}

export function getDeviceModelList (arg) {
  return request({
    url: api.device_model,
    method: 'post',
    data: arg
  })
}

export function getBatteryModelList (arg) {
  return request({
    url: api.battery_model,
    method: 'post',
    data: arg
  })
}

export function getBatteryInfo (deviceId, arg) {
  return request({
    url: api.battery_info + '/' + deviceId,
    method: 'post',
    data: arg
  })
}

export function getBatteryInfoLatest (deviceId, arg) {
  return request({
    url: api.battery_info_latest + '/' + deviceId,
    method: 'post',
    data: arg
  })
}

export function setBmsConfig (deviceId, arg) {
  return request({
    url: api.bms_config + '/' + deviceId,
    method: 'post',
    data: arg
  })
}

export function getBmsConfigDataTypes (bmsType) {
  return request({
    url: api.bms_config_data_types + '/' + bmsType,
    method: 'get'
  })
}

export function getBmsConfigDataTypesMap (bmsType) {
  return request({
    url: api.bms_config_data_types_map + '/' + bmsType,
    method: 'get'
  })
}

export function getLocation (deviceId, arg) {
  return request({
    url: api.location + '/' + deviceId,
    method: 'post',
    data: arg
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return request({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}

export function res_page (arg) {
  return request({
    url: api.sys_res_page,
    method: 'post',
    data: arg
  })
}

export function res_add (arg) {
  return request({
    url: api.sys_res_add,
    method: 'post',
    data: arg
  })
}

export function res_update (arg) {
  return request({
    url: api.sys_res_update,
    method: 'post',
    data: arg
  })
}

export function res_delete (arg) {
  return request({
    url: api.sys_res_delete,
    method: 'post',
    data: arg
  })
}

export function res_all (arg) {
  return request({
    url: api.sys_res_all,
    method: 'post',
    data: arg
  })
}

export function sys_res_layer_top (arg) {
  return request({
    url: api.sys_res_layer_top,
    method: 'post',
    data: arg
  })
}

export function role_page (arg) {
  return request({
    url: api.sys_role_page,
    method: 'post',
    data: arg
  })
}

export function role_add (arg) {
  return request({
    url: api.sys_role_add,
    method: 'post',
    data: arg
  })
}

export function role_update (arg) {
  return request({
    url: api.sys_role_update,
    method: 'post',
    data: arg
  })
}

export function role_delete (arg) {
  return request({
    url: api.sys_role_delete,
    method: 'post',
    data: arg
  })
}

export function sys_user_page (arg) {
  return request({
    url: api.sys_user_page,
    method: 'post',
    data: arg
  })
}

export function sys_user_remove (arg) {
  return request({
    url: api.sys_user_remove,
    method: 'post',
    data: arg
  })
}

export function sys_user_add (arg) {
  return request({
    url: api.sys_user_add,
    method: 'post',
    data: arg
  })
}

export function sys_user_update (arg) {
  return request({
    url: api.sys_user_update,
    method: 'post',
    data: arg
  })
}

export function sys_role_layer_top(arg){
  return request({
    url: api.sys_role_layer_top,
    method: 'post',
    data: arg
  })
}

export function dictPage (arg) {
  return request({
    url: api.sys_dict_page,
    method: 'post',
    data: arg
  })
}

export function dictAdd (arg) {
  return request({
    url: api.sys_dict_add,
    method: 'post',
    data: arg
  })
}

export function dictUpdate (arg) {
  return request({
    url: api.sys_dict_update,
    method: 'post',
    data: arg
  })
}

export function dictDelete (arg) {
  return request({
    url: api.sys_dict_delete,
    method: 'post',
    data: arg
  })
}
