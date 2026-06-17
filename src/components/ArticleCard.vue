<template>
  <article class="article-card">
    <div class="article-card-meta">
      <span v-if="post.date">{{ formatDate(post.date) }}</span>
    </div>
    <h2 class="article-card-title">
      <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
    </h2>
    <p class="article-card-excerpt">{{ post.excerpt }}</p>
    <div class="article-card-tags" v-if="post.tags.length">
      <span
        v-for="tag in post.tags"
        :key="tag"
        class="tag"
      >{{ tag }}</span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
