/**
 * 北山洞见 · 订阅 API (Vercel Serverless Function)
 *
 * 部署：cd beishan-blog && vercel --prod
 * 调用：POST https://你的域名.vercel.app/api/subscribe
 *
 * 前置准备（部署前在 Vercel 环境变量中配置）：
 *   SENDCLOUD_API_USER  — SendCloud API_USER
 *   SENDCLOUD_API_KEY   — SendCloud API_KEY
 *   SENDCLOUD_LIST      — SendCloud 地址列表别称，如 beishan@maillist.sendcloud.org
 */

// SendCloud API 地址列表成员添加接口
const SENDCLOUD_API = 'https://api.sendcloud.net/apiv2/addressmember/add'

/**
 * 校验邮箱格式
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase())
}

/**
 * 设置 CORS 响应头
 */
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

  // 预检请求
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

  // 校验
  if (!email) {
    res.writeHead(400, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: '请输入邮箱地址' }))
  }

  if (!isValidEmail(email)) {
    res.writeHead(400, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: '邮箱格式不正确' }))
  }

  // 检查环境变量
  const apiUser = process.env.SENDCLOUD_API_USER
  const apiKey = process.env.SENDCLOUD_API_KEY
  const list = process.env.SENDCLOUD_LIST

  if (!apiUser || !apiKey || !list) {
    console.error('SendCloud 环境变量未配置')
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      success: false,
      message: '服务配置异常，请联系管理员'
    }))
  }

  // 调用 SendCloud API
  try {
    const formData = new URLSearchParams()
    formData.append('apiUser', apiUser)
    formData.append('apiKey', apiKey)
    formData.append('address', list)
    formData.append('members', email)

    const scResp = await fetch(SENDCLOUD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })

    const scResult = await scResp.json()

    if (scResult.result === true) {
      res.writeHead(200, { ...headers, 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        success: true,
        message: '订阅成功！请查收确认邮件'
      }))
    }

    // SendCloud 返回失败
    console.error('SendCloud API 错误:', JSON.stringify(scResult))

    // 判断是否是重复订阅
    if (scResult.info && scResult.info.invalidCount > 0) {
      const reasons = scResult.info.reasonList || []
      if (reasons.some(r => r.includes('duplicate'))) {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({
          success: true,
          message: '该邮箱已订阅，无需重复操作'
        }))
      }
    }

    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      success: false,
      message: scResult.message || '订阅失败，请稍后重试'
    }))

  } catch (err) {
    console.error('SendCloud 请求异常:', err)
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      success: false,
      message: '服务暂时不可用，请稍后重试'
    }))
  }
}
