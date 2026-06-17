/**
 * 北山洞见 - 文章自动标签分析脚本
 * 
 * 功能：
 *   1. 扫描 src/posts/ 下所有文章
 *   2. 基于关键词匹配自动推荐标签
 *   3. 可选：自动补全缺少标签的文章
 *   4. 集成到 npm run build 流程中
 * 
 * 用法：
 *   node scripts/auto-tag.js          # 扫描并输出报告（安全模式）
 *   node scripts/auto-tag.js --apply  # 自动为缺标签文章补全标签
 *   node scripts/auto-tag.js --dry    # 仅显示建议，不修改文件
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const POSTS_DIR = join(__dirname, '..', 'src', 'posts')

// ===== 标签规则库 =====
// 关键词 → 推荐标签的映射
const TAG_RULES = [
  // 商业模式相关
  {
    tag: '商业模式',
    keywords: ['商业模式', '盈利模式', '变现', '收入模型', '价值主张', '商业闭环', '收入来源', '成本结构'],
    weight: 3
  },
  {
    tag: '拆解框架',
    keywords: ['拆解', '框架', '方法论', '分析维度', '评估体系', 'OPS', '钻石模型', '双轴', '全链路'],
    weight: 3
  },
  {
    tag: '商业案例',
    keywords: ['案例', '实例', '案例研究', '复盘', '参考', '案例拆解'],
    weight: 2
  },

  // 一人公司/创业
  {
    tag: '一人公司',
    keywords: ['一人公司', '一人企业', '个人创业', '超级个体', 'solopreneur', '独立开发者', 'OPC', '个人IP'],
    weight: 4
  },
  {
    tag: '一人模式',
    keywords: ['一人模式', '单人', '独立', '自由职业', '数字游民', '远程工作'],
    weight: 2
  },
  {
    tag: '创业方法',
    keywords: ['创业', '启动', '从0到1', 'MVP', '验证', '最小可行', '冷启动', '增长'],
    weight: 3
  },

  // AI 技术
  {
    tag: 'AI工具',
    keywords: ['AI', '人工智能', 'ChatGPT', 'GPT', 'Claude', '大模型', 'LLM', '机器学习', '深度学习', 'NLP'],
    weight: 4
  },
  {
    tag: 'AI应用',
    keywords: ['AI生成', '自动生成', '智能', 'AI驱动', 'AIGC', 'AI写作', 'AI设计', 'AI开发', 'AI编码'],
    weight: 3
  },
  {
    tag: '自动化',
    keywords: ['自动化', '自动', '脚本', '工作流', 'workflow', '流水线', 'automation'],
    weight: 3
  },

  // 产品/技术
  {
    tag: '技术栈',
    keywords: ['技术栈', '开发', '编程', '代码', '架构', '前端', '后端', '全栈', 'Vue', 'React', 'Python', 'Node'],
    weight: 3
  },
  {
    tag: '产品设计',
    keywords: ['产品', '产品设计', '用户体验', 'UX', 'UI', '交互', '原型', '功能设计'],
    weight: 2
  },
  {
    tag: 'SaaS',
    keywords: ['SaaS', '软件即服务', '订阅制', '月付', 'ARR', 'MRR', '订阅收入'],
    weight: 3
  },

  // 知识付费
  {
    tag: '知识付费',
    keywords: ['知识付费', '课程', '付费订阅', '知识星球', '付费文章', '付费社群', '会员', '专栏'],
    weight: 3
  },
  {
    tag: '内容变现',
    keywords: ['变现', '收入', '盈利', '付费', '定价', '定价策略', '转化', '销售', '营收'],
    weight: 2
  },

  // 运营/增长
  {
    tag: '运营',
    keywords: ['运营', '增长', '用户', '转化率', '留存', '激活', '拉新', '促活'],
    weight: 3
  },
  {
    tag: '营销',
    keywords: ['营销', '推广', '品牌', '传播', '社交媒体', '公众号', '视频号', '小红书', '抖音'],
    weight: 3
  },
  {
    tag: 'SEO',
    keywords: ['SEO', '搜索', '搜索引擎', '关键词', '排名', '流量', '自然流量'],
    weight: 2
  },

  // 金融/投资
  {
    tag: '投资分析',
    keywords: ['投资', '融资', '估值', '资本', '回报', 'VC', 'PE', '天使', '风投', '退出'],
    weight: 3
  },
  {
    tag: '宏观策略',
    keywords: ['宏观', '策略', '周期', '经济', '政策', '利率', '通胀', '央行', '货币政策', '财政'],
    weight: 4
  },
  {
    tag: '金融研究',
    keywords: ['金融', '股票', '基金', '市场', '交易', '证券', '分析师', '研报', '对冲', '量化'],
    weight: 3
  },

  // 方法论框架
  {
    tag: '研究框架',
    keywords: ['研究', '分析', '报告', '深度', '调研', '洞察', '扫描', '方法论'],
    weight: 2
  },
  {
    tag: '思维模型',
    keywords: ['思维', '认知', '模型', '系统思维', '底层逻辑', '第一性原理', '本质'],
    weight: 2
  },

  // 效率/工具
  {
    tag: '效率工具',
    keywords: ['效率', '工具', '插件', '扩展', '快捷键', '提效', '生产力'],
    weight: 2
  },

  // 内容创作
  {
    tag: '内容创作',
    keywords: ['写作', '创作', '内容', '文章', '文案', '博客', '自媒体', '写作方法'],
    weight: 2
  },
]

// 最小关键词匹配次数阈值（避免噪声匹配）
const MIN_MATCH_THRESHOLD = 2

// ===== 核心逻辑 =====

/**
 * 从文章内容中提取推荐标签
 */
