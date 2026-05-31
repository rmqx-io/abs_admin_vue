import antd from 'ant-design-vue/es/locale-provider/zh_CN'
import momentCN from 'moment/locale/zh-cn'
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
  momentName: 'zh-cn',
  momentLocale: momentCN,
  'Total': '总计',
  'Status': '状态',
  'Online': '在线',
  'Offline': '离线',
  'Standby': '待机',
  'No': '编号',
  'Organization': '组织',
  'BT Code': 'BT码',
  'ICCID': 'ICCID',
  'SOH': 'SOH',
  'SOC': 'SOC',
  'Alarm': '告警',
  'common.search': '查询',
  'common.more': '更多',
  'common.edit': '修改',
  'common.batchActions': '批量操作'
}

export default {
  message: '-',

  'layouts.usermenu.dialog.title': '信息',
  'layouts.usermenu.dialog.content': '您确定要注销吗？',
  'layouts.userLayout.title': '后台系统',
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
