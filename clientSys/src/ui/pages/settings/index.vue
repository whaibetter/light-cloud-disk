<template>
  <div class="page">
    <!-- 移动端头部 -->
    <div class="mobile-header">
      <div class="mobile-header-bg"></div>
      <div class="mobile-header-content">
        <span class="mobile-page-title">设置</span>
        <span class="mobile-page-desc">管理您的应用配置</span>
      </div>
    </div>

    <!-- 桌面端布局 -->
    <div class="desktop-layout">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="sidebar-logo-icon">
              <span>☁️</span>
            </div>
            <span class="sidebar-logo-text">轻量云盘</span>
          </div>
        </div>

        <div class="sidebar-nav">
          <div class="nav-item" @click="goBack">
            <span class="nav-icon">📁</span>
            <span class="nav-text">所有文件</span>
          </div>
          <div class="nav-item active">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">设置</span>
          </div>
        </div>

        <div class="sidebar-footer">
          <span class="sidebar-version">v3.0.0</span>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <div class="desktop-topbar">
          <div class="topbar-left">
            <span class="topbar-title">设置</span>
            <span class="topbar-desc">管理您的应用配置</span>
          </div>
        </div>

        <div class="settings-area">
          <div class="settings-grid">
            <!-- 服务器配置 -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon server">
                  <span>🌐</span>
                </div>
                <div class="card-title-group">
                  <span class="card-title">服务器配置</span>
                  <span class="card-desc">连接到您的云盘服务器</span>
                </div>
              </div>

              <div class="card-body">
                <div class="form-group">
                  <label class="form-label">服务器地址</label>
                  <div class="input-wrapper">
                    <input
                      v-model="serverUrl"
                      class="form-input"
                      placeholder="https://example.com"
                      type="url"
                    />
                    <span v-if="serverUrl" class="input-clear" @click="serverUrl = ''">✕</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">API 密钥</label>
                  <div class="input-wrapper">
                    <input
                      v-model="apiKey"
                      class="form-input"
                      placeholder="输入您的 API 密钥"
                      :type="showApiKey ? 'text' : 'password'"
                    />
                    <div class="input-action" @click="showApiKey = !showApiKey">
                      <span>{{ showApiKey ? '🙈' : '👁️' }}</span>
                    </div>
                  </div>
                </div>

                <div class="test-section">
                  <button class="test-btn" :disabled="testing" @click="testConnection">
                    <span class="btn-icon">{{ testing ? '⏳' : '🔗' }}</span>
                    <span>{{ testing ? '测试中...' : '测试连接' }}</span>
                  </button>

                  <div v-if="testResult" :class="['test-result', testResult.status]">
                    <span class="result-icon">{{ testResult.status === 'success' ? '✅' : '❌' }}</span>
                    <span class="result-text">{{ testResult.message }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 显示设置 -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon display">
                  <span>🎨</span>
                </div>
                <div class="card-title-group">
                  <span class="card-title">显示设置</span>
                  <span class="card-desc">自定义界面外观</span>
                </div>
              </div>

              <div class="card-body">
                <div class="form-group">
                  <label class="form-label">视图模式</label>
                  <div class="mode-selector">
                    <div
                      class="mode-option"
                      :class="{ active: viewMode === 'list' }"
                      @click="setViewMode('list')"
                    >
                      <span class="mode-icon">☰</span>
                      <span class="mode-text">列表视图</span>
                    </div>
                    <div
                      class="mode-option"
                      :class="{ active: viewMode === 'grid' }"
                      @click="setViewMode('grid')"
                    >
                      <span class="mode-icon">☷</span>
                      <span class="mode-text">网格视图</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 存储信息 -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon storage">
                  <span>💾</span>
                </div>
                <div class="card-title-group">
                  <span class="card-title">存储信息</span>
                  <span class="card-desc">查看存储使用情况</span>
                </div>
              </div>

              <div class="card-body">
                <div class="storage-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ fileStore.fileCount }}</span>
                    <span class="stat-label">文件总数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ formatFileSize(fileStore.totalSize) }}</span>
                    <span class="stat-label">已用空间</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions-bar">
            <button class="save-btn" @click="saveConfig">
              <span class="btn-icon">💾</span>
              <span>保存配置</span>
            </button>
            <button class="reset-btn" @click="resetConfig">
              <span class="btn-icon">🔄</span>
              <span>恢复默认</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端内容 -->
    <div class="mobile-content">
      <!-- 服务器配置 -->
      <div class="mobile-section">
        <div class="section-header">
          <div class="section-icon server">
            <span>🌐</span>
          </div>
          <span class="section-title">服务器配置</span>
        </div>

        <div class="section-body">
          <div class="form-group">
            <label class="form-label">服务器地址</label>
            <div class="input-wrapper">
              <input
                v-model="serverUrl"
                class="form-input"
                placeholder="https://example.com"
                type="url"
              />
              <span v-if="serverUrl" class="input-clear" @click="serverUrl = ''">✕</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">API 密钥</label>
            <div class="input-wrapper">
              <input
                v-model="apiKey"
                class="form-input"
                placeholder="输入您的 API 密钥"
                :type="showApiKey ? 'text' : 'password'"
              />
              <div class="input-action" @click="showApiKey = !showApiKey">
                <span>{{ showApiKey ? '🙈' : '👁️' }}</span>
              </div>
            </div>
          </div>

          <button class="test-btn" :disabled="testing" @click="testConnection">
            <span class="btn-icon">{{ testing ? '⏳' : '🔗' }}</span>
            <span>{{ testing ? '测试中...' : '测试连接' }}</span>
          </button>

          <div v-if="testResult" :class="['test-result', testResult.status]">
            <span class="result-icon">{{ testResult.status === 'success' ? '✅' : '❌' }}</span>
            <span class="result-text">{{ testResult.message }}</span>
          </div>
        </div>
      </div>

      <!-- 显示设置 -->
      <div class="mobile-section">
        <div class="section-header">
          <div class="section-icon display">
            <span>🎨</span>
          </div>
          <span class="section-title">显示设置</span>
        </div>

        <div class="section-body">
          <div class="form-group">
            <label class="form-label">视图模式</label>
            <div class="mode-selector">
              <div
                class="mode-option"
                :class="{ active: viewMode === 'list' }"
                @click="setViewMode('list')"
              >
                <span class="mode-icon">☰</span>
                <span class="mode-text">列表</span>
              </div>
              <div
                class="mode-option"
                :class="{ active: viewMode === 'grid' }"
                @click="setViewMode('grid')"
              >
                <span class="mode-icon">☷</span>
                <span class="mode-text">网格</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 存储信息 -->
      <div class="mobile-section">
        <div class="section-header">
          <div class="section-icon storage">
            <span>💾</span>
          </div>
          <span class="section-title">存储信息</span>
        </div>

        <div class="section-body">
          <div class="storage-stats">
            <div class="stat-item">
              <span class="stat-value">{{ fileStore.fileCount }}</span>
              <span class="stat-label">文件总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatFileSize(fileStore.totalSize) }}</span>
              <span class="stat-label">已用空间</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mobile-actions">
        <button class="save-btn" @click="saveConfig">
          <span class="btn-icon">💾</span>
          <span>保存配置</span>
        </button>
        <button class="reset-btn" @click="resetConfig">
          <span class="btn-icon">🔄</span>
          <span>恢复默认</span>
        </button>
      </div>

      <!-- 版本信息 -->
      <div class="mobile-footer">
        <div class="footer-icon">
          <span>☁️</span>
        </div>
        <span class="footer-name">轻量云盘</span>
        <span class="footer-version">v3.0.0</span>
      </div>
    </div>

    <!-- 移动端底部导航 -->
    <div class="mobile-tabbar">
      <div class="tab-item" @click="goBack">
        <span class="tab-icon">📁</span>
        <span class="tab-text">文件</span>
      </div>
      <div class="tab-item active">
        <span class="tab-icon">⚙️</span>
        <span class="tab-text">设置</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { platform } from '../../../platform/context'
