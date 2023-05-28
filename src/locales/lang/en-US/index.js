import antd from 'ant-design-vue/es/locale-provider/en_US'
import momentEN from 'moment/locale/en-gb'

const components = {
  antLocale: antd,
  momentName: 'zh-US',
  momentLocale: momentEN
}

export default {
  message: '-',

  ...components
}