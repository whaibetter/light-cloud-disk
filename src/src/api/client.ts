import { useConfigStore } from '@/stores/config.store'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  timeout?: number
}

interface RequestResult {
  data: any
  statusCode: number
  header: Record<string, string>
}

const DEFAULT_BASE_URL = 'http://localhost:3000'
const DEFAULT_API_KEY = 'light-cloud-disk-2026'

class ApiClient {
  private baseURL: string = DEFAULT_BASE_URL
  private apiKey: string = DEFAULT_API_KEY
  private timeout: number = 30000

  constructor() {
    this.updateConfig()
  }

  updateConfig() {
    try {
      const configStore = useConfigStore()
      const url = configStore.serverUrl
      this.baseURL = (url && url.trim()) ? url.trim().replace(/\/+$/, '') : DEFAULT_BASE_URL
      this.apiKey = (configStore.apiKey && configStore.apiKey.trim()) ? configStore.apiKey.trim() : DEFAULT_API_KEY
    } catch (e) {
      this.baseURL = DEFAULT_BASE_URL
      this.apiKey = DEFAULT_API_KEY
    }
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const base = this.baseURL.replace(/\/+$/, '')
    const path = url.startsWith('/') ? url : '/' + url
    return base + path
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  async request<T = any>(options: RequestOptions): Promise<T> {
    this.updateConfig()

    const {
      url,
      method = 'GET',
      data,
      header = {},
      timeout = this.timeout
    } = options

    const fullUrl = this.buildUrl(url)
    const headers = { ...this.getHeaders(), ...header }

    return new Promise((resolve, reject) => {
      const requestOptions: any = {
        url: fullUrl,
        method,
        header: headers,
        timeout,
        success: (res: RequestResult) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            const errorMsg = res.data?.error || res.data?.message || `Request failed: ${res.statusCode}`
            reject(new Error(errorMsg))
          }
        },
        fail: (err: any) => {
          reject(new Error(err.errMsg || 'Network request failed'))
        }
      }

      if (data && method !== 'GET') {
        requestOptions.data = data
      } else if (data && method === 'GET') {
        const queryString = Object.entries(data)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as any)}`)
          .join('&')
        requestOptions.url = fullUrl + (queryString ? `?${queryString}` : '')
      }

      uni.request(requestOptions)
    })
  }

  async get<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'GET', data })
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'POST', data })
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data })
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', data })
  }

  uploadFile(
    url: string,
    filePath: string,
    name: string = 'files',
    onProgress?: (percent: number) => void
  ): Promise<any> {
    this.updateConfig()

    return new Promise((resolve, reject) => {
      const fullUrl = this.buildUrl(url)

      const uploadTask = uni.uploadFile({
        url: fullUrl,
        filePath,
        name,
        header: {
          'X-API-Key': this.apiKey
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(res.data)
              resolve(data)
            } catch {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || 'Upload failed'))
        }
      })

      if (onProgress) {
        uploadTask.onProgressUpdate((res) => {
          onProgress(res.progress)
        })
      }
    })
  }

  downloadFile(url: string, fileName?: string): void {
    this.updateConfig()

    const fullUrl = this.buildUrl(url)

    const downloadTask = uni.downloadFile({
      url: fullUrl,
      header: {
        'X-API-Key': this.apiKey
      },
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              uni.showToast({
                title: '下载成功',
                icon: 'success'
              })
              console.log('File saved to:', saveRes.savedFilePath)
            },
            fail: () => {
              uni.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
        console.error('Download failed:', err)
      }
    })

    if (fileName) {
      downloadTask.onProgressUpdate((res) => {
        uni.showLoading({ title: `下载中 ${res.progress}%` })
        if (res.progress === 100) {
          uni.hideLoading()
        }
      })
    }
  }
}

export const apiClient = new ApiClient()
