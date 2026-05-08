export interface FileInfo {
  id: string
  originalName: string
  storedName: string
  size: number
  mimetype: string
  uploadTime: string
  md5: string
  shares?: ShareInfo[]
}

export interface ShareInfo {
  token: string
  hasPassword: boolean
  expireAt: string | null
  createdAt: string
  expired: boolean
}

export interface ShareResponse {
  success: boolean
  shareUrl: string
  token: string
  hasPassword: boolean
  expireAt: string | null
}

export interface SharesResponse {
  success: boolean
  shares: ShareInfo[]
}

export interface ShareVerifyResponse {
  success: boolean
  needPassword?: boolean
  fileName?: string
  fileSize?: number
  mimetype?: string
  downloadReady?: boolean
  error?: string
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

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}
