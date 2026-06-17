import { createRouter, createWebHistory } from 'vue-router'
import siteConfig from './config.js'

// 自动检测 base 路径：GitHub Pages 下为 /beishan-blog/，本地开发为 /
const base = import.meta.env.BASE_URL || '/'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: siteConfig.title, description: siteConfig.description }
  },
  {
    path: '/post/:slug',
    name: 'post',
    component: () => import('./views/PostView.vue'),
    meta: { title: '文章' }
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('./views/TagsView.vue'),
    meta: { title: '标签分类', description: '浏览所有文章标签，按标签筛选感兴趣的内容。' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/AboutView.vue'),
    meta: { title: '关于', description: `关于${siteConfig.author}和${siteConfig.title}的介绍。` }
  }
]

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
