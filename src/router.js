import { createRouter, createWebHistory } from 'vue-router'
import siteConfig from './config.js'

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
    path: '/industry-insight',
    name: 'industry-insight',
    component: () => import('./views/CategoryView.vue'),
    meta: {
      title: '行业洞察',
      description: '宏观趋势、行业格局、政策解读与市场信号——从行业视角看懂商业世界的底层变化。'
    }
  },
  {
    path: '/business-model',
    name: 'business-model',
    component: () => import('./views/CategoryView.vue'),
    meta: {
      title: '商业模式',
      description: '商业模式的深度拆解、案例研究与框架构建——系统化理解每一种赚钱方式。'
    }
  },
  {
    path: '/business-thinking',
    name: 'business-thinking',
    component: () => import('./views/CategoryView.vue'),
    meta: {
      title: '商业思维',
      description: '认知升级、方法论沉淀、创业心法与工具论——构建你的商业底层操作系统。'
    }
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('./views/TagsView.vue'),
    meta: { title: '标签分类', description: '浏览所有文章标签，按标签筛选感兴趣的内容。' }
  },
  {
    path: '/subscribe',
    name: 'subscribe',
    component: () => import('./views/SubscribeView.vue'),
    meta: { title: '订阅周报', description: '订阅北山洞见周报，每周一篇深度商业拆解，覆盖行业趋势、商业模式与AI赋能方法论。' }
  },
  {
    path: '/admin/subscribers',
    name: 'admin-subscribers',
    component: () => import('./views/AdminView.vue'),
    meta: { title: '订阅者管理' }
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
