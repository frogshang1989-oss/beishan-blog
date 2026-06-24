/**
 * 北山洞见 · 订阅 API (Vercel Serverless + KV 存储)
 *
 * 部署：
 *   1. Vercel 控制台创建 KV 数据库 → 关联到此项目
 *   2. cd beishan-blog && vercel --prod
 *
 * 前端调用：POST /api/subscribe  { "email": "reader@example.com" }
 * 山人查看：浏览器访问 /api/subscribers?token=你的密码
 */

import { kv } from '@vercel/kv'

const SUBSCRIBERS_KEY = 'beishan:subscribers'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase())
}

function corsHeaders(origin) {
  const allowed = [
    'https://frogshang1989-oss.github.io',
    'http://localhost:5173',
    'http://localhost:4173'
  ]
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

export default async function handler(req, res) {
  const headers = corsHeaders(req.headers.origin || '')

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers)
    return res.end()
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: '仅支持 POST 请求' }))
  }

  // 解析 body
  let body
  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    body = JSON.parse(Buffer.concat(chunks).toString())
  } catch {
    res.writeHead(400, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: '请求体格式错误' }))
  }

  const email = (body.email || '').trim().toLowerCase()

  if (!email) {
    res.writeHead(400, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: '请输入邮箱地址' }))
  }

  if (!isValidEmail(email)) {
    res.writeHead(400, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: '邮箱格式不正确' }))
  }

  try {
    // 使用 Sorted Set：key=邮箱，score=时间戳（支持按时间排序 + 自动去重）
    const already = await kv.zscore(SUBSCRIBERS_KEY, email)
    if (already !== null) {
      res.writeHead(200, { ...headers, 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        success: true,
        message: '该邮箱已订阅，无需重复操作'
      }))
    }

    await kv.zadd(SUBSCRIBERS_KEY, {
      score: Date.now(),
      member: email
    })

    const total = await kv.zcard(SUBSCRIBERS_KEY)

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      success: true,
      message: '订阅成功！',
      total
    }))
  } catch (err) {
    console.error('KV 写入异常:', err)
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      success: false,
      message: '服务暂时不可用，请稍后重试'
    }))
  }
}
