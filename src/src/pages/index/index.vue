<template>
  <view class="page-index">
    <view class="header">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="search-row">
        <view class="search-bar">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            v-model="searchQuery"
            placeholder="搜索文件..."
            @input="handleSearch"
            @confirm="handleSearch"
          />
          <text v-if="searchQuery" class="clear-icon" @click="clearSearch">✕</text>
        </view>
        <view class="filter-btn" @click="toggleFilterPanel">
          <text>筛选</text>
        </view>
      </view>
      
      <view class="toolbar-row">
        <view class="file-count">
          <text>{{ filteredFiles.length }} 个文件</text>
        </view>
        <view class="toolbar-actions">
          <picker 
            mode="selector" 
            :range="sortOptions" 
            range-key="label"
            :value="sortOptions.findIndex(o => o.value === fileStore.sortBy)"
            @change="handleSortFieldChange"
          >
            <view class="sort-picker">
              <text>{{ getSortLabel(fileStore.sortBy) }}</text>
              <text class="sort-arrow">{{ fileStore.sortOrder === 'desc' ? '↓' : '↑' }}</text>
            </view>
          </picker>
          <view class="view-toggle" @click="toggleViewMode">
            <text>{{ viewMode === 'list' ? '▦' : '☰' }}</text>
          </view>
        </view>
      </view>

      <view v-if="showFilterPanel" class="filter-panel">
        <view class="filter-section">
          <view class="filter-label">文件类型</view>
          <view class="filter-tags">
            <view 
              v-for="type in fileTypeFilters" 
              :key="type.value"
              class="filter-tag"
              :class="{ active: selectedTypes.includes(type.value) }"
              @click="toggleTypeFilter(type.value)"
            >
              {{ type.label }}
            </view>
          </view>
        </view>
        
        <view class="filter-section">
          <view class="filter-label">排序方式</view>
          <view class="filter-tags">
            <view class="filter-tag" :class="{ active: fileStore.sortBy === 'time' }" @click="setSort('time')">上传时间</view>
            <view class="filter-tag" :class="{ active: fileStore.sortBy === 'name' }" @click="setSort('name')">文件名</view>
            <view class="filter-tag" :class="{ active: fileStore.sortBy === 'size' }" @click="setSort('size')">文件大小</view>
          </view>
        </view>

        <view class="filter-section">
          <view class="filter-label">排序方向</view>
          <view class="filter-tags">
            <view class="filter-tag" :class="{ active: fileStore.sortOrder === 'desc' }" @click="setSortOrder('desc')">降序 ↓</view>
            <view class="filter-tag" :class="{ active: fileStore.sortOrder === 'asc' }" @click="setSortOrder('asc')">升序 ↑</view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view 
      class="content" 
      scroll-y 
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <view v-if="filteredFiles.length === 0 && !fileStore.loading" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-message">暂无文件</text>
        <text class="empty-hint">点击下方按钮上传文件</text>
      </view>
      
      <view v-if="viewMode === 'list'" class="list-view">
        <view v-for="file in filteredFiles" :key="file.id" class="list-item" @click="handleItemClick(file)">
          <view class="item-icon" :style="{ backgroundColor: getFileIconColor(file.mimetype) }">
            <text class="icon-emoji">{{ getFileIcon(file.mimetype) }}</text>
          </view>
          <view class="item-info">
            <text class="item-name">{{ file.originalName }}</text>
            <text class="item-meta">{{ formatSize(file.size) }} · {{ formatDate(file.uploadTime) }}</text>
          </view>
          <view class="item-actions">
            <view class="action-btn" @click.stop="handleDownload(file)">
              <text>↓</text>
            </view>
            <view class="action-btn delete" @click.stop="handleDelete(file)">
              <text>×</text>
            </view>
          </view>
        </view>
      </view>
      
      <view v-else class="grid-view">
        <view v-for="file in filteredFiles" :key="file.id" class="grid-item" @click="handleItemClick(file)">
          <view class="grid-icon" :style="{ backgroundColor: getFileIconColor(file.mimetype) }">
            <text class="icon-emoji">{{ getFileIcon(file.mimetype) }}</text>
          </view>
          <text class="grid-name">{{ file.originalName }}</text>
          <text class="grid-meta">{{ formatSize(file.size) }}</text>
          <view class="grid-actions">
            <view class="action-btn small" @click.stop="handleDownload(file)">
              <text>↓</text>
            </view>
            <view class="action-btn small delete" @click.stop="handleDelete(file)">
              <text>×</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="upload-bar">
      <view class="upload-btn" @click="handleUpload">
        <text class="upload-icon">+</text>
        <text class="upload-text">上传文件</text>
      </view>
    </view>

    <view v-if="showUploadPanel" class="upload-modal" @click="closeUploadPanel">
      <view class="upload-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">上传文件</text>
          <view class="close-btn" @click="closeUploadPanel">×</view>
        </view>
        <view class="upload-options">
          <view class="option-btn" @click="chooseImage">
            <text class="option-icon">🖼️</text>
            <text class="option-text">选择图片</text>
          </view>
          <view class="option-btn" @click="chooseFileAction">
            <text class="option-icon">📁</text>
            <text class="option-text">选择文件</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="uploading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">上传中... {{ uploadProgress }}%</text>
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
const refreshing = ref(false)
const showUploadPanel = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const showFilterPanel = ref(false)
const selectedTypes = ref<string[]>([])
const statusBarHeight = ref(0)

const fileTypeFilters = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
  { label: '文档', value: 'document' },
  { label: '压缩包', value: 'archive' },
  { label: '其他', value: 'other' }
]

