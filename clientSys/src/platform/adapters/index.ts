/**
 * 平台适配器接口定义
 *
 * 所有平台相关的操作都通过适配器接口抽象，
 * 核心业务逻辑只依赖这些接口，不直接调用任何平台 API。
 * 这样同一套业务代码可以在 Tauri、Web 等不同平台上运行。
 */

// ==================== 存储适配器 ====================

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

// ==================== 网络适配器 ====================

export interface RequestOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface UploadOptions {
  url: string
  filePath: string
  fieldName?: string
  headers?: Record<string, string>
  onProgress?: (progress: UploadProgress) => void
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface DownloadOptions {
  url: string
  fileName: string
  headers?: Record<string, string>
  onProgress?: (progress: DownloadProgress) => void
}

export interface DownloadProgress {
  loaded: number
  total: number
  percent: number
}

export interface NetworkAdapter {
  request<T>(options: RequestOptions): Promise<T>
  upload<T>(options: UploadOptions): Promise<T>
  download(options: DownloadOptions): Promise<string> // 返回本地文件路径
}

// ==================== 文件适配器 ====================

export interface FilePickOptions {
  multiple?: boolean
  accept?: string // MIME 类型过滤，如 "image/*"
  title?: string
}

export interface FilePickResult {
  path: string
  name: string
  size: number
  file?: File // Web 平台的 File 对象
}

export interface FileAdapter {
  pickFiles(options?: FilePickOptions): Promise<FilePickResult[]>
  previewFile(filePath: string, mimeType?: string): Promise<void>
  saveFile(sourcePath: string, fileName: string): Promise<string> // 返回保存路径
}

// ==================== UI 适配器 ====================

export interface ToastOptions {
  title: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'none'
  duration?: number
}

export interface ModalOptions {
  title: string
  content: string
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
}

export interface LoadingOptions {
  title?: string
  mask?: boolean
}

export interface UIAdapter {
  showToast(options: ToastOptions): void
  showModal(options: ModalOptions): Promise<boolean> // 返回是否确认
  showLoading(options?: LoadingOptions): void
  hideLoading(): void
}

// ==================== 系统适配器 ====================

export interface SystemInfo {
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web'
  screenWidth: number
  screenHeight: number
  deviceType: 'mobile' | 'tablet' | 'desktop'
  isDarkMode: boolean
}

export interface SystemAdapter {
  getSystemInfo(): Promise<SystemInfo>
  isDesktop(): boolean
  isMobile(): boolean
}

// ==================== 导航适配器 ====================

export interface NavigationAdapter {
  push(path: string): void
  replace(path: string): void
  back(): void
}

// ==================== 平台适配器集合 ====================

export interface PlatformAdapters {
  storage: StorageAdapter
  network: NetworkAdapter
  file: FileAdapter
  ui: UIAdapter
  system: SystemAdapter
  navigation: NavigationAdapter
}
