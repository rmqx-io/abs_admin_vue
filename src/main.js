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

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/display.css'

import '@/styles/variables.scss'
import '@/styles/element-variables.scss'

import AmapVue from '@amap/amap-vue'

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
AmapVue.config.version = '2.0' // 默认2.0，这里可以不修改
AmapVue.config.key = '5817d32d7eb114d90df69cbf22cf1c87'
AmapVue.config.plugins = [
  'AMap.Autocomplete',
  'AMap.PlaceSearch',
  'AMap.Scale',
  'AMap.OverView',
  'AMap.ToolBar',
  'AMap.MapType',
  'AMap.PolyEditor',
  'AMap.PolyLine',
  'AMap.CircleEditor',
  'AMap.Geocoder',
  'AMap.MarkerClusterer',
  'AMap.Polygon'
  // 在此配置你需要预加载的插件，如果不配置，在使用到的时候会自动异步加载
]
Vue.use(AmapVue)

window.umi_plugin_ant_themeVar = themePluginConfig.theme

window.vm = new Vue({
  router,
  store,
  i18n,
  // init localstorage, vuex
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
