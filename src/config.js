// 博客全局配置 - 修改此处即可自定义博客信息
export default {
  title: '北山洞见',
  subtitle: '行业洞察 · 商业模式 · 商业思维',
  author: '山人',
  description: '从行业洞察到商业模式，从认知升级到实战落地——一人公司的商业认知体系。覆盖宏观趋势、商业模式拆解、AI赋能方法论。',
  footer: '© 2026 北山洞见',

  // ====== 订阅 API 配置 ======
  // 部署 Vercel 后，将 apiUrl 改为你的 Vercel 域名
  // 例: 'https://beishan-subscribe.vercel.app/api/subscribe'
  api: {
    subscribeUrl: '/api/subscribe'  // 开发时用本地代理；部署后改为 Vercel URL
  },

  // 首页 Hero
  hero: {
    tagline: '一人即团队，体系即壁垒',
    title: '一人公司从 0 到 1\n的商业认知体系',
    subtitle: '每周一篇深度拆解——从行业趋势洞察到商业模式解构，帮助你用系统思维构建一人公司的竞争壁垒。',

    // 订阅功能
    subscribe: {
      placeholder: '输入邮箱，订阅周报',
      buttonText: '订阅',
      hint: '已有 1,260+ 读者加入',
      successMsg: '🎉 订阅成功！确认邮件已发送，请检查收件箱',
      errorMsg: '订阅失败，请稍后重试或直接联系 frogshang@foxmail.com'
    }
  },

  // 产品/资源区（对标 Dan Koe 的产品卡片）
  products: [
    {
      icon: '📐',
      title: '商业模式拆解框架',
      desc: '六步流程 + 18个工具的系统化方法论，融合7个经典框架。帮你从0到1拆解任何商业模式。',
      button: '免费获取',
      link: '/business-model',
      highlight: false
    },
    {
      icon: '🔬',
      title: '行业场景洞察模型',
      desc: '从任意行业中系统识别、拆解、评估并筛选适合一人公司的场景机会，含完整分析工具链。',
      button: '了解详情',
      link: '/industry-insight',
      highlight: false
    },
    {
      icon: '🤖',
      title: 'AI 赋能实战指南',
      desc: '一人公司 AI 工具选型、自动化系统构建、人机协同工作流——用 AI 把一个人变成一支团队。',
      button: '立即阅读',
      link: '/business-thinking',
      highlight: false
    },
    {
      icon: '🎯',
      title: '1v1 决策教练',
      desc: '针对一人公司从0到1阶段的关键决策——方向选择、产品设计、变现路径规划。',
      button: '预约咨询',
      link: '/about',
      highlight: true
    }
  ],

  // 社交链接
  socialLinks: {
    wechat: { label: '公众号', icon: '✍️', url: '#' },
    xiaohongshu: { label: '知识星球', icon: '⭐', url: '#' },
    twitter: { label: 'GitHub', icon: '💻', url: 'https://github.com/frogshang1989-oss' },
    email: { label: '邮件', icon: '📧', url: 'mailto:frogshang@foxmail.com' }
  },

  postsPerPage: 10
}
