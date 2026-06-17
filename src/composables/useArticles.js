import { ref, computed } from 'vue'

const posts = ref([])
const loaded = ref(false)

// 分类定义
export const CATEGORIES = {
  'industry-insight': { label: '行业洞察', slug: 'industry-insight', desc: '宏观趋势、行业格局、政策解读与市场信号' },
  'business-model': { label: '商业模式', slug: 'business-model', desc: '商业模式的深度拆解、案例研究与框架构建' },
  'business-thinking': { label: '商业思维', slug: 'business-thinking', desc: '认知升级、方法论沉淀、创业心法与工具论' }
}

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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
      }
      frontmatter[key] = value
    }
  })
  return { frontmatter, content }
}

// 提取摘要
function getExcerpt(content, maxLen = 150) {
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#\-|]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain
}

// 从路径中提取分类
function getCategoryFromPath(path) {
  for (const cat of Object.keys(CATEGORIES)) {
    if (path.includes(`/${cat}/`)) return cat
  }
  return null
}

export function useArticles() {
  // 动态加载三个分类目录 + 根目录下的所有 .md 文件
  const modules = import.meta.glob(
    ['../posts/**/*.md', '../posts/*.md'],
    { query: '?raw', import: 'default', eager: true }
  )

  for (const [path, raw] of Object.entries(modules)) {
    const filename = path.split('/').pop()
    const slug = filename.replace(/\.md$/, '')

    if (posts.value.find(p => p.slug === slug)) continue

    const { frontmatter, content } = parseFrontmatter(raw)
    const category = frontmatter.category || getCategoryFromPath(path)

    posts.value.push({
      slug,
      title: frontmatter.title || slug,
      date: frontmatter.date || '',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      category,
      categoryLabel: CATEGORIES[category]?.label || '未分类',
      excerpt: getExcerpt(content),
      content,
      raw: frontmatter
    })
  }

  // 按日期倒序
  posts.value.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  // 公开文章（排除 _about.md 等系统文件）
  const publicPosts = computed(() =>
    posts.value.filter(p => !p.slug.startsWith('_'))
  )

  // 按分类获取文章
  function getPostsByCategory(categorySlug) {
    return computed(() =>
      publicPosts.value.filter(p => p.category === categorySlug)
    )
  }

  // 收集所有标签
  const allTags = computed(() => {
    const tagSet = new Set()
    const tagCount = {}
    publicPosts.value.forEach(p => {
      p.tags.forEach(t => {
        tagSet.add(t)
        tagCount[t] = (tagCount[t] || 0) + 1
      })
    })
    return Array.from(tagSet)
      .map(name => ({ name, count: tagCount[name] }))
      .sort((a, b) => b.count - a.count)
  })

  // 各分类最新文章（用于首页展示）
  const categoryHighlights = computed(() => {
    const result = {}
    for (const cat of Object.keys(CATEGORIES)) {
      result[cat] = publicPosts.value
        .filter(p => p.category === cat)
        .slice(0, 3)
    }
    return result
  })

  return {
    posts: publicPosts,
    allTags,
    allPosts: posts,
    getPostsByCategory,
    categoryHighlights,
    CATEGORIES
  }
}
