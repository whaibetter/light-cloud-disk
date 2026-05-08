<template>
  <view class="page">
    <!-- 移动端顶部 -->
    <view class="mobile-header">
      <view class="mobile-header-bg"></view>
      <view class="mobile-header-content">
        <view class="mobile-logo">
          <view class="mobile-logo-icon">
            <text>☁️</text>
          </view>
          <view class="mobile-logo-text">
            <text class="mobile-app-name">轻量云盘</text>
            <text class="mobile-app-desc">{{ fileStore.files.length }} 个文件</text>
          </view>
        </view>
        <view class="mobile-actions">
          <view class="mobile-action-btn" @click="toggleTheme">
            <text>{{ theme === 'dark' ? '☀️' : '🌙' }}</text>
          </view>
          <view class="mobile-action-btn" @click="goToSettings">
            <text>⚙️</text>
          </view>
        </view>
      </view>

      <!-- 移动端搜索 -->
      <view class="mobile-search">
        <view class="mobile-search-box">
          <text class="search-icon">🔍</text>
          <input
            class="mobile-search-input"
            v-model="searchQuery"
            placeholder="搜索文件..."
            placeholder-class="search-placeholder"
            @input="handleSearch"
          />
          <text v-if="searchQuery" class="search-clear" @click="clearSearch">✕</text>
        </view>
        <view class="mobile-sort-btn" @click="showSortPanel = true">
          <text>↕️</text>
        </view>
      </view>
    </view>

    <!-- 移动端文件列表 -->
    <view class="mobile-content">
      <!-- 空状态 -->
      <view v-if="filteredFiles.length === 0 && !fileStore.loading" class="empty-state">
        <view class="empty-illustration">
          <view class="empty-circle">
            <text class="empty-icon">📭</text>
          </view>
        </view>
        <text class="empty-title">暂无文件</text>
        <text class="empty-desc">点击下方按钮上传文件</text>
      </view>

      <!-- 文件列表 -->
      <view v-if="filteredFiles.length > 0" class="mobile-file-list">
        <view
          v-for="(file, index) in filteredFiles"
          :key="file.id"
          class="mobile-file-item"
          @click="handleItemClick(file)"
        >
          <view class="mobile-file-icon" :style="{ background: getFileGradient(file.mimetype) }">
            <text>{{ getFileIcon(file.mimetype) }}</text>
          </view>
          <view class="mobile-file-info">
            <text class="mobile-file-name">{{ file.originalName }}</text>
            <text class="mobile-file-meta">{{ formatSize(file.size) }} · {{ formatDate(file.uploadTime) }}</text>
          </view>
          <view class="mobile-file-actions">
            <view class="mobile-action-icon share" @click.stop="openShareModal(file)">
              <text>🔗</text>
            </view>
            <view class="mobile-action-icon download" @click.stop="handleDownload(file)">
              <text>↓</text>
            </view>
            <view class="mobile-action-icon delete" @click.stop="handleDelete(file)">
              <text>×</text>
            </view>
          </view>
        </view>
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
          <view class="nav-item active">
            <text class="nav-icon">📁</text>
            <text class="nav-text">所有文件</text>
            <text class="nav-badge">{{ fileStore.files.length }}</text>
          </view>
          <view class="nav-item" @click="goToSettings">
            <text class="nav-icon">⚙️</text>
            <text class="nav-text">设置</text>
          </view>
        </view>

        <view class="sidebar-stats">
          <view class="stat-card">
            <text class="stat-label">存储空间</text>
            <text class="stat-value">{{ formatSize(totalSize) }}</text>
            <view class="stat-bar">
              <view class="stat-bar-fill" :style="{ width: storagePercent + '%' }"></view>
            </view>
          </view>
        </view>

        <view class="sidebar-upload">
          <view class="sidebar-upload-btn" @click="handleUpload">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传文件</text>
          </view>
        </view>
      </view>

      <!-- 主内容区 -->
      <view class="main-content">
        <view class="desktop-topbar">
          <view class="topbar-left">
            <text class="topbar-title">所有文件</text>
            <text class="topbar-count">{{ filteredFiles.length }} 个项目</text>
          </view>
          <view class="topbar-right">
            <view class="topbar-search">
              <text class="search-icon">🔍</text>
              <input
                class="topbar-search-input"
                v-model="searchQuery"
                placeholder="搜索文件..."
                placeholder-class="search-placeholder"
                @input="handleSearch"
              />
            </view>
            <view class="topbar-actions">
              <view class="theme-btn" @click="toggleTheme">
                <text>{{ theme === 'dark' ? '☀️' : '🌙' }}</text>
              </view>
              <view
                class="view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <text>☰</text>
              </view>
              <view
                class="view-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <text>☷</text>
              </view>
              <view class="sort-btn" @click="showSortPanel = true">
                <text>↕️</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 筛选标签 -->
        <view class="filter-bar">
          <scroll-view scroll-x class="filter-scroll">
            <view class="filter-tags">
              <view
                class="filter-tag"
                :class="{ active: selectedTypes.length === 0 }"
                @click="clearTypeFilter"
              >
                <text>全部</text>
              </view>
              <view
                v-for="type in fileTypeFilters"
                :key="type.value"
                class="filter-tag"
                :class="{ active: selectedTypes.includes(type.value) }"
                @click="toggleTypeFilter(type.value)"
              >
                <text class="tag-icon">{{ type.icon }}</text>
                <text>{{ type.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 文件列表区域 -->
        <view class="files-area">
          <!-- 空状态 -->
          <view v-if="filteredFiles.length === 0 && !fileStore.loading" class="empty-state">
            <view class="empty-illustration">
              <view class="empty-circle">
                <text class="empty-icon">📭</text>
              </view>
            </view>
            <text class="empty-title">暂无文件</text>
            <text class="empty-desc">点击上传按钮开始管理您的文件</text>
            <view class="empty-action" @click="handleUpload">
              <text class="action-icon">+</text>
              <text>上传文件</text>
            </view>
          </view>

          <!-- 列表视图 -->
          <view v-if="viewMode === 'list' && filteredFiles.length > 0" class="list-view">
            <view class="list-header">
              <view class="header-name sortable" @click="toggleSort('name')">
                <text>名称</text>
                <text v-if="fileStore.sortBy === 'name'" class="sort-indicator">{{ fileStore.sortOrder === 'asc' ? '↑' : '↓' }}</text>
              </view>
              <view class="header-size sortable" @click="toggleSort('size')">
                <text>大小</text>
                <text v-if="fileStore.sortBy === 'size'" class="sort-indicator">{{ fileStore.sortOrder === 'asc' ? '↑' : '↓' }}</text>
              </view>
              <view class="header-time sortable" @click="toggleSort('time')">
                <text>修改时间</text>
                <text v-if="fileStore.sortBy === 'time'" class="sort-indicator">{{ fileStore.sortOrder === 'asc' ? '↑' : '↓' }}</text>
              </view>
              <text class="header-actions">操作</text>
            </view>
            <view
              v-for="(file, index) in filteredFiles"
              :key="file.id"
              class="list-row"
              @click="handleItemClick(file)"
            >
              <view class="row-name">
                <view class="file-icon" :style="{ background: getFileGradient(file.mimetype) }">
                  <text>{{ getFileIcon(file.mimetype) }}</text>
                </view>
                <text class="file-name">{{ file.originalName }}</text>
              </view>
              <text class="row-size">{{ formatSize(file.size) }}</text>
              <text class="row-time">{{ formatDate(file.uploadTime) }}</text>
              <view class="row-actions">
                <view class="action-btn share" @click.stop="openShareModal(file)">
                  <text>🔗</text>
                </view>
                <view class="action-btn download" @click.stop="handleDownload(file)">
                  <text>↓</text>
                </view>
                <view class="action-btn delete" @click.stop="handleDelete(file)">
                  <text>×</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 网格视图 -->
          <view v-if="viewMode === 'grid' && filteredFiles.length > 0" class="grid-view">
            <view
              v-for="(file, index) in filteredFiles"
              :key="file.id"
              class="grid-card"
              @click="handleItemClick(file)"
            >
              <view class="card-icon" :style="{ background: getFileGradient(file.mimetype) }">
                <text>{{ getFileIcon(file.mimetype) }}</text>
              </view>
              <text class="card-name">{{ file.originalName }}</text>
              <text class="card-meta">{{ formatSize(file.size) }}</text>
              <view class="card-actions">
                <view class="action-btn share" @click.stop="openShareModal(file)">
                  <text>🔗</text>
                </view>
                <view class="action-btn download" @click.stop="handleDownload(file)">
                  <text>↓</text>
                </view>
                <view class="action-btn delete" @click.stop="handleDelete(file)">
                  <text>×</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 移动端底部操作栏 -->
    <view class="mobile-bottom-bar">
      <view class="mobile-upload-btn" @click="handleUpload">
        <text class="upload-icon">+</text>
        <text class="upload-text">上传文件</text>
      </view>
      <view class="mobile-tabbar">
        <view class="tab-item active">
          <text class="tab-icon">📁</text>
          <text class="tab-text">文件</text>
        </view>
        <view class="tab-item" @click="goToSettings">
          <text class="tab-icon">⚙️</text>
          <text class="tab-text">设置</text>
        </view>
      </view>
    </view>

    <!-- 排序面板 -->
    <view v-if="showSortPanel" class="modal-overlay" @click="showSortPanel = false">
      <view class="sort-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">排序方式</text>
          <view class="modal-close" @click="showSortPanel = false">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-option"
            :class="{ active: fileStore.sortBy === option.value }"
            @click="setSort(option.value)"
          >
            <text class="option-icon">{{ option.icon }}</text>
            <text class="option-text">{{ option.label }}</text>
            <text v-if="fileStore.sortBy === option.value" class="option-check">✓</text>
          </view>
          <view class="sort-divider"></view>
          <view class="sort-direction">
            <view
              class="direction-btn"
              :class="{ active: fileStore.sortOrder === 'desc' }"
              @click="setSortOrder('desc')"
            >
              <text>降序 ↓</text>
            </view>
            <view
              class="direction-btn"
              :class="{ active: fileStore.sortOrder === 'asc' }"
              @click="setSortOrder('asc')"
            >
              <text>升序 ↑</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 上传面板 -->
    <view v-if="showUploadPanel" class="modal-overlay" @click="closeUploadPanel">
      <view class="upload-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择上传方式</text>
          <view class="modal-close" @click="closeUploadPanel">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="upload-option" @click="chooseImage">
            <view class="option-icon-wrapper image">
              <text>🖼️</text>
            </view>
            <view class="option-info">
              <text class="option-title">上传图片</text>
              <text class="option-desc">从相册选择图片</text>
            </view>
          </view>
          <view class="upload-option" @click="chooseFileAction">
            <view class="option-icon-wrapper file">
              <text>📁</text>
            </view>
            <view class="option-info">
              <text class="option-title">上传文件</text>
              <text class="option-desc">选择任意文件</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 上传进度 -->
    <view v-if="uploading" class="modal-overlay">
      <view class="progress-modal">
        <view class="progress-spinner"></view>
        <text class="progress-title">正在上传</text>
        <text class="progress-percent">{{ uploadProgress }}%</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: uploadProgress + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 分享面板 -->
    <view v-if="showSharePanel" class="modal-overlay" @click="closeSharePanel">
      <view class="share-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">分享文件</text>
          <view class="modal-close" @click="closeSharePanel">
            <text>✕</text>
          </view>
        </view>
        <view class="modal-body">
          <!-- 当前分享的文件名 -->
          <view class="share-file-info">
            <text class="share-file-name">{{ shareFile?.originalName }}</text>
          </view>

          <!-- 分享链接显示 -->
          <view v-if="shareLink" class="share-link-section">
            <text class="share-link-label">分享链接</text>
            <view class="share-link-box">
              <text class="share-link-url" selectable>{{ shareLink }}</text>
              <view class="share-link-copy" @click="copyShareLink">
                <text>{{ shareCopied ? '已复制' : '复制' }}</text>
              </view>
            </view>
            <view v-if="shareHasPassword" class="share-password-display">
              <text class="share-password-label">提取密码：</text>
              <text class="share-password-value">{{ sharePasswordPlain }}</text>
            </view>
          </view>

          <!-- 分享设置 -->
          <view class="share-settings">
            <text class="share-section-title">分享设置</text>

            <!-- 密码设置 -->
            <view class="share-field">
              <text class="share-field-label">访问密码（可选）</text>
              <input
                class="share-field-input"
                v-model="sharePassword"
                placeholder="留空则无需密码"
                :password="!showSharePassword"
              />
              <view class="share-password-toggle" @click="showSharePassword = !showSharePassword">
                <text>{{ showSharePassword ? '🙈' : '👁️' }}</text>
              </view>
            </view>

            <!-- 有效期设置 -->
            <view class="share-field">
              <text class="share-field-label">有效期</text>
              <view class="share-expire-options">
                <view
                  v-for="opt in expireOptions"
                  :key="opt.value"
                  class="expire-option"
                  :class="{ active: shareExpireHours === opt.value }"
                  @click="shareExpireHours = opt.value"
                >
                  <text>{{ opt.label }}</text>
                </view>
              </view>
            </view>

            <!-- 生成按钮 -->
            <view class="share-generate-btn" @click="generateShareLink">
              <text>{{ shareLink ? '重新生成链接' : '生成分享链接' }}</text>
            </view>
          </view>

          <!-- 已有分享列表 -->
          <view v-if="existingShares.length > 0" class="share-existing">
            <text class="share-section-title">已有分享（{{ existingShares.length }}）</text>
            <view
              v-for="share in existingShares"
              :key="share.token"
              class="share-item"
              :class="{ expired: share.expired }"
            >
              <view class="share-item-info">
                <view class="share-item-row">
                  <text class="share-item-token">{{ share.token }}</text>
                  <view v-if="!share.expired" class="share-item-copy" @click="copyExistingShareLink(share.token)">
                    <text>复制</text>
                  </view>
                </view>
                <view class="share-item-tags">
                  <text class="share-tag" :class="share.hasPassword ? 'tag-locked' : 'tag-unlocked'">
                    {{ share.hasPassword ? '🔒 有密码' : '🔓 无密码' }}
                  </text>
                  <text class="share-tag" :class="share.expired ? 'tag-expired' : (share.expireAt ? 'tag-limited' : 'tag-permanent')">
                    {{ share.expired ? '⏰ 已过期' : (share.expireAt ? '⏳ 限时 · ' + formatExpireTime(share.expireAt) : '♾️ 永久') }}
                  </text>
                </view>
              </view>
              <view class="share-item-delete" @click="deleteExistingShare(share.token)">
                <text>🗑️</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useFileStore, useConfigStore } from '@/stores'
import { fileApi } from '@/api/modules/file'
import { chooseFile } from '@/utils/file'
import { formatFileSize, formatDate, getFileIcon, getFileIconColor } from '@/utils'
import type { FileInfo, ShareInfo } from '@/api/types'

const fileStore = useFileStore()
const configStore = useConfigStore()

const searchQuery = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const theme = ref<'light' | 'dark'>('light')
const refreshing = ref(false)
const showUploadPanel = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const showSortPanel = ref(false)
const selectedTypes = ref<string[]>([])
const statusBarHeight = ref(0)

// 分享相关
const showSharePanel = ref(false)
const shareFile = ref<FileInfo | null>(null)
const shareLink = ref('')
const sharePassword = ref('')
const sharePasswordPlain = ref('')
const shareHasPassword = ref(false)
const shareExpireHours = ref<number | null>(null)
const showSharePassword = ref(false)
const shareCopied = ref(false)
const existingShares = ref<ShareInfo[]>([])

const expireOptions = [
  { label: '永久', value: null },
  { label: '1小时', value: 1 },
  { label: '24小时', value: 24 },
  { label: '7天', value: 168 },
  { label: '30天', value: 720 },
]

const fileTypeFilters = [
  { label: '图片', value: 'image', icon: '🖼️' },
  { label: '视频', value: 'video', icon: '🎬' },
  { label: '音频', value: 'audio', icon: '🎵' },
  { label: '文档', value: 'document', icon: '📄' },
  { label: '压缩包', value: 'archive', icon: '📦' },
]

const sortOptions = [
  { label: '上传时间', value: 'time' as const, icon: '🕐' },
  { label: '文件名称', value: 'name' as const, icon: '🔤' },
  { label: '文件大小', value: 'size' as const, icon: '📏' },
]

const totalSize = computed(() => {
  return fileStore.files.reduce((sum, file) => sum + (file.size || 0), 0)
})

const storagePercent = computed(() => {
  const maxStorage = 1024 * 1024 * 1024 // 1GB
  return Math.min((totalSize.value / maxStorage) * 100, 100)
})

const filteredFiles = computed(() => {
  let result = [...fileStore.files]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f => f.originalName.toLowerCase().includes(query))
  }

  if (selectedTypes.value.length > 0) {
    result = result.filter(f => {
      const type = getFileType(f.mimetype)
      return selectedTypes.value.includes(type)
    })
  }

  result.sort((a, b) => {
    let comparison = 0
    switch (fileStore.sortBy) {
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName)
        break
      case 'time':
        comparison = new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
    }
    return fileStore.sortOrder === 'asc' ? comparison : -comparison
  })

  return result
})

