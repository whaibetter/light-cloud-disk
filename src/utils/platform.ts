export type Platform = 'h5' | 'app' | 'mp' | 'mp-weixin' | 'mp-alipay'

export function getPlatform(): Platform {
  // #ifdef H5
  return 'h5'
  // #endif

  // #ifdef APP-PLUS
  return 'app'
  // #endif

  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif

  // #ifdef MP-ALIPAY
  return 'mp-alipay'
  // #endif

  // #ifdef MP
  return 'mp'
  // #endif

  return 'h5'
}

export function isH5(): boolean {
  // #ifdef H5
  return true
  // #endif
  return false
}

export function isApp(): boolean {
  // #ifdef APP-PLUS
  return true
  // #endif
  return false
}

export function isMiniProgram(): boolean {
  // #ifdef MP
  return true
  // #endif
  return false
}

export function isWeiXin(): boolean {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  return false
}

export function getSystemInfo() {
  return uni.getSystemInfoSync()
}

export function getPlatformName(): string {
  const info = getSystemInfo()
  return info.platform || 'unknown'
}
