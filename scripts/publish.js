/**
 * 北山洞见 - WorkBuddy 文章发布接口
 *
 * 用法：
 *   # 方式1：stdin 传入内容
 *   echo "正文..." | node scripts/publish.js --category business-model --title "标题" --tags "标签1,标签2"
 *
 *   # 方式2：指定内容文件
 *   node scripts/publish.js --category industry-insight --title "标题" --tags "标签1,标签2" --content-file temp.md
 *
 *   # 方式3：直接指定内容
 *   node scripts/publish.js --category business-thinking --title "标题" --tags "标签1" --content "正文内容"
 *
 * 参数说明：
 *   --category     必填，板块：industry-insight | business-model | business-thinking
 *   --title        必填，文章标题
 *   --tags         可选，逗号分隔的标签列表
 *   --date         可选，发布日期（默认今天），格式 YYYY-MM-DD
 *   --content      可选，文章正文（Markdown）
 *   --content-file 可选，从文件读取内容
 *   --dry          预览模式，仅显示将生成的文件内容，不实际写入
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const VALID_CATEGORIES = ['industry-insight', 'business-model', 'business-thinking']

// 解析命令行参数
function parseArgs() {
  const args = { tags: [], dry: false }
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--category': args.category = argv[++i]; break
      case '--title': args.title = argv[++i]; break
      case '--tags': args.tags = argv[++i] ? argv[i].split(',').map(s => s.trim()).filter(Boolean) : []; break
      case '--date': args.date = argv[++i]; break
      case '--content': args.content = argv[++i]; break
      case '--content-file': args.contentFile = argv[++i]; break
      case '--dry': args.dry = true; break
    }
  }
  return args
}

// 生成 URL 友好的 slug
function slugify(title) {
  return title
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'untitled'
}

// 生成 frontmatter
function buildFrontmatter(args) {
  const today = new Date().toISOString().slice(0, 10)
  const lines = [
    '---',
    `title: "${args.title}"`,
    `date: ${args.date || today}`,
    `category: ${args.category}`,
    `tags: [${args.tags.map(t => `'${t}'`).join(', ')}]`,
    '---',
    ''
  ]
  return lines.join('\n')
}

// 主流程
async function main() {
  const args = parseArgs()

  // 校验
  if (!args.category || !VALID_CATEGORIES.includes(args.category)) {
    console.error(`❌ 无效分类: ${args.category}`)
    console.error(`   有效值: ${VALID_CATEGORIES.join(' | ')}`)
    process.exit(1)
  }

  if (!args.title) {
    console.error('❌ 缺少 --title 参数')
    process.exit(1)
  }

  // 获取内容
  let content = args.content || ''
  if (args.contentFile) {
    if (!existsSync(args.contentFile)) {
      console.error(`❌ 内容文件不存在: ${args.contentFile}`)
      process.exit(1)
    }
    content = readFileSync(args.contentFile, 'utf-8')
  }

  // 如果没有通过参数指定内容，尝试从 stdin 读取
  if (!content && !process.stdin.isTTY) {
    const chunks = []
    for await (const chunk of process.stdin) {
      chunks.push(chunk)
    }
    content = Buffer.concat(chunks).toString('utf-8')
  }

  if (!content.trim()) {
    console.error('❌ 没有提供文章内容')
    console.error('   通过 --content、--content-file 或 stdin 传入')
    process.exit(1)
  }

  const frontmatter = buildFrontmatter(args)
  const fullContent = frontmatter + content.trim() + '\n'

  const slug = slugify(args.title)
  const postsDir = join(__dirname, '..', 'src', 'posts', args.category)
  const filePath = join(postsDir, `${slug}.md`)

  if (!existsSync(postsDir)) {
    mkdirSync(postsDir, { recursive: true })
  }

  if (args.dry) {
    console.log('📋 [预览模式] 将生成以下内容：')
    console.log(`   文件: ${filePath}`)
    console.log(`   标题: ${args.title}`)
    console.log(`   分类: ${args.category}`)
    console.log(`   标签: ${args.tags.join(', ') || '(无)'}`)
    console.log(`   日期: ${args.date || new Date().toISOString().slice(0, 10)}`)
    console.log('---预览---')
    console.log(fullContent.slice(0, 500) + (fullContent.length > 500 ? '\n...' : ''))
    console.log('---结束---')
    return
  }

  if (existsSync(filePath)) {
    console.warn(`⚠️  文件已存在，覆盖: ${filePath}`)
  }

  writeFileSync(filePath, fullContent, 'utf-8')
  console.log(`✅ 文章已发布: ${filePath}`)
  console.log(`   板块: ${args.category}`)
  console.log(`   标题: ${args.title}`)
  console.log(`   标签: ${args.tags.join(', ') || '(无)'}`)
}

main().catch(err => {
  console.error('❌ 发布失败:', err.message)
  process.exit(1)
})
