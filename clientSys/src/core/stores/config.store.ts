/**
 * 配置存储
 *
 * 平台无关的配置管理，通过 StorageAdapter 持久化。
 * 不直接调用 uni.getStorageSync / localStorage 等平台 API。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig } from '../types'
import { DEFAULT_CONFIG } from '../types'
import type { StorageAdapter } from '../../platform/adapters'

const STORAGE_KEY = 'lcd_config'

export function createConfigStore(storage: StorageAdapter) {
  return defineStore('config', () => {
    const serverUrl = ref(DEFAULT_CONFIG.serverUrl)
    const apiKey = ref(DEFAULT_CONFIG.apiKey)
    const theme = ref<AppConfig['theme']>(DEFAULT_CONFIG.theme)
    const language = ref(DEFAULT_CONFIG.language)
    const viewMode = ref<AppConfig['viewMode']>(DEFAULT_CONFIG.viewMode)
    const initialized = ref(false)

    const isConfigValid = computed(() => serverUrl.value.length > 0 && apiKey.value.length > 0)

    async function init() {
      if (initialized.value) return
      const saved = await storage.get<AppConfig>(STORAGE_KEY)
      if (saved) {
        serverUrl.value = saved.serverUrl || DEFAULT_CONFIG.serverUrl
        apiKey.value = saved.apiKey || DEFAULT_CONFIG.apiKey
        theme.value = saved.theme || DEFAULT_CONFIG.theme
        language.value = saved.language || DEFAULT_CONFIG.language
        viewMode.value = saved.viewMode || DEFAULT_CONFIG.viewMode
      }
      initialized.value = true
    }

    async function save() {
      await storage.set<AppConfig>(STORAGE_KEY, {
        serverUrl: serverUrl.value,
        apiKey: apiKey.value,
        theme: theme.value,
        language: language.value,
        viewMode: viewMode.value
      })
    }

    function normalizeUrl(url: string): string {
      if (!url || !url.trim()) return ''
      let normalized = url.trim().replace(/\/+$/, '')
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'http://' + normalized
      }
      return normalized
    }

    async function setServerUrl(url: string) {
      serverUrl.value = normalizeUrl(url)
      await save()
    }

    async function setApiKey(key: string) {
      apiKey.value = key
      await save()
    }

    async function setTheme(newTheme: AppConfig['theme']) {
      theme.value = newTheme
      await save()
      applyTheme(newTheme)
    }

    async function toggleTheme() {
      await setTheme(theme.value === 'light' ? 'dark' : 'light')
    }

    async function setLanguage(lang: string) {
      language.value = lang
      await save()
    }

    async function setViewMode(mode: AppConfig['viewMode']) {
      viewMode.value = mode
      await save()
    }

    async function resetToDefault() {
      serverUrl.value = DEFAULT_CONFIG.serverUrl
      apiKey.value = DEFAULT_CONFIG.apiKey
      theme.value = DEFAULT_CONFIG.theme
      language.value = DEFAULT_CONFIG.language
      viewMode.value = DEFAULT_CONFIG.viewMode
      await storage.remove(STORAGE_KEY)
    }

    function applyTheme(t: string) {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', t)
        document.body.className = t === 'dark' ? 'theme-dark' : 'theme-light'
      }
    }

    return {
      serverUrl,
      apiKey,
      theme,
      language,
      viewMode,
      initialized,
      isConfigValid,
      init,
      setServerUrl,
      setApiKey,
      setTheme,
      toggleTheme,
      setLanguage,
      setViewMode,
      resetToDefault,
      applyTheme
    }
  })
}
