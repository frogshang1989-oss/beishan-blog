<template>
  <div class="admin-page">
    <div class="admin-card">
      <div class="admin-icon">📬</div>
      <h1>订阅者管理</h1>

      <div v-if="!authed" class="auth-box">
        <p>请输入管理密码</p>
        <input
          v-model="password"
          type="password"
          placeholder="管理密码"
          @keyup.enter="checkPassword"
        />
        <button class="btn btn-primary" @click="checkPassword">进入</button>
        <p v-if="authError" class="auth-error">密码错误</p>
      </div>

      <template v-else>
        <p class="admin-desc">共 {{ subscribers.length }} 位订阅者</p>
        <button class="btn btn-primary" :disabled="loading" @click="fetchSubscribers">
          {{ loading ? '加载中...' : '刷新列表' }}
        </button>

        <p v-if="error" class="admin-error">{{ error }}</p>

        <div v-if="subscribers.length > 0" class="subscriber-list">
          <div v-for="(s, i) in subscribers" :key="s.email" class="subscriber-item">
            <span class="subscriber-index">{{ i + 1 }}</span>
            <span class="subscriber-email">{{ s.email }}</span>
            <span class="subscriber-time">{{ formatDate(s.subscribedAt) }}</span>
          </div>
        </div>

        <div v-else-if="!loading" class="empty-state">
          <p>暂无订阅者</p>
        </div>

        <div v-if="subscribers.length > 0" class="admin-actions">
          <button class="btn btn-secondary" @click="copyAll">📋 复制全部邮箱</button>
          <button class="btn btn-secondary" @click="downloadCSV">⬇️ 下载 CSV</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSEO } from '../composables/useSEO.js'
import { useCloudBaseSubscribers } from '../composables/useCloudBaseSubscribers.js'
import config from '../config.js'

useSEO({ title: '订阅者管理 - 北山洞见' })

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || config.cloudbase?.adminPassword || 'beishan2026'

const authed = ref(false)
const password = ref('')
const authError = ref(false)

const { loading, error, subscribers, fetchSubscribers } = useCloudBaseSubscribers()

function checkPassword() {
  if (password.value === ADMIN_PASSWORD) {
    authed.value = true
    fetchSubscribers()
  } else {
    authError.value = true
  }
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

function copyAll() {
  const emails = subscribers.value.map(s => s.email).join('; ')
  navigator.clipboard.writeText(emails).then(() => {
    alert(`已复制 ${subscribers.value.length} 个邮箱`)
  })
}

function downloadCSV() {
  const rows = [['邮箱', '订阅时间']]
  for (const s of subscribers.value) {
    rows.push([s.email, formatDate(s.subscribedAt)])
  }
  const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // 仅预加载，等待密码
})
</script>

<style scoped>
.admin-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 60px 24px 80px;
}

.admin-card {
  background: var(--c-card);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: var(--shadow-card);
}

.admin-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 16px;
}

.admin-card h1 {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
}

.admin-desc {
  text-align: center;
  color: var(--c-text-secondary);
  margin-bottom: 20px;
}

.auth-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 320px;
  margin: 0 auto;
  text-align: center;
}

.auth-box input {
  padding: 12px 16px;
  border: 1px solid var(--c-border-light);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--c-bg);
}

.auth-error {
  color: #e53e3e;
  font-size: 0.9rem;
}

.admin-error {
  color: #e53e3e;
  text-align: center;
  margin-top: 16px;
}

.subscriber-list {
  margin-top: 24px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--c-bg-alt);
}

.subscriber-item {
  display: grid;
  grid-template-columns: 32px 1fr 150px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--c-border-light);
  font-size: 0.9rem;
}

.subscriber-item:last-child {
  border-bottom: none;
}

.subscriber-index {
  color: var(--c-text-tertiary);
  font-size: 0.8rem;
}

.subscriber-email {
  font-weight: 500;
  word-break: break-all;
}

.subscriber-time {
  color: var(--c-text-secondary);
  font-size: 0.78rem;
  white-space: nowrap;
}

.subscriber-link {
  color: var(--c-accent);
  font-size: 0.8rem;
  text-decoration: none;
}

.subscriber-link:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--c-text-secondary);
}

.admin-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

@media (max-width: 640px) {
  .subscriber-item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .subscriber-index {
    display: none;
  }
  .subscriber-time {
    white-space: normal;
  }
}
</style>
