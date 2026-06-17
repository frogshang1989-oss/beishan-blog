<template>
  <div class="app-container">
    <header class="app-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner">
        <router-link to="/" class="header-title">{{ config.title }}</router-link>
        <nav class="header-nav">
          <router-link to="/" exact-active-class="active">文章</router-link>
          <router-link to="/tags" active-class="active">标签</router-link>
          <router-link to="/about" active-class="active">关于</router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>{{ config.footer }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import config from './config.js'

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
