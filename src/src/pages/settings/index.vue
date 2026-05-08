<template>
  <view class="page">
    <!-- 移动端头部 -->
    <view class="mobile-header">
      <view class="mobile-header-bg"></view>
      <view class="mobile-header-content">
        <text class="mobile-page-title">设置</text>
        <text class="mobile-page-desc">管理您的应用配置</text>
      </view>
    </view>
    
    <!-- 桌面端布局 -->
    <view class="desktop-layout">
      <!-- 侧边栏 -->
      <view class="sidebar">
        <view class="sidebar-header">
          <view class="sidebar-logo">
            <view class="sidebar-logo-icon">
              <text>☁️</text>
            </view>
            <text class="sidebar-logo-text">轻量云盘</text>
          </view>
        </view>
        
        <view class="sidebar-nav">
          <view class="nav-item" @click="goToFiles">
            <text class="nav-icon">📁</text>
            <text class="nav-text">所有文件</text>
          </view>
          <view class="nav-item active">
            <text class="nav-icon">⚙️</text>
            <text class="nav-text">设置</text>
          </view>
        </view>
        
        <view class="sidebar-footer">
          <text class="sidebar-version">v2.0.0</text>
        </view>
      </view>
      
      <!-- 主内容区 -->
      <view class="main-content">
        <view class="desktop-topbar">
          <view class="topbar-left">
            <text class="topbar-title">设置</text>
            <text class="topbar-desc">管理您的应用配置</text>
          </view>
        </view>
        
        <view class="settings-area">
          <view class="settings-grid">
            <!-- 服务器配置 -->
            <view class="settings-card">
              <view class="card-header">
                <view class="card-icon server">
                  <text>🌐</text>
                </view>
                <view class="card-title-group">
                  <text class="card-title">服务器配置</text>
                  <text class="card-desc">连接到您的云盘服务器</text>
                </view>
              </view>
              
              <view class="card-body">
                <view class="form-group">
                  <label class="form-label">服务器地址</label>
                  <view class="input-wrapper">
                    <input 
                      class="form-input" 
                      v-model="serverUrl"
                      placeholder="https://example.com"
                      placeholder-class="input-placeholder"
                      type="url"
                    />
                    <text v-if="serverUrl" class="input-clear" @click="serverUrl = ''">✕</text>
                  </view>
                </view>
                
                <view class="form-group">
                  <label class="form-label">API 密钥</label>
                  <view class="input-wrapper">
                    <input 
                      class="form-input" 
                      v-model="apiKey"
                      placeholder="输入您的 API 密钥"
                      placeholder-class="input-placeholder"
                      :password="!showApiKey"
                    />
                    <view class="input-action" @click="showApiKey = !showApiKey">
                      <text>{{ showApiKey ? '🙈' : '👁️' }}</text>
                    </view>
                  </view>
                </view>
                
                <view class="test-section">
                  <button class="test-btn" @click="testConnection" :loading="testing">
                    <text class="btn-icon">{{ testing ? '⏳' : '🔗' }}</text>
                    <text>{{ testing ? '测试中...' : '测试连接' }}</text>
                  </button>
                  
                  <view v-if="testResult" class="test-result" :class="testResult.status">
                    <text class="result-icon">{{ testResult.status === 'success' ? '✅' : '❌' }}</text>
                    <text class="result-text">{{ testResult.message }}</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 显示设置 -->
            <view class="settings-card">
              <view class="card-header">
                <view class="card-icon display">
                  <text>🎨</text>
                </view>
                <view class="card-title-group">
                  <text class="card-title">显示设置</text>
                  <text class="card-desc">自定义界面外观</text>
                </view>
              </view>
              
              <view class="card-body">
                <view class="form-group">
                  <label class="form-label">视图模式</label>
                  <view class="mode-selector">
                    <view 
                      class="mode-option" 
                      :class="{ active: viewMode === 'list' }"
                      @click="setViewMode('list')"
                    >
                      <text class="mode-icon">☰</text>
                      <text class="mode-text">列表视图</text>
                    </view>
                    <view 
                      class="mode-option" 
                      :class="{ active: viewMode === 'grid' }"
                      @click="setViewMode('grid')"
                    >
                      <text class="mode-icon">☷</text>
                      <text class="mode-text">网格视图</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 存储信息 -->
            <view class="settings-card">
              <view class="card-header">
                <view class="card-icon storage">
                  <text>💾</text>
                </view>
                <view class="card-title-group">
                  <text class="card-title">存储信息</text>
                  <text class="card-desc">查看存储使用情况</text>
                </view>
              </view>
              
              <view class="card-body">
                <view class="storage-stats">
                  <view class="stat-item">
                    <text class="stat-value">{{ fileStore.files.length }}</text>
                    <text class="stat-label">文件总数</text>
                  </view>
                  <view class="stat-item">
                    <text class="stat-value">{{ formatSize(totalSize) }}</text>
                    <text class="stat-label">已用空间</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 操作按钮 -->
          <view class="actions-bar">
            <button class="save-btn" @click="saveConfig">
              <text class="btn-icon">💾</text>
              <text>保存配置</text>
            </button>
            <button class="reset-btn" @click="resetConfig">
              <text class="btn-icon">🔄</text>
              <text>恢复默认</text>
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 移动端内容 -->
    <view class="mobile-content">
      <!-- 服务器配置 -->
      <view class="mobile-section">
        <view class="section-header">
          <view class="section-icon server">
            <text>🌐</text>
          </view>
          <text class="section-title">服务器配置</text>
        </view>
        
        <view class="section-body">
          <view class="form-group">
            <label class="form-label">服务器地址</label>
            <view class="input-wrapper">
              <input 
                class="form-input" 
                v-model="serverUrl"
                placeholder="https://example.com"
                placeholder-class="input-placeholder"
                type="url"
              />
              <text v-if="serverUrl" class="input-clear" @click="serverUrl = ''">✕</text>
            </view>
          </view>
          
          <view class="form-group">
            <label class="form-label">API 密钥</label>
            <view class="input-wrapper">
              <input 
                class="form-input" 
                v-model="apiKey"
                placeholder="输入您的 API 密钥"
                placeholder-class="input-placeholder"
                :password="!showApiKey"
              />
              <view class="input-action" @click="showApiKey = !showApiKey">
                <text>{{ showApiKey ? '🙈' : '👁️' }}</text>
              </view>
            </view>
          </view>
          
          <button class="test-btn" @click="testConnection" :loading="testing">
            <text class="btn-icon">{{ testing ? '⏳' : '🔗' }}</text>
            <text>{{ testing ? '测试中...' : '测试连接' }}</text>
          </button>
          
          <view v-if="testResult" class="test-result" :class="testResult.status">
            <text class="result-icon">{{ testResult.status === 'success' ? '✅' : '❌' }}</text>
            <text class="result-text">{{ testResult.message }}</text>
          </view>
        </view>
      </view>
      
      <!-- 显示设置 -->
      <view class="mobile-section">
        <view class="section-header">
          <view class="section-icon display">
            <text>🎨</text>
          </view>
          <text class="section-title">显示设置</text>
        </view>
        
        <view class="section-body">
          <view class="form-group">
            <label class="form-label">视图模式</label>
            <view class="mode-selector">
              <view 
                class="mode-option" 
                :class="{ active: viewMode === 'list' }"
                @click="setViewMode('list')"
              >
                <text class="mode-icon">☰</text>
                <text class="mode-text">列表</text>
              </view>
              <view 
                class="mode-option" 
                :class="{ active: viewMode === 'grid' }"
                @click="setViewMode('grid')"
              >
                <text class="mode-icon">☷</text>
                <text class="mode-text">网格</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 存储信息 -->
      <view class="mobile-section">
        <view class="section-header">
          <view class="section-icon storage">
            <text>💾</text>
          </view>
          <text class="section-title">存储信息</text>
        </view>
        
        <view class="section-body">
          <view class="storage-stats">
            <view class="stat-item">
              <text class="stat-value">{{ fileStore.files.length }}</text>
              <text class="stat-label">文件总数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ formatSize(totalSize) }}</text>
              <text class="stat-label">已用空间</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="mobile-actions">
        <button class="save-btn" @click="saveConfig">
          <text class="btn-icon">💾</text>
          <text>保存配置</text>
        </button>
        <button class="reset-btn" @click="resetConfig">
          <text class="btn-icon">🔄</text>
          <text>恢复默认</text>
        </button>
      </view>
      
      <!-- 版本信息 -->
      <view class="mobile-footer">
        <view class="footer-icon">
          <text>☁️</text>
        </view>
        <text class="footer-name">轻量云盘</text>
        <text class="footer-version">v2.0.0</text>
      </view>
    </view>
    
    <!-- 移动端底部导航 -->
    <view class="mobile-tabbar">
      <view class="tab-item" @click="goToFiles">
        <text class="tab-icon">📁</text>
        <text class="tab-text">文件</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">⚙️</text>
        <text class="tab-text">设置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfigStore, useFileStore } from '@/stores'
