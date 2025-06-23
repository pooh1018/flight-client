import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [
    react(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  //给内部的脚手架 配置解析
  resolve: {
    //路径别名的配置
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    host: true,
    port: 8011, // 端口
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        // target: 'http://47.109.24.42:8001',
        changeOrigin: true,
        // secure: true,
        headers: {
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        },
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern', // or "modern-compiler", "modern", "legacy"
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    charset: 'utf8',
    rollupOptions: {
      output: {
        charset: 'utf-8'
      },
      external: [
        'babel-runtime',
        'babel-runtime/helpers/typeof'
      ]
    }
  }
})
