<template>
  <div class="page">
    <!-- 移动端顶部 -->
    <div class="mobile-header">
      <div class="mobile-header-bg"></div>
      <div class="mobile-header-content">
        <div class="mobile-logo">
          <div class="mobile-logo-icon">
            <span>☁️</span>
          </div>
          <div class="mobile-logo-text">
            <span class="mobile-app-name">轻量云盘</span>
            <span class="mobile-app-desc">{{ fileStore.fileCount }} 个文件</span>
          </div>
        </div>
        <div class="mobile-actions">
          <div class="mobile-action-btn" @click="toggleTheme">
            <span>{{ configStore.theme === 'dark' ? '☀️' : '🌙' }}</span>
          </div>
          <div class="mobile-action-btn" @click="goToSettings">
            <span>⚙️</span>
          </div>
        </div>
      </div>

      <!-- 移动端搜索 -->
      <div class="mobile-search">
        <div class="mobile-search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            class="mobile-search-input"
            placeholder="搜索文件..."
            @input="onSearch"
          />
          <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
        </div>
      </div>
    </div>

    <!-- 移动端文件列表 -->
    <div class="mobile-content">
      <!-- 空状态 -->
      <div v-if="fileStore.filteredFiles.length === 0 && !fileStore.loading" class="empty-state">
        <div class="empty-illustration">
          <div class="empty-circle">
            <span class="empty-icon">📭</span>
          </div>
        </div>
        <span class="empty-title">暂无文件</span>
        <span class="empty-desc">点击下方按钮上传文件</span>
      </div>

      <!-- 文件列表 -->
      <div v-if="fileStore.filteredFiles.length > 0" class="mobile-file-list">
        <div
          v-for="file in fileStore.filteredFiles"
          :key="file.id"
          class="mobile-file-item"
          @click="handleItemClick(file)"
        >
          <div class="mobile-file-icon" :style="{ background: getFileGradient(file.mimetype) }">
            <span>{{ getFileIcon(file.mimetype) }}</span>
          </div>
          <div class="mobile-file-info">
            <span class="mobile-file-name">{{ file.originalName }}</span>
            <span class="mobile-file-meta">
              {{ formatFileSize(file.size) }} · {{ formatDate(file.uploadTime) }}
            </span>
          </div>
          <div class="mobile-file-actions">
            <div class="mobile-action-icon share" @click.stop="handleShare(file)">
              <span>🔗</span>
            </div>
            <div class="mobile-action-icon download" @click.stop="handleDownload(file)">
              <span>↓</span>
            </div>
            <div class="mobile-action-icon delete" @click.stop="handleDelete(file)">
              <span>×</span>
            </div>
          </div>
        </div>
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
          <div class="nav-item active">
            <span class="nav-icon">📁</span>
            <span class="nav-text">所有文件</span>
            <span class="nav-badge">{{ fileStore.fileCount }}</span>
          </div>
          <div class="nav-item" @click="goToSettings">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">设置</span>
          </div>
        </div>

        <div class="sidebar-stats">
          <div class="stat-card">
            <span class="stat-label">存储空间</span>
            <span class="stat-value">{{ formatFileSize(fileStore.totalSize) }}</span>
            <div class="stat-bar">
              <div class="stat-bar-fill" :style="{ width: storagePercent + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-upload">
          <div class="sidebar-upload-btn" @click="handleUpload">
            <span class="upload-icon">+</span>
            <span class="upload-text">上传文件</span>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
        <div class="desktop-topbar">
          <div class="topbar-left">
            <span class="topbar-title">所有文件</span>
            <span class="topbar-count">{{ fileStore.filteredFiles.length }} 个项目</span>
          </div>
          <div class="topbar-right">
            <div class="topbar-search">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                class="topbar-search-input"
                placeholder="搜索文件..."
                @input="onSearch"
              />
            </div>
            <div class="topbar-actions">
              <div class="theme-btn" @click="toggleTheme">
                <span>{{ configStore.theme === 'dark' ? '☀️' : '🌙' }}</span>
              </div>
              <div
                class="view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="setViewMode('list')"
              >
                <span>☰</span>
              </div>
              <div
                class="view-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="setViewMode('grid')"
              >
                <span>☷</span>
              </div>
              <div class="sort-btn" @click="showSortPanel = true">
                <span>↕️</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 筛选标签 -->
        <div class="filter-bar">
          <div class="filter-tags">
            <div
              class="filter-tag"
              :class="{ active: selectedTypes.length === 0 }"
              @click="clearTypeFilter"
            >
              <span>全部</span>
            </div>
            <div
              v-for="type in fileTypeFilters"
              :key="type.value"
              class="filter-tag"
              :class="{ active: selectedTypes.includes(type.value) }"
              @click="toggleTypeFilter(type.value)"
            >
              <span class="tag-icon">{{ type.icon }}</span>
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <div class="files-area">
          <!-- 空状态 -->
          <div v-if="fileStore.filteredFiles.length === 0 && !fileStore.loading" class="empty-state">
            <div class="empty-illustration">
              <div class="empty-circle">
                <span class="empty-icon">📭</span>
              </div>
            </div>
            <span class="empty-title">暂无文件</span>
            <span class="empty-desc">点击上传按钮开始管理您的文件</span>
            <div class="empty-action" @click="handleUpload">
              <span class="action-icon">+</span>
              <span>上传文件</span>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list' && fileStore.filteredFiles.length > 0" class="list-view">
            <div class="list-header">
              <span class="header-name">名称</span>
              <span class="header-size">大小</span>
              <span class="header-time">修改时间</span>
              <span class="header-actions">操作</span>
            </div>
            <div
              v-for="file in fileStore.filteredFiles"
              :key="file.id"
              class="list-row"
              @click="handleItemClick(file)"
            >
              <div class="row-name">
                <div class="file-icon" :style="{ background: getFileGradient(file.mimetype) }">
                  <span>{{ getFileIcon(file.mimetype) }}</span>
                </div>
                <span class="file-name">{{ file.originalName }}</span>
              </div>
              <span class="row-size">{{ formatFileSize(file.size) }}</span>
              <span class="row-time">{{ formatDate(file.uploadTime) }}</span>
              <div class="row-actions">
                <div class="action-btn share" @click.stop="handleShare(file)">
                  <span>🔗</span>
                </div>
                <div class="action-btn download" @click.stop="handleDownload(file)">
                  <span>↓</span>
                </div>
                <div class="action-btn delete" @click.stop="handleDelete(file)">
                  <span>×</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid' && fileStore.filteredFiles.length > 0" class="grid-view">
            <div
              v-for="file in fileStore.filteredFiles"
              :key="file.id"
              class="grid-card"
              @click="handleItemClick(file)"
            >
              <div class="card-icon" :style="{ background: getFileGradient(file.mimetype) }">
                <span>{{ getFileIcon(file.mimetype) }}</span>
              </div>
              <span class="card-name">{{ file.originalName }}</span>
              <span class="card-meta">{{ formatFileSize(file.size) }}</span>
              <div class="card-actions">
                <div class="action-btn share" @click.stop="handleShare(file)">
                  <span>🔗</span>
                </div>
                <div class="action-btn download" @click.stop="handleDownload(file)">
                  <span>↓</span>
                </div>
                <div class="action-btn delete" @click.stop="handleDelete(file)">
                  <span>×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端底部操作栏 -->
    <div class="mobile-bottom-bar">
      <div class="mobile-upload-btn" @click="handleUpload">
        <span class="upload-icon">+</span>
        <span class="upload-text">上传文件</span>
      </div>
      <div class="mobile-tabbar">
        <div class="tab-item active">
          <span class="tab-icon">📁</span>
          <span class="tab-text">文件</span>
        </div>
        <div class="tab-item" @click="goToSettings">
          <span class="tab-icon">⚙️</span>
          <span class="tab-text">设置</span>
        </div>
      </div>
    </div>

    <!-- 排序面板 -->
    <div v-if="showSortPanel" class="modal-overlay" @click="showSortPanel = false">
      <div class="sort-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">排序方式</span>
          <div class="modal-close" @click="showSortPanel = false">
            <span>✕</span>
          </div>
        </div>
        <div class="modal-body">
          <div
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-option"
            :class="{ active: fileStore.sortBy === option.value }"
            @click="setSort(option.value)"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-text">{{ option.label }}</span>
            <span v-if="fileStore.sortBy === option.value" class="option-check">✓</span>
          </div>
          <div class="sort-divider"></div>
          <div class="sort-direction">
            <div
              class="direction-btn"
              :class="{ active: fileStore.sortOrder === 'desc' }"
              @click="setSortOrder('desc')"
            >
              <span>降序 ↓</span>
            </div>
            <div
              class="direction-btn"
              :class="{ active: fileStore.sortOrder === 'asc' }"
              @click="setSortOrder('asc')"
            >
              <span>升序 ↑</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传面板 -->
    <div v-if="showUploadPanel" class="modal-overlay" @click="showUploadPanel = false">
      <div class="upload-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">选择上传方式</span>
          <div class="modal-close" @click="showUploadPanel = false">
            <span>✕</span>
          </div>
        </div>
        <div class="modal-body">
          <div class="upload-option" @click="chooseImage">
            <div class="option-icon-wrapper image">
              <span>🖼️</span>
            </div>
            <div class="option-info">
              <span class="option-title">上传图片</span>
              <span class="option-desc">从相册选择图片</span>
            </div>
          </div>
          <div class="upload-option" @click="chooseFileAction">
            <div class="option-icon-wrapper file">
              <span>📁</span>
            </div>
            <div class="option-info">
              <span class="option-title">上传文件</span>
              <span class="option-desc">选择任意文件</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="modal-overlay">
      <div class="progress-modal">
        <div class="progress-spinner"></div>
        <span class="progress-title">正在上传</span>
        <span class="progress-percent">{{ uploadProgress }}%</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 分享模态框 -->
    <div v-if="showSharePanel" class="modal-overlay" @click="showSharePanel = false">
      <div class="share-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{ shareMode === 'create' ? '分享文件' : '管理分享' }}</span>
          <div class="modal-close" @click="showSharePanel = false">
            <span>✕</span>
          </div>
        </div>
        <div class="modal-body">
          <!-- 创建分享模式 -->
          <template v-if="shareMode === 'create'">
            <div class="share-file-info">
              <span class="share-file-icon">{{ getFileIcon(shareFile?.mimetype || '') }}</span>
              <span class="share-file-name">{{ shareFile?.originalName }}</span>
            </div>
            <div class="share-form">
              <div class="form-group">
                <label class="form-label">访问密码（可选）</label>
                <input
                  v-model="sharePassword"
                  class="share-input"
                  placeholder="留空则无需密码"
                  :type="showSharePassword ? 'text' : 'password'"
                />
              </div>
              <div class="form-group">
                <label class="form-label">有效期</label>
                <div class="expire-options">
                  <div
                    v-for="opt in expireOptions"
                    :key="opt.value"
                    class="expire-option"
                    :class="{ active: shareExpireHours === opt.value }"
                    @click="shareExpireHours = opt.value"
                  >
                    {{ opt.label }}
                  </div>
                </div>
              </div>
              <button class="share-create-btn" :disabled="shareCreating" @click="doCreateShare">
                {{ shareCreating ? '创建中...' : '创建分享链接' }}
              </button>
            </div>
            <!-- 创建成功后显示链接 -->
            <div v-if="shareLink" class="share-result">
              <label class="form-label">分享链接</label>
              <div class="share-link-row">
                <input class="share-link-input" :value="shareLink" readonly />
                <button class="share-copy-btn" @click="copyShareLink">复制</button>
              </div>
              <span class="share-hint">有效期：{{ shareExpireHours === 0 ? '永久' : shareExpireHours + ' 小时' }}{{ sharePassword ? ' · 已设密码' : '' }}</span>
            </div>
          </template>

          <!-- 管理分享模式 -->
          <template v-if="shareMode === 'manage'">
            <div v-if="shareStore.loading" class="share-loading">加载中...</div>
            <div v-else-if="shareStore.currentShares.length === 0" class="share-empty">暂无分享</div>
            <div v-else class="share-list">
              <div v-for="share in shareStore.currentShares" :key="share.token" class="share-item">
                <div class="share-item-info">
                  <span class="share-token">{{ share.token }}</span>
                  <span class="share-meta">
                    {{ share.password ? '🔒 有密码' : '🌐 公开' }}
                    · {{ share.expireAt ? '到期: ' + formatDate(share.expireAt) : '永久有效' }}
                  </span>
                </div>
                <div class="share-item-actions">
                  <button class="share-item-btn copy" @click="copyShareLinkDirect(share.token)">复制</button>
                  <button class="share-item-btn delete" @click="doDeleteShare(share.token)">删除</button>
                </div>
              </div>
            </div>
            <button class="share-create-new-btn" @click="shareMode = 'create'; shareLink = ''">
              新建分享
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { platform } from '../../../platform/context'
import { formatFileSize, formatDate } from '../../../core/utils/format'
import { getFileIcon, getFileGradient } from '../../../core/stores/file.store'
import type { FileInfo } from '../../../core/types'