function getFileType(mimetype: string): string {
  if (!mimetype) return 'other'
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('document') ||
      mimetype.includes('excel') || mimetype.includes('spreadsheet') || mimetype.includes('powerpoint') ||
      mimetype.includes('presentation') || mimetype.includes('text')) return 'document'
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar') ||
      mimetype.includes('gzip') || mimetype.includes('7z')) return 'archive'
  return 'other'
}

function getFileGradient(mimetype: string): string {
  const type = getFileType(mimetype)
  const gradients: Record<string, string> = {
    image: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    video: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
    audio: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    document: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    archive: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    other: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
  }
  return gradients[type] || gradients.other
}

function formatSize(bytes: number): string {
  return formatFileSize(bytes)
}

function goToSettings() {
  uni.switchTab({ url: '/pages/settings/index' })
}

function toggleTypeFilter(type: string) {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  } else {
    selectedTypes.value.push(type)
  }
}

function clearTypeFilter() {
  selectedTypes.value = []
}

function setSort(field: 'name' | 'time' | 'size') {
  fileStore.setSort(field, fileStore.sortOrder)
}

function toggleSort(field: 'name' | 'time' | 'size') {
  if (fileStore.sortBy === field) {
    fileStore.setSort(field, fileStore.sortOrder === 'asc' ? 'desc' : 'asc')
  } else {
    fileStore.setSort(field, 'desc')
  }
}

