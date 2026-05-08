import { apiClient } from '../client'
import type { FilesResponse, UploadResponse, DeleteResponse, ShareResponse, SharesResponse, ShareVerifyResponse } from '../types'

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
  },

  async createShare(fileName: string, password?: string, expireHours?: number): Promise<ShareResponse> {
    const encodedName = encodeURIComponent(fileName)
    return apiClient.post<ShareResponse>(`/api/share/${encodedName}`, { password, expireHours })
  },

  async getShares(fileName: string): Promise<SharesResponse> {
    const encodedName = encodeURIComponent(fileName)
    return apiClient.get<SharesResponse>(`/api/shares/${encodedName}`)
  },

  async getAllShares(): Promise<{ success: boolean, shares: any[] }> {
    return apiClient.get('/api/shares')
  },

  async deleteShare(token: string): Promise<any> {
    return apiClient.delete(`/api/share/${token}`)
  },

  async getShareInfo(token: string): Promise<ShareVerifyResponse> {
    return apiClient.get<ShareVerifyResponse>(`/api/s/${token}`)
  },

  async verifySharePassword(token: string, password: string): Promise<ShareVerifyResponse> {
    return apiClient.post<ShareVerifyResponse>(`/api/s/${token}/verify`, { password })
  },

  getShareDownloadUrl(token: string, baseURL: string, password?: string): string {
    const base = (baseURL && baseURL.trim()) ? baseURL.trim().replace(/\/+$/, '') : 'http://localhost:3000'
    let url = `${base}/api/s/${token}/download`
    if (password) {
      url += `?password=${encodeURIComponent(password)}`
    }
    return url
  }
}
