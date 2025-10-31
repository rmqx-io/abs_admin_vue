# Localization Quick Reference

## Key Translation Pairs

| English (en-US) | Chinese (zh-CN) | Translation Key |
|----------------|----------------|-----------------|
| Welcome | 欢迎 | menu.welcome |
| Dashboard | 仪表盘 | menu.dashboard |
| Device Management | 设备管理 | menu.device |
| User Management | 用户管理 | menu.user |
| Account Settings | 个人设置 | menu.account.settings |
| Login | 登录 | user.login.login |
| Username | 用户名 | user.login.userName |
| Password | 密码 | user.login.password |
| Remember me | 自动登录 | user.login.remember-me |
| Forgot password | 忘记密码 | user.login.forgot-password |
| Submit | 提交 | submit |
| Save | 保存 | save |
| Online | 在线 | Online |
| Offline | 离线 | Offline |
| Standby | 待机 | Standby |
| Total Devices | 设备总数 | device.total |
| Submit Successfully | 提交成功 | submit.ok |
| Save Successfully | 保存成功 | save.ok |

## Component-Specific Translations

### Menu Items
```javascript
// English
'menu.dashboard': 'Dashboard'
'menu.dashboard.analysis': 'Analysis'
'menu.form': 'Form'
'menu.form.basic-form': 'Basic Form'

// Chinese
'menu.dashboard': '仪表盘'
'menu.dashboard.analysis': '分析页'
'menu.form': '表单页'
'menu.form.basic-form': '基础表单'
```

### User Login
```javascript
// English
'user.login.tab-login-credentials': 'Account Login'
'user.login.account.placeholder': 'Account'
'user.login.password.placeholder': 'Password'

// Chinese
'user.login.tab-login-credentials': '账户密码登录'
'user.login.account.placeholder': '账户'
'user.login.password.placeholder': '密码'
```

### Settings
```javascript
// English
'app.setting.pagestyle': 'Page Style Setting'
'app.setting.themecolor': 'Theme Color'
'app.setting.navigationmode': 'Navigation Mode'

// Chinese
'app.setting.pagestyle': '整体风格设置'
'app.setting.themecolor': '主题色'
'app.setting.navigationmode': '导航模式'
```

## How to Use Translations

### In Vue Templates
```vue
<template>
  <div>
    <!-- Direct translation -->
    <h1>{{ $t('menu.dashboard') }}</h1>
    
    <!-- Translation with placeholder -->
    <input :placeholder="$t('user.login.account.placeholder')" />
    
    <!-- Translation in v-decorator -->
    <a-input v-decorator="[
      'account',
      {rules: [{ required: true, message: $t('user.userName.required') }]}
    ]" />
  </div>
</template>
```

### In JavaScript/JSX
```javascript
import { i18nRender } from '@/locales'

// In component method
methods: {
  showMessage() {
    this.$message.success(this.$t('submit.ok'))
  }
}

// In JSX render function
render() {
  return <span>{i18nRender('menu.welcome')}</span>
}
```

### Switching Languages Programmatically
```javascript
// In component
this.$store.dispatch('setLang', 'en-US') // Switch to English
this.$store.dispatch('setLang', 'zh-CN') // Switch to Chinese

// Get current language
const currentLang = this.$store.getters.lang
```

## File Structure Reference

```
Key Translation Files:
├── global.js      → Common terms (submit, save, etc.)
├── menu.js        → Navigation and menu items
├── user.js        → Login, registration, user forms
├── setting.js     → App settings and preferences
├── device.js      → Device management
├── dashboard/
│   └── analysis.js → Dashboard analytics
├── form/
│   └── basicForm.js → Form labels and validation
├── account/
│   └── settings.js → Account settings page
└── result/
    ├── success.js  → Success messages
    └── fail.js     → Error messages
```

## Testing Your Translations

1. **Visual Test**: Switch language using globe icon (🇨🇳 ⇄ 🇺🇸)
2. **Code Check**: Search for `$t('` in your Vue files
3. **Console Check**: Run in browser console:
   ```javascript
   // Check if translation exists
   console.log(window.vm.$t('menu.welcome'))
   
   // List all translations
   console.log(window.vm.$i18n.messages)
   ```

## Common Translation Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| `module.action` | `user.login` | Simple actions |
| `module.component.field` | `form.basic-form.title` | Form fields |
| `module.component.message` | `user.email.required` | Validation messages |
| `layout.component.text` | `layouts.usermenu.dialog.title` | Layout elements |
| `menu.path` | `menu.dashboard.analysis` | Menu navigation |

---

**Quick Tip**: Always add translations to both `en-US` and `zh-CN` files simultaneously to maintain parity!