const configStore = platform.getConfigStore()
const fileStore = platform.getFileStore()
const shareStore = platform.getShareStore()
const ui = platform.getUI()
const nav = platform.getNavigation()
const fileAdapter = platform.getFile()

const searchQuery = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const showUploadPanel = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const showSortPanel = ref(false)
const selectedTypes = ref<string[]>([])

// 分享相关
const showSharePanel = ref(false)
const shareMode = ref<'create' | 'manage'>('create')
const shareFile = ref<FileInfo | null>(null)
const sharePassword = ref('')
const showSharePassword = ref(false)
const shareExpireHours = ref(0)
const shareCreating = ref(false)
const shareLink = ref('')
const expireOptions = [
  { label: '永久', value: 0 },
  { label: '1小时', value: 1 },
  { label: '24小时', value: 24 },
  { label: '7天', value: 168 }
]

const fileTypeFilters = [
  { label: '图片', value: 'image', icon: '🖼️' },
  { label: '视频', value: 'video', icon: '🎬' },
  { label: '音频', value: 'audio', icon: '🎵' },
  { label: '文档', value: 'document', icon: '📄' },
  { label: '压缩包', value: 'archive', icon: '📦' }
]

const sortOptions = [
  { label: '上传时间', value: 'time' as const, icon: '🕐' },
  { label: '文件名称', value: 'name' as const, icon: '🔤' },
  { label: '文件大小', value: 'size' as const, icon: '📏' }
]

