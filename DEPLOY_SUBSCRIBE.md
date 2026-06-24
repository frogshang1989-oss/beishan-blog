# 订阅系统部署指南

## 架构说明

```
用户浏览器 ──POST──→ Vercel Serverless ──写入──→ Vercel KV
     ↑                   ↑                        ↑
  GitHub Pages       api/subscribe.js          持久化存储
  (博客网站)         api/subscribers.js         (邮箱列表)
```

## 部署步骤（约 5 分钟）

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 登录并创建 KV 数据库

```bash
cd d:\工作空间\beishan-blog

# 登录 Vercel
vercel login

# 创建 KV 数据库
vercel kv create beishan-kv

# 关联到当前项目
vercel link
```

### 3. 设置环境变量（可选）

在 Vercel 控制台 → 项目 Settings → Environment Variables 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ADMIN_TOKEN` | `你的密码` | 查看订阅者列表的密码，不设则默认 `beishan2026` |
| `KV_URL` | `自动生成` | Vercel KV 连接地址（创建 KV 后自动出现） |
| `KV_REST_API_URL` | `自动生成` | KV REST API 地址 |
| `KV_REST_API_TOKEN` | `自动生成` | KV API 令牌 |

### 4. 部署

```bash
cd d:\工作空间\beishan-blog
vercel --prod
```

部署成功后你会得到一个域名，例如 `beishan-api.vercel.app`。

### 5. 更新前端配置

打开 `src/config.js`，把 `api.subscribeUrl` 改为你的 Vercel 域名：

```js
api: {
  subscribeUrl: 'https://beishan-api.vercel.app/api/subscribe'
}
```

然后提交 push，等待 GitHub Actions 自动部署博客。

---

## 使用方式

### 查看订阅者通讯录

浏览器打开：

```
https://beishan-api.vercel.app/api/subscribers?token=你的密码
```

页面显示：
- 累计订阅人数
- 按时间倒序排列的全部邮箱
- 「📋 复制全部邮箱」按钮

### 手动发送周报

在通讯录页面复制全部邮箱 → 粘贴到你的邮箱（QQ邮箱/网易邮箱等）的 **密送（BCC）** 栏 → 撰写内容 → 发送。

---

## 常见问题

**Q: Vercel KV 收费吗？**
A: Hobby 计划免费 256MB 存储 + 每天 30,000 次请求，够用到上万订阅者。

**Q: 如何清空所有订阅者？**
A: 在 Vercel 控制台 → KV 数据库 → 删除 key `beishan:subscribers`。

**Q: 订阅者能自动退订吗？**
A: 当前版本需手动处理。收到退订请求后从通讯录页面反馈即可（后续可加退订接口）。
