import request from '@/utils/request'

const prefix = '/admin'

const api = {
  sys_dict_page: `${prefix}/sys_dict_page`,
  sys_dict_layer_top: `${prefix}/sys_dict_layer_top`,
  sys_dict_add: `${prefix}/sys_dict_add`,
  sys_dict_update: `${prefix}/sys_dict_update`,
  sys_dict_delete: `${prefix}/sys_dict_remove`,

  sys_res_page: `${prefix}/sys_res_page`,
  sys_res_add: `${prefix}/sys_res_add`,
  sys_res_update: `${prefix}/sys_res_update`,
  sys_res_delete: `${prefix}/sys_res_remove`,

  sys_role_page: `${prefix}/sys_role_page`,
  sys_role_add: `${prefix}/sys_role_add`,
  sys_role_update: `${prefix}/sys_role_update`,
  sys_role_delete: `${prefix}/sys_role_delete`,
  sys_res_all: `${prefix}/sys_res_all`,
  sys_res_layer_top: `${prefix}/sys_res_layer_top`,

  sys_user_page: `${prefix}/sys_user_page`,
  sys_user_add: `${prefix}/sys_user_add`,
  sys_user_update: `${prefix}/sys_user_update`,
  sys_user_remove: `${prefix}/sys_user_remove`,
  sys_role_layer_top: `${prefix}/sys_role_layer_top`,

  user: `${prefix}/sys_user_page`,
  role: `${prefix}/role`,
  service: `${prefix}/service`,
  device: `${prefix}/device`,
  device_export: `${prefix}/device/export`,
  device_alarm: `${prefix}/device/alarm`,
  bms_alarm_count: `${prefix}/device/alarm/bms/count`,
  device_alarm_types: `${prefix}/device/alarm/type`,
  add_device: `${prefix}/device/add`,
  update_device: `${prefix}/device/update`,
  device_packet_log: `${prefix}/device/packet/log`,

  org: `${prefix}/org`,
  add_org: `${prefix}/org/add`,
  org_tree: `${prefix}/organization/tree`,

  device_model: `${prefix}/device/model/page`,
  battery_model: `${prefix}/battery/model/page`,

  battery_info: `${prefix}/device/bms/info`,
  battery_info_latest: `${prefix}/device/bms/info/latest`,
  bms_config: `${prefix}/device/bms/config`,
  bms_config_data_types: `${prefix}/device/bms/config/data_types`,
  bms_config_data_types_map: `${prefix}/device/bms/config/data_types/map`,
  location: `${prefix}/device/location`,
  bms_type: `${prefix}/device/bms/type`,

  send_command_list: `${prefix}/device/config/commands`,
  send_command: `${prefix}/device/control/send/command`,
  send_batch_command: `${prefix}/device/control/send_batch/command`,
  send_batch_command_list: `${prefix}/device/control/send_batch/command/list`,
  send_batch_command_devices: `${prefix}/device/control/send_batch/command/devices`,

  refresh_online_status: `${prefix}/device/refresh/online/status`,

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

export function exportDeviceList (arg) {
  return request({
    url: api.device_export,
    method: 'post',
    data: arg
  })
}

export function getExportDeviceList (parameters) {
  return request({
    url: api.device_export,
    method: 'get',
    params: parameters
  })
}

export function getDeviceAlarm (arg) {
  return request({
    url: api.device_alarm,
    method: 'post',
    data: arg
  })
}

export function getBmsAlarmCount (parameters) {
  return request({
    url: api.bms_alarm_count,
    method: 'get',
    params: parameters
  })
}

export function getDeviceAlarmTypes (deviceType) {
return request({
    url: api.device_alarm_types + '/' + deviceType,
    method: 'get'
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

export function getDevicePacketLog (deviceId, parameter) {
  return request({
    url: api.device_packet_log + '/' + deviceId,
    method: 'post',
    data: parameter
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

export function getStatusCount (parameter) {
  return request({
    url: api.device + '/status/count',
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

export function getBatteryInfo (deviceId, bmsType, arg) {
  return request({
    url: api.battery_info + '/' + deviceId + '/' + bmsType,
    method: 'post',
    data: arg
  })
}

export function getBatteryInfoLatest (deviceId, bmsType, arg) {
  return request({
    url: api.battery_info_latest + '/' + deviceId + '/' + bmsType,
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

export function getBmsType(deviceId) {
  // Implementing a cache for bms_type
  if (getBmsType.cache && getBmsType.cache[deviceId]) {
    return Promise.resolve(getBmsType.cache[deviceId]);
  }

  return request({
    url: api.bms_type + '/' + deviceId,
    method: 'get'
  }).then(res => {
    // Storing the bms_type in the cache
    if (!getBmsType.cache) {
      getBmsType.cache = {};
    }
    getBmsType.cache[deviceId] = res;
    return res;
  });
}

export function getLocation (deviceId, arg) {
  return request({
    url: api.location + '/' + deviceId,
    method: 'post',
    data: arg
  })
}

export function refreshOnlineStatus (deviceId) {
  return request({
    url: api.refresh_online_status + '/' + deviceId,
    method: 'get'
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

export function getSendCommandList (provider) {
  return request({
    url: api.send_command_list + '/' + provider,
    method: 'get'
  })
}

export function getBatchSendCommandList (arg) {
  return request({
    url: api.send_batch_command_list,
    method: 'post',
    data: arg
  })
}

export function getBatchSendCommandDevices (arg) {
  return request({
    url: api.send_batch_command_devices,
    method: 'post',
    data: arg
  })
}

export function sendCommand (deviceId, arg) {
  return request({
    url: api.send_command + '/' + deviceId,
    method: 'post',
    data: arg
  })
}

export function batchSendCommand (arg) {
  return request({
    url: api.send_batch_command,
    method: 'post',
    data: arg
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

export function sys_role_layer_top(arg) {
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
