// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import i18n from './locales'
import { VueAxios } from './utils/request'
import ProLayout, { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import themePluginConfig from '../config/themePluginConfig'

// mock
// WARNING: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.
import './mock'

import bootstrap from './core/bootstrap'
import './core/lazy_use' // use lazy load components
import './permission' // permission control
import './utils/filter' // global filter
import './assets/global.less' // global style

import VueAMap from 'vue-amap'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/display.css'

import '@/styles/variables.scss'
import '@/styles/element-variables.scss'

Vue.config.productionTip = false
Vue.use(ElementUI, {
  size: 'small',
})

// mount axios to `Vue.$http` and `this.$http`
Vue.use(VueAxios)
// use pro-layout components
Vue.component('pro-layout', ProLayout)
Vue.component('page-container', PageHeaderWrapper)
Vue.component('page-header-wrapper', PageHeaderWrapper)

// 初始化vue-amap
Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: '5817d32d7eb114d90df69cbf22cf1c87',
  plugin: [
    'AMap.Autocomplete',
    'AMap.Geocoder',
    'AMap.PlaceSearch',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.AMapManager',
    'AMap.Geolocation',
  ],
  v: '1.4.4',
  uiVersion: '1.0.11',
})

window.umi_plugin_ant_themeVar = themePluginConfig.theme

window.vm = new Vue({
  router,
  store,
  i18n,
  // init localstorage, vuex
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
