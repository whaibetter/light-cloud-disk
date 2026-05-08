<template>
  <view class="page-settings">
    <view class="section">
      <view class="section-title">服务器配置</view>
      
      <view class="form-item">
        <view class="form-label">服务器地址</view>
        <input 
          class="form-input" 
          v-model="serverUrl"
          placeholder="请输入服务器地址"
          type="url"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">API密钥</view>
        <input 
          class="form-input" 
          v-model="apiKey"
          placeholder="请输入API密钥"
          password
        />
      </view>
    </view>

    <view class="section">
      <view class="section-title">显示设置</view>
      
      <view class="form-item">
        <view class="form-label">视图模式</view>
        <view class="view-mode-selector">
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="setViewMode('list')"
          >
            列表视图
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="setViewMode('grid')"
          >
            网格视图
          </button>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">主题设置</view>
      
      <view class="form-item">
        <view class="form-label">深色模式</view>
        <switch 
          :checked="theme === 'dark'" 
          @change="toggleTheme"
          color="#4CAF50"
        />
      </view>
    </view>

    <view class="section">
      <view class="section-title">连接测试</view>
      
      <button class="test-btn" @click="testConnection" :loading="testing">
        {{ testing ? '测试中...' : '测试连接' }}
      </button>
      
      <view v-if="testResult" class="test-result" :class="testResult.status">
        {{ testResult.message }}
      </view>
    </view>

    <view class="actions">
      <button class="save-btn" @click="saveConfig">保存配置</button>
      <button class="reset-btn" @click="resetConfig">恢复默认</button>
    </view>

    <view class="version-info">
      <text>轻量云盘 v2.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores'
import { apiClient } from '@/api/client'

const configStore = useConfigStore()

const serverUrl = ref('')
const apiKey = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const theme = ref<'light' | 'dark'>('light')
const testing = ref(false)
const testResult = ref<{ status: 'success' | 'error', message: string } | null>(null)

onMounted(() => {
  serverUrl.value = configStore.serverUrl
  apiKey.value = configStore.apiKey
  viewMode.value = configStore.viewMode as 'list' | 'grid'
  theme.value = configStore.theme as 'light' | 'dark'
})

function setViewMode(mode: 'list' | 'grid') {
  viewMode.value = mode
  configStore.setViewMode(mode)
}

function toggleTheme(e: any) {
  const isDark = e.detail.value
  theme.value = isDark ? 'dark' : 'light'
  configStore.setTheme(isDark ? 'dark' : 'light')
}

async function testConnection() {
  testing.value = true
  testResult.value = null

  try {
    const config = {
      serverUrl: serverUrl.value,
      apiKey: apiKey.value
    }

    const tempUrl = config.serverUrl.replace(/\/+$/, '')
    uni.request({
      url: tempUrl + '/api/files',
      method: 'GET',
      header: {
        'X-API-Key': config.apiKey
      },
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          testResult.value = {
            status: 'success',
            message: '连接成功！服务器响应正常'
          }
        } else {
          testResult.value = {
            status: 'error',
            message: `连接失败：服务器返回 ${res.statusCode}`
          }
        }
      },
      fail: (err) => {
        testResult.value = {
          status: 'error',
          message: `连接失败：${err.errMsg || '网络错误'}`
        }
      }
    })
  } catch (error: any) {
    testResult.value = {
      status: 'error',
      message: `连接失败：${error.message}`
    }
  } finally {
    testing.value = false
  }
}

function saveConfig() {
  if (!serverUrl.value.trim()) {
    uni.showToast({
      title: '请输入服务器地址',
      icon: 'none'
    })
    return
  }

  if (!apiKey.value.trim()) {
    uni.showToast({
      title: '请输入API密钥',
      icon: 'none'
    })
    return
  }

  let url = serverUrl.value.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url
  }
  url = url.replace(/\/+$/, '')

  configStore.setServerUrl(url)
  configStore.setApiKey(apiKey.value.trim())

  uni.showToast({
    title: '配置已保存',
    icon: 'success'
  })
}

function resetConfig() {
  uni.showModal({
    title: '确认恢复',
    content: '确定要恢复默认配置吗？',
    success: (res) => {
      if (res.confirm) {
        configStore.resetToDefault()
        serverUrl.value = configStore.serverUrl
        apiKey.value = configStore.apiKey
        viewMode.value = configStore.viewMode as 'list' | 'grid'
        theme.value = configStore.theme as 'light' | 'dark'
        
        uni.showToast({
          title: '已恢复默认配置',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page-settings {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 32rpx;
  }
}

.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 16rpx;
  }

  .form-input {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333333;
  }
}

.view-mode-selector {
  display: flex;
  gap: 16rpx;

  .mode-btn {
    flex: 1;
    height: 80rpx;
    background: #f5f5f5;
    border: none;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666666;

    &.active {
      background: #4CAF50;
      color: #ffffff;
    }
  }
}

.test-btn {
  width: 100%;
  height: 88rpx;
  background: #2196F3;
  border: none;
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  margin-bottom: 24rpx;
}

.test-result {
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  text-align: center;

  &.success {
    background: #e8f5e9;
    color: #4CAF50;
  }

  &.error {
    background: #ffebee;
    color: #f44336;
  }
}

.actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;

  .save-btn {
    flex: 1;
    height: 96rpx;
    background: #4CAF50;
    border: none;
    border-radius: 48rpx;
    color: #ffffff;
    font-size: 32rpx;
  }

  .reset-btn {
    flex: 1;
    height: 96rpx;
    background: #f5f5f5;
    border: none;
    border-radius: 48rpx;
    color: #666666;
    font-size: 32rpx;
  }
}

.version-info {
  text-align: center;
  margin-top: 64rpx;
  font-size: 24rpx;
  color: #999999;
}
</style>
