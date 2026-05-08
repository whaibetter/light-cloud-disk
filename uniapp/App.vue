<template>
  <view :class="['app', themeClass]">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useConfigStore } from '@/stores'

const configStore = useConfigStore()

const themeClass = computed(() => {
  return configStore.theme === 'dark' ? 'theme-dark' : 'theme-light'
})

// 应用深色模式
function applyTheme(theme: string) {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light'
  }
  // #endif
}

// 监听主题变化
watch(() => configStore.theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

onMounted(() => {
  applyTheme(configStore.theme)
})

onShow(() => {
  applyTheme(configStore.theme)
})
</script>

<style lang="scss">
// 浅色模式变量
:root {
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-sunken: #F3F4F6;
  --bg-input: #F3F4F6;
  --bg-hover: #F3F4F6;
  
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-inverse: #FFFFFF;
  
  --border-default: #E5E7EB;
  --border-subtle: #F3F4F6;
  
  --brand-primary: #4F46E5;
  --brand-gradient: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #06B6D4 100%);
}

// 深色模式变量
[data-theme="dark"],
.theme-dark {
  --bg-page: #111827;
  --bg-card: #1F2937;
  --bg-elevated: #374151;
  --bg-sunken: #1F2937;
  --bg-input: #374151;
  --bg-hover: #374151;
  
  --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  --text-tertiary: #6B7280;
  --text-inverse: #111827;
  
  --border-default: #374151;
  --border-subtle: #1F2937;
}

.app {
  min-height: 100vh;
  background: var(--bg-page);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

// 全局深色模式样式
.theme-dark {
  page {
    background-color: #111827;
    color: #F9FAFB;
  }
  
  // 隐藏 tabBar
  uni-tabbar,
  .uni-tabbar,
  .uni-tabbar-bottom {
    display: none !important;
  }
}

// 桌面端隐藏 tabBar
@media (min-width: 768px) {
  uni-tabbar,
  .uni-tabbar,
  .uni-tabbar-bottom {
    display: none !important;
  }
}
</style>
