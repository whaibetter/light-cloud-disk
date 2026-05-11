<template>
  <div :class="['app', themeClass]">
    <router-view />
    <Toast />
    <LoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { platform } from '../platform/context'
import Toast from './components/Toast.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'

const configStore = platform.getConfigStore()

const themeClass = computed(() => (configStore.theme === 'dark' ? 'theme-dark' : 'theme-light'))

watch(
  () => configStore.theme,
  (newTheme) => {
    configStore.applyTheme(newTheme)
  },
  { immediate: true }
)

onMounted(() => {
  configStore.applyTheme(configStore.theme)
})
</script>

<style lang="scss">
@import './styles/reset';

.app {
  min-height: 100vh;
  background: var(--bg-page);
  font-family: $font-family;
  color: var(--text-primary);
  transition: background-color $duration-normal $ease-default, color $duration-normal $ease-default;
}

// 深色模式全局样式
.theme-dark {
  &.app {
    background: var(--bg-page);
  }
}
</style>
