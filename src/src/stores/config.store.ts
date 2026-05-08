import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  SERVER_URL: 'lcd_server_url',
  API_KEY: 'lcd_api_key',
  THEME: 'lcd_theme',
  LANGUAGE: 'lcd_language',
  VIEW_MODE: 'lcd_view_mode'
} as const

function getDefaultServerUrl(): string {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const host = window.location.host
    // 如果在 /cloud/ 路径下，返回当前域名 + /cloud
    if (window.location.pathname.startsWith('/cloud')) {
      return `${protocol}//${host}/cloud`
    }
    return `${protocol}//${host}`
  }
  // #endif
  return 'http://117.72.196.45:12137'
}

const DEFAULTS = {
  SERVER_URL: getDefaultServerUrl(),
  API_KEY: '12138qwe',
  THEME: 'light',
  LANGUAGE: 'zh-CN',
  VIEW_MODE: 'list'
}

function normalizeUrl(url: string): string {
  if (!url || !url.trim()) return DEFAULTS.SERVER_URL
  let normalized = url.trim().replace(/\/+$/, '')
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'http://' + normalized
  }
  return normalized
}

export const useConfigStore = defineStore('config', () => {
  const serverUrl = ref(normalizeUrl(uni.getStorageSync(STORAGE_KEYS.SERVER_URL) || ''))
  const apiKey = ref(uni.getStorageSync(STORAGE_KEYS.API_KEY) || DEFAULTS.API_KEY)
  const theme = ref(uni.getStorageSync(STORAGE_KEYS.THEME) || DEFAULTS.THEME)
  const language = ref(uni.getStorageSync(STORAGE_KEYS.LANGUAGE) || DEFAULTS.LANGUAGE)
  const viewMode = ref(uni.getStorageSync(STORAGE_KEYS.VIEW_MODE) || DEFAULTS.VIEW_MODE)

  function setServerUrl(url: string) {
    const normalized = normalizeUrl(url)
    serverUrl.value = normalized
    uni.setStorageSync(STORAGE_KEYS.SERVER_URL, normalized)
  }

  function setApiKey(key: string) {
    apiKey.value = key
    uni.setStorageSync(STORAGE_KEYS.API_KEY, key)
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    uni.setStorageSync(STORAGE_KEYS.THEME, newTheme)
    applyTheme(newTheme)
  }

  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  function setLanguage(lang: string) {
    language.value = lang
    uni.setStorageSync(STORAGE_KEYS.LANGUAGE, lang)
  }

  function setViewMode(mode: 'list' | 'grid') {
    viewMode.value = mode
    uni.setStorageSync(STORAGE_KEYS.VIEW_MODE, mode)
  }

  function resetToDefault() {
    serverUrl.value = DEFAULTS.SERVER_URL
    apiKey.value = DEFAULTS.API_KEY
    theme.value = DEFAULTS.THEME
    language.value = DEFAULTS.LANGUAGE
    viewMode.value = DEFAULTS.VIEW_MODE

    uni.setStorageSync(STORAGE_KEYS.SERVER_URL, DEFAULTS.SERVER_URL)
    uni.setStorageSync(STORAGE_KEYS.API_KEY, DEFAULTS.API_KEY)
    uni.setStorageSync(STORAGE_KEYS.THEME, DEFAULTS.THEME)
    uni.setStorageSync(STORAGE_KEYS.LANGUAGE, DEFAULTS.LANGUAGE)
    uni.setStorageSync(STORAGE_KEYS.VIEW_MODE, DEFAULTS.VIEW_MODE)
  }

  function isConfigValid(): boolean {
    return serverUrl.value.length > 0 && apiKey.value.length > 0
  }

  function applyTheme(t: string) {
    uni.setStorageSync(STORAGE_KEYS.THEME, t)
  }

  return {
    serverUrl,
    apiKey,
    theme,
    language,
    viewMode,
    setServerUrl,
    setApiKey,
    setTheme,
    toggleTheme,
    setLanguage,
    setViewMode,
    resetToDefault,
    isConfigValid
  }
})