import { apiClient } from '@/api/client'
import { formatFileSize } from '@/utils'

const configStore = useConfigStore()
const fileStore = useFileStore()

const serverUrl = ref('')
const apiKey = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const showApiKey = ref(false)
const testing = ref(false)
const testResult = ref<{ status: 'success' | 'error', message: string } | null>(null)

const totalSize = computed(() => {
  return fileStore.files.reduce((sum, file) => sum + (file.size || 0), 0)
})

function formatSize(bytes: number): string {
  return formatFileSize(bytes)
}

onMounted(() => {
  serverUrl.value = configStore.serverUrl
  apiKey.value = configStore.apiKey
  viewMode.value = configStore.viewMode as 'list' | 'grid'
})

function goToFiles() {
  uni.switchTab({ url: '/pages/index/index' })
}

function setViewMode(mode: 'list' | 'grid') {
  viewMode.value = mode
  configStore.setViewMode(mode)
}

async function testConnection() {
  testing.value = true
  testResult.value = null

  try {
    const tempUrl = serverUrl.value.replace(/\/+$/, '')
    uni.request({
      url: tempUrl + '/api/files',
      method: 'GET',
      header: { 'X-API-Key': apiKey.value },
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          testResult.value = { status: 'success', message: '连接成功！服务器响应正常' }
        } else {
          testResult.value = { status: 'error', message: `连接失败：服务器返回 ${res.statusCode}` }
        }
      },
      fail: (err) => {
        testResult.value = { status: 'error', message: `连接失败：${err.errMsg || '网络错误'}` }
      }
    })
  } catch (error: any) {
    testResult.value = { status: 'error', message: `连接失败：${error.message}` }
  } finally {
    testing.value = false
  }
}

