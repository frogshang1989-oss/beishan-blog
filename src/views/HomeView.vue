<template>
  <div>
    <!-- ─── ① Hero 区块：标题 + 订阅框 + 社交证明 ─── -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-tagline">{{ config.hero.tagline }}</div>
        <h1 class="hero-title">{{ config.hero.title }}</h1>
        <p class="hero-subtitle">{{ config.hero.subtitle }}</p>

        <!-- 邮件订阅 -->
        <form class="subscribe-box" @submit.prevent="handleSubscribe">
          <div class="subscribe-input-wrap">
            <input
              v-model="email"
              type="email"
              :placeholder="subscribeStatus === 'success' ? '订阅成功！' : config.hero.subscribe.placeholder"
              class="subscribe-input"
              :disabled="subscribeStatus === 'loading' || subscribeStatus === 'success'"
              required
            />
            <button
              type="submit"
              class="subscribe-btn"
              :disabled="subscribeStatus === 'loading'"
            >
              <template v-if="subscribeStatus === 'loading'">提交中...</template>
              <template v-else>{{ config.hero.subscribe.buttonText }}</template>
            </button>
          </div>
          <p v-if="subscribeStatus === 'success'" class="subscribe-success-msg">{{ subscribeMsg }}</p>
          <p v-else-if="subscribeStatus === 'error'" class="subscribe-error-msg">{{ subscribeMsg }}</p>
          <p v-else class="subscribe-hint">{{ config.hero.subscribe.hint }}</p>
        </form>
      </div>
    </section>

    <!-- ─── ② 产品/资源区：4 张销售卡片 ─── -->
    <section class="section section-alt" id="products">
      <div class="section-inner">
        <div class="section-label">核心资源</div>
        <h2 class="section-title">为你的一人公司之路，搭建完整的认知工具包</h2>
        <p class="section-desc">
          从方法论到工具论，从框架到实战——每一份资源都是经过一人公司实战验证的产物。
        </p>
        <div class="product-grid">
          <div
            v-for="product in config.products"
            :key="product.title"
            class="product-card"
            :class="{ 'product-card-featured': product.highlight }"
          >
            <div class="product-icon">{{ product.icon }}</div>
            <h3>{{ product.title }}</h3>
            <p>{{ product.desc }}</p>
            <router-link :to="product.link" class="btn btn-product">
              {{ product.button }}
              <span class="btn-arrow">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── ③ 最新文章区：搜索 + 文章网格 ─── -->
    <section class="section" id="articles">
      <div class="section-inner">
        <div class="section-header-row">
          <div>
            <div class="section-label">最新文章</div>
            <h2 class="section-title">深度商业内容，每周更新</h2>
          </div>
          <router-link to="/tags" class="view-all-link">查看全部文章 →</router-link>
        </div>

        <!-- 搜索 -->
        <input
          v-model="searchQuery"
          type="text"
          class="search-box"
          placeholder="搜索文章..."
        />

        <!-- 文章网格 -->
        <div class="post-list" v-if="filteredPosts.length > 0">
          <ArticleCard
            v-for="post in filteredPosts"
            :key="post.slug"
            :post="post"
          />
        </div>
        <div v-else class="empty-state">
          <h2>暂无匹配文章</h2>
          <p>换个关键词试试？</p>
        </div>
      </div>
    </section>

    <!-- ─── ④ 关于区 ─── -->
    <section class="section section-alt" id="about-brief">
      <div class="section-inner">
        <div class="about-brief">
          <h2 class="about-brief-title">我是山人</h2>
          <p class="about-brief-text">
            15年商业研究经验，服务过 YANMAR、韩国CJ 等国际企业。<br/>
            现在聚焦一人公司赛道——用系统化商业思维 + AI 工具赋能，
            帮助超级个体构建从 0 到 1 的完整商业体系。
          </p>
          <div class="social-icons">
            <a
              v-for="(link, key) in config.socialLinks"
              :key="key"
              :href="link.url"
              class="social-icon"
              :title="link.label"
              :target="link.url.startsWith('http') ? '_blank' : ''"
            >
              {{ link.icon }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useArticles } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'
import { useSiteConfig } from '../composables/useSiteConfig.js'
import ArticleCard from '../components/ArticleCard.vue'

useSEO()

const { siteConfig: config } = useSiteConfig()
const { posts: allPosts } = useArticles()
const email = ref('')
const searchQuery = ref('')
const subscribeStatus = ref('idle') // idle | loading | success | error
const subscribeMsg = ref('')

const filteredPosts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allPosts.value.slice(0, 6)
  return allPosts.value.filter(p => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }).slice(0, 6)
})

async function handleSubscribe() {
  if (!email.value.trim() || subscribeStatus.value === 'loading') return

  subscribeStatus.value = 'loading'
  subscribeMsg.value = ''

  try {
    const resp = await fetch(config.api.subscribeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() })
    })
    const data = await resp.json()

    if (data.success) {
      subscribeStatus.value = 'success'
      subscribeMsg.value = data.message
      email.value = ''
    } else {
      subscribeStatus.value = 'error'
      subscribeMsg.value = data.message || config.hero.subscribe.errorMsg
    }
  } catch {
    subscribeStatus.value = 'error'
    subscribeMsg.value = config.hero.subscribe.errorMsg
  }
}
</script>
