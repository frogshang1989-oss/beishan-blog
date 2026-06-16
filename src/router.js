import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue')
  },
  {
    path: '/post/:slug',
    name: 'post',
    component: () => import('./views/PostView.vue')
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('./views/TagsView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
