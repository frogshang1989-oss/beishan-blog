<template>
  <div class="subscribe-page">
    <div class="subscribe-page-card">
      <div class="subscribe-page-icon">📬</div>
      <h1>订阅北山洞见周报</h1>
      <p class="subscribe-page-desc">
        每周一篇深度商业拆解，覆盖行业趋势、商业模式、AI 赋能方法论。
        目前已有 <strong>1,260+</strong> 位一人公司创业者订阅。
      </p>

      <!-- 订阅表单 -->
      <form class="subscribe-page-form" @submit.prevent="handleSubmit">
        <input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          class="subscribe-input-large"
          required
        />
        <button type="submit" class="btn btn-primary btn-large" :disabled="submitted">
          {{ submitted ? '已提交 ✓' : '免费订阅' }}
        </button>
      </form>

      <p v-if="submitted" class="subscribe-success">
        🎉 感谢订阅！确认邮件已发送到 {{ submittedEmail }}，请检查收件箱。
      </p>

      <div class="subscribe-benefits">
        <h3>你将获得</h3>
        <ul>
          <li>📊 每周一篇深度商业拆解</li>
          <li>🔬 行业趋势 & 政策信号解读</li>
          <li>🧰 一人公司实操方法论</li>
          <li>🤖 AI 工具赋能 & 自动化方案</li>
        </ul>
      </div>

      <p class="subscribe-footer-text">
        无需担心垃圾邮件。每周一封，随时退订。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSEO } from '../composables/useSEO.js'

useSEO({ title: '订阅周报 - 北山洞见' })

const email = ref('')
const submitted = ref(false)
const submittedEmail = ref('')

function handleSubmit() {
  if (!email.value.trim()) return
  submittedEmail.value = email.value
  submitted.value = true
  // TODO: 接入邮件服务 API（ConvertKit / Substack / Buttondown）
  email.value = ''
}
</script>

<style scoped>
.subscribe-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 80px 24px;
}

.subscribe-page-card {
  background: var(--c-card);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: var(--shadow-card);
  text-align: center;
}

.subscribe-page-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.subscribe-page-card h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

.subscribe-page-desc {
  font-size: 1rem;
  color: var(--c-text-secondary);
  line-height: 1.55;
  margin-bottom: 28px;
}

.subscribe-page-desc strong {
  color: var(--c-text);
}

.subscribe-page-form {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.subscribe-input-large {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid var(--c-border-light);
  border-radius: 14px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--c-bg);
  outline: none;
  transition: border-color 0.2s ease;
}
.subscribe-input-large:focus {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

.btn-large {
  padding: 14px 28px;
  font-size: 1rem;
}

.subscribe-success {
  color: #30a64a;
  font-size: 0.95rem;
  margin-bottom: 28px;
  line-height: 1.5;
}

.subscribe-benefits {
  text-align: left;
  background: var(--c-bg-alt);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.subscribe-benefits h3 {
  font-size: 1rem;
  font-weight: 650;
  margin-bottom: 14px;
}

.subscribe-benefits ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subscribe-benefits li {
  font-size: 0.9375rem;
  color: var(--c-text-secondary);
}

.subscribe-footer-text {
  font-size: 0.85rem;
  color: var(--c-text-tertiary);
}

@media (max-width: 480px) {
  .subscribe-page-card {
    padding: 32px 24px;
  }
  .subscribe-page-form {
    flex-direction: column;
  }
}
</style>
