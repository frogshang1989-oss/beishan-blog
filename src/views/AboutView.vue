<template>
  <div class="about-page">
    <h1>关于「{{ config.title }}」</h1>
    <div class="about-content">
      <p>{{ config.description }}</p>
      <p>我是<strong>{{ config.author }}</strong>，15年工作经验，专注企业管理咨询。</p>
      <p>2021年起转型一人公司/超级个体赛道，聚焦三个方向：</p>
      <ul style="padding-left: 1.5em; margin: 1em 0; color: var(--c-text-secondary); line-height: 2;">
        <li><strong>商业模式拆解</strong> — 系统化框架，看清任何生意的运行规律</li>
        <li><strong>AI 赋能方法论</strong> — 如何用 AI 工具放大个人产出，构建自动化系统</li>
        <li><strong>内容与知识变现</strong> — 公众号 + 视频号 + 知识星球闭环运营</li>
      </ul>
      <p>这个博客分享我的研究、思考与实践，希望能帮助同样在探索一人公司道路的你。</p>
      <h2 style="font-size: 1.15rem; margin-top: 2em; margin-bottom: 0.6em;">联系方式</h2>
      <p>邮箱：frogshang@foxmail.com</p>
      <h2 style="font-size: 1.15rem; margin-top: 2em; margin-bottom: 0.6em;">关于这个博客</h2>
      <p>纯静态网站，使用 Vue 3 + Vite 构建，Markdown 编写文章，GitHub Pages 免费托管。</p>
      <p>所有文章使用 Markdown 编写，存放在 <code>src/posts/</code> 目录下，支持代码高亮、表格、图片等丰富格式。</p>
    </div>
  </div>
</template>

<script setup>
import config from '../config.js'
</script>
