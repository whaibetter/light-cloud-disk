/**
 * API 客户端
 *
 * 平台无关的 API 客户端，通过适配器接口进行网络请求。
 * 不直接依赖任何平台 API（如 uni.request 或 fetch）。
 */

import type { NetworkAdapter } from '../../platform/adapters'
import type {
  FilesResponse,
  UploadResponse,
  DeleteResponse,
  FileInfo,
  ShareInfo,
  CreateShareResponse,
  SharesResponse
} from '../types'

export class ApiClient {
  private network: NetworkAdapter
  private serverUrl: string = ''
  private apiKey: string = ''

  constructor(network: NetworkAdapter) {
    this.network = network
  }

  updateConfig(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
  }

  getServerUrl(): string {
    return this.serverUrl
  }

  private checkConfig() {
    if (!this.serverUrl || !this.apiKey) {
      throw new Error('请先在设置页面配置服务器地址和 API Key')
    }
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    // 开发环境使用相对路径，通过 Vite 代理转发，避免 CORS 问题
    if (import.meta.env.DEV) {
      return path
    }
    return `${this.serverUrl}${path}`
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  // ==================== 文件 API ====================

  async getFiles(): Promise<FilesResponse> {
    this.checkConfig()
    return this.network.request<FilesResponse>({
      url: this.buildUrl('/api/files'),
      method: 'GET',
      headers: this.getHeaders()
    })
  }

  async uploadFile(
    filePath: string,
    onProgress?: (loaded: number, total: number, percent: number) => void,
    file?: File
  ): Promise<UploadResponse> {
    this.checkConfig()
    return this.network.upload<UploadResponse>({
      url: this.buildUrl('/api/upload'),
      filePath,
      fieldName: 'files',
      headers: { 'X-API-Key': this.apiKey },
      onProgress: onProgress
        ? (p) => onProgress(p.loaded, p.total, p.percent)
        : undefined
    })
  }

  async deleteFile(fileName: string): Promise<DeleteResponse> {
    this.checkConfig()
    const encodedName = encodeURIComponent(fileName)
    return this.network.request<DeleteResponse>({
      url: this.buildUrl(`/api/files/${encodedName}`),
      method: 'DELETE',
      headers: this.getHeaders()
    })
  }

  async getFileInfo(fileName: string): Promise<{ success: boolean; file: FileInfo }> {
    this.checkConfig()
    const encodedName = encodeURIComponent(fileName)
    return this.network.request<{ success: boolean; file: FileInfo }>({
      url: this.buildUrl(`/api/files/${encodedName}`),
      method: 'GET',
      headers: this.getHeaders()
    })
  }

  async downloadFile(
    fileName: string,
    onProgress?: (loaded: number, total: number, percent: number) => void
  ): Promise<string> {
    this.checkConfig()
    const encodedName = encodeURIComponent(fileName)
    return this.network.download({
      url: this.buildUrl(`/api/download/${encodedName}`),
      fileName,
      headers: { 'X-API-Key': this.apiKey },
      onProgress: onProgress
        ? (p) => onProgress(p.loaded, p.total, p.percent)
        : undefined
    })
  }

  getDownloadUrl(fileName: string): string {
    const encodedName = encodeURIComponent(fileName)
    const base = import.meta.env.DEV ? '' : this.serverUrl
    return `${base}/api/download/${encodedName}?apiKey=${encodeURIComponent(this.apiKey)}`
  }

  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    return this.network.request({
      url: this.buildUrl('/api/health'),
      method: 'GET'
    })
  }

  // ==================== 分享 API ====================

  async createShare(
    storedName: string,
    password?: string,
    expireHours?: number
  ): Promise<CreateShareResponse> {
    this.checkConfig()
    const encodedName = encodeURIComponent(storedName)
    return this.network.request<CreateShareResponse>({
      url: this.buildUrl(`/api/share/${encodedName}`),
      method: 'POST',
      headers: this.getHeaders(),
      body: { password: password || '', expireHours: expireHours || 0 }
    })
  }

  async getShares(storedName: string): Promise<SharesResponse> {
    this.checkConfig()
    const encodedName = encodeURIComponent(storedName)
    return this.network.request<SharesResponse>({
      url: this.buildUrl(`/api/shares/${encodedName}`),
      method: 'GET',
      headers: this.getHeaders()
    })
  }

  async deleteShare(token: string): Promise<DeleteResponse> {
    this.checkConfig()
    return this.network.request<DeleteResponse>({
      url: this.buildUrl(`/api/share/${token}`),
      method: 'DELETE',
      headers: this.getHeaders()
    })
  }

  async getShareInfo(token: string): Promise<ShareInfo> {
    return this.network.request<ShareInfo>({
      url: this.buildUrl(`/api/s/${token}`),
      method: 'GET'
    })
  }

  async verifySharePassword(
    token: string,
    password: string
  ): Promise<ShareInfo & { success: boolean }> {
    return this.network.request<ShareInfo & { success: boolean }>({
      url: this.buildUrl(`/api/s/${token}/verify`),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { password }
    })
  }

  getShareDownloadUrl(token: string, password?: string): string {
    const base = import.meta.env.DEV ? '' : this.serverUrl
    let url = `${base}/api/s/${token}/download`
    if (password) {
      url += `?password=${encodeURIComponent(password)}`
    }
    return url
  }
}
