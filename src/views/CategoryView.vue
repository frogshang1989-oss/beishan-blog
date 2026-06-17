<template>
  <div class="category-page">
    <!-- 板块头部 -->
    <section class="category-hero">
      <div class="category-label">{{ categoryInfo.label }}</div>
      <h1 class="category-title">{{ categoryInfo.label }}</h1>
      <p class="category-desc">{{ categoryInfo.desc }}</p>
      <div class="category-meta">
        <span>{{ categoryPosts.length }} 篇文章</span>
        <span v-if="categoryPosts.length > 0">· 最近更新 {{ categoryPosts[0].date }}</span>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="category-articles">
      <div class="section-inner">
        <div v-if="categoryPosts.length" class="post-list">
          <ArticleCard v-for="post in categoryPosts" :key="post.slug" :post="post" />
        </div>
        <div v-else class="empty-state">
          <h2>还没有文章</h2>
          <p>该板块的文章正在撰写中，敬请期待。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useArticles, CATEGORIES } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'
import ArticleCard from '../components/ArticleCard.vue'

const route = useRoute()

// 从路由名称获取分类
const categorySlug = computed(() => route.name)  // 'industry-insight' / 'business-model' / 'business-thinking'
const categoryInfo = computed(() => CATEGORIES[categorySlug.value] || { label: '未知', desc: '' })

const { getPostsByCategory } = useArticles()
const categoryPosts = computed(() => getPostsByCategory(categorySlug.value).value)

useSEO({
  title: categoryInfo.value.label,
  description: categoryInfo.value.desc
})
</script>

<style scoped>
.category-page {
  max-width: 1024px;
  margin: 0 auto;
}

.category-hero {
  text-align: center;
  padding: 64px 24px 48px;
}

.category-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin-bottom: 12px;
}

.category-title {
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin: 0 0 16px;
}

.category-desc {
  font-size: 1.15rem;
  color: var(--c-text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto 20px;
}

.category-meta {
  font-size: 0.9rem;
  color: var(--c-text-tertiary);
}

.category-articles {
  padding: 0 0 64px;
}

.section-inner {
  padding: 0 24px;
}

.post-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: var(--c-text-secondary);
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .post-list {
    grid-template-columns: 1fr;
  }
  .category-hero {
    padding: 48px 20px 32px;
  }
  .category-title {
    font-size: 2rem;
  }
}
</style>
