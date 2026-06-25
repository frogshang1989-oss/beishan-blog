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

## 第一步：创建 CloudBase 环境

1. 访问 https://cloud.tencent.com/ 注册/登录
2. 进入 [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
3. 点击 **新建环境**，选 **免费版**
4. 记下 **环境 ID**（如 `beishan-blog-xxx`）

---

## 第二步：创建数据库集合

在 CloudBase 控制台 → **数据库** → 新建集合：

- 集合名称：`subscribers`
- 权限模式：建议选 **“仅创建者及管理员可读写”** 或默认
- 索引（可选但推荐）：为 `email` 字段创建 **唯一索引**，防止重复

---

## 第三步：创建 subscribe 云函数

### 3.1 创建函数

1. 控制台 → **云函数** → **新建云函数**
2. 函数名称：`subscribe`
3. 运行环境：Node.js 18.x
4. 触发器：HTTP 触发器，路径 `/subscribe`，方法勾选 `POST` 和 `OPTIONS`

### 3.2 粘贴代码

把 `cloudbase/functions/subscribe/index.js` 的内容完整粘贴到函数编辑器中。

### 3.3 安装依赖

函数编辑器通常有 `package.json` 或依赖安装入口。添加依赖：

```json
{
  "dependencies": {
    "@cloudbase/node-sdk": "latest"
  }
}
```

或使用本文件 `cloudbase/functions/subscribe/package.json` 的内容。

### 3.4 部署

点击 **保存并安装依赖** → **部署**。

复制生成的 HTTP 访问地址，形如：

```
https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribe
```

---

## 第四步：创建 subscribers 云函数

1. 控制台 → **云函数** → **新建云函数**
2. 函数名称：`subscribers`
3. 运行环境：Node.js 18.x
4. 触发器：HTTP 触发器，路径 `/subscribers`，方法勾选 `GET` 和 `OPTIONS`
5. 环境变量：添加 `ADMIN_PASSWORD`，值为你的管理密码（默认 `beishan2026`）

把 `cloudbase/functions/subscribers/index.js` 的内容粘贴到编辑器，安装 `@cloudbase/node-sdk` 依赖，然后部署。

复制 HTTP 访问地址，形如：

```
https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribers
```

---

## 第五步：配置前端

### 方式一：直接写死在 config.js（适合快速验证）

打开 `src/config.js`，填入刚才复制的两个地址：

```js
cloudbase: {
  envId: 'beishan-blog-xxx',
  subscribeUrl: 'https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribe',
  subscribersUrl: 'https://beishan-blog-xxx-xxxx.service.tcloudbase.com/subscribers',
  adminPassword: 'beishan2026'
}
```

### 方式二：用 GitHub Secrets（推荐，更安全）

打开仓库设置页：

🔗 https://github.com/frogshang1989-oss/beishan-blog/settings/secrets/actions

添加三个 Secrets：

| Secret 名称 | 值 |
|---|---|
| `SUBSCRIBE_URL` | 订阅云函数地址 |
| `SUBSCRIBERS_URL` | 订阅者列表云函数地址 |
| `ADMIN_PASSWORD` | 管理密码 |

GitHub Actions 构建时会自动注入，无需写死在前端代码里。

---

## 第六步：提交并推送

```bash
cd "D:/工作空间/beishan-blog"
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

## 安全说明

- 管理页密码仅用于基础访问控制，前端代码中需要包含它（用于调用 subscribers 云函数）。
- 建议定期更换 `ADMIN_PASSWORD`。
- CloudBase 环境 ID 和云函数 URL 是公开可访问的，但 `subscribers` 云函数需要正确密码才能返回数据。

---

## 备选：CLI 部署

如果你更习惯命令行，可以安装 CloudBase CLI：

```bash
npm install -g @cloudbase/cli
tcb login
```

然后修改 `cloudbaserc.json` 中的 `envId`，执行：

```bash
tcb framework deploy
```

不过控制台图形化部署更直观，推荐优先使用控制台方式。
