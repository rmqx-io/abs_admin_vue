import request from '@/utils/request'

const prefix = '/admin'

export const api = {
  smart_light_states: `${prefix}/smart_light/states`,
  smart_light_properties: `${prefix}/smart_light/properties`,
  smart_light_latest: `${prefix}/smart_light/latest`,
  smart_light_dashboard_stats: `${prefix}/smart_light/dashboard/stats`,
  smart_light_dashboard_device_stats: `${prefix}/smart_light/dashboard/device_stats`,
  smart_light_dashboard_user_stats: `${prefix}/smart_light/dashboard/user_stats`,
  smart_light_dashboard_energy_stats: `${prefix}/smart_light/dashboard/energy_stats`,
  smart_light_dashboard_realtime: `${prefix}/smart_light/dashboard/realtime`,
  
  // 设备型号管理
  smart_switch_models: `${prefix}/device_models/smart_switch`,
  smart_light_models: `${prefix}/device_models/smart_light`,
  
  // 已安装设备管理
  installed_devices: `${prefix}/installed_devices`
}

export function getSmartLightStates (parameter) {
  return request({
    url: api.smart_light_states,
    method: 'get',
    params: parameter
  })
}

export function getSmartLightProperties (parameter) {
  return request({
    url: api.smart_light_properties,
    method: 'get',
    params: parameter
  })
}

export function getLatestStateAndProperty (deviceId) {
  return request({
    url: `${api.smart_light_latest}/${deviceId}`,
    method: 'get'
  })
}

// 智能照明看板相关API
export function getSmartLightDashboardStats () {
  return request({
    url: api.smart_light_dashboard_stats,
    method: 'get'
  })
}

export function getSmartLightDeviceStats () {
  return request({
    url: api.smart_light_dashboard_device_stats,
    method: 'get'
  })
}

export function getSmartLightUserStats () {
  return request({
    url: api.smart_light_dashboard_user_stats,
    method: 'get'
  })
}

export function getSmartLightEnergyStats () {
  return request({
    url: api.smart_light_dashboard_energy_stats,
    method: 'get'
  })
}

export function getSmartLightRealtimeStats () {
  return request({
    url: api.smart_light_dashboard_realtime,
    method: 'get'
  })
}

// 智能开关型号管理API
export function getSmartSwitchModelList (parameter) {
  return request({
    url: api.smart_switch_models,
    method: 'post',
    data: parameter
  })
}

export function addSmartSwitchModel (parameter) {
  return request({
    url: api.smart_switch_models,
    method: 'post',
    data: parameter
  })
}

export function updateSmartSwitchModel (parameter) {
  return request({
    url: `${api.smart_switch_models}/${parameter.id}`,
    method: 'put',
    data: parameter
  })
}

export function deleteSmartSwitchModel (id) {
  return request({
    url: `${api.smart_switch_models}/${id}`,
    method: 'delete'
  })
}

// 智能灯型号管理API
export function getSmartLightModelList (parameter) {
  return request({
    url: api.smart_light_models,
    method: 'post',
    data: parameter
  })
}

export function addSmartLightModel (parameter) {
  return request({
    url: api.smart_light_models,
    method: 'post',
    data: parameter
  })
}

export function updateSmartLightModel (parameter) {
  return request({
    url: `${api.smart_light_models}/${parameter.id}`,
    method: 'put',
    data: parameter
  })
}

export function deleteSmartLightModel (id) {
  return request({
    url: `${api.smart_light_models}/${id}`,
    method: 'delete'
  })
}

// 已安装设备管理API
export function getInstalledDeviceList (parameter) {
  return request({
    url: api.installed_devices,
    method: 'post',
    data: parameter
  })
}

export function addInstalledDevice (parameter) {
  return request({
    url: api.installed_devices,
    method: 'post',
    data: parameter
  })
}

export function updateInstalledDevice (parameter) {
  return request({
    url: `${api.installed_devices}/${parameter.id}`,
    method: 'put',
    data: parameter
  })
}

export function softDeleteDevice (id) {
  return request({
    url: `${api.installed_devices}/${id}/soft_delete`,
    method: 'patch'
  })
}

export function restoreDevice (id) {
  return request({
    url: `${api.installed_devices}/${id}/restore`,
    method: 'patch'
  })
}