function analyzeTags(content) {
  const lower = content.toLowerCase()
  const scores = {}

  for (const rule of TAG_RULES) {
    let matches = 0
    for (const kw of rule.keywords) {
      // 在全文（含标题）中搜索关键词
      const count = (lower.match(new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      matches += count
    }
    if (matches >= MIN_MATCH_THRESHOLD) {
      scores[rule.tag] = matches * rule.weight
    }
  }

  // 按得分排序
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  // 返回前 5 个标签
  return sorted.slice(0, 5)
}

/**
 * 解析 frontmatter
 */
function parseFrontmatter(raw) {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = raw.match(fmRegex)
  if (!match) {
    return { frontmatter: {}, content: raw, raw }
  }
  const fmText = match[1]
  const content = match[2]
  const frontmatter = {}
  fmText.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
      }
      frontmatter[key] = value
    }
  })
  return { frontmatter, content, raw }
}

/**
 * 生成新的 frontmatter 文本
 */
function generateFrontmatter(title, date, tags, body) {
  const lines = ['---']
  lines.push(`title: "${title}"`)
  if (date) lines.push(`date: ${date}`)
  lines.push('tags:')
  if (tags.length === 0) {
    lines.push('  - 未分类')
  } else {
    tags.forEach(t => lines.push(`  - ${t}`))
  }
  lines.push('---')
  lines.push('')
  lines.push(body)
  return lines.join('\n')
}

// ===== 主流程 =====

function main() {
  const args = process.argv.slice(2)
  const mode = args.includes('--apply') ? 'apply' : args.includes('--dry') ? 'dry' : 'report'

  console.log('🔍 北山洞见 - 文章自动标签分析')
  console.log(`模式: ${mode === 'apply' ? '自动补全' : mode === 'dry' ? '仅预览' : '仅报告'}`)
  console.log('')

  // 递归扫描 posts 目录及其子目录
  function scanMdFiles(dir) {
    const results = []
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results.push(...scanMdFiles(fullPath))
      } else if (extname(entry) === '.md' && !entry.startsWith('_')) {
        results.push(fullPath)
      }
    }
    return results
  }

  const files = scanMdFiles(POSTS_DIR)

  if (files.length === 0) {
    console.log('📭 src/posts/ 目录下暂无文章')
    return
  }

  console.log(`📂 扫描 ${files.length} 篇文章...\n`)
  console.log('='.repeat(70))

  let modifiedCount = 0

  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf-8')
    const { frontmatter, content } = parseFrontmatter(raw)
    const existingTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []
    const title = frontmatter.title || filePath

    // 分析全文内容（标题 + 正文）
    const fullText = title + '\n' + content
    const suggestedTags = analyzeTags(fullText)

    // 去除已有标签
    const newTags = suggestedTags.filter(t => !existingTags.includes(t))

    // 推荐的完整标签集
    const mergedTags = [...new Set([...existingTags, ...suggestedTags])]

    console.log(`\n📄 ${title}`)
    console.log(`   文件: ${file}`)
    console.log(`   已有标签: [${existingTags.join(', ') || '无'}]`)
    console.log(`   推荐标签: [${suggestedTags.join(', ') || '无匹配'}]`)

    if (newTags.length > 0) {
      console.log(`   ✨ 新增: [${newTags.join(', ')}]`)
      console.log(`   🏷️  合并后: [${mergedTags.join(', ')}]`)

      if (mode === 'apply') {
        const newContent = generateFrontmatter(title, frontmatter.date || '', mergedTags, content)
        writeFileSync(filePath, newContent, 'utf-8')
        console.log(`   ✅ 已更新`)
        modifiedCount++
      }
    } else if (suggestedTags.length > 0) {
      console.log(`   ✅ 标签已完整`)
    } else {
      console.log(`   ⚠️  无匹配关键词，建议手动添加标签`)
    }
  }

  console.log('\n' + '='.repeat(70))

  if (mode === 'apply') {
    console.log(`\n✅ 完成！已更新 ${modifiedCount} 篇文章的标签。`)
    console.log('💡 建议: git diff 检查改动后提交')
  } else {
    console.log(`\n📊 报告完成。`)
    if (modifiedCount === 0) {
      console.log('💡 所有文章标签已完整，无需更新。')
    } else {
      console.log(`💡 共 ${modifiedCount} 篇文章可以补全标签。`)
      console.log('   运行 node scripts/auto-tag.js --apply 自动补全')
      console.log('   运行 node scripts/auto-tag.js --dry    仅预览变更')
    }
  }
}

main()
