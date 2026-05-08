import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fileApi } from '@/api/modules/file'
import { getFileExtension, getFileNameWithoutExtension } from '@/utils/format'
import type { FileInfo, UploadProgress } from '@/api/types'

export const useFileStore = defineStore('file', () => {
  const files = ref<FileInfo[]>([])
  const loading = ref(false)
  const viewMode = ref<'list' | 'grid'>('list')
  const selectedIds = ref<string[]>([])
  const searchQuery = ref('')
  const sortBy = ref<'name' | 'time' | 'size'>('time')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const filteredFiles = computed(() => {
    let result = [...files.value]
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(f => 
        f.originalName.toLowerCase().includes(query)
      )
    }

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

  const selectedFiles = computed(() => {
    return files.value.filter(f => selectedIds.value.includes(f.id))
  })

  const hasSelection = computed(() => selectedIds.value.length > 0)

  async function fetchFiles() {
    loading.value = true
    try {
      const response = await fileApi.getFiles()
      files.value = response.files || []
      loading.value = false
    } catch (error: any) {
      loading.value = false
      throw error
    }
  }

  async function uploadFile(
    filePath: string, 
    onProgress?: (progress: number) => void,
    file?: File
  ): Promise<void> {
    const response = await fileApi.uploadFile(filePath, (progress: UploadProgress) => {
      if (onProgress) {
        onProgress(progress.percent)
      }
    }, file)
    
    if (response.files && response.files.length > 0) {
      files.value.unshift(response.files[0])
    }
  }

  async function deleteFile(fileId: string): Promise<void> {
    const file = files.value.find(f => f.id === fileId)
    if (!file) return
    
    await fileApi.deleteFile(file.storedName)
    
    const index = files.value.findIndex(f => f.id === fileId)
    if (index > -1) {
      files.value.splice(index, 1)
    }
  }

  function setViewMode(mode: 'list' | 'grid') {
    viewMode.value = mode
  }

  function toggleSelection(fileId: string) {
    const index = selectedIds.value.indexOf(fileId)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(fileId)
    }
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setSort(field: 'name' | 'time' | 'size', order: 'asc' | 'desc') {
    sortBy.value = field
    sortOrder.value = order
  }

  return {
    files,
    loading,
    viewMode,
    selectedIds,
    searchQuery,
    sortBy,
    sortOrder,
    filteredFiles,
    selectedFiles,
    hasSelection,
    fetchFiles,
    uploadFile,
    deleteFile,
    setViewMode,
    toggleSelection,
    clearSelection,
    setSearchQuery,
    setSort
  }
})
