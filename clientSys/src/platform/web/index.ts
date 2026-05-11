/**
 * Web 平台适配器实现
 *
 * 纯浏览器环境的适配器实现。
 * 当应用不在 Tauri 环境中运行时（如纯 Web 部署），使用这些适配器。
 */

import type {
  StorageAdapter,
  NetworkAdapter,
  FileAdapter,
  UIAdapter,
  SystemAdapter,
  NavigationAdapter,
  PlatformAdapters,
  RequestOptions,
  UploadOptions,
  DownloadOptions,
  FilePickOptions,
  FilePickResult,
  ToastOptions,
  ModalOptions,
  SystemInfo
} from '../adapters'

// ==================== 存储适配器 ====================

class WebStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(key)
    if (value === null) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}

// ==================== 网络适配器 ====================

class WebNetworkAdapter implements NetworkAdapter {
  async request<T>(options: RequestOptions): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000)

    try {
      const response = await fetch(options.url, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      return response.json() as Promise<T>
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async upload<T>(options: UploadOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', options.url)

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }

      xhr.upload.onprogress = (event) => {
        if (options.onProgress && event.total > 0) {
          options.onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100)
          })
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(`Upload failed: HTTP ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.ontimeout = () => reject(new Error('Upload timeout'))

      // Web 环境下 filePath 是 blob URL 或 File 对象
      if (options.filePath.startsWith('blob:')) {
        fetch(options.filePath)
          .then((res) => res.blob())
          .then((blob) => {
            const formData = new FormData()
            formData.append('files', blob, options.filePath.split('/').pop() || 'file')
            xhr.send(formData)
          })
          .catch(reject)
      } else {
        const formData = new FormData()
        formData.append('files', options.filePath)
        xhr.send(formData)
      }
    })
  }

  async download(options: DownloadOptions): Promise<string> {
    const response = await fetch(options.url, {
      headers: options.headers
    })

    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status}`)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    // 触发浏览器下载
    const a = document.createElement('a')
    a.href = url
    a.download = options.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return options.fileName
  }
}

// ==================== 文件适配器 ====================

class WebFileAdapter implements FileAdapter {
  async pickFiles(options?: FilePickOptions): Promise<FilePickResult[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = options?.multiple ?? false

      if (options?.accept) {
        input.accept = options.accept
      }

      input.onchange = () => {
        const files = Array.from(input.files || [])
        resolve(
          files.map((file) => ({
            path: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            file
          }))
        )
      }

      input.oncancel = () => resolve([])
      input.click()
    })
  }

  async previewFile(filePath: string): Promise<void> {
    window.open(filePath, '_blank')
  }

  async saveFile(sourcePath: string, fileName: string): Promise<string> {
    // Web 环境下触发下载
    const a = document.createElement('a')
    a.href = sourcePath
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return fileName
  }
}

// ==================== UI 适配器 ====================

class WebUIAdapter implements UIAdapter {
  showToast(options: ToastOptions): void {
    // 使用自定义 toast 组件
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: options
      })
    )
  }

  async showModal(options: ModalOptions): Promise<boolean> {
    if (options.showCancel === false) {
      window.alert(options.content)
      return true
    }
    return window.confirm(options.content)
  }

  showLoading(): void {
    window.dispatchEvent(new CustomEvent('app:loading', { detail: { show: true } }))
  }

  hideLoading(): void {
    window.dispatchEvent(new CustomEvent('app:loading', { detail: { show: false } }))
  }
}

// ==================== 系统适配器 ====================

class WebSystemAdapter implements SystemAdapter {
  async getSystemInfo(): Promise<SystemInfo> {
    const ua = navigator.userAgent
    const isAndroid = /android/i.test(ua)
    const isIOS = /iphone|ipad|ipod/i.test(ua)

    return {
      platform: isAndroid ? 'android' : isIOS ? 'ios' : 'web',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: window.screen.width >= 1024 ? 'desktop' : window.screen.width >= 768 ? 'tablet' : 'mobile',
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  isDesktop(): boolean {
    return window.screen.width >= 1024
  }

  isMobile(): boolean {
    return window.screen.width < 768
  }
}

// ==================== 导航适配器 ====================

class WebNavigationAdapter implements NavigationAdapter {
  private router: { push: (path: string) => void; replace: (path: string) => void; back: () => void } | null = null

  setRouter(router: { push: (path: string) => void; replace: (path: string) => void; back: () => void }) {
    this.router = router
  }

  push(path: string): void {
    if (this.router) {
      this.router.push(path)
    } else {
      window.location.hash = path
    }
  }

  replace(path: string): void {
    if (this.router) {
      this.router.replace(path)
    } else {
      window.location.replace(`#${path}`)
    }
  }

  back(): void {
    if (this.router) {
      this.router.back()
    } else {
      window.history.back()
    }
  }
}

// ==================== 导出适配器集合 ====================

// 单例导航适配器，供 main.ts 设置路由引用
export const webNavigationAdapter = new WebNavigationAdapter()

export function createWebAdapters(): PlatformAdapters {
  return {
    storage: new WebStorageAdapter(),
    network: new WebNetworkAdapter(),
    file: new WebFileAdapter(),
    ui: new WebUIAdapter(),
    system: new WebSystemAdapter(),
    navigation: webNavigationAdapter
  }
}
