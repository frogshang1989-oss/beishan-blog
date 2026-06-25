import { ref } from 'vue'
import config from '../config.js'

const loading = ref(false)
const error = ref('')
const subscribers = ref([])

export function useCloudBaseSubscribers() {
  const subscribersUrl =
    import.meta.env.VITE_SUBSCRIBERS_URL ||
    config.cloudbase?.subscribersUrl ||
    ''

  const adminPassword =
    import.meta.env.VITE_ADMIN_PASSWORD ||
    config.cloudbase?.adminPassword ||
    'beishan2026'

  async function fetchSubscribers() {
    loading.value = true
    error.value = ''
    subscribers.value = []

    if (!subscribersUrl) {
      error.value = '未配置订阅者 API，无法读取'
      loading.value = false
      return
    }

    try {
      const resp = await fetch(`${subscribersUrl}?token=${adminPassword}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await resp.json().catch(() => ({}))

      if (!resp.ok || data.code >= 400) {
        throw new Error(data.message || `请求失败 (${resp.status})`)
      }

      subscribers.value = (data.data || []).map(item => ({
        email: item.email,
        subscribedAt: item.subscribedAt,
        source: item.source || 'website'
      }))
    } catch (err) {
      error.value = err.message || '读取订阅者失败'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, subscribers, fetchSubscribers }
}
