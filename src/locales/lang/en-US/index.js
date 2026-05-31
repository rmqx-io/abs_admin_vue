import antd from 'ant-design-vue/es/locale-provider/en_US'
import momentEN from 'moment/locale/en-gb'
import global from './global'

import menu from './menu'
import setting from './setting'
import user from './user'
import dashboard from './dashboard'
import form from './form'
import result from './result'
import account from './account'
import device from './device'
import list from './list'
import org from './org'
import alarm from './alarm'
import deviceTracing from './device-tracing'

const components = {
  antLocale: antd,
  momentName: 'en-US',
  momentLocale: momentEN,
  'Total': 'Total',
  'Status': 'Status',
  'Online': 'Online',
  'Offline': 'Offline',
  'Standby': 'Standby',
  'No': 'No.',
  'Organization': 'Organization',
  'BT Code': 'BT Code',
  'ICCID': 'ICCID',
  'SOH': 'SOH',
  'SOC': 'SOC',
  'Alarm': 'Alarm',
  'common.search': 'Search',
  'common.more': 'More',
  'common.edit': 'Edit',
  'common.batchActions': 'Batch Actions'
}

export default {
  message: '-',

  'layouts.usermenu.dialog.title': 'Information',
  'layouts.usermenu.dialog.content': 'Are you sure you want to log out?',
  'layouts.userLayout.title': 'Admin System',
  ...components,
  ...global,
  ...menu,
  ...setting,
  ...user,
  ...dashboard,
  ...form,
  ...result,
  ...account,
  ...device,
  ...list,
  ...org,
  ...alarm,
  ...deviceTracing
}
