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

const components = {
  antLocale: antd,
  momentName: 'zh-CN',
  momentLocale: momentCN,
  'total': '全部',
  'status': '状态',
  'online': '在线',
  'offline': '离线',
  'standby': '待机'
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
  ...device
}
