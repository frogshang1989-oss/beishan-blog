<template>
  <div class="about-page">
    <div class="about-content article-content" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useArticles } from '../composables/useArticles.js'

const { allPosts } = useArticles()

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

const aboutPage = computed(() => allPosts.value.find(p => p.slug === '_about'))
const renderedContent = computed(() => {
  if (!aboutPage.value) return '<h1>关于</h1><p>暂无内容</p>'
  return marked.parse(aboutPage.value.content)
})
</script>
