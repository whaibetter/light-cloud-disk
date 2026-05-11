/**
 * 核心类型定义
 *
 * 平台无关的业务类型，所有层共享。
 */

// ==================== 文件相关 ====================

export interface ShareRecord {
  token: string
  password: string // MD5 hash or empty
  expireAt: string | null
  createdAt: string
}

export interface FileInfo {
  id: string
  originalName: string
  storedName: string
  size: number
  mimetype: string
  uploadTime: string
  md5: string
  shares?: ShareRecord[]
}

export interface UploadResponse {
  success: boolean
  message: string
  files: FileInfo[]
}

export interface FilesResponse {
  success: boolean
  count: number
  files: FileInfo[]
}

export interface DeleteResponse {
  success: boolean
  message: string
}

export interface ApiError {
  error: string
  message?: string
}

// ==================== 配置相关 ====================

export interface AppConfig {
  serverUrl: string
  apiKey: string
  theme: 'light' | 'dark'
  language: string
  viewMode: 'list' | 'grid'
}

export const DEFAULT_CONFIG: AppConfig = {
  serverUrl: '',
  apiKey: '',
  theme: 'light',
  language: 'zh',
  viewMode: 'list'
}

// ==================== 文件类型 ====================

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'

export interface FileTypeFilter {
  label: string
  value: FileCategory
  icon: string
}

export const FILE_TYPE_FILTERS: FileTypeFilter[] = [
  { label: '图片', value: 'image', icon: '🖼️' },
  { label: '视频', value: 'video', icon: '🎬' },
  { label: '音频', value: 'audio', icon: '🎵' },
  { label: '文档', value: 'document', icon: '📄' },
  { label: '压缩包', value: 'archive', icon: '📦' }
]

export type SortField = 'name' | 'time' | 'size'
export type SortOrder = 'asc' | 'desc'

export interface SortOption {
  label: string
  value: SortField
  icon: string
}

export const SORT_OPTIONS: SortOption[] = [
  { label: '上传时间', value: 'time', icon: '🕐' },
  { label: '文件名称', value: 'name', icon: '🔤' },
  { label: '文件大小', value: 'size', icon: '📏' }
]

// ==================== 分享相关 ====================

export interface ShareInfo {
  needPassword: boolean
  downloadReady: boolean
  fileName?: string
  fileSize?: number
  mimetype?: string
}

export interface CreateShareResponse {
  success: boolean
  token: string
  shareUrl: string
}

export interface SharesResponse {
  success: boolean
  shares: ShareRecord[]
}
