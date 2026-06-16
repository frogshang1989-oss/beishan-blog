<template>
  <div class="article-detail" v-if="post">
    <router-link to="/" class="back-link">← 返回首页</router-link>
    <div class="article-header">
      <h1>{{ post.title }}</h1>
      <div class="article-header-meta">
        <span v-if="post.date">{{ formatDate(post.date) }}</span>
      </div>
      <div class="article-card-tags" style="margin-top: 10px">
        <router-link
          v-for="tag in post.tags"
          :key="tag"
          :to="`/?tag=${encodeURIComponent(tag)}`"
          class="tag"
        >{{ tag }}</router-link>
      </div>
    </div>
    <div class="article-content" v-html="renderedContent"></div>
  </div>
  <div v-else class="empty-state">
    <h2>文章不存在</h2>
    <p>找不到对应的文章，可能已被删除。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useArticles } from '../composables/useArticles.js'

const route = useRoute()
const { posts } = useArticles()
const slug = route.params.slug

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: false,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch {}
    }
    return code
  }
})

const post = computed(() => posts.value.find(p => p.slug === slug))
const renderedContent = computed(() => {
  if (!post.value) return ''
  return marked.parse(post.value.content)
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
