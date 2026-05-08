import { apiClient } from '../client'
import type { FilesResponse, UploadResponse, DeleteResponse } from '../types'

export const fileApi = {
  async getFiles(): Promise<FilesResponse> {
    return apiClient.get<FilesResponse>('/api/files')
  },

  async uploadFile(
    filePath: string,
    onProgress?: (percent: number) => void,
    file?: File
  ): Promise<UploadResponse> {
    return apiClient.uploadFile('/api/upload', filePath, 'files', onProgress, file)
  },

  async deleteFile(fileName: string): Promise<DeleteResponse> {
    const encodedName = encodeURIComponent(fileName)
    return apiClient.delete<DeleteResponse>(`/api/files/${encodedName}`)
  },

  getDownloadUrl(fileName: string, baseURL: string): string {
    const encodedName = encodeURIComponent(fileName)
    const base = (baseURL && baseURL.trim()) ? baseURL.trim().replace(/\/+$/, '') : 'http://localhost:3000'
    return `${base}/api/download/${encodedName}`
  }
}
