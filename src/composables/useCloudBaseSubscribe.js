import { ref } from 'vue'
import config from '../config.js'

const loading = ref(false)
const error = ref('')
const success = ref('')

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase())
}

export function useCloudBaseSubscribe() {
  const subscribeUrl =
    import.meta.env.VITE_SUBSCRIBE_URL ||
    config.cloudbase?.subscribeUrl ||
    ''

  async function subscribe(email) {
    loading.value = true
    error.value = ''
    success.value = ''

    const cleanEmail = email.trim().toLowerCase()
    if (!isValidEmail(cleanEmail)) {
      error.value = '邮箱格式不正确'
      loading.value = false
      return false
    }

    if (!subscribeUrl) {
      error.value = '订阅系统未配置，请联系管理员'
      loading.value = false
      return false
    }

    try {
      const resp = await fetch(subscribeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      })

      const data = await resp.json().catch(() => ({}))

      if (!resp.ok || data.code >= 400) {
        throw new Error(data.message || `请求失败 (${resp.status})`)
      }

      success.value = data.message || '订阅成功！'
      loading.value = false
      return true
    } catch (err) {
      error.value = err.message || '订阅失败，请稍后重试'
      loading.value = false
      return false
    }
  }

  return { loading, error, success, subscribe }
}