const storagePercent = computed(() => {
  const maxStorage = 1024 * 1024 * 1024 // 1GB
  return Math.min((fileStore.totalSize / maxStorage) * 100, 100)
})

onMounted(async () => {
  viewMode.value = configStore.viewMode

  if (!configStore.isConfigValid) {
    ui.showToast({ title: '请先配置服务器地址和 API Key', icon: 'warning', duration: 3000 })
    nav.push('/settings')
    return
  }
  await loadFiles()
})

async function loadFiles() {
  try {
    await fileStore.fetchFiles()
  } catch (error: any) {
    ui.showToast({ title: error.message || '加载失败', icon: 'error' })
  }
}

function onSearch() {
  fileStore.setSearchQuery(searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
  fileStore.setSearchQuery('')
}

function toggleTheme() {
  configStore.toggleTheme()
}

function goToSettings() {
  nav.push('/settings')
}

function setViewMode(mode: 'list' | 'grid') {
  viewMode.value = mode
  configStore.setViewMode(mode)
}

function toggleTypeFilter(type: string) {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  } else {
    selectedTypes.value.push(type)
  }
  fileStore.toggleTypeFilter(type as any)
}

function clearTypeFilter() {
  selectedTypes.value = []
  fileStore.clearTypeFilter()
}

