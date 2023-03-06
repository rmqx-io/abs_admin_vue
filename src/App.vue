<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'

export default {
  data () {
    return {
      // locale: zhCN
    }
  },
  computed: {
    locale () {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))

      const locale = this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
      console.log('locale', locale)
      if (locale === undefined) {
        console.log('locale fallback to zhCN')
        return zhCN
      }
      return locale
    }
  }
}
</script>
