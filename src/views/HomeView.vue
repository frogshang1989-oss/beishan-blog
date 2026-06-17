<template>
  <div>
    <!-- Hero 区块 -->
    <section class="hero">
      <div class="hero-tagline">{{ config.hero.tagline }}</div>
      <h1 class="hero-title">{{ config.hero.title }}</h1>
      <p class="hero-subtitle">{{ config.hero.subtitle }}</p>
      <div class="hero-actions">
        <a href="#categories" class="btn btn-primary">开始阅读</a>
        <router-link to="/about" class="btn btn-outline">了解更多</router-link>
      </div>
    </section>

    <!-- 三板块区块 -->
    <section class="section" id="categories">
      <div class="section-inner">
        <div class="section-label">内容板块</div>
        <h2 class="section-title">三大主题，构建你的商业认知体系</h2>
        <p class="section-desc">
          从宏观趋势到微观执行，从模式拆解到思维升级——每个板块聚焦一个核心商业能力。
        </p>
        <div class="category-grid">
          <!-- 行业洞察 -->
          <div class="category-card" v-for="cat in categoryCards" :key="cat.slug">
            <div class="category-card-header">
              <div class="category-card-icon">{{ cat.icon }}</div>
              <h3>{{ cat.label }}</h3>
            </div>
            <p class="category-card-desc">{{ cat.desc }}</p>
            <div class="category-card-articles" v-if="cat.articles.length">
              <router-link
                v-for="article in cat.articles"
                :key="article.slug"
                :to="`/post/${article.slug}`"
                class="category-article-link"
              >
                <span class="category-article-date">{{ formatShortDate(article.date) }}</span>
                <span class="category-article-title">{{ article.title }}</span>
              </router-link>
            </div>
            <div v-else class="category-card-empty">
              文章即将发布
            </div>
            <router-link :to="`/${cat.slug}`" class="category-card-more">
              查看全部 {{ cat.total }} 篇 →
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useArticles, CATEGORIES } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'
import config from '../config.js'

useSEO()

const { categoryHighlights, getPostsByCategory } = useArticles()

const categoryCards = computed(() => [
  {
    ...CATEGORIES['industry-insight'],
    icon: '📊',
    articles: categoryHighlights.value['industry-insight'] || [],
    total: getPostsByCategory('industry-insight').value.length
  },
  {
    ...CATEGORIES['business-model'],
    icon: '🔍',
    articles: categoryHighlights.value['business-model'] || [],
    total: getPostsByCategory('business-model').value.length
  },
  {
    ...CATEGORIES['business-thinking'],
    icon: '💡',
    articles: categoryHighlights.value['business-thinking'] || [],
    total: getPostsByCategory('business-thinking').value.length
  }
])

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`
}
</script>
