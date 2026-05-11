/**
 * Tauri 平台适配器实现
 *
 * 使用 Tauri 2.0 插件 API 实现各适配器接口。
 * 在 Tauri 环境（桌面端 + Android/iOS）中使用。
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

class TauriStorageAdapter implements StorageAdapter {
  private store: Map<string, unknown> = new Map()
  private initialized = false

  private async init() {
    if (this.initialized) return
    // Tauri 2.0 使用 @tauri-apps/plugin-store
    try {
      const { Store } = await import('@tauri-apps/plugin-store')
      const store = await Store.load('app-data.json')
      const entries = await store.entries()
      for (const [key, value] of entries) {
        this.store.set(key, value)
      }
    } catch {
      // 降级到 localStorage (Web 环境)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            this.store.set(key, JSON.parse(localStorage.getItem(key) || 'null'))
          } catch {
            this.store.set(key, localStorage.getItem(key))
          }
        }
      }
    }
    this.initialized = true
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init()
    return (this.store.get(key) as T) ?? null
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init()
    this.store.set(key, value)
    try {
      const { Store } = await import('@tauri-apps/plugin-store')
      const store = await Store.load('app-data.json')
      await store.set(key, value)
      await store.save()
    } catch {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  async remove(key: string): Promise<void> {
    await this.init()
    this.store.delete(key)
    try {
      const { Store } = await import('@tauri-apps/plugin-store')
      const store = await Store.load('app-data.json')
      await store.delete(key)
      await store.save()
    } catch {
      localStorage.removeItem(key)
    }
  }

  async clear(): Promise<void> {
    await this.init()
    this.store.clear()
    try {
      const { Store } = await import('@tauri-apps/plugin-store')
      const store = await Store.load('app-data.json')
      await store.clear()
      await store.save()
    } catch {
      localStorage.clear()
    }
  }
}

// ==================== 网络适配器 ====================

class TauriNetworkAdapter implements NetworkAdapter {
  async request<T>(options: RequestOptions): Promise<T> {
    const { fetch } = await import('@tauri-apps/plugin-http')
    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      connectTimeout: options.timeout || 30000
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
    }

    return response.data as T
  }

  async upload<T>(options: UploadOptions): Promise<T> {
    const { fetch, Body } = await import('@tauri-apps/plugin-http')
    const { readBinaryFile } = await import('@tauri-apps/plugin-fs')

    const fileData = await readBinaryFile(options.filePath)
    const formData = new FormData()
    formData.append('files', new Blob([fileData]), options.filePath.split('/').pop() || 'file')

    const response = await fetch(options.url, {
      method: 'POST',
      headers: options.headers,
      body: Body.form(formData)
    })

    if (!response.ok) {
      throw new Error(`Upload failed: HTTP ${response.status}`)
    }

    return response.data as T
  }

  async download(options: DownloadOptions): Promise<string> {
    const { fetch } = await import('@tauri-apps/plugin-http')
    const { writeBinaryFile, downloadDir } = await import('@tauri-apps/plugin-fs')

    const response = await fetch(options.url, {
      method: 'GET',
      headers: options.headers,
      connectTimeout: 30000
    })

    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${response.status}`)
    }

    const data = await response.data
    const downloadPath = `${await downloadDir()}/${options.fileName}`
    await writeBinaryFile(downloadPath, new Uint8Array(data as ArrayBuffer))

    return downloadPath
  }
}

// ==================== 文件适配器 ====================

class TauriFileAdapter implements FileAdapter {
  async pickFiles(options?: FilePickOptions): Promise<FilePickResult[]> {
    const { open } = await import('@tauri-apps/plugin-dialog')

    const result = await open({
      multiple: options?.multiple ?? false,
      filters: options?.accept
        ? [
            {
              name: 'Files',
              extensions: [options.accept.replace(/.*\//, '')]
            }
          ]
        : undefined,
      title: options?.title
    })

    if (!result) return []

    const paths = Array.isArray(result) ? result : [result]
    return paths.map((path) => ({
      path,
      name: path.split(/[/\\]/).pop() || 'unknown',
      size: 0 // Tauri 需要额外读取文件大小
    }))
  }

  async previewFile(filePath: string): Promise<void> {
    const { open: openPath } = await import('@tauri-apps/plugin-shell')
    await openPath(filePath)
  }

  async saveFile(sourcePath: string, fileName: string): Promise<string> {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const savePath = await save({
      defaultPath: fileName
    })
    if (!savePath) throw new Error('Save cancelled')

    const { readBinaryFile, writeBinaryFile } = await import('@tauri-apps/plugin-fs')
    const data = await readBinaryFile(sourcePath)
    await writeBinaryFile(savePath, data)

    return savePath
  }
}

// ==================== UI 适配器 ====================

class TauriUIAdapter implements UIAdapter {
  showToast(options: ToastOptions): void {
    // Tauri 没有原生 toast，使用自定义实现
    // 通过事件总线通知 UI 层显示 toast
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: options
      })
    )
  }

  async showModal(options: ModalOptions): Promise<boolean> {
    const { confirm, message } = await import('@tauri-apps/plugin-dialog')

    if (options.showCancel === false) {
      await message(options.content, { title: options.title, kind: 'info' })
      return true
    }

    return confirm(options.content, {
      title: options.title,
      kind: 'warning',
      okLabel: options.confirmText || '确认',
      cancelLabel: options.cancelText || '取消'
    })
  }

  showLoading(): void {
    window.dispatchEvent(new CustomEvent('app:loading', { detail: { show: true } }))
  }

  hideLoading(): void {
    window.dispatchEvent(new CustomEvent('app:loading', { detail: { show: false } }))
  }
}

// ==================== 系统适配器 ====================

class TauriSystemAdapter implements SystemAdapter {
  async getSystemInfo(): Promise<SystemInfo> {
    const { platform, arch, type } = await import('@tauri-apps/plugin-os')

    const osPlatform = platform()
    const mappedPlatform: SystemInfo['platform'] =
      osPlatform === 'windows'
        ? 'windows'
        : osPlatform === 'macos'
          ? 'macos'
          : osPlatform === 'linux'
            ? 'linux'
            : osPlatform === 'android'
              ? 'android'
              : osPlatform === 'ios'
                ? 'ios'
                : 'web'

    return {
      platform: mappedPlatform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType:
        type() === 'desktop'
          ? 'desktop'
          : window.screen.width >= 768
            ? 'tablet'
            : 'mobile',
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  isDesktop(): boolean {
    const platform = navigator.platform.toLowerCase()
    return platform.includes('win') || platform.includes('mac') || platform.includes('linux')
  }

  isMobile(): boolean {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent)
  }
}

// ==================== 导航适配器 ====================

class TauriNavigationAdapter implements NavigationAdapter {
  private router: { push: (path: string) => void; replace: (path: string) => void; back: () => void } | null = null

  setRouter(router: { push: (path: string) => void; replace: (path: string) => void; back: () => void }) {
    this.router = router
  }

  push(path: string): void {
    this.router?.push(path)
  }

  replace(path: string): void {
    this.router?.replace(path)
  }

  back(): void {
    this.router?.back()
  }
}

// ==================== 导出适配器集合 ====================

// 单例导航适配器，供 main.ts 设置路由引用
export const tauriNavigationAdapter = new TauriNavigationAdapter()

export function createTauriAdapters(): PlatformAdapters {
  return {
    storage: new TauriStorageAdapter(),
    network: new TauriNetworkAdapter(),
    file: new TauriFileAdapter(),
    ui: new TauriUIAdapter(),
    system: new TauriSystemAdapter(),
    navigation: tauriNavigationAdapter
  }
}