function setSort(field: 'name' | 'time' | 'size') {
  fileStore.setSort(field, fileStore.sortOrder)
}

function setSortOrder(order: 'asc' | 'desc') {
  fileStore.setSort(fileStore.sortBy, order)
  showSortPanel.value = false
}

async function handleItemClick(file: FileInfo) {
  await handleDownload(file)
}

async function handleDownload(file: FileInfo) {
  try {
    await fileStore.downloadFile(file.id)
    ui.showToast({ title: '下载成功', icon: 'success' })
  } catch (error: any) {
    ui.showToast({ title: error.message || '下载失败', icon: 'error' })
  }
}

async function handleDelete(file: FileInfo) {
  const confirmed = await ui.showModal({
    title: '确认删除',
    content: `确定要删除 "${file.originalName}" 吗？`,
    confirmText: '删除',
    cancelText: '取消'
  })

  if (!confirmed) return

  try {
    await fileStore.deleteFile(file.id)
    ui.showToast({ title: '删除成功', icon: 'success' })
  } catch (error: any) {
    ui.showToast({ title: error.message || '删除失败', icon: 'error' })
  }
}

async function handleShare(file: FileInfo) {
  shareFile.value = file
  shareLink.value = ''
  sharePassword.value = ''
  shareExpireHours.value = 0
  shareCreating.value = false

  // 先检查是否已有分享
  try {
    await shareStore.fetchShares(file.storedName)
    if (shareStore.currentShares.length > 0) {
      shareMode.value = 'manage'
    } else {
      shareMode.value = 'create'
    }
  } catch {
    shareMode.value = 'create'
  }

  showSharePanel.value = true
}

