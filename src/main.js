import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)

// GitHub Pages SPA 回退处理：从 404.html 跳转回来时恢复原始路径
const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  const url = new URL(redirect)
  router.replace(url.pathname.replace('/beishan-blog', '') + url.search + url.hash)
}

app.mount('#app')
