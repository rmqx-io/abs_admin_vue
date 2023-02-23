// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout,PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/dashboard/analysis',
    children: [
      // dashboard
      {
        path: '/dashboard',
        name: 'dashboard',
        redirect: '/dashboard/analysis',
        component: RouteView,
        meta: { title: 'menu.dashboard', keepAlive: true, icon: bxAnaalyse, permission: ['dashboard'] },
        children: [
          {
            path: '/dashboard/analysis/:pageNo([1-9]\\d*)?',
            name: 'Analysis',
            component: () => import('@/views/dashboard/Analysis'),
            meta: { title: 'menu.dashboard.analysis', keepAlive: false, permission: ['dashboard'] }
          },
          {
            path: '/dashboard/dashboard',
            name: 'Dashboard',
            component: () => import('@/views/dashboard/Dashboard'),
            meta: { title: 'menu.dashboard.monitor', keepAlive: true, permission: ['dashboard'] }
          }
        ]
      },
      // list
      {
        path: '/list',
        name: 'list',
        component: RouteView,
        redirect: '/list/device-list',
        meta: { title: 'menu.device', icon: 'bars', permission: ['table'] },
        children: [
          {
            path: '/list/device-list/:page_no([1-9]\\d*)?',
            name: 'TableListWrapper',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/list/DeviceList'),
            meta: { title: '设备列表', keepAlive: true, permission: ['table'] },
            children: [
            ]
          },
          {
            path: '/list/device-list/info/:device_id([1-9]\\d*)?',
            // hideChildrenInMenu: true,
            hidden: true,
            // name: 'ProfileBasic',
            // component: () => import('@/views/profile/basic'),
            name: 'Info',
            component: () => import('@/views/list/components/BatteryInfo'),
            meta: { title: '电池详情', keepAlive: true, permission: ['table'] }
          }
        ]
      },
      {
        path: '/org',
        name: 'org',
        component: RouteView,
        redirect: '/org/org',
        meta: { title: 'menu.org', icon: 'team', permission: ['table'] },
        children: [
          {
            path: '/org/org/:page_no([1-9]\\d*)?',
            name: 'OrgList',
            hideChildrenInMenu: true,
            component: () => import('@/views/org/OrgList'),
            meta: { title: 'menu.org', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/setting/user',
            name: 'setting_user',
            component: () => import('@/views/setting/User'),
            meta: { title: '账号管理', keepAlive: true, permission: ['table'] }
          }
        ]
      },

      {
        path: '/model',
        name: 'model',
        component: RouteView,
        redirect: '/model/device-model',
        meta: { title: 'menu.model', icon: 'profile', permission: ['table'] },
        children: [
          {
            path: '/model/device-model/:page_no([1-9]\\d*)?',
            name: 'DeviceList',
            hideChildrenInMenu: true,
            component: () => import('@/views/model/DeviceList'),
            meta: { title: 'menu.device-model', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/model/battery-model/:page_no([1-9]\\d*)?',
            name: 'BatteryList',
            hideChildrenInMenu: true,
            component: () => import('@/views/model/BatteryList'),
            meta: { title: 'menu.battery-model', keepAlive: true, permission: ['table'] }
          }
        ]
      },

      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: 'menu.account', icon: 'user', keepAlive: true, permission: ['user'] },
        children: [
          {
            path: '/account/center',
            name: 'center',
            component: () => import('@/views/account/center'),
            meta: { title: 'menu.account.center', keepAlive: true, permission: ['user'] }
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: 'menu.account.settings', hideHeader: true, permission: ['user'] },
            redirect: '/account/settings/basic',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/basic',
                name: 'BasicSettings',
                component: () => import('@/views/account/settings/BasicSetting'),
                meta: { title: 'account.settings.menuMap.basic', hidden: true, permission: ['user'] }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: {
                  title: 'account.settings.menuMap.security',
                  hidden: true,
                  keepAlive: true,
                  permission: ['user']
                }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: { title: 'account.settings.menuMap.custom', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: { title: 'account.settings.menuMap.binding', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: {
                  title: 'account.settings.menuMap.notification',
                  hidden: true,
                  keepAlive: true,
                  permission: ['user']
                }
              }
            ]
          }
        ]
      },
      /*
      {
        path: '/other',
        name: 'otherPage',
        component: PageView,
        meta: { title: '其他组件', icon: 'slack', permission: [ 'dashboard' ] },
        redirect: '/other/icon-selector',
        children: [
          {
            path: '/other/icon-selector',
            name: 'TestIconSelect',
            component: () => import('@/views/other/IconSelectorView'),
            meta: { title: 'IconSelector', icon: 'tool', keepAlive: true, permission: [ 'dashboard' ] }
          },
          {
            path: '/other/list',
            component: RouteView,
            meta: { title: '业务布局', icon: 'layout', permission: [ 'setting' ] },
            redirect: '/other/list/tree-list',
            children: [
              {
                path: '/other/list/tree-list',
                name: 'TreeList',
                component: () => import('@/views/other/TreeList'),
                meta: { title: '树目录表格', keepAlive: true }
              },
              {
                path: '/other/list/edit-table',
                name: 'EditList',
                component: () => import('@/views/other/TableInnerEditList'),
                meta: { title: '内联编辑表格', keepAlive: true }
              },
              {
                path: '/other/list/user-list',
                name: 'UserList',
                component: () => import('@/views/other/UserList'),
                meta: { title: '用户列表', keepAlive: true }
              },
              {
                path: '/other/list/role-list',
                name: 'RoleList',
                component: () => import('@/views/other/RoleList'),
                meta: { title: '角色列表', keepAlive: true }
              },
              // {
              //   path: '/other/list/system-role',
              //   name: 'SystemRole',
              //   component: () => import('@/views/role/RoleList'),
              //   meta: { title: '角色列表2', keepAlive: true }
              // },
              {
                path: '/other/list/permission-list',
                name: 'PermissionList',
                component: () => import('@/views/other/PermissionList'),
                meta: { title: '权限列表', keepAlive: true }
              }
            ]
          }
        ]
      },
       */
      {
        path: '/setting',
        component: RouteView,
        redirect: '/setting/user',
        name: 'setting',
        meta: { title: '设置', icon: 'setting', keepAlive: true, permission: ['setting'] },
        children: [
          {
            path: '/setting/user',
            name: 'setting_user',
            component: () => import('@/views/setting/User'),
            meta: { title: '账号管理', keepAlive: true, permission: ['setting'] }
          },
          {
            path: '/setting/role',
            name: 'setting_role',
            component: () => import('@/views/setting/Role'),
            meta: { title: '角色管理', keepAlive: true, permission: ['setting'] }
          },
          {
            path: '/setting/res',
            name: 'setting_res',
            component: () => import('@/views/setting/Res'),
            meta: { title: '权限管理', keepAlive: true, permission: ['setting'] }
          },
          {
            path: '/setting/dict',
            name: 'setting_dict',
            component: () => import('@/views/setting/Dict'),
            meta: { title: '字典管理', keepAlive: true, permission: ['setting'] }
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
