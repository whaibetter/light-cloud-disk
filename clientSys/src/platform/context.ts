/**
 * 平台上下文
 *
 * 依赖注入容器，负责根据当前运行环境选择合适的适配器，
 * 并提供统一的访问接口。核心业务逻辑通过此文件获取平台能力。
 */

import type { PlatformAdapters } from './adapters'
import { ApiClient } from '../core/api/client'
import { createConfigStore } from '../core/stores/config.store'
import { createFileStore } from '../core/stores/file.store'
import { createShareStore } from '../core/stores/share.store'
import type { Pinia } from 'pinia'

class PlatformContext {
  private adapters: PlatformAdapters | null = null
  private apiClient: ApiClient | null = null
  private pinia: Pinia | null = null

  private configStoreInstance: ReturnType<ReturnType<typeof createConfigStore>> | null = null
  private fileStoreInstance: ReturnType<ReturnType<typeof createFileStore>> | null = null
  private shareStoreInstance: ReturnType<ReturnType<typeof createShareStore>> | null = null

  init(adapters: PlatformAdapters, pinia: Pinia) {
    this.adapters = adapters
    this.pinia = pinia

    // 创建 API 客户端
    this.apiClient = new ApiClient(adapters.network)

    // 创建 Store（传入适配器）
    const ConfigStore = createConfigStore(adapters.storage)
    const FileStore = createFileStore(this.apiClient)
    const ShareStore = createShareStore(this.apiClient)

    this.configStoreInstance = ConfigStore(pinia)
    this.fileStoreInstance = FileStore(pinia)
    this.shareStoreInstance = ShareStore(pinia)
  }

  getAdapters(): PlatformAdapters {
    if (!this.adapters) throw new Error('PlatformContext not initialized')
    return this.adapters
  }

  getApiClient(): ApiClient {
    if (!this.apiClient) throw new Error('PlatformContext not initialized')
    return this.apiClient
  }

  getConfigStore() {
    if (!this.configStoreInstance) throw new Error('PlatformContext not initialized')
    return this.configStoreInstance
  }

  getFileStore() {
    if (!this.fileStoreInstance) throw new Error('PlatformContext not initialized')
    return this.fileStoreInstance
  }

  getShareStore() {
    if (!this.shareStoreInstance) throw new Error('PlatformContext not initialized')
    return this.shareStoreInstance
  }

  getStorage() {
    return this.getAdapters().storage
  }

  getNetwork() {
    return this.getAdapters().network
  }

  getFile() {
    return this.getAdapters().file
  }

  getUI() {
    return this.getAdapters().ui
  }

  getSystem() {
    return this.getAdapters().system
  }

  getNavigation() {
    return this.getAdapters().navigation
  }
}

// 全局单例
export const platform = new PlatformContext()

/**
 * 初始化平台上下文
 *
 * 在应用启动时调用，根据当前环境注入对应的适配器。
 */
export async function initPlatform(adapters: PlatformAdapters, pinia: Pinia) {
  platform.init(adapters, pinia)

  // 初始化配置
  const configStore = platform.getConfigStore()
  await configStore.init()

  // 同步 API 客户端配置
  const apiClient = platform.getApiClient()
  apiClient.updateConfig(configStore.serverUrl, configStore.apiKey)

  // 监听配置变化，同步到 API 客户端
  // Pinia 的 $subscribe 在 store 初始化后可用
  configStore.$subscribe(() => {
    apiClient.updateConfig(configStore.serverUrl, configStore.apiKey)
  })
}
