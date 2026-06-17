import { watch } from 'vue'
import siteConfig from '../config.js'

const BASE_URL = 'https://frogshang1989-oss.github.io/beishan-blog'

/**
 * 为每个页面注入 SEO 元标签（title、description、Open Graph、结构化数据）
 * @param {Object} options
 * @param {string} options.title - 页面标题（自动拼接博客名）
 * @param {string} options.description - 页面描述
 * @param {string} options.url - 页面完整 URL
 * @param {string} options.type - Open Graph 类型（website/article）
 * @param {Object} options.article - 文章结构化数据（仅 type=article 时有效）
 */
export function useSEO({ title, description, url, type = 'website', article = null } = {}) {
  const pageTitle = title
    ? `${title} - ${siteConfig.title}`
    : `${siteConfig.title} - ${siteConfig.subtitle}`

  const pageDesc = description || siteConfig.description
  const pageUrl = url || BASE_URL + '/'

  // 设置 document title
  document.title = pageTitle

  // 通用 meta
  setMeta('description', pageDesc)
  setMeta('author', siteConfig.author)

  // Open Graph
  setMeta('og:title', pageTitle, 'property')
  setMeta('og:description', pageDesc, 'property')
  setMeta('og:url', pageUrl, 'property')
  setMeta('og:type', type, 'property')
  setMeta('og:site_name', siteConfig.title, 'property')

  // Twitter Card
  setMeta('twitter:title', pageTitle)
  setMeta('twitter:description', pageDesc)

  // Canonical URL
  setLink('canonical', pageUrl)

  // 删除旧的 JSON-LD
  const oldScript = document.getElementById('structured-data')
  if (oldScript) oldScript.remove()

  // 结构化数据 (JSON-LD)
  if (type === 'article' && article) {
    const jsonLD = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': pageDesc,
      'author': {
        '@type': 'Person',
        'name': siteConfig.author
      },
      'datePublished': article.date,
      'dateModified': article.date,
      'url': pageUrl,
      'publisher': {
        '@type': 'Person',
        'name': siteConfig.author
      }
    }
    if (article.tags && article.tags.length) {
      jsonLD.keywords = article.tags.join(', ')
    }
    injectJSONLD(jsonLD)
  } else {
    // 网站级别的结构化数据
    const siteJSONLD = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': siteConfig.title,
      'description': siteConfig.description,
      'url': BASE_URL + '/'
    }
    injectJSONLD(siteJSONLD)
  }
}

function setMeta(name, content, attrName = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attrName}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function injectJSONLD(data) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'structured-data'
  script.textContent = JSON.stringify(data, null, 2)
  document.head.appendChild(script)
}
