/**
 * 文件存储
 *
 * 平台无关的文件状态管理。
 * 所有文件操作通过 ApiClient 进行，不直接依赖任何平台 API。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileInfo, FileCategory, SortField, SortOrder } from '../types'
import type { ApiClient } from '../api/client'

export function createFileStore(apiClient: ApiClient) {
  return defineStore('file', () => {
    const files = ref<FileInfo[]>([])
    const loading = ref(false)
    const searchQuery = ref('')
    const sortBy = ref<SortField>('time')
    const sortOrder = ref<SortOrder>('desc')
    const selectedTypes = ref<FileCategory[]>([])

    // ==================== 计算属性 ====================

    const filteredFiles = computed(() => {
      let result = [...files.value]

      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter((f) => f.originalName.toLowerCase().includes(query))
      }

      // 类型过滤
      if (selectedTypes.value.length > 0) {
        result = result.filter((f) => {
          const category = getFileCategory(f.mimetype)
          return selectedTypes.value.includes(category)
        })
      }

      // 排序
      result.sort((a, b) => {
        let comparison = 0
        switch (sortBy.value) {
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
        return sortOrder.value === 'asc' ? comparison : -comparison
      })

      return result
    })

    const totalSize = computed(() => files.value.reduce((sum, f) => sum + (f.size || 0), 0))

    const fileCount = computed(() => files.value.length)

    // ==================== 操作 ====================

    async function fetchFiles() {
      loading.value = true
      try {
        const response = await apiClient.getFiles()
        files.value = response.files || []
      } finally {
        loading.value = false
      }
    }

    async function uploadFile(
      filePath: string,
      onProgress?: (loaded: number, total: number, percent: number) => void,
      file?: File
    ): Promise<void> {
      const response = await apiClient.uploadFile(filePath, onProgress, file)
      if (response.files && response.files.length > 0) {
        files.value.unshift(response.files[0])
      }
    }

    async function deleteFile(fileId: string): Promise<void> {
      const file = files.value.find((f) => f.id === fileId)
      if (!file) return

      await apiClient.deleteFile(file.storedName)

      const index = files.value.findIndex((f) => f.id === fileId)
      if (index > -1) {
        files.value.splice(index, 1)
      }
    }

    async function downloadFile(fileId: string): Promise<string> {
      const file = files.value.find((f) => f.id === fileId)
      if (!file) throw new Error('File not found')
      return apiClient.downloadFile(file.storedName)
    }

    function setSearchQuery(query: string) {
      searchQuery.value = query
    }

    function setSort(field: SortField, order: SortOrder) {
      sortBy.value = field
      sortOrder.value = order
    }

    function toggleTypeFilter(type: FileCategory) {
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

    return {
      files,
      loading,
      searchQuery,
      sortBy,
      sortOrder,
      selectedTypes,
      filteredFiles,
      totalSize,
      fileCount,
      fetchFiles,
      uploadFile,
      deleteFile,
      downloadFile,
      setSearchQuery,
      setSort,
      toggleTypeFilter,
      clearTypeFilter
    }
  })
}

// ==================== 工具函数 ====================

export function getFileCategory(mimetype: string): FileCategory {
  if (!mimetype) return 'other'
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('word') ||
    mimetype.includes('document') ||
    mimetype.includes('excel') ||
    mimetype.includes('spreadsheet') ||
    mimetype.includes('powerpoint') ||
    mimetype.includes('presentation') ||
    mimetype.includes('text')
  )
    return 'document'
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar') || mimetype.includes('gz'))
    return 'archive'
  return 'other'
}

export function getFileIcon(mimetype: string): string {
  const category = getFileCategory(mimetype)
  const icons: Record<FileCategory, string> = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    other: '📄'
  }
  return icons[category]
}

export function getFileIconColor(mimetype: string): string {
  const category = getFileCategory(mimetype)
  const colors: Record<FileCategory, string> = {
    image: '#4CAF50',
    video: '#E91E63',
    audio: '#9C27B0',
    document: '#2196F3',
    archive: '#FF9800',
    other: '#607D8B'
  }
  return colors[category]
}

export function getFileGradient(mimetype: string): string {
  const category = getFileCategory(mimetype)
  const gradients: Record<FileCategory, string> = {
    image: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    video: 'linear-gradient(135deg, #E91E63, #FF5722)',
    audio: 'linear-gradient(135deg, #9C27B0, #673AB7)',
    document: 'linear-gradient(135deg, #2196F3, #03A9F4)',
    archive: 'linear-gradient(135deg, #FF9800, #FFC107)',
    other: 'linear-gradient(135deg, #607D8B, #9E9E9E)'
  }
  return gradients[category]
}
