import request from '@/utils/request'

const prefix = '/admin'

export const api = {
  smart_light_states: `${prefix}/smart_light/states`,
  smart_light_properties: `${prefix}/smart_light/properties`,
  smart_light_latest: `${prefix}/smart_light/latest`
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
