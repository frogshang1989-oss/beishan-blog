<template>
  <div class="tags-page">
    <h2>文章标签</h2>
    <p style="color: var(--c-text-secondary); font-size: 1rem; margin-bottom: 16px;">
      共 {{ allTags.length }} 个标签，{{ posts.length }} 篇文章
    </p>

    <!-- 分类快速入口 -->
    <div class="category-filter-bar">
      <span class="filter-label">板块：</span>
      <router-link to="/industry-insight" class="filter-chip">📊 行业洞察</router-link>
      <router-link to="/business-model" class="filter-chip">🔍 商业模式</router-link>
      <router-link to="/business-thinking" class="filter-chip">💡 商业思维</router-link>
    </div>

    <div class="tag-cloud">
      <router-link
        v-for="tag in allTags"
        :key="tag.name"
        :to="`/?tag=${encodeURIComponent(tag.name)}`"
        class="tag"
      >
        {{ tag.name }} ({{ tag.count }})
      </router-link>
    </div>
    <div v-if="!allTags.length" class="empty-state">
      <h2>暂无标签</h2>
      <p>发布文章后，标签会在这里显示。</p>
    </div>
  </div>
</template>

<script setup>
import { useArticles } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'

useSEO({
  title: '标签分类',
  description: '浏览所有文章标签，按标签筛选感兴趣的内容。覆盖行业洞察、商业模式、商业思维三大板块。'
})

const { posts, allTags } = useArticles()
</script>

<style scoped>
.category-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text-secondary);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: var(--c-tag-bg);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--c-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}
.filter-chip:hover {
  background: var(--c-accent-light);
  color: var(--c-accent);
}
</style>
