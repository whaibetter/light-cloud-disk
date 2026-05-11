<template>
  <div class="share-page">
    <div class="share-container">
      <!-- Logo -->
      <div class="share-header">
        <div class="share-logo">
          <span>☁️</span>
        </div>
        <span class="share-title">轻量云盘</span>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="share-card">
        <div class="share-spinner"></div>
        <span class="share-status">正在获取分享信息...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="share-card error">
        <span class="error-icon">{{ errorIcon }}</span>
        <span class="error-title">{{ errorTitle }}</span>
        <span class="error-desc">{{ error }}</span>
        <button class="share-btn" @click="goHome">返回首页</button>
      </div>

      <!-- 需要密码 -->
      <div v-else-if="needPassword && !verified" class="share-card">
        <span class="card-icon">🔒</span>
        <span class="card-title">需要访问密码</span>
        <span class="card-desc">请输入分享密码以继续下载</span>
        <div class="password-form">
          <input
            v-model="password"
            class="password-input"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="verifyPassword"
          />
          <button class="share-btn" :disabled="verifying" @click="verifyPassword">
            {{ verifying ? '验证中...' : '验证' }}
          </button>
        </div>
        <span v-if="passwordError" class="password-error">{{ passwordError }}</span>
      </div>

      <!-- 可下载 -->
      <div v-else-if="downloadReady" class="share-card success">
        <span class="card-icon">📄</span>
        <span class="card-title">{{ fileName }}</span>
        <span class="card-desc">{{ formattedFileSize }}</span>
        <button class="share-btn download" @click="download">
          下载文件
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { platform } from '../../../platform/context'
import { formatFileSize } from '../../../core/utils/format'

const loading = ref(true)
const error = ref('')
const errorIcon = ref('😕')
const errorTitle = ref('出错了')
const needPassword = ref(false)
const downloadReady = ref(false)
const verified = ref(false)
const fileName = ref('')
const fileSize = ref(0)
const mimetype = ref('')
const password = ref('')
const passwordError = ref('')
const verifying = ref(false)

let token = ''

const formattedFileSize = computed(() => {
  return fileSize.value ? formatFileSize(fileSize.value) : ''
})

onMounted(() => {
  // 从 URL hash 中提取 token
  const hash = window.location.hash
  const match = hash.match(/token=([^&]+)/)
  if (match) {
    token = match[1]
    fetchShareInfo()
  } else {
    showError('链接无效', '😕', '未找到分享令牌')
  }
})

async function fetchShareInfo() {
  loading.value = true
  error.value = ''
  try {
    const apiClient = platform.getApiClient()
    const info = await apiClient.getShareInfo(token)

    if (info.needPassword) {
      needPassword.value = true
      fileName.value = info.fileName || ''
      fileSize.value = info.fileSize || 0
      mimetype.value = info.mimetype || ''
    } else {
      needPassword.value = false
      downloadReady.value = true
      fileName.value = info.fileName || ''
      fileSize.value = info.fileSize || 0
      mimetype.value = info.mimetype || ''
    }
  } catch (err: any) {
    const msg = err.message || '获取分享信息失败'
    if (msg.includes('expired') || msg.includes('过期')) {
      showError('分享链接已过期', '⏰', msg)
    } else if (msg.includes('not found') || msg.includes('不存在')) {
      showError('分享链接不存在', '😕', msg)
    } else {
      showError(msg, '😕', '请检查链接是否正确')
    }
  } finally {
    loading.value = false
  }
}

async function verifyPassword() {
  if (!password.value.trim()) {
    passwordError.value = '请输入密码'
    return
  }

  verifying.value = true
  passwordError.value = ''
  try {
    const apiClient = platform.getApiClient()
    const result = await apiClient.verifySharePassword(token, password.value)
    if (result.success) {
      verified.value = true
      downloadReady.value = true
      needPassword.value = false
      fileName.value = result.fileName || fileName.value
      fileSize.value = result.fileSize || fileSize.value
      mimetype.value = result.mimetype || mimetype.value
    } else {
      passwordError.value = '密码错误'
    }
  } catch (err: any) {
    const msg = err.message || '验证失败'
    if (msg.includes('Invalid password') || msg.includes('密码')) {
      passwordError.value = '密码错误'
    } else if (msg.includes('expired') || msg.includes('过期')) {
      showError('分享链接已过期', '⏰', msg)
    } else {
      passwordError.value = msg
    }
  } finally {
    verifying.value = false
  }
}

function download() {
  const apiClient = platform.getApiClient()
  const url = apiClient.getShareDownloadUrl(token, verified.value ? password.value : undefined)
  window.open(url, '_blank')
}

function showError(title: string, icon: string, desc: string) {
  error.value = desc
  errorIcon.value = icon
  errorTitle.value = title
}

function goHome() {
  window.location.hash = '#/'
}
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background: $bg-page;
  @include flex-center;
  padding: $space-4;
}

.share-container {
  width: 100%;
  max-width: 400px;
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-3;
  margin-bottom: $space-8;

  .share-logo {
    width: 48px;
    height: 48px;
    background: $brand-gradient;
    border-radius: $radius-xl;
    @include flex-center;
    font-size: 24px;
  }

  .share-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }
}

.share-card {
  background: $bg-card;
  border-radius: $radius-2xl;
  padding: $space-8;
  text-align: center;
  box-shadow: $shadow-lg;

  .share-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $gray-200;
    border-top-color: $brand-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto $space-4;
  }

  .share-status {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .card-icon {
    display: block;
    font-size: 48px;
    margin-bottom: $space-4;
  }

  .card-title {
    display: block;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $space-2;
    word-break: break-all;
  }

  .card-desc {
    display: block;
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $space-6;
  }

  &.error {
    .error-icon {
      display: block;
      font-size: 48px;
      margin-bottom: $space-4;
    }

    .error-title {
      display: block;
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $space-2;
    }

    .error-desc {
      display: block;
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: $space-6;
    }
  }
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: $space-3;

  .password-input {
    width: 100%;
    height: 44px;
    padding: 0 $space-4;
    background: $bg-sunken;
    border: 1px solid $border-subtle;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    color: $text-primary;
    outline: none;

    &:focus {
      border-color: $brand-primary;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }
}

.password-error {
  display: block;
  margin-top: $space-2;
  font-size: $font-size-sm;
  color: $color-danger;
}

.share-btn {
  width: 100%;
  height: 44px;
  background: $brand-gradient;
  border: none;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-inverse;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.download {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    margin-top: $space-2;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
