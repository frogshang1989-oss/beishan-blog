/**
 * 北山洞见 · 订阅者列表 (Vercel Serverless)
 *
 * 山人查看通讯录：
 *   浏览器打开 https://你的域名.vercel.app/api/subscribers?token=你的密码
 *
 * 环境变量（Vercel 控制台设置）：
 *   ADMIN_TOKEN — 访问密码（默认 beishan2026）
 */

import { kv } from '@vercel/kv'

const SUBSCRIBERS_KEY = 'beishan:subscribers'

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const token = url.searchParams.get('token')
  const adminToken = process.env.ADMIN_TOKEN || 'beishan2026'

  if (token !== adminToken) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>禁止访问</title></head>
<body style="font-family:system-ui;text-align:center;padding:80px 24px;color:#6e6e73">
  <h2 style="font-weight:600;color:#1d1d1f">🔒 需要密码</h2>
  <p>请使用正确的访问令牌</p>
</body></html>`)
  }

  try {
    // 按订阅时间倒序返回所有订阅者
    const members = await kv.zrange(SUBSCRIBERS_KEY, 0, -1, { rev: true, withScores: true })
    const emails = []
    for (let i = 0; i < members.length; i += 2) {
      emails.push({
        email: members[i],
        time: new Date(members[i + 1]).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      })
    }

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>北山洞见 · 订阅者通讯录</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif; background: #f5f5f7; color: #1d1d1f; padding: 40px 24px }
    .container { max-width: 640px; margin: 0 auto }
    h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px }
    .meta { color: #86868b; font-size: 0.9rem; margin-bottom: 32px }
    .stats { background: #fff; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.04) }
    .stats strong { font-size: 2rem; font-weight: 700; color: #0071e3 }
    .list { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04) }
    .item { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; border-bottom: 1px solid #f0f0f5 }
    .item:last-child { border-bottom: none }
    .item-email { font-weight: 500; font-size: 0.95rem }
    .item-time { color: #86868b; font-size: 0.8rem }
    .copy-all { margin-top: 16px; text-align: right }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; font-family: inherit; background: #0071e3; color: #fff; transition: all .2s }
    .btn:hover { background: #0077ed }
    .empty { text-align: center; padding: 48px 24px; color: #86868b }
  </style>
</head>
<body>
  <div class="container">
    <h1>📬 北山洞见 · 订阅者通讯录</h1>
    <p class="meta">按订阅时间倒序排列 &nbsp;|&nbsp; 更新于 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
    <div class="stats">
      累计订阅 <strong>${emails.length}</strong> 人
    </div>
    ${emails.length === 0 ? '<div class="empty"><p>暂无订阅者</p></div>' : `
    <div class="list">
      ${emails.map((e, i) => `
        <div class="item">
          <span class="item-email">${e.email}</span>
          <span class="item-time">${e.time}</span>
        </div>
      `).join('')}
    </div>
    <div class="copy-all">
      <button class="btn" onclick="copyAll()">📋 复制全部邮箱</button>
    </div>
    `}
  </div>
  <script>
    function copyAll() {
      const emails = ${JSON.stringify(emails.map(e => e.email))}
      navigator.clipboard.writeText(emails.join('; ')).then(() => {
        alert('已复制 ' + emails.length + ' 个邮箱到剪贴板！')
      })
    }
  </script>
</body></html>`

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(html)
  } catch (err) {
    console.error('KV 读取异常:', err)
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end('<h2>服务异常，请稍后重试</h2>')
  }
}