function setSortOrder(order: 'asc' | 'desc') {
  fileStore.setSort(fileStore.sortBy, order)
  showSortPanel.value = false
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  viewMode.value = configStore.viewMode as 'list' | 'grid'
  theme.value = configStore.theme as 'light' | 'dark'

  if (!configStore.isConfigValid()) {
    uni.showModal({
      title: '配置提示',
      content: '首次使用请先配置服务器地址和 API Key',
      showCancel: false,
      success: () => {
        uni.switchTab({ url: '/pages/settings/index' })
      }
    })
  } else {
    loadFiles()
  }
})

function toggleTheme() {
  const newTheme = theme.value === 'light' ? 'dark' : 'light'
  theme.value = newTheme
  configStore.setTheme(newTheme)
}

onShow(() => {
  loadFiles()
})

async function loadFiles() {
  try {
    await fileStore.fetchFiles()
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  }
}

function handleSearch() {
  fileStore.setSearchQuery(searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
  fileStore.setSearchQuery('')
}

function handleItemClick(file: FileInfo) {
  handleDownload(file)
}

function handleDownload(file: FileInfo) {
  const url = fileApi.getDownloadUrl(file.storedName, configStore.serverUrl) + '?apiKey=' + encodeURIComponent(configStore.apiKey)
  // #ifdef H5
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.click()
  // #endif
  // #ifndef H5
  uni.showToast({ title: '正在下载...', icon: 'none' })
  // #endif
}

async function handleDelete(file: FileInfo) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 "${file.originalName}" 吗？`,
    confirmColor: '#EF4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          await fileStore.deleteFile(file.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (error: any) {
          uni.showToast({ title: error.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 分享功能
async function openShareModal(file: FileInfo) {
  shareFile.value = file
  shareLink.value = ''
  sharePassword.value = ''
  sharePasswordPlain.value = ''
  shareHasPassword.value = false
  shareExpireHours.value = null
  showSharePassword.value = false
  shareCopied.value = false
  showSharePanel.value = true

  // 加载已有分享
  try {
    const res = await fileApi.getShares(file.storedName)
    existingShares.value = res.shares || []
  } catch {
    existingShares.value = []
  }
}

function closeSharePanel() {
  showSharePanel.value = false
  shareFile.value = null
  shareLink.value = ''
}

async function generateShareLink() {
  if (!shareFile.value) return

  try {
    const res = await fileApi.createShare(
      shareFile.value.storedName,
      sharePassword.value || undefined,
      shareExpireHours.value || undefined
    )
    shareLink.value = res.shareUrl
    shareHasPassword.value = res.hasPassword
    sharePasswordPlain.value = sharePassword.value
    shareCopied.value = false

    // 刷新已有分享列表
    const sharesRes = await fileApi.getShares(shareFile.value.storedName)
    existingShares.value = sharesRes.shares || []

    uni.showToast({ title: '分享链接已生成', icon: 'success' })
  } catch (error: any) {
    uni.showToast({ title: error.message || '生成失败', icon: 'none' })
  }
}

function copyShareLink() {
  if (!shareLink.value) return
  // #ifdef H5
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareLink.value).then(() => {
      shareCopied.value = true
      uni.showToast({ title: '已复制', icon: 'success' })
      setTimeout(() => { shareCopied.value = false }, 2000)
    }).catch(() => {
      fallbackCopy(shareLink.value)
    })
  } else {
    fallbackCopy(shareLink.value)
  }
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: shareLink.value,
    success: () => {
      shareCopied.value = true
      setTimeout(() => { shareCopied.value = false }, 2000)
    }
  })
  // #endif
}

// #ifdef H5
function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    shareCopied.value = true
    uni.showToast({ title: '已复制', icon: 'success' })
    setTimeout(() => { shareCopied.value = false }, 2000)
  } catch {
    uni.showToast({ title: '复制失败，请手动复制', icon: 'none' })
  }
  document.body.removeChild(textarea)
}
// #endif

async function deleteExistingShare(token: string) {
  uni.showModal({
    title: '确认删除',
    content: '删除后该分享链接将立即失效，确定要删除吗？',
    confirmColor: '#EF4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          await fileApi.deleteShare(token)
          existingShares.value = existingShares.value.filter(s => s.token !== token)
          uni.showToast({ title: '已删除，链接已失效', icon: 'success' })
        } catch (error: any) {
          uni.showToast({ title: error.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}

function copyExistingShareLink(token: string) {
  const url = `${configStore.serverUrl}/cloud/#/pages/share/index?token=${token}`
  // #ifdef H5
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }).catch(() => {
      fallbackCopy(url)
    })
  } else {
    fallbackCopy(url)
  }
  // #endif
  // #ifndef H5
  uni.setClipboardData({ data: url })
  // #endif
}

