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
        <!-- 桌面端顶部栏 -->
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
            <!-- 表头 -->
            <view class="list-header">
              <text class="header-name">名称</text>
              <text class="header-size">大小</text>
              <text class="header-time">修改时间</text>
              <text class="header-actions">操作</text>
            </view>
            
            <!-- 文件行 -->
            <view 
              v-for="(file, index) in filteredFiles" 
              :key="file.id"
              class="list-row"
              :style="{ animationDelay: index * 0.03 + 's' }"
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
              :style="{ animationDelay: index * 0.03 + 's' }"
              @click="handleItemClick(file)"
            >
              <view class="card-icon" :style="{ background: getFileGradient(file.mimetype) }">
                <text>{{ getFileIcon(file.mimetype) }}</text>
              </view>
              <text class="card-name">{{ file.originalName }}</text>
              <text class="card-meta">{{ formatSize(file.size) }}</text>
              <view class="card-actions">
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
    
    <!-- 移动端底部上传栏 -->
    <view class="mobile-upload-bar">
      <view class="mobile-upload-btn" @click="handleUpload">
        <text class="upload-icon">+</text>
        <text class="upload-text">上传文件</text>
      </view>
    </view>
    
    <!-- 移动端底部导航 -->
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
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useFileStore, useConfigStore } from '@/stores'
import { fileApi } from '@/api/modules/file'
import { chooseFile } from '@/utils/file'
import { formatFileSize, formatDate, getFileIcon, getFileIconColor } from '@/utils'
import type { FileInfo } from '@/api/types'

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

function setSortOrder(order: 'asc' | 'desc') {
  fileStore.setSort(fileStore.sortBy, order)
  showSortPanel.value = false
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  viewMode.value = configStore.viewMode as 'list' | 'grid'
  theme.value = configStore.theme as 'light' | 'dark'
  loadFiles()
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

function handleUpload() {
  showUploadPanel.value = true
}

function closeUploadPanel() {
  showUploadPanel.value = false
}

async function chooseImage() {
  closeUploadPanel()
  // #ifdef H5
  const filePaths = await chooseFile({ type: 'image', multiple: true })
  if (filePaths && filePaths.length > 0) {
    await uploadFiles(filePaths)
  }
  // #endif
  // #ifndef H5
  uni.chooseImage({
    count: 9,
    success: (res) => {
      uploadFiles(res.tempFilePaths)
    }
  })
  // #endif
}

async function chooseFileAction() {
  closeUploadPanel()
  const filePaths = await chooseFile({ multiple: true })
  if (filePaths && filePaths.length > 0) {
    await uploadFiles(filePaths)
  }
}

async function uploadFiles(filePaths: string[]) {
  uploading.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < filePaths.length; i++) {
      await fileStore.uploadFile(filePaths[i], (progress) => {
        uploadProgress.value = Math.round(((i + progress / 100) / filePaths.length) * 100)
      })
    }
    uni.showToast({ title: `成功上传 ${filePaths.length} 个文件`, icon: 'success' })
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

// ========== 移动端样式 ==========
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
    
    .mobile-search-box {
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
  }
}

.mobile-upload-bar {
  display: block;
  padding: $space-3 $space-4;
  background: $bg-card;
  border-top: 1px solid $border-subtle;
  
  @include respond-above('md') {
    display: none;
  }
  
  .mobile-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    height: 48px;
    background: $brand-gradient;
    border-radius: $radius-full;
    color: $text-inverse;
    font-weight: $font-weight-semibold;
    box-shadow: $shadow-colored;
    
    .upload-icon {
      font-size: 20px;
    }
  }
}

.mobile-tabbar {
  display: flex;
  background: $bg-card;
  border-top: 1px solid $border-subtle;
  padding-bottom: $safe-bottom;
  
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

// ========== 列表视图 ==========
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
    }
  }
  
  .list-row {
    display: flex;
    align-items: center;
    padding: $space-3 $space-4;
    border-bottom: 1px solid $border-subtle;
    cursor: pointer;
    transition: $transition-base;
    animation: fadeInUp $duration-slow $ease-out both;
    
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

// ========== 网格视图 ==========
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
    animation: fadeInUp $duration-slow $ease-out both;
    
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
.progress-modal {
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
</style>
