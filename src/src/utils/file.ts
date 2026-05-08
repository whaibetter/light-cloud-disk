import { isH5, isApp, isMiniProgram } from './platform'

export function getFileIcon(mimetype: string): string {
  if (!mimetype) return '📄'

  if (mimetype.startsWith('image/')) return '🖼️'
  if (mimetype.startsWith('video/')) return '🎬'
  if (mimetype.startsWith('audio/')) return '🎵'
  if (mimetype.includes('pdf')) return '📕'
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return '📦'
  if (mimetype.includes('text')) return '📝'
  if (mimetype.includes('javascript') || mimetype.includes('json') || mimetype.includes('xml')) return '📜'
  if (mimetype.includes('word') || mimetype.includes('document')) return '📘'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📗'
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📙'

  return '📄'
}

export function getFileIconColor(mimetype: string): string {
  if (!mimetype) return '#999999'

  if (mimetype.startsWith('image/')) return '#4CAF50'
  if (mimetype.startsWith('video/')) return '#E91E63'
  if (mimetype.startsWith('audio/')) return '#9C27B0'
  if (mimetype.includes('pdf')) return '#F44336'
  if (mimetype.includes('zip') || mimetype.includes('rar')) return '#FF9800'
  if (mimetype.includes('text')) return '#2196F3'
  if (mimetype.includes('javascript') || mimetype.includes('json')) return '#FFC107'

  return '#607D8B'
}

interface ChooseFileOptions {
  multiple?: boolean
  type?: 'all' | 'image' | 'video' | 'audio'
  sourceType?: Array<'album' | 'camera'>
  count?: number
}

interface ChooseFileResult {
  path: string
  name: string
  file?: File
}

export function chooseFile(options: ChooseFileOptions = {}): Promise<ChooseFileResult[]> {
  const { multiple = false, type = 'all', count = 9 } = options

  // #ifdef H5
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple

    if (type === 'image') {
      input.accept = 'image/*'
    } else if (type === 'video') {
      input.accept = 'video/*'
    } else if (type === 'audio') {
      input.accept = 'audio/*'
    } else {
      input.accept = '*/*'
    }

    input.onchange = (e: any) => {
      const files = Array.from(e.target.files) as File[]
      const results = files.map(file => ({
        path: URL.createObjectURL(file),
        name: file.name,
        file: file
      }))
      resolve(results)
    }

    input.click()
  })
  // #endif

  // #ifdef APP-PLUS
  return new Promise((resolve) => {
    const sourceType = type === 'image' ? ['album', 'camera'] : ['album']

    if (type === 'image') {
      uni.chooseImage({
        count: multiple ? count : 1,
        sourceType,
        success: (res) => {
          const results = res.tempFilePaths.map(path => ({
            path,
            name: path.split('/').pop() || 'unknown'
          }))
          resolve(results)
        },
        fail: () => {
          resolve([])
        }
      })
    } else if (type === 'video') {
      uni.chooseVideo({
        sourceType,
        success: (res) => {
          resolve([{
            path: res.tempFilePath,
            name: res.tempFilePath.split('/').pop() || 'unknown'
          }])
        },
        fail: () => {
          resolve([])
        }
      })
    } else {
      uni.chooseMessageFile({
        count: multiple ? count : 1,
        success: (res) => {
          const results = res.tempFilePaths.map(path => ({
            path,
            name: path.split('/').pop() || 'unknown'
          }))
          resolve(results)
        },
        fail: () => {
          resolve([])
        }
      })
    }
  })
  // #endif

  // #ifdef MP
  return new Promise((resolve) => {
    if (type === 'image') {
      uni.chooseImage({
        count: multiple ? count : 1,
        success: (res) => {
          const results = res.tempFilePaths.map(path => ({
            path,
            name: path.split('/').pop() || 'unknown'
          }))
          resolve(results)
        },
        fail: () => {
          resolve([])
        }
      })
    } else if (type === 'video') {
      uni.chooseVideo({
        success: (res) => {
          resolve([{
            path: res.tempFilePath,
            name: res.tempFilePath.split('/').pop() || 'unknown'
          }])
        },
        fail: () => {
          resolve([])
        }
      })
    } else {
      uni.showToast({
        title: '请选择图片或视频',
        icon: 'none'
      })
      resolve([])
    }
  })
  // #endif

  return Promise.resolve([])
}

export function openFilePreview(filePath: string, mimetype?: string): void {
  // #ifdef H5
  window.open(filePath, '_blank')
  // #endif

  // #ifdef APP-PLUS
  uni.previewMedia({
    sources: [{
      url: filePath,
      type: mimetype?.startsWith('video') ? 'video' : 'image'
    }],
    current: 0
  })
  // #endif

  // #ifdef MP
  if (mimetype?.startsWith('image')) {
    uni.previewImage({
      urls: [filePath],
      current: filePath
    })
  } else {
    uni.showToast({
      title: '暂不支持预览',
      icon: 'none'
    })
  }
  // #endif
}
