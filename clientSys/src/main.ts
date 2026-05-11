/**
 * 应用入口
 *
 * 根据当前运行环境（Tauri / Web）选择适配器并初始化应用。
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './ui/App.vue'
import { initPlatform, platform } from './platform/context'

// ==================== 路由配置 ====================

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./ui/pages/home/index.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./ui/pages/settings/index.vue')
  },
  {
    path: '/share',
    name: 'share',
    component: () => import('./ui/pages/share/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ==================== 应用初始化 ====================

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // 检测运行环境并选择适配器
  const isTauri = window.__TAURI_INTERNALS__ !== undefined

  if (isTauri) {
    // Tauri 环境（桌面端 / Android / iOS）
    const { createTauriAdapters, tauriNavigationAdapter } = await import('./platform/tauri')
    const adapters = createTauriAdapters()

    // 设置导航适配器的路由引用
    tauriNavigationAdapter.setRouter(router)

    await initPlatform(adapters, pinia)
  } else {
    // Web 环境（纯浏览器）
    const { createWebAdapters, webNavigationAdapter } = await import('./platform/web')
    const adapters = createWebAdapters()

    // 设置导航适配器的路由引用
    webNavigationAdapter.setRouter(router)

    await initPlatform(adapters, pinia)
  }

  // 挂载应用
  app.mount('#app')

  // 移除首屏加载指示器
  const loader = document.getElementById('app-loader')
  if (loader) {
    loader.classList.add('fade-out')
    setTimeout(() => loader.remove(), 300)
  }

  // 应用初始主题
  const configStore = platform.getConfigStore()
  configStore.applyTheme(configStore.theme)
}

bootstrap().catch(console.error)
