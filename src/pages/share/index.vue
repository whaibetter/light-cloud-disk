<template>
  <view class="share-page">
    <!-- 加载中 -->
    <view v-if="loading" class="share-loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误/过期 -->
    <view v-else-if="error" class="share-error">
      <view class="error-icon">
        <text>{{ errorIcon }}</text>
      </view>
      <text class="error-title">{{ errorTitle }}</text>
      <text class="error-desc">{{ error }}</text>
    </view>

    <!-- 需要密码 -->
    <view v-else-if="needPassword && !verified" class="share-password-form">
      <view class="password-icon">
        <text>🔒</text>
      </view>
      <text class="password-title">需要访问密码</text>
      <text class="password-desc">请输入密码以下载文件</text>
      <view class="password-input-wrap">
        <input
          class="password-input"
          v-model="inputPassword"
          placeholder="请输入密码"
          :password="!showPassword"
          @confirm="verifyPassword"
        />
        <view class="password-toggle" @click="showPassword = !showPassword">
          <text>{{ showPassword ? '🙈' : '👁️' }}</text>
        </view>
      </view>
      <view class="password-submit" @click="verifyPassword">
        <text>验证</text>
      </view>
    </view>

    <!-- 可下载 -->
    <view v-else-if="downloadReady" class="share-download">
      <view class="download-icon">
        <text>📁</text>
      </view>
      <text class="download-filename">{{ fileName }}</text>
      <text class="download-size">{{ formatSize(fileSize) }}</text>
      <view class="download-btn" @click="downloadFile">
        <text>下载文件</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fileApi } from '@/api/modules/file'
import { useConfigStore } from '@/stores'
import { formatFileSize } from '@/utils'

const configStore = useConfigStore()

const loading = ref(true)
const error = ref('')
const errorIcon = ref('😕')
const errorTitle = ref('无法访问')
const needPassword = ref(false)
const verified = ref(false)
const downloadReady = ref(false)
const fileName = ref('')
const fileSize = ref(0)
const mimetype = ref('')
const inputPassword = ref('')
const showPassword = ref(false)
const token = ref('')

function formatSize(bytes: number): string {
  return formatFileSize(bytes)
}

function getTokenFromHash(): string {
  // 从 URL hash 中提取 token: #/pages/share/index?token=xxx
  const hash = window.location.hash || ''
  const match = hash.match(/[?&]token=([^&#]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function loadShareInfo() {
  token.value = getTokenFromHash()

  if (!token.value) {
    error.value = '无效的分享链接'
    loading.value = false
    return
  }

  try {
    const res = await fileApi.getShareInfo(token.value)

    if (res.needPassword) {
      needPassword.value = true
      fileName.value = res.fileName || ''
      fileSize.value = res.fileSize || 0
      mimetype.value = res.mimetype || ''
    } else if (res.downloadReady) {
      downloadReady.value = true
      needPassword.value = false
      fileName.value = res.fileName || ''
      fileSize.value = res.fileSize || 0
      mimetype.value = res.mimetype || ''
    }
  } catch (err: any) {
    if (err.message?.includes('expired') || err.message?.includes('过期')) {
      errorIcon.value = '⏰'
      errorTitle.value = '链接已过期'
      error.value = '此分享链接已过期，请联系文件所有者重新分享'
    } else if (err.message?.includes('not found') || err.message?.includes('404')) {
      errorIcon.value = '🔍'
      errorTitle.value = '链接不存在'
      error.value = '此分享链接不存在或已被删除'
    } else {
      error.value = err.message || '加载失败'
    }
  } finally {
    loading.value = false
  }
}

async function verifyPassword() {
  if (!inputPassword.value.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  try {
    const res = await fileApi.verifySharePassword(token.value, inputPassword.value)

    if (res.success && res.downloadReady) {
      verified.value = true
      downloadReady.value = true
      needPassword.value = false
      fileName.value = res.fileName || fileName.value
      fileSize.value = res.fileSize || fileSize.value
      mimetype.value = res.mimetype || mimetype.value
    }
  } catch (err: any) {
    if (err.message?.includes('Invalid password') || err.message?.includes('401')) {
      uni.showToast({ title: '密码错误', icon: 'none' })
    } else {
      uni.showToast({ title: err.message || '验证失败', icon: 'none' })
    }
  }
}

function downloadFile() {
  const url = fileApi.getShareDownloadUrl(token.value, configStore.serverUrl, verified.value ? inputPassword.value : undefined)

  // #ifdef H5
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.value
  link.click()
  // #endif

  // #ifndef H5
  uni.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: () => {
            uni.showToast({ title: '下载成功', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      }
    },
    fail: () => {
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
  // #endif
}

function resetState() {
  loading.value = true
  error.value = ''
  needPassword.value = false
  verified.value = false
  downloadReady.value = false
  inputPassword.value = ''
}

// #ifdef H5
function onHashChange() {
  resetState()
  loadShareInfo()
}
// #endif

onMounted(() => {
  loadShareInfo()
  // #ifdef H5
  window.addEventListener('hashchange', onHashChange)
  // #endif
})

onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('hashchange', onHashChange)
  // #endif
})
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background: $bg-page;
  @include flex-center;
  flex-direction: column;
  padding: $space-8;
}

.share-loading {
  @include flex-center;
  flex-direction: column;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $gray-200;
    border-top-color: $brand-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: $space-4;
  }

  .loading-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.share-error {
  @include flex-center;
  flex-direction: column;
  text-align: center;

  .error-icon {
    font-size: 64px;
    margin-bottom: $space-4;
  }

  .error-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $space-2;
  }

  .error-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    max-width: 300px;
  }
}

.share-password-form {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  width: 100%;
  max-width: 360px;

  .password-icon {
    font-size: 48px;
    margin-bottom: $space-4;
  }

  .password-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $space-2;
  }

  .password-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $space-6;
  }

  .password-input-wrap {
    display: flex;
    align-items: center;
    width: 100%;
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: $radius-lg;
    padding: 0 $space-3;
    margin-bottom: $space-4;

    .password-input {
      flex: 1;
      height: 48px;
      font-size: $font-size-sm;
      color: $text-primary;
    }

    .password-toggle {
      padding: $space-2;
      cursor: pointer;
    }
  }

  .password-submit {
    width: 100%;
    height: 48px;
    @include flex-center;
    background: $brand-gradient;
    color: white;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }
  }
}

.share-download {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  width: 100%;
  max-width: 360px;

  .download-icon {
    font-size: 64px;
    margin-bottom: $space-4;
  }

  .download-filename {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $space-2;
    word-break: break-all;
    max-width: 100%;
  }

  .download-size {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $space-6;
  }

  .download-btn {
    width: 100%;
    height: 48px;
    @include flex-center;
    background: $brand-gradient;
    color: white;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    cursor: pointer;

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
