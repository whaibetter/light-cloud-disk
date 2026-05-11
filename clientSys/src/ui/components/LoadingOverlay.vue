<template>
  <Transition name="loading">
    <div v-if="visible" class="loading-overlay">
      <div class="loading-spinner" />
      <span class="loading-text">加载中...</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onLoadingEvent(e: Event) {
  visible.value = (e as CustomEvent).detail?.show ?? false
}

onMounted(() => {
  window.addEventListener('app:loading', onLoadingEvent)
})

onUnmounted(() => {
  window.removeEventListener('app:loading', onLoadingEvent)
})
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-modal-backdrop;
  background: rgba(0, 0, 0, 0.3);
  @include flex-center;
  flex-direction: column;
  gap: $space-3;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  color: #fff;
  font-size: $font-size-sm;
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity $duration-normal $ease-default;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>
