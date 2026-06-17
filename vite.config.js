import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { writeFileSync, copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    // 生成 404.html 作为 SPA 回退页（GitHub Pages 必须）
    {
      name: 'spa-fallback',
      closeBundle() {
        // SPA 回退脚本：将 404 路径存入 sessionStorage 后跳转首页
        const fallbackHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><script>
sessionStorage.setItem('redirect', location.pathname + location.search + location.hash);
location.replace('/beishan-blog/');
</script></head><body></body></html>`
        writeFileSync('dist/404.html', fallbackHTML)
      }
    }
  ],
  base: '/beishan-blog/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