const sortOptions = [
  { label: '按时间', value: 'time' as const },
  { label: '按名称', value: 'name' as const },
  { label: '按大小', value: 'size' as const }
]

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

function getSortLabel(sortBy: 'name' | 'time' | 'size'): string {
  const map: Record<string, string> = { name: '名称', time: '时间', size: '大小' }
  return map[sortBy] || '时间'
}

function formatSize(bytes: number): string {
  return formatFileSize(bytes)
}

function toggleFilterPanel() {
  showFilterPanel.value = !showFilterPanel.value
}

function toggleTypeFilter(type: string) {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  } else {
    selectedTypes.value.push(type)
  }
}

function handleSortFieldChange(e: any) {
  const field = sortOptions[e.detail.value].value
  fileStore.setSort(field, fileStore.sortOrder)
}

function setSort(field: 'name' | 'time' | 'size') {
  if (fileStore.sortBy === field) {
    fileStore.setSort(field, fileStore.sortOrder === 'desc' ? 'asc' : 'desc')
  } else {
    fileStore.setSort(field, 'desc')
  }
}

function setSortOrder(order: 'asc' | 'desc') {
  fileStore.setSort(fileStore.sortBy, order)
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  viewMode.value = configStore.viewMode as 'list' | 'grid'
  loadFiles()
})

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

async function handleRefresh() {
  refreshing.value = true
  await loadFiles()
  refreshing.value = false
}

function handleSearch() {
  fileStore.setSearchQuery(searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
  fileStore.setSearchQuery('')
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
  configStore.setViewMode(viewMode.value)
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
    content: `确定要删除文件 "${file.originalName}" 吗？`,
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
.page-index {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
}

.header {
  flex-shrink: 0;
  background: #4CAF50;
  padding: 0 24rpx 16rpx;

  .search-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 12rpx;

    .search-bar {
      flex: 1;
      display: flex;
      align-items: center;
      height: 72rpx;
      padding: 0 24rpx;
      background: #ffffff;
      border-radius: 36rpx;

      .search-icon {
        margin-right: 12rpx;
        font-size: 28rpx;
      }

      .search-input {
        flex: 1;
        height: 100%;
        font-size: 28rpx;
      }

      .clear-icon {
        padding: 8rpx;
        font-size: 24rpx;
        color: #999;
      }
    }

    .filter-btn {
      height: 72rpx;
      padding: 0 24rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #ffffff;
    }
  }

  .toolbar-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .file-count {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .sort-picker {
        display: flex;
        align-items: center;
        padding: 8rpx 16rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20rpx;
        font-size: 24rpx;
        color: #ffffff;

        .sort-arrow {
          margin-left: 8rpx;
        }
      }

      .view-toggle {
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        font-size: 28rpx;
        color: #ffffff;
      }
    }
  }

  .filter-panel {
    margin-top: 16rpx;
    padding: 24rpx;
    background: #ffffff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);

    .filter-section {
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 16rpx;
      }

      .filter-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .filter-tag {
          padding: 8rpx 20rpx;
          background: #f5f5f5;
          border-radius: 20rpx;
          font-size: 24rpx;
          color: #666;

          &.active {
            background: #4CAF50;
            color: #ffffff;
          }
        }
      }
    }
  }
}

.content {
  flex: 1;
  height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
  }

  .empty-message {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 16rpx;
  }

  .empty-hint {
    font-size: 24rpx;
    color: #999;
  }
}

.list-view {
  padding: 16rpx 24rpx 0;

  .list-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .item-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;
      flex-shrink: 0;

      .icon-emoji {
        font-size: 40rpx;
      }
    }

    .item-info {
      flex: 1;
      min-width: 0;

      .item-name {
        display: block;
        font-size: 28rpx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 8rpx;
      }

      .item-meta {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
    }

    .item-actions {
      display: flex;
      gap: 16rpx;
      flex-shrink: 0;

      .action-btn {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 28rpx;
        color: #666;

        &.delete {
          background: #fee;
          color: #f56c6c;
        }
      }
    }
  }
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 16rpx 24rpx 0;

  .grid-item {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .grid-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16rpx;

      .icon-emoji {
        font-size: 36rpx;
      }
    }

    .grid-name {
      display: block;
      font-size: 26rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      margin-bottom: 8rpx;
    }

    .grid-meta {
      display: block;
      font-size: 22rpx;
      color: #999;
      text-align: center;
      margin-bottom: 16rpx;
    }

    .grid-actions {
      display: flex;
      justify-content: center;
      gap: 16rpx;

      .action-btn {
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 24rpx;
        color: #666;

        &.delete {
          background: #fee;
          color: #f56c6c;
        }
      }
    }
  }
}

.upload-bar {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 100;

  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    background: #4CAF50;
    border-radius: 48rpx;
    color: #ffffff;
    font-size: 32rpx;

    .upload-icon {
      font-size: 40rpx;
      margin-right: 12rpx;
    }
  }
}

.upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;

  .upload-panel {
    width: 100%;
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 32rpx;
    padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(32rpx + env(safe-area-inset-bottom));

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32rpx;

      .panel-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }

      .close-btn {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border-radius: 50%;
        font-size: 40rpx;
        color: #666;
      }
    }

    .upload-options {
      display: flex;
      gap: 24rpx;

      .option-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48rpx 24rpx;
        background: #f5f5f5;
        border-radius: 24rpx;

        .option-icon {
          font-size: 64rpx;
          margin-bottom: 16rpx;
        }

        .option-text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 6rpx solid #ffffff;
      border-top-color: #4CAF50;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      margin-top: 24rpx;
      font-size: 28rpx;
      color: #ffffff;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
