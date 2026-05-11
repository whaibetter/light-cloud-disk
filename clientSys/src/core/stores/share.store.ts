/**
 * 分享存储
 *
 * 平台无关的分享状态管理。
 * 所有分享操作通过 ApiClient 进行，不直接依赖任何平台 API。
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ShareRecord } from '../types'
import type { ApiClient } from '../api/client'

export function createShareStore(apiClient: ApiClient) {
  return defineStore('share', () => {
    const currentShares = ref<ShareRecord[]>([])
    const currentStoredName = ref('')
    const loading = ref(false)

    async function fetchShares(storedName: string) {
      loading.value = true
      currentStoredName.value = storedName
      try {
        const response = await apiClient.getShares(storedName)
        currentShares.value = response.shares || []
      } finally {
        loading.value = false
      }
    }

    async function createShare(
      storedName: string,
      password?: string,
      expireHours?: number
    ): Promise<string> {
      const response = await apiClient.createShare(storedName, password, expireHours)
      // 刷新分享列表
      await fetchShares(storedName)
      return response.token
    }

    async function deleteShare(token: string) {
      await apiClient.deleteShare(token)
      // 从本地列表移除
      const idx = currentShares.value.findIndex((s) => s.token === token)
      if (idx !== -1) {
        currentShares.value.splice(idx, 1)
      }
    }

    function getShareUrl(token: string): string {
      const base = import.meta.env.DEV ? '' : apiClient.getServerUrl()
      return `${base}/#/share?token=${token}`
    }

    function clear() {
      currentShares.value = []
      currentStoredName.value = ''
    }

    return {
      currentShares,
      currentStoredName,
      loading,
      fetchShares,
      createShare,
      deleteShare,
      getShareUrl,
      clear
    }
  })
}
