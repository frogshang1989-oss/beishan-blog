<template>
  <div>
    <!-- Hero 区块 -->
    <section class="hero">
      <div class="hero-tagline">{{ config.hero.tagline }}</div>
      <h1 class="hero-title">{{ config.hero.title }}</h1>
      <p class="hero-subtitle">{{ config.hero.subtitle }}</p>
      <div class="hero-actions">
        <a href="#articles" class="btn btn-primary">开始阅读</a>
        <router-link to="/about" class="btn btn-outline">了解更多</router-link>
      </div>
    </section>

    <!-- 产品/资源区块 -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-label">核心资源</div>
        <h2 class="section-title">帮你跑通一人公司的工具与框架</h2>
        <p class="section-desc">
          经过实战验证的方法论、工具栈和服务，每一件都为了解决一人公司创业中的真实问题。
        </p>
        <div class="product-grid">
          <div class="product-card" v-for="(item, i) in config.products" :key="i">
            <div class="product-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
            <router-link :to="item.link" class="product-link">了解详情</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章列表区块 -->
    <section class="section" id="articles">
      <div class="section-inner">
        <div class="section-label">最新文章</div>
        <h2 class="section-title">深度思考与实践记录</h2>
        <input
          v-model="search"
          class="search-box"
          type="text"
          placeholder="搜索文章标题、标签..."
        />
        <div v-if="filteredPosts.length" class="post-list">
          <ArticleCard v-for="post in filteredPosts" :key="post.slug" :post="post" />
        </div>
        <div v-else class="empty-state">
          <h2>{{ search ? '没有找到匹配的文章' : '还没有文章' }}</h2>
          <p>{{ search ? '试试换个关键词搜索' : '在 src/posts/ 目录下添加 .md 文件即可发布新文章' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useArticles } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'
import ArticleCard from '../components/ArticleCard.vue'
import config from '../config.js'

useSEO()

const { posts } = useArticles()
const route = useRoute()
const search = ref('')
const activeTag = ref(route.query.tag || '')

watch(() => route.query.tag, (val) => {
  activeTag.value = val || ''
  if (val) search.value = ''
})

const filteredPosts = computed(() => {
  let result = posts.value

  if (activeTag.value) {
    result = result.filter(p => p.tags.includes(activeTag.value))
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.excerpt.toLowerCase().includes(q)
    )
  }

  return result
})
</script>