async function doCreateShare() {
  if (!shareFile.value) return
  shareCreating.value = true
  try {
    const token = await shareStore.createShare(
      shareFile.value.storedName,
      sharePassword.value || undefined,
      shareExpireHours.value || undefined
    )
    const base = import.meta.env.DEV ? '' : configStore.serverUrl
    shareLink.value = `${base}/#/share?token=${token}`
    ui.showToast({ title: '分享创建成功', icon: 'success' })
  } catch (error: any) {
    ui.showToast({ title: error.message || '创建失败', icon: 'error' })
  } finally {
    shareCreating.value = false
  }
}

async function doDeleteShare(token: string) {
  const confirmed = await ui.showModal({
    title: '确认删除',
    content: '确定要删除此分享链接吗？',
    confirmText: '删除',
    cancelText: '取消'
  })
  if (!confirmed) return

  try {
    await shareStore.deleteShare(token)
    ui.showToast({ title: '分享已删除', icon: 'success' })
    if (shareStore.currentShares.length === 0) {
      shareMode.value = 'create'
    }
  } catch (error: any) {
    ui.showToast({ title: error.message || '删除失败', icon: 'error' })
  }
}

function copyShareLink() {
  navigator.clipboard.writeText(shareLink.value).then(() => {
    ui.showToast({ title: '链接已复制', icon: 'success' })
  })
}

function copyShareLinkDirect(token: string) {
  const base = import.meta.env.DEV ? '' : configStore.serverUrl
  const url = `${base}/#/share?token=${token}`
  navigator.clipboard.writeText(url).then(() => {
    ui.showToast({ title: '链接已复制', icon: 'success' })
  })
}

function handleUpload() {
  showUploadPanel.value = true
}

async function chooseImage() {
  showUploadPanel.value = false
  try {
    const results = await fileAdapter.pickFiles({ multiple: true, accept: 'image/*' })
    if (results.length > 0) {
      await uploadFiles(results)
    }
  } catch (error: any) {
    ui.showToast({ title: error.message || '选择文件失败', icon: 'error' })
  }
}

async function chooseFileAction() {
  showUploadPanel.value = false
  try {
    const results = await fileAdapter.pickFiles({ multiple: true })
    if (results.length > 0) {
      await uploadFiles(results)
    }
  } catch (error: any) {
    ui.showToast({ title: error.message || '选择文件失败', icon: 'error' })
  }
}

