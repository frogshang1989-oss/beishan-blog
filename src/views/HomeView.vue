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
              :placeholder="config.hero.subscribe.placeholder"
              class="subscribe-input"
              required
            />
            <button type="submit" class="subscribe-btn">
              {{ config.hero.subscribe.buttonText }}
            </button>
          </div>
          <p class="subscribe-hint">{{ config.hero.subscribe.hint }}</p>
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
            <a :href="product.link" class="btn btn-product">
              {{ product.button }}
              <span class="btn-arrow">→</span>
            </a>
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
import config from '../config.js'
import ArticleCard from '../components/ArticleCard.vue'

useSEO()

const { posts: allPosts } = useArticles()
const email = ref('')
const searchQuery = ref('')

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

function handleSubscribe() {
  if (!email.value.trim()) return
  // 当前跳转到订阅页面，接入邮件服务后改为 API 调用
  window.open(config.hero.subscribe.url, '_blank')
}
</script>
