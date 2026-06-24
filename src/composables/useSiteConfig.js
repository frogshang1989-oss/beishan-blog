/**
 * 站点配置合并：config.js 默认值 + CMS 可编辑的 settings.json
 *
 * 运行时从 /admin/settings.json 获取 CMS 编辑后的设置，
 * 深度合并到 config.js 默认值上。如果 fetch 失败，使用纯默认值。
 */
import { ref } from 'vue'
import config from '../config.js'

const siteConfig = ref({ ...config })
const loaded = ref(false)

export function useSiteConfig() {
  // 只加载一次
  if (!loaded.value) {
    loaded.value = true
    fetch('/admin/settings.json')
      .then(res => {
        if (!res.ok) throw new Error('settings not found')
        return res.json()
      })
      .then(settings => {
        // 深度合并：settings 中的值覆盖 config 默认值
        for (const key of Object.keys(settings)) {
          if (
            typeof settings[key] === 'object' &&
            settings[key] !== null &&
            !Array.isArray(settings[key]) &&
            typeof config[key] === 'object' &&
            config[key] !== null
          ) {
            siteConfig.value[key] = { ...config[key], ...settings[key] }
          } else {
            siteConfig.value[key] = settings[key]
          }
        }
      })
      .catch(() => {
        // 获取失败，使用默认 config 值（已在 siteConfig 中）
      })
  }

  return { siteConfig }
}
