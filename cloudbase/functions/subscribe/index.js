const cloudbase = require('@cloudbase/node-sdk')

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
})
const db = app.database()
const _ = db.command

function response(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase())
}

exports.main = async (event, context) => {
  // 处理 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return response({ code: 200, message: 'ok' })
  }

  let email = ''
  try {
    const payload = event.body ? JSON.parse(event.body) : event
    email = String(payload.email || '').trim().toLowerCase()
  } catch (e) {
    return response({ code: 400, message: '请求格式错误' }, 400)
  }

  if (!isValidEmail(email)) {
    return response({ code: 400, message: '邮箱格式不正确' }, 400)
  }

  try {
    const exist = await db.collection('subscribers').where({ email }).count()

    if (exist.total > 0) {
      return response({ code: 200, message: '该邮箱已订阅，无需重复操作' })
    }

    await db.collection('subscribers').add({
      data: {
        email,
        subscribedAt: new Date(),
        source: 'website',
        createdAt: db.serverDate()
      }
    })

    return response({ code: 200, message: '订阅成功' })
  } catch (err) {
    console.error('subscribe error:', err)
    return response({ code: 500, message: '订阅失败，请稍后重试' }, 500)
  }
}
