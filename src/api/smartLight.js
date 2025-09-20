import request from '@/utils/request'

const prefix = '/admin'

export const api = {
  smart_light_states: `${prefix}/smart_light/states`,
  smart_light_properties: `${prefix}/smart_light/properties`
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
