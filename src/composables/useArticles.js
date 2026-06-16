import { ref, computed } from 'vue'

const posts = ref([])
const loaded = ref(false)

// 简易 frontmatter 解析器
function parseFrontmatter(raw) {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = raw.match(fmRegex)
  if (!match) {
    return { frontmatter: {}, content: raw }
  }
  const fmText = match[1]
  const content = match[2]
  const frontmatter = {}
  fmText.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim()
      // 去掉引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      // 解析数组格式 [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
      }
      frontmatter[key] = value
    }
  })
  return { frontmatter, content }
}

// 提取摘要（去除 Markdown 标记）
function getExcerpt(content, maxLen = 150) {
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#\-|]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain
}

// 使用 Vite 的 import.meta.glob 加载所有文章
export function useArticles() {
  // 动态加载 src/posts/ 下所有 .md 文件
  const modules = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true })

  for (const [path, raw] of Object.entries(modules)) {
    const filename = path.split('/').pop()
    const slug = filename.replace(/\.md$/, '')

    // 避免重复加载
    if (posts.value.find(p => p.slug === slug)) continue

    const { frontmatter, content } = parseFrontmatter(raw)

    posts.value.push({
      slug,
      title: frontmatter.title || slug,
      date: frontmatter.date || '',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      excerpt: getExcerpt(content),
      content,
      raw: frontmatter
    })
  }

  // 按日期倒序排列
  posts.value.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  // 收集所有标签
  const allTags = computed(() => {
    const tagSet = new Set()
    const tagCount = {}
    posts.value.forEach(p => {
      p.tags.forEach(t => {
        tagSet.add(t)
        tagCount[t] = (tagCount[t] || 0) + 1
      })
    })
    return Array.from(tagSet)
      .map(name => ({ name, count: tagCount[name] }))
      .sort((a, b) => b.count - a.count)
  })

  return { posts, allTags }
}
