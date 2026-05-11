import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@platform': resolve(__dirname, 'src/platform'),
      '@ui': resolve(__dirname, 'src/ui')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${resolve(__dirname, 'src/ui/styles/_variables.scss').replace(/\\/g, '/')}"; @import "${resolve(__dirname, 'src/ui/styles/_mixins.scss').replace(/\\/g, '/')}";`
      }
    }
  },

  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**']
    },
    // 开发代理：将 /api 请求转发到远程服务器，避免 CORS 问题
    // /api/files → http://117.72.196.45/cloud/api/files
    proxy: {
      '/api': {
        target: 'http://117.72.196.45',
        changeOrigin: true,
        rewrite: (path) => `/cloud${path}`
      }
    }
  }
})
