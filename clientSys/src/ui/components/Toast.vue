<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast', `toast-${icon}`]">
      <span class="toast-icon">{{ iconEmoji }}</span>
      <span class="toast-text">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const message = ref('')
const icon = ref<'success' | 'error' | 'warning' | 'info' | 'none'>('none')
let timer: ReturnType<typeof setTimeout> | null = null

const iconEmoji = computed(() => {
  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    none: ''
  }
  return icons[icon.value] || ''
})

function show(detail: { title: string; icon?: string; duration?: number }) {
  message.value = detail.title
  icon.value = (detail.icon as typeof icon.value) || 'none'
  visible.value = true

  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, detail.duration || 2000)
}

function onToastEvent(e: Event) {
  show((e as CustomEvent).detail)
}

onMounted(() => {
  window.addEventListener('app:toast', onToastEvent)
})

onUnmounted(() => {
  window.removeEventListener('app:toast', onToastEvent)
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: $z-toast;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: $space-3 $space-5;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-size-base;
  pointer-events: none;
  backdrop-filter: blur(10px);
}

.toast-icon {
  font-size: 18px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity $duration-normal $ease-default, transform $duration-normal $ease-default;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
