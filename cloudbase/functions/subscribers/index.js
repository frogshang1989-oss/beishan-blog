const cloudbase = require('@cloudbase/node-sdk')

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
})
const db = app.database()

function response(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
    },
    body: JSON.stringify(body)
  }
}

function getAdminToken(event) {
  const headers = event.headers || {}
  const query = event.queryString || event.queryStringParameters || {}
  return (
    headers['x-admin-token'] ||
    headers['X-Admin-Token'] ||
    query.token ||
    ''
  )
}

exports.main = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return response({ code: 200, message: 'ok' })
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'beishan2026'
  const token = getAdminToken(event)

  if (token !== adminPassword) {
    return response({ code: 403, message: '未授权' }, 403)
  }

  try {
    const { data } = await db
      .collection('subscribers')
      .orderBy('subscribedAt', 'desc')
      .limit(1000)
      .get()

    const subscribers = data.map(item => ({
      email: item.email,
      subscribedAt: item.subscribedAt ? new Date(item.subscribedAt).toISOString() : null,
      source: item.source || 'website'
    }))

    return response({ code: 200, data: subscribers })
  } catch (err) {
    console.error('subscribers error:', err)
    return response({ code: 500, message: '读取订阅者失败' }, 500)
  }
}