import { formatFileSize } from '../../../core/utils/format'

const configStore = platform.getConfigStore()
const fileStore = platform.getFileStore()
const ui = platform.getUI()
const nav = platform.getNavigation()
const network = platform.getNetwork()

const serverUrl = ref('')
const apiKey = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const showApiKey = ref(false)
const testing = ref(false)
const testResult = ref<{ status: 'success' | 'error'; message: string } | null>(null)

onMounted(async () => {
  serverUrl.value = configStore.serverUrl
  apiKey.value = configStore.apiKey
  viewMode.value = configStore.viewMode

  if (!configStore.isConfigValid) {
    ui.showToast({ title: '请先配置服务器地址和 API Key', icon: 'warning', duration: 3000 })
  }
})

function goBack() {
  nav.push('/')
}

function setViewMode(mode: 'list' | 'grid') {
  viewMode.value = mode
  configStore.setViewMode(mode)
}

async function testConnection() {
  if (!serverUrl.value) {
    ui.showToast({ title: '请输入服务器地址', icon: 'warning' })
    return
  }

  testing.value = true
  testResult.value = null

  try {
    // 开发环境使用相对路径，通过 Vite 代理转发，避免 CORS
    const url = import.meta.env.DEV
      ? '/api/health'
      : `${serverUrl.value.replace(/\/+$/, '')}/api/health`
    await network.request<{ success: boolean }>({
      url,
      method: 'GET',
      timeout: 10000
    })
    testResult.value = { status: 'success', message: '连接成功！服务器响应正常' }
  } catch (error: any) {
    testResult.value = { status: 'error', message: error.message || '连接失败' }
  } finally {
    testing.value = false
  }
}

