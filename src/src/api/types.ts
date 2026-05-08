export interface FileInfo {
  id: string
  originalName: string
  storedName: string
  size: number
  mimetype: string
  uploadTime: string
  md5: string
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