async function uploadFiles(fileResults: Array<{ path: string; name: string; file?: File }>) {
  uploading.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < fileResults.length; i++) {
      await fileStore.uploadFile(fileResults[i].path, undefined, fileResults[i].file)
      uploadProgress.value = Math.round(((i + 1) / fileResults.length) * 100)
    }
    ui.showToast({ title: `成功上传 ${fileResults.length} 个文件`, icon: 'success' })
    await loadFiles()
  } catch (error: any) {
    ui.showToast({ title: error.message || '上传失败', icon: 'error' })
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
        border: none;
        outline: none;
      }

      .search-clear {
        padding: $space-1;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
}

// ========== 移动端内容区 ==========
.mobile-content {
  flex: 1;
  display: block;
  overflow-y: auto;
  padding-bottom: 140px;

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
        background: rgba($brand-primary, 0.1);
        color: $brand-primary;
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
        box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.4);
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
          border: none;
          outline: none;
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

    .filter-tags {
      display: inline-flex;
      gap: $space-2;
      flex-wrap: wrap;

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
      box-shadow: 0 12px 20px -5px rgba(79, 70, 229, 0.4);
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

        &.share {
          background: rgba($brand-primary, 0.1);
          color: $brand-primary;

          &:hover {
            background: rgba($brand-primary, 0.2);
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

        &.share {
          background: rgba($brand-primary, 0.1);
          color: $brand-primary;

          &:hover {
            background: rgba($brand-primary, 0.2);
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

// ========== 分享模态框 ==========
.share-modal {
  background: $bg-card;
  border-radius: $radius-2xl;
  width: 90%;
  max-width: 440px;
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

.share-file-info {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  background: $bg-sunken;
  border-radius: $radius-lg;
  margin-bottom: $space-4;

  .share-file-icon {
    font-size: 24px;
  }

  .share-file-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.share-form {
  .form-group {
    margin-bottom: $space-4;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $space-2;
  }

  .share-input {
    width: 100%;
    height: 40px;
    padding: 0 $space-3;
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

.expire-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-2;

  .expire-option {
    height: 36px;
    background: $bg-sunken;
    border: 1px solid $border-subtle;
    border-radius: $radius-lg;
    @include flex-center;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: $brand-primary;
      color: $brand-primary;
    }

    &.active {
      background: $brand-primary;
      border-color: $brand-primary;
      color: $text-inverse;
    }
  }
}

.share-create-btn {
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
  margin-top: $space-2;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.share-result {
  margin-top: $space-4;
  padding-top: $space-4;
  border-top: 1px solid $border-subtle;

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $space-2;
  }
}

.share-link-row {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-2;

  .share-link-input {
    flex: 1;
    height: 40px;
    padding: 0 $space-3;
    background: $bg-sunken;
    border: 1px solid $border-subtle;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    color: $text-primary;
    outline: none;
  }

  .share-copy-btn {
    height: 40px;
    padding: 0 $space-4;
    background: $brand-primary;
    border: none;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-inverse;
    cursor: pointer;
    transition: $transition-base;
    white-space: nowrap;

    &:hover {
      opacity: 0.9;
    }
  }
}

.share-hint {
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.share-loading,
.share-empty {
  text-align: center;
  padding: $space-8 0;
  font-size: $font-size-sm;
  color: $text-tertiary;
}

.share-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-bottom: $space-4;
}

.share-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-3;
  background: $bg-sunken;
  border-radius: $radius-lg;

  .share-item-info {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    min-width: 0;
    flex: 1;

    .share-token {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      font-family: monospace;
    }

    .share-meta {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .share-item-actions {
    display: flex;
    gap: $space-2;
    flex-shrink: 0;
    margin-left: $space-3;

    .share-item-btn {
      height: 30px;
      padding: 0 $space-3;
      border: none;
      border-radius: $radius-md;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: $transition-base;

      &.copy {
        background: rgba($brand-primary, 0.1);
        color: $brand-primary;

        &:hover {
          background: rgba($brand-primary, 0.2);
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

.share-create-new-btn {
  width: 100%;
  height: 40px;
  background: $bg-sunken;
  border: 1px dashed $border-subtle;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: $brand-primary;
    color: $brand-primary;
  }
}
</style>
