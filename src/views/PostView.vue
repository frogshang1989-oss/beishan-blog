<template>
  <div class="article-detail" v-if="post">
    <router-link to="/" class="back-link">← 返回首页</router-link>
    <div class="article-header">
      <h1>{{ post.title }}</h1>
      <div class="article-header-meta">
        <span v-if="post.date">{{ formatDate(post.date) }}</span>
      </div>
      <div class="article-card-tags">
        <router-link
          v-for="tag in post.tags"
          :key="tag"
          :to="`/?tag=${encodeURIComponent(tag)}`"
          class="tag"
        >{{ tag }}</router-link>
      </div>
    </div>
    <div class="article-content" ref="contentRef" v-html="renderedContent"></div>
  </div>
  <div v-else class="empty-state">
    <h2>文章不存在</h2>
    <p>找不到对应的文章，可能已被删除。</p>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import 'highlight.js/styles/github-dark.css'
import { useArticles } from '../composables/useArticles.js'
import { useSEO } from '../composables/useSEO.js'

const route = useRoute()
const { posts } = useArticles()
const slug = route.params.slug

const post = computed(() => posts.value.find(p => p.slug === slug))

// 动态 SEO：文章加载后更新 meta
watch(post, (p) => {
  if (!p) return
  const excerpt = p.content
    .replace(/^---[\s\S]*?---/, '')  // 去掉 frontmatter
    .replace(/[#*`>\[\]()!|]/g, '')  // 去掉 markdown 符号
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 150)
  useSEO({
    title: p.title,
    description: excerpt || p.title,
    url: `https://frogshang1989-oss.github.io/beishan-blog/post/${p.slug}`,
    type: 'article',
    article: {
      title: p.title,
      date: p.date || new Date().toISOString().slice(0, 10),
      tags: p.tags || []
    }
  })
}, { immediate: true })

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
})

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: false,
  highlight: function(code, lang) {
    // Mermaid 代码块不进行语法高亮，保留原始内容
    if (lang === 'mermaid') {
      return `<div class="mermaid">${code}</div>`
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch {}
    }
    return code
  }
})

const renderedContent = computed(() => {
  if (!post.value) return ''
  return marked.parse(post.value.content)
})

// Mermaid 渲染：在 DOM 更新后执行
const contentRef = ref(null)

async function renderMermaid() {
  await nextTick()
  const container = document.querySelector('.article-content')
  if (!container) return
  const mermaidBlocks = container.querySelectorAll('.mermaid')
  if (mermaidBlocks.length === 0) return
  try {
    await mermaid.run({ nodes: Array.from(mermaidBlocks) })
  } catch (e) {
    console.warn('Mermaid 渲染失败:', e)
  }
}

watch(renderedContent, renderMermaid)
onMounted(renderMermaid)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
