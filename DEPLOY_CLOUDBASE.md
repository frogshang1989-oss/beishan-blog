# 订阅系统部署指南（腾讯云 CloudBase 版）

本方案用 **腾讯云 CloudBase** 作为后端：

- **CloudBase 云函数**：处理订阅请求、返回订阅者列表
- **CloudBase 数据库**：存储订阅者邮箱
- **前端**：Vue 3 单页应用，调用云函数 HTTP 地址

国内访问稳定，无需把 Token 暴露在前端。

---

## 架构

| 动作 | 流程 |
|---|---|
| 用户订阅 | 前端 → CloudBase `subscribe` 云函数 → 写入数据库 |
| 山人查看 | 管理页 → CloudBase `subscribers` 云函数 → 读取数据库 |
| 发送邮件 | 管理页一键复制邮箱 → 用自己的邮件客户端群发 |

---

## 第一步：准备腾讯云账号

1. 访问 https://cloud.tencent.com/ 注册/登录
2. 进入 [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
3. 创建新环境（选「免费版」即可），记下 **环境 ID**（如 `beishan-blog-xxx`）

---

## 第二步：安装 CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

登录：

```bash
tcb login
```

按提示用微信/QQ/腾讯云账号扫码授权。

---

## 第三步：创建数据库集合

在 CloudBase 控制台 → **数据库** → 新建集合：

- 集合名称：`subscribers`
- 索引：为 `email` 字段创建唯一索引（可选，防止重复）

---

## 第四步：部署云函数

### 1. 修改环境 ID

打开项目根目录的 `cloudbaserc.json`，把 `your-env-id` 换成你的真实环境 ID。

```json
{
  "version": "2.0",
  "envId": "beishan-blog-xxx"
}
```

### 2. 修改默认管理密码（可选）

- `cloudbase/functions/subscribers/config.json` 中的 `environment.ADMIN_PASSWORD`
- `cloudbaserc.json` 中的 `framework.plugins.function.inputs.functions[1].config.envVariables.ADMIN_PASSWORD`

建议保持两者一致。

### 3. 部署

在项目根目录执行：

```bash
tcb framework deploy
```

或老版 CLI：

```bash
tcb deploy cloudbase/functions/subscribe
```

部署成功后，CloudBase 会给出两个云函数访问地址，形如：

- `https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribe`
- `https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribers`

---

## 第五步：配置前端

打开 `src/config.js`，填入上一步拿到的云函数地址：

```js
cloudbase: {
  envId: 'beishan-blog-xxx',
  subscribeUrl: 'https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribe',
  subscribersUrl: 'https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribers',
  adminPassword: 'beishan2026'
}
```

也可以把这两个地址填入 **GitHub Secrets**（推荐），构建时自动注入，无需写死在前端代码里：

| Secret 名称 | 值 |
|---|---|
| `SUBSCRIBE_URL` | 订阅云函数地址 |
| `SUBSCRIBERS_URL` | 订阅者列表云函数地址 |
| `ADMIN_PASSWORD` | 管理密码 |

仓库设置页：

🔗 https://github.com/frogshang1989-oss/beishan-blog/settings/secrets/actions

---

## 第六步：提交并推送

```bash
git add .
git commit -m "feat: 迁移订阅系统到腾讯云 CloudBase"
git push origin main
```

GitHub Actions 会自动构建并部署到 GitHub Pages。

---

## 使用

### 订阅页

- 用户访问：https://frogshang1989-oss.github.io/beishan-blog/#/subscribe
- 输入邮箱 → 点击订阅 → 后端写入 CloudBase 数据库

### 管理页

- 山人访问：https://frogshang1989-oss.github.io/beishan-blog/#/admin/subscribers
- 输入 `ADMIN_PASSWORD` 密码 → 查看所有订阅者
- 支持：刷新列表、复制全部邮箱、下载 CSV

---

## 清理旧文件

确认 CloudBase 方案运行正常后，可删除以下 GitHub Issues 方案残留文件：

- `src/composables/useGitHubSubscribe.js`
- `src/composables/useGitHubSubscribers.js`
- `DEPLOY_SUBSCRIBE_GITHUB.md`

---

## 安全说明

- 管理页密码仅用于基础访问控制，前端代码中会包含它（用于调用 subscribers 云函数）。
- 建议定期更换 `ADMIN_PASSWORD`。
- CloudBase 环境 ID 和云函数 URL 是公开可访问的，但 `subscribers` 云函数需要正确密码才能返回数据。
