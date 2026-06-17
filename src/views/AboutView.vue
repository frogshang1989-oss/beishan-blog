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
import { useSEO } from '../composables/useSEO.js'

useSEO({
  title: '关于',
  description: '关于山人和北山洞见的介绍。一人公司创业实战者、AI工具赋能方法论的深度研究者。',
  url: 'https://frogshang1989-oss.github.io/beishan-blog/about'
})

const { allPosts } = useArticles()

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
