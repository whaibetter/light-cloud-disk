import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  base: '/cloud/',
  plugins: [uni()],

  resolve: {
    alias: {
      '@': __dirname
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${resolve(__dirname, 'styles/variables').replace(/\\/g, '/')}"; @import "${resolve(__dirname, 'styles/mixins').replace(/\\/g, '/')}";`
      }
    }
  },

  optimizeDeps: {
    include: []
  },

  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
