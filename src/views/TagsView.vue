<template>
  <div>
    <h2 style="font-size: 1.3rem; margin-bottom: 8px;">文章标签</h2>
    <p style="color: var(--c-text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
      共 {{ allTags.length }} 个标签，{{ posts.length }} 篇文章
    </p>
    <div class="tag-cloud">
      <router-link
        v-for="tag in allTags"
        :key="tag.name"
        :to="`/?tag=${encodeURIComponent(tag.name)}`"
        class="tag"
        style="font-size: 0.85rem; padding: 5px 14px;"
      >
        {{ tag.name }} ({{ tag.count }})
      </router-link>
    </div>
    <div v-if="!allTags.length" class="empty-state" style="margin-top: 40px;">
      <h2>暂无标签</h2>
      <p>发布文章后，标签会在这里显示。</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useArticles } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'

useSEO({
  title: '标签分类',
  description: '浏览所有文章标签，按标签筛选感兴趣的内容。覆盖一人公司、AI赋能、商业模式等领域。'
})

const { posts, allTags } = useArticles()
</script>
