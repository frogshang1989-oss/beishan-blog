<template>
  <div class="app-container">
    <header class="app-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner">
        <router-link to="/" class="header-title">{{ config.title }}</router-link>
        <nav class="header-nav">
          <router-link to="/industry-insight" active-class="active">行业洞察</router-link>
          <router-link to="/business-model" active-class="active">商业模式</router-link>
          <router-link to="/business-thinking" active-class="active">商业思维</router-link>
          <router-link to="/tags" active-class="active" class="nav-secondary">标签</router-link>
          <router-link to="/about" active-class="active" class="nav-secondary">关于</router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-social">
          <a
            v-for="(link, key) in config.socialLinks"
            :key="key"
            :href="link.url"
            :title="link.label"
            :target="link.url.startsWith('http') ? '_blank' : ''"
            class="footer-social-link"
          >
            <span class="footer-social-icon">{{ link.icon }}</span>
            <span class="footer-social-label">{{ link.label }}</span>
          </a>
        </div>
        <p class="footer-copyright">{{ config.footer }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSiteConfig } from './composables/useSiteConfig.js'

const { siteConfig: config } = useSiteConfig()

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