function formatExpireTime(expireAt: string): string {
  const now = new Date()
  const expire = new Date(expireAt)
  const diff = expire.getTime() - now.getTime()

  // 格式化为 YYYY-MM-DD HH:mm
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${expire.getFullYear()}-${pad(expire.getMonth() + 1)}-${pad(expire.getDate())} ${pad(expire.getHours())}:${pad(expire.getMinutes())}`

  if (diff <= 0) return `已于 ${dateStr} 过期`

  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  let remainStr = ''
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    remainStr = `（剩余 ${days} 天）`
  } else if (hours > 0) {
    remainStr = `（剩余 ${hours} 小时 ${minutes} 分钟）`
  } else {
    remainStr = `（剩余 ${minutes} 分钟）`
  }

  return `${dateStr} 过期 ${remainStr}`
}

function handleUpload() {
  showUploadPanel.value = true
}

function closeUploadPanel() {
  showUploadPanel.value = false
}

async function chooseImage() {
  closeUploadPanel()
  // #ifdef H5
  const fileResults = await chooseFile({ type: 'image', multiple: true })
  if (fileResults && fileResults.length > 0) {
    await uploadFiles(fileResults)
  }
  // #endif
  // #ifndef H5
  uni.chooseImage({
    count: 9,
    success: (res) => {
      const fileResults = res.tempFilePaths.map(path => ({
        path,
        name: path.split('/').pop() || 'unknown'
      }))
      uploadFiles(fileResults)
    }
  })
  // #endif
}

async function chooseFileAction() {
  closeUploadPanel()
  const fileResults = await chooseFile({ multiple: true })
  if (fileResults && fileResults.length > 0) {
    await uploadFiles(fileResults)
  }
}

async function uploadFiles(fileResults: Array<{path: string, name: string, file?: File}>) {
  uploading.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < fileResults.length; i++) {
      await fileStore.uploadFile(fileResults[i].path, (progress) => {
        uploadProgress.value = Math.round(((i + progress / 100) / fileResults.length) * 100)
      }, fileResults[i].file)
    }
    uni.showToast({ title: `成功上传 ${fileResults.length} 个文件`, icon: 'success' })
    await loadFiles()
  } catch (error: any) {
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

// ========== 移动端顶部 ==========
.mobile-header {
  display: block;
  position: relative;
  background: $brand-gradient;
  padding: $space-4;
  padding-top: calc(#{$space-4} + #{$safe-top});

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
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: $space-3;

    .mobile-logo-icon {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: $radius-lg;
      @include flex-center;
      font-size: 22px;
    }

    .mobile-logo-text {
      .mobile-app-name {
        display: block;
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-inverse;
      }

      .mobile-app-desc {
        display: block;
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .mobile-actions {
    display: flex;
    gap: $space-2;

    .mobile-action-btn {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: $radius-full;
      @include flex-center;
      font-size: 18px;
    }
  }

  .mobile-search {
    position: relative;
    display: flex;
    align-items: center;
    gap: $space-2;

    .mobile-search-box {
      flex: 1;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: $radius-full;
      padding: 0 $space-4;
      height: 44px;
      box-shadow: $shadow-md;

      .search-icon {
        font-size: 16px;
        margin-right: $space-2;
      }

      .mobile-search-input {
        flex: 1;
        height: 100%;
        font-size: $font-size-base;
      }

      .search-placeholder {
        color: $text-tertiary;
      }

      .search-clear {
        padding: $space-1;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .mobile-sort-btn {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      @include flex-center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: $radius-full;
      box-shadow: $shadow-md;
      font-size: 18px;
      cursor: pointer;

      &:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
    }
  }
}

// ========== 移动端内容区 ==========
.mobile-content {
  flex: 1;
  display: block;
  overflow-y: auto;
  padding-bottom: 140px; // 为底部栏留空间

  @include respond-above('md') {
    display: none;
  }
}

// ========== 移动端文件列表 ==========
.mobile-file-list {
  padding: $space-3;
}

.mobile-file-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  background: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $space-2;
  box-shadow: $shadow-xs;

  .mobile-file-icon {
    width: 44px;
    height: 44px;
    border-radius: $radius-md;
    @include flex-center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .mobile-file-info {
    flex: 1;
    min-width: 0;

    .mobile-file-name {
      display: block;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mobile-file-meta {
      display: block;
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-top: 2px;
    }
  }

  .mobile-file-actions {
    display: flex;
    gap: $space-2;
    flex-shrink: 0;

    .mobile-action-icon {
      width: 32px;
      height: 32px;
      border-radius: $radius-full;
      @include flex-center;
      font-size: 14px;
      font-weight: $font-weight-bold;

      &.share {
        background: rgba($color-success, 0.1);
        color: $color-success;
      }

      &.download {
        background: rgba($color-info, 0.1);
        color: $color-info;
      }

      &.delete {
        background: rgba($color-danger, 0.1);
        color: $color-danger;
      }
    }
  }
}

// ========== 移动端底部栏 ==========
.mobile-bottom-bar {
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-fixed;
  background: $bg-card;
  border-top: 1px solid $border-subtle;
  padding-bottom: $safe-bottom;

  @include respond-above('md') {
    display: none;
  }

  .mobile-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    height: 44px;
    margin: $space-2 $space-3;
    background: $brand-gradient;
    border-radius: $radius-full;
    color: $text-inverse;
    font-weight: $font-weight-semibold;
    box-shadow: $shadow-colored;

    .upload-icon {
      font-size: 18px;
    }
  }

  .mobile-tabbar {
    display: flex;
    border-top: 1px solid $border-subtle;

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
}

// ========== 桌面端布局 ==========
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
        flex: 1;
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
      }

      .nav-badge {
        font-size: $font-size-xs;
        background: $bg-sunken;
        padding: 2px 8px;
        border-radius: $radius-full;
        color: $text-secondary;
      }
    }
  }

  .sidebar-stats {
    padding: $space-4;

    .stat-card {
      background: $bg-sunken;
      border-radius: $radius-lg;
      padding: $space-4;

      .stat-label {
        display: block;
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-bottom: $space-1;
      }

      .stat-value {
        display: block;
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin-bottom: $space-3;
      }

      .stat-bar {
        height: 4px;
        background: $gray-200;
        border-radius: $radius-full;
        overflow: hidden;

        .stat-bar-fill {
          height: 100%;
          background: $brand-gradient;
          border-radius: $radius-full;
          transition: width 0.5s ease;
        }
      }
    }
  }

  .sidebar-upload {
    padding: $space-4;

    .sidebar-upload-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $space-2;
      height: 44px;
      background: $brand-gradient;
      border-radius: $radius-lg;
      color: $text-inverse;
      font-weight: $font-weight-semibold;
      cursor: pointer;
      transition: $transition-base;
      box-shadow: $shadow-colored;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 20px -5px rgba($brand-primary, 0.4);
      }

      .upload-icon {
        font-size: 18px;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .desktop-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-4 $space-6;
    background: $bg-card;
    border-bottom: 1px solid $border-subtle;
    position: sticky;
    top: 0;
    z-index: $z-sticky;

    .topbar-left {
      .topbar-title {
        display: block;
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
      }

      .topbar-count {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: $space-4;

      .topbar-search {
        display: flex;
        align-items: center;
        background: $bg-sunken;
        border-radius: $radius-full;
        padding: 0 $space-4;
        height: 40px;
        width: 280px;

        .search-icon {
          font-size: 14px;
          margin-right: $space-2;
          color: $text-tertiary;
        }

        .topbar-search-input {
          flex: 1;
          height: 100%;
          font-size: $font-size-sm;
          background: transparent;
        }

        .search-placeholder {
          color: $text-tertiary;
        }
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: $space-1;
        background: $bg-sunken;
        border-radius: $radius-lg;
        padding: $space-1;

        .theme-btn {
          width: 36px;
          height: 36px;
          border-radius: $radius-md;
          @include flex-center;
          font-size: 16px;
          color: $text-secondary;
          cursor: pointer;
          transition: $transition-base;
          margin-right: $space-1;

          &:hover {
            color: $text-primary;
            background: $bg-card;
          }
        }

        .view-btn {
          width: 36px;
          height: 36px;
          border-radius: $radius-md;
          @include flex-center;
          font-size: 16px;
          color: $text-secondary;
          cursor: pointer;
          transition: $transition-base;

          &:hover {
            color: $text-primary;
          }

          &.active {
            background: $bg-card;
            color: $brand-primary;
            box-shadow: $shadow-xs;
          }
        }

        .sort-btn {
          width: 36px;
          height: 36px;
          border-radius: $radius-md;
          @include flex-center;
          font-size: 16px;
          color: $text-secondary;
          cursor: pointer;
          transition: $transition-base;
          margin-left: $space-1;

          &:hover {
            color: $text-primary;
            background: $bg-card;
          }
        }
      }
    }
  }

  .filter-bar {
    padding: $space-4 $space-6;
    background: $bg-card;
    border-bottom: 1px solid $border-subtle;

    .filter-scroll {
      white-space: nowrap;
    }

    .filter-tags {
      display: inline-flex;
      gap: $space-2;

      .filter-tag {
        display: inline-flex;
        align-items: center;
        gap: $space-1;
        padding: $space-2 $space-4;
        background: $bg-sunken;
        border-radius: $radius-full;
        font-size: $font-size-sm;
        color: $text-secondary;
        cursor: pointer;
        transition: $transition-base;

        &:hover {
          background: $gray-200;
          color: $text-primary;
        }

        .tag-icon {
          font-size: 14px;
        }

        &.active {
          background: $brand-primary;
          color: $text-inverse;
        }
      }
    }
  }

  .files-area {
    flex: 1;
    padding: $space-6;
    overflow-y: auto;
  }
}

// ========== 空状态 ==========
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-16 $space-8;

  .empty-illustration {
    margin-bottom: $space-8;

    .empty-circle {
      width: 120px;
      height: 120px;
      background: $brand-gradient-subtle;
      border-radius: $radius-full;
      @include flex-center;

      .empty-icon {
        font-size: 48px;
      }
    }
  }

  .empty-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $space-2;
  }

  .empty-desc {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: $space-8;
  }

  .empty-action {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-3 $space-6;
    background: $brand-gradient;
    border-radius: $radius-full;
    color: $text-inverse;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: $transition-base;
    box-shadow: $shadow-colored;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -5px rgba($brand-primary, 0.4);
    }

    .action-icon {
      font-size: 18px;
    }
  }
}

// ========== 桌面端列表视图 ==========
.list-view {
  @include card;
  overflow: hidden;

  .list-header {
    display: none;

    @include respond-above('md') {
      display: flex;
      align-items: center;
      padding: $space-3 $space-4;
      background: $bg-sunken;
      border-bottom: 1px solid $border-subtle;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: $text-secondary;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      .header-name { flex: 1; min-width: 0; }
      .header-size { width: 100px; text-align: right; }
      .header-time { width: 150px; text-align: right; }
      .header-actions { width: 100px; text-align: right; }

      .sortable {
        cursor: pointer;
        user-select: none;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        transition: color 0.2s;

        &:hover {
          color: $brand-primary;
        }

        .sort-indicator {
          font-size: 12px;
          color: $brand-primary;
        }
      }
    }
  }

  .list-row {
    display: flex;
    align-items: center;
    padding: $space-3 $space-4;
    border-bottom: 1px solid $border-subtle;
    cursor: pointer;
    transition: $transition-base;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: $bg-sunken;
    }

    .row-name {
      flex: 1;
      display: flex;
      align-items: center;
      gap: $space-3;
      min-width: 0;

      .file-icon {
        width: 40px;
        height: 40px;
        border-radius: $radius-md;
        @include flex-center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .file-name {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
        @include text-truncate;
      }
    }

    .row-size,
    .row-time {
      display: none;

      @include respond-above('md') {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .row-size {
      @include respond-above('md') {
        width: 100px;
        text-align: right;
      }
    }

    .row-time {
      @include respond-above('md') {
        width: 150px;
        text-align: right;
      }
    }

    .row-actions {
      display: flex;
      gap: $space-2;
      margin-left: $space-4;

      @include respond-above('md') {
        width: 100px;
        justify-content: flex-end;
      }

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: $radius-full;
        @include flex-center;
        font-size: 14px;
        font-weight: $font-weight-bold;
        cursor: pointer;
        transition: $transition-base;

        &.download {
          background: rgba($color-info, 0.1);
          color: $color-info;

          &:hover {
            background: rgba($color-info, 0.2);
          }
        }

        &.delete {
          background: rgba($color-danger, 0.1);
          color: $color-danger;

          &:hover {
            background: rgba($color-danger, 0.2);
          }
        }
      }
    }
  }
}

// ========== 桌面端网格视图 ==========
.grid-view {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-4;

  @include respond-above('sm') {
    grid-template-columns: repeat(3, 1fr);
  }

  @include respond-above('lg') {
    grid-template-columns: repeat(4, 1fr);
  }

  @include respond-above('xl') {
    grid-template-columns: repeat(5, 1fr);
  }

  .grid-card {
    @include card;
    @include card-hover;
    padding: $space-4;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: $radius-lg;
      @include flex-center;
      font-size: 28px;
      margin-bottom: $space-3;
    }

    .card-name {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
      text-align: center;
      @include text-truncate;
      width: 100%;
      margin-bottom: $space-1;
    }

    .card-meta {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-bottom: $space-3;
    }

    .card-actions {
      display: flex;
      gap: $space-2;
      opacity: 0;
      transition: $transition-base;

      .action-btn {
        width: 28px;
        height: 28px;
        border-radius: $radius-full;
        @include flex-center;
        font-size: 12px;
        font-weight: $font-weight-bold;
        cursor: pointer;
        transition: $transition-base;

        &.download {
          background: rgba($color-info, 0.1);
          color: $color-info;

          &:hover {
            background: rgba($color-info, 0.2);
          }
        }

        &.delete {
          background: rgba($color-danger, 0.1);
          color: $color-danger;

          &:hover {
            background: rgba($color-danger, 0.2);
          }
        }
      }
    }

    &:hover .card-actions {
      opacity: 1;
    }
  }
}

// ========== 模态框 ==========
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: $z-modal-backdrop;
  @include flex-center;

  @include respond-below('md') {
    align-items: flex-end;
  }
}

.sort-modal,
.upload-modal,
.progress-modal,
.share-modal {
  background: $bg-card;
  border-radius: $radius-2xl;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  animation: fadeInScale $duration-slow $ease-out;

  @include respond-below('md') {
    width: 100%;
    border-radius: $radius-2xl $radius-2xl 0 0;
    animation: slideUp $duration-slow $ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-5 $space-6;
    border-bottom: 1px solid $border-subtle;

    .modal-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .modal-close {
      width: 32px;
      height: 32px;
      border-radius: $radius-full;
      @include flex-center;
      font-size: 16px;
      color: $text-secondary;
      cursor: pointer;
      transition: $transition-base;

      &:hover {
        background: $bg-sunken;
        color: $text-primary;
      }
    }
  }

  .modal-body {
    padding: $space-4 $space-6 $space-6;
  }
}

.sort-option {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-4;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: $transition-base;
  margin-bottom: $space-1;

  &:hover {
    background: $bg-sunken;
  }

  .option-icon {
    font-size: 18px;
  }

  .option-text {
    flex: 1;
    font-size: $font-size-base;
    color: $text-primary;
  }

  .option-check {
    font-size: 16px;
    color: $brand-primary;
    font-weight: $font-weight-bold;
  }

  &.active {
    background: $brand-gradient-subtle;
  }
}

.sort-divider {
  height: 1px;
  background: $border-subtle;
  margin: $space-3 0;
}

.sort-direction {
  display: flex;
  gap: $space-2;

  .direction-btn {
    flex: 1;
    height: 40px;
    background: $bg-sunken;
    border-radius: $radius-lg;
    @include flex-center;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      background: $gray-200;
    }

    &.active {
      background: $brand-primary;
      color: $text-inverse;
    }
  }
}

.upload-option {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: $transition-base;
  margin-bottom: $space-2;

  &:hover {
    background: $bg-sunken;
  }

  .option-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    @include flex-center;
    font-size: 24px;

    &.image {
      background: linear-gradient(135deg, #F472B6 0%, #EC4899 100%);
    }

    &.file {
      background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
    }
  }

  .option-info {
    .option-title {
      display: block;
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .option-desc {
      display: block;
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.progress-modal {
  padding: $space-10 $space-8;
  text-align: center;

  .progress-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid $gray-200;
    border-top-color: $brand-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto $space-4;
  }

  .progress-title {
    display: block;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $space-1;
  }

  .progress-percent {
    display: block;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $brand-primary;
    margin-bottom: $space-4;
  }

  .progress-bar {
    height: 6px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: $brand-gradient;
      border-radius: $radius-full;
      transition: width 0.3s ease;
    }
  }
}

.share-modal {
  .modal-body {
    padding: $space-4 $space-6 $space-6;
  }

  .share-file-info {
    margin-bottom: $space-4;
    padding-bottom: $space-3;
    border-bottom: 1px solid $border-subtle;

    .share-file-name {
      font-size: $font-size-sm;
      color: $text-secondary;
      word-break: break-all;
    }
  }

  .share-link-section {
    margin-bottom: $space-4;
    padding: $space-3;
    background: $bg-sunken;
    border-radius: $radius-lg;

    .share-link-label {
      display: block;
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-bottom: $space-2;
    }

    .share-link-box {
      display: flex;
      align-items: center;
      gap: $space-2;
      background: $bg-card;
      border: 1px solid $border-subtle;
      border-radius: $radius-md;
      padding: $space-2 $space-3;

      .share-link-url {
        flex: 1;
        font-size: $font-size-xs;
        color: $text-primary;
        word-break: break-all;
        min-width: 0;
      }

      .share-link-copy {
        flex-shrink: 0;
        padding: $space-1 $space-3;
        background: $brand-primary;
        color: white;
        border-radius: $radius-md;
        font-size: $font-size-xs;
        cursor: pointer;

        &:active {
          opacity: 0.8;
        }
      }
    }

    .share-password-display {
      margin-top: $space-2;
      display: flex;
      align-items: center;
      gap: $space-1;

      .share-password-label {
        font-size: $font-size-xs;
        color: $text-secondary;
      }

      .share-password-value {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        color: $brand-primary;
        letter-spacing: 2px;
      }
    }
  }

  .share-settings {
    margin-bottom: $space-4;

    .share-section-title {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $space-3;
    }

    .share-field {
      margin-bottom: $space-3;

      .share-field-label {
        display: block;
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-bottom: $space-1;
      }

      .share-field-input {
        width: 100%;
        height: 40px;
        padding: 0 $space-3;
        background: $bg-sunken;
        border: 1px solid $border-subtle;
        border-radius: $radius-md;
        font-size: $font-size-sm;
        color: $text-primary;
        box-sizing: border-box;
      }
    }

    .share-expire-options {
      display: flex;
      flex-wrap: wrap;
      gap: $space-2;

      .expire-option {
        padding: $space-1 $space-3;
        background: $bg-sunken;
        border: 1px solid $border-subtle;
        border-radius: $radius-full;
        font-size: $font-size-xs;
        color: $text-secondary;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
          background: rgba($brand-primary, 0.1);
          border-color: $brand-primary;
          color: $brand-primary;
        }
      }
    }

    .share-generate-btn {
      margin-top: $space-4;
      width: 100%;
      height: 44px;
      @include flex-center;
      background: $brand-gradient;
      color: white;
      border-radius: $radius-lg;
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      cursor: pointer;

      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }
    }
  }

  .share-existing {
    border-top: 1px solid $border-subtle;
    padding-top: $space-4;

    .share-section-title {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $space-3;
    }

    .share-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: $space-3;
      background: $bg-sunken;
      border-radius: $radius-md;
      margin-bottom: $space-2;
      border: 1px solid $border-subtle;

      &.expired {
        opacity: 0.6;
      }

      .share-item-info {
        flex: 1;
        min-width: 0;

        .share-item-row {
          display: flex;
          align-items: center;
          gap: $space-2;
          margin-bottom: $space-2;

          .share-item-token {
            font-size: $font-size-xs;
            font-family: monospace;
            color: $text-primary;
            word-break: break-all;
          }

          .share-item-copy {
            flex-shrink: 0;
            padding: 2px $space-2;
            background: rgba($brand-primary, 0.1);
            color: $brand-primary;
            border-radius: $radius-sm;
            font-size: $font-size-xs;
            cursor: pointer;

            &:active {
              opacity: 0.7;
            }
          }
        }

        .share-item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: $space-1;

          .share-tag {
            display: inline-flex;
            align-items: center;
            padding: 2px $space-2;
            border-radius: $radius-full;
            font-size: 11px;
            gap: 2px;

            &.tag-locked {
              background: rgba($color-warning, 0.1);
              color: $color-warning;
            }

            &.tag-unlocked {
              background: rgba($color-success, 0.1);
              color: $color-success;
            }

            &.tag-permanent {
              background: rgba($color-info, 0.1);
              color: $color-info;
            }

            &.tag-limited {
              background: rgba($brand-primary, 0.1);
              color: $brand-primary;
            }

            &.tag-expired {
              background: rgba($text-tertiary, 0.1);
              color: $text-tertiary;
            }
          }
        }
      }

      .share-item-delete {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        @include flex-center;
        border-radius: $radius-full;
        color: $text-secondary;
        cursor: pointer;
        margin-left: $space-2;

        &:hover {
          background: rgba($color-danger, 0.1);
          color: $color-danger;
        }
      }
    }
  }
}

.share-password-toggle {
  position: absolute;
  right: $space-3;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
</style>