function saveConfig() {
  if (!serverUrl.value.trim()) {
    uni.showToast({ title: '请输入服务器地址', icon: 'none' })
    return
  }
  if (!apiKey.value.trim()) {
    uni.showToast({ title: '请输入API密钥', icon: 'none' })
    return
  }

  let url = serverUrl.value.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url
  }
  url = url.replace(/\/+$/, '')

  configStore.setServerUrl(url)
  configStore.setApiKey(apiKey.value.trim())
  uni.showToast({ title: '配置已保存', icon: 'success' })
}

function resetConfig() {
  uni.showModal({
    title: '确认恢复',
    content: '确定要恢复默认配置吗？',
    confirmColor: '#4F46E5',
    success: (res) => {
      if (res.confirm) {
        configStore.resetToDefault()
        serverUrl.value = configStore.serverUrl
        apiKey.value = configStore.apiKey
        viewMode.value = configStore.viewMode as 'list' | 'grid'
        uni.showToast({ title: '已恢复默认配置', icon: 'success' })
      }
    }
  })
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
      box-shadow: 0 0 0 3px rgba($brand-primary, 0.1);
    }
    
    .form-input {
      flex: 1;
      height: 44px;
      font-size: $font-size-base;
      color: $text-primary;
      background: transparent;
    }
    
    .input-placeholder {
      color: $text-tertiary;
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

.switch-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4;
  background: $bg-sunken;
  border-radius: $radius-lg;
  
  .switch-info {
    .switch-label {
      display: block;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }
    
    .switch-desc {
      display: block;
      font-size: $font-size-sm;
      color: $text-secondary;
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
    box-shadow: 0 12px 20px -5px rgba($brand-primary, 0.4);
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
      box-shadow: 0 12px 20px -5px rgba($brand-primary, 0.4);
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
