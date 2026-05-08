<template>
  <view class="app">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'

onShow(() => {
  // App 启动
})
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  background: $bg-page;
  font-family: $font-family;
}
</style>
