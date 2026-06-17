/**
 * Sitemap 生成脚本
 * 扫描所有文章和页面，生成符合标准的 sitemap.xml
 * 用法：node scripts/generate-sitemap.js
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://frogshang1989-oss.github.io/beishan-blog'
const POSTS_DIR = resolve(__dirname, '../src/posts')
const OUTPUT = resolve(__dirname, '../dist/sitemap.xml')

// 静态页面
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/about', changefreq: 'monthly', priority: '0.7' },
  { url: '/tags', changefreq: 'weekly', priority: '0.8' }
]

// 解析 Markdown frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return {}
  const frontmatter = {}
  match[1].split('\n').forEach(line => {
    const kv = line.match(/^(\w+):\s*(.+)/)
    if (kv) {
      let val = kv[2].trim()
      // 去掉引号
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1)
      }
      frontmatter[kv[1]] = val
    }
  })
  return frontmatter
}

// 扫描文章
function scanPosts() {
  const posts = []
  try {
    const files = readdirSync(POSTS_DIR)
    files.forEach(f => {
      if (!f.endsWith('.md') || f.startsWith('_')) return
      const content = readFileSync(resolve(POSTS_DIR, f), 'utf-8')
      const fm = parseFrontmatter(content)
      if (fm.title) {
        posts.push({
          slug: f.replace('.md', ''),
          date: fm.date || new Date().toISOString().slice(0, 10)
        })
      }
    })
  } catch (e) {
    console.warn('⚠ 无法扫描文章目录:', e.message)
  }
  return posts
}

// 生成 sitemap XML
function generateSitemap() {
  const posts = scanPosts()
  const urls = []

  // 静态页面
  staticPages.forEach(p => {
    urls.push(`  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
  })

  // 文章页面
  posts.sort((a, b) => b.date.localeCompare(a.date))
  posts.forEach(p => {
    urls.push(`  <url>
    <loc>${BASE_URL}/post/${p.slug}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`)
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  writeFileSync(OUTPUT, sitemap, 'utf-8')
  console.log(`✅ sitemap.xml 已生成 (${urls.length} 个页面): ${OUTPUT}`)
}

generateSitemap()