async function saveConfig() {
  if (!serverUrl.value || !apiKey.value) {
    ui.showToast({ title: '请填写完整配置', icon: 'warning' })
    return
  }

  await configStore.setServerUrl(serverUrl.value)
  await configStore.setApiKey(apiKey.value)
  ui.showToast({ title: '配置已保存', icon: 'success' })
}

async function resetConfig() {
  const confirmed = await ui.showModal({
    title: '确认恢复',
    content: '确定要清空配置吗？这将清除服务器地址和 API Key。',
    confirmText: '确认',
    cancelText: '取消'
  })

  if (!confirmed) return

  await configStore.resetToDefault()
  serverUrl.value = ''
  apiKey.value = ''
  viewMode.value = 'list'
  ui.showToast({ title: '配置已清空', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

// ========== 移动端样式 ==========
.mobile-header {
  display: block;
  position: relative;
  background: $brand-gradient;
  padding: $space-6 $space-4;
  padding-top: calc(#{$space-6} + #{$safe-top});

  @include respond-above('md') {
    display: none;
  }

  .mobile-header-bg {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%);
  }

  .mobile-header-content {
    position: relative;
  }

  .mobile-page-title {
    display: block;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-inverse;
    margin-bottom: $space-1;
  }

  .mobile-page-desc {
    display: block;
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.7);
  }
}

.mobile-content {
  flex: 1;
  padding: $space-4;
  padding-bottom: calc(70px + #{$safe-bottom});

  @include respond-above('md') {
    display: none;
  }
}

.mobile-section {
  @include card;
  margin-bottom: $space-4;
  overflow: hidden;

  .section-header {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-4;
    border-bottom: 1px solid $border-subtle;

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: $radius-md;
      @include flex-center;
      font-size: 18px;

      &.server {
        background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
      }

      &.display {
        background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
      }

      &.storage {
        background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
      }
    }

    .section-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .section-body {
    padding: $space-4;
  }
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin-bottom: $space-6;

  @include respond-above('md') {
    display: none;
  }
}

.mobile-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-8 0;

  @include respond-above('md') {
    display: none;
  }

  .footer-icon {
    width: 48px;
    height: 48px;
    background: $brand-gradient;
    border-radius: $radius-lg;
    @include flex-center;
    font-size: 24px;
    margin-bottom: $space-3;
    box-shadow: $shadow-colored;
  }

  .footer-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $space-1;
  }

  .footer-version {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.mobile-tabbar {
  display: flex;
  background: $bg-card;
  border-top: 1px solid $border-subtle;
  padding-bottom: $safe-bottom;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-fixed;

  @include respond-above('md') {
    display: none;
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: $space-2 0;
    color: $text-tertiary;

    &.active {
      color: $brand-primary;
    }

    .tab-icon {
      font-size: 20px;
    }

    .tab-text {
      font-size: $font-size-xs;
    }
  }
}

// ========== 桌面端样式 ==========
.desktop-layout {
  display: none;
  flex: 1;

  @include respond-above('md') {
    display: flex;
  }
}

.sidebar {
  width: $sidebar-width;
  background: $bg-card;
  border-right: 1px solid $border-subtle;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;

  .sidebar-header {
    padding: $space-6;
    border-bottom: 1px solid $border-subtle;

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: $space-3;

      .sidebar-logo-icon {
        width: 40px;
        height: 40px;
        background: $brand-gradient;
        border-radius: $radius-lg;
        @include flex-center;
        font-size: 20px;
        box-shadow: $shadow-colored;
      }

      .sidebar-logo-text {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $text-primary;
      }
    }
  }

  .sidebar-nav {
    padding: $space-4 $space-3;
    flex: 1;

    .nav-item {
      display: flex;
      align-items: center;
      gap: $space-3;
      padding: $space-3 $space-4;
      border-radius: $radius-lg;
      color: $text-secondary;
      cursor: pointer;
      transition: $transition-base;
      margin-bottom: $space-1;

      &:hover {
        background: $bg-sunken;
        color: $text-primary;
      }

      &.active {
        background: $brand-gradient-subtle;
        color: $brand-primary;
      }

      .nav-icon {
        font-size: 18px;
      }

      .nav-text {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
      }
    }
  }

  .sidebar-footer {
    padding: $space-4 $space-6;
    border-top: 1px solid $border-subtle;

    .sidebar-version {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .desktop-topbar {
    padding: $space-6;
    background: $bg-card;
    border-bottom: 1px solid $border-subtle;

    .topbar-left {
      .topbar-title {
        display: block;
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
      }

      .topbar-desc {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }

  .settings-area {
    flex: 1;
    padding: $space-6;
    overflow-y: auto;
  }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: $space-6;
  margin-bottom: $space-6;
}

.settings-card {
  @include card;
  overflow: hidden;

  .card-header {
    display: flex;
    align-items: center;
    gap: $space-4;
    padding: $space-5 $space-6;
    border-bottom: 1px solid $border-subtle;

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: $radius-lg;
      @include flex-center;
      font-size: 22px;

      &.server {
        background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
      }

      &.display {
        background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
      }

      &.storage {
        background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
      }
    }

    .card-title-group {
      .card-title {
        display: block;
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .card-desc {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }

  .card-body {
    padding: $space-6;
  }
}

// ========== 表单样式 ==========
.form-group {
  margin-bottom: $space-5;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $space-2;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    background: $bg-sunken;
    border-radius: $radius-lg;
    padding: 0 $space-4;
    border: 1px solid transparent;
    transition: $transition-base;

    &:focus-within {
      background: $bg-card;
      border-color: $brand-primary;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .form-input {
      flex: 1;
      height: 44px;
      font-size: $font-size-base;
      color: $text-primary;
      background: transparent;
      border: none;
      outline: none;
    }

    .input-clear,
    .input-action {
      padding: $space-2;
      font-size: 14px;
      color: $text-secondary;
      cursor: pointer;

      &:hover {
        color: $text-primary;
      }
    }
  }
}

.mode-selector {
  display: flex;
  gap: $space-3;

  .mode-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-2;
    padding: $space-4;
    background: $bg-sunken;
    border-radius: $radius-lg;
    border: 2px solid transparent;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      background: $gray-200;
    }

    .mode-icon {
      font-size: 24px;
    }

    .mode-text {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    &.active {
      background: $brand-gradient-subtle;
      border-color: $brand-primary;

      .mode-text {
        color: $brand-primary;
        font-weight: $font-weight-medium;
      }
    }
  }
}

.test-section {
  margin-top: $space-5;
}

.test-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  width: 100%;
  height: 44px;
  background: $brand-gradient;
  border-radius: $radius-lg;
  color: $text-inverse;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: $transition-base;
  box-shadow: $shadow-colored;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-icon {
    font-size: 16px;
  }
}

.test-result {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: $space-4;
  padding: $space-4;
  border-radius: $radius-lg;
  animation: fadeInUp $duration-slow $ease-out;

  .result-icon {
    font-size: 18px;
  }

  .result-text {
    font-size: $font-size-sm;
  }

  &.success {
    background: rgba($color-success, 0.1);
    color: $color-success;
  }

  &.error {
    background: rgba($color-danger, 0.1);
    color: $color-danger;
  }
}

.storage-stats {
  display: flex;
  gap: $space-4;

  .stat-item {
    flex: 1;
    text-align: center;
    padding: $space-4;
    background: $bg-sunken;
    border-radius: $radius-lg;

    .stat-value {
      display: block;
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $brand-primary;
      margin-bottom: $space-1;
    }

    .stat-label {
      display: block;
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

.actions-bar {
  display: flex;
  gap: $space-4;

  button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    height: 48px;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      transform: translateY(-1px);
    }

    .btn-icon {
      font-size: 16px;
    }
  }

  .save-btn {
    background: $brand-gradient;
    color: $text-inverse;
    box-shadow: $shadow-colored;

    &:hover {
      box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.4);
    }
  }

  .reset-btn {
    background: $bg-card;
    color: $text-secondary;
    border: 1px solid $border-default;

    &:hover {
      background: $bg-sunken;
      color: $text-primary;
    }
  }
}
</style>
