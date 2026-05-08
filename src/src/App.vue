<template>
  <view class="app-container">
    <view class="app-content">
      <slot />
    </view>
    <view class="app-tabbar" v-if="showTabBar">
      <view class="tabbar-safe-area"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface Props {
  showTabBar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTabBar: true
})

onShow(() => {
  console.log('Light Cloud Disk App Started')
})
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  background-color: $bg-color;
}

.app-content {
  min-height: 100vh;
}

.app-tabbar {
  .tabbar-safe-area {
    height: constant(safe-area-inset-bottom);
    height: env(safe-area-inset-bottom);
  }
}
</style>
