<template>
  <div>
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticles } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'
import ArticleCard from '../components/ArticleCard.vue'

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
