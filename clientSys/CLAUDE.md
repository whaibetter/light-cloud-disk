# clientSys - Tauri 2.0 跨平台客户端

[根目录](../CLAUDE.md) > **clientSys**

> 变更记录 (Changelog)
> - 2026-05-10 21:26:03: 全仓扫描刷新，确认模块状态无变化
> - 2026-05-10: 初始化模块文档

## 模块职责

基于 Tauri 2.0 的跨平台原生客户端（v3.0.0），支持桌面端（Windows/macOS/Linux）、Android、iOS 和纯 Web 部署。采用**平台适配器架构**，核心业务逻辑与平台 API 完全解耦。

## 入口与启动

- **前端入口**: `src/main.ts`（检测 Tauri/Web 环境，选择适配器，初始化应用）
- **Rust 入口**: `src-tauri/src/main.rs` + `src-tauri/src/lib.rs`
- **HTML 入口**: `index.html`
- **路由**: Vue Router (hash 模式)，三个路由：`/` (home), `/settings`, `/share`

### 启动命令

```bash
npm install
npm run dev         # Vite 开发服务器 (localhost:1420)
npm run dev:tauri   # Tauri 桌面端开发
npm run dev:android # Tauri Android 开发
npm run build       # 前端构建
npm run build:tauri # Tauri 桌面端构建
npm run lint        # ESLint 检查修复
npm run type-check  # TypeScript 类型检查
```

## 架构设计

### 三层架构

```
src/
├── core/           # 核心层 - 平台无关的业务逻辑
│   ├── api/        # API 客户端（依赖 NetworkAdapter 接口）
│   ├── stores/     # Pinia stores（工厂函数模式，注入适配器）
│   ├── types/      # 业务类型定义
│   └── utils/      # 工具函数
├── platform/       # 平台层 - 适配器接口和实现
│   ├── adapters/   # 适配器接口定义（Storage/Network/File/UI/System/Navigation）
│   ├── context.ts  # 依赖注入容器（PlatformContext 单例）
│   ├── tauri/      # Tauri 适配器实现
│   └── web/        # Web 适配器实现
├── ui/             # 界面层 - Vue 组件和页面
│   ├── App.vue
│   ├── components/ # 通用组件 (Toast, LoadingOverlay)
│   ├── pages/      # 页面 (home, settings, share)
│   └── styles/     # 样式 (_variables, _mixins, _reset)
└── main.ts         # 应用入口
```

### 平台适配器接口 (`platform/adapters/index.ts`)

| 适配器 | 职责 | 方法 |
|--------|------|------|
| `StorageAdapter` | 持久化存储 | `get`, `set`, `remove`, `clear` |
| `NetworkAdapter` | 网络请求 | `request`, `upload`, `download` |
| `FileAdapter` | 文件操作 | `pickFiles`, `previewFile`, `saveFile` |
| `UIAdapter` | 界面交互 | `showToast`, `showModal`, `showLoading`, `hideLoading` |
| `SystemAdapter` | 系统信息 | `getSystemInfo`, `isDesktop`, `isMobile` |
| `NavigationAdapter` | 页面导航 | `push`, `replace`, `back` |

### 适配器实现

| 实现 | 文件 | 存储 | 网络 | 文件 | UI |
|------|------|------|------|------|----|
| Tauri | `platform/tauri/index.ts` | @tauri-apps/plugin-store | @tauri-apps/plugin-http | @tauri-apps/plugin-dialog + fs | @tauri-apps/plugin-dialog + 自定义事件 |
| Web | `platform/web/index.ts` | localStorage | fetch + XMLHttpRequest | input[type=file] + Blob | window.alert/confirm + 自定义事件 |

### 依赖注入 (`platform/context.ts`)

`PlatformContext` 单例类，在 `main.ts` 的 `bootstrap()` 中初始化：
1. 检测 `window.__TAURI_INTERNALS__` 判断运行环境
2. 创建对应的适配器集合
3. 注入到 ApiClient 和 Pinia stores
4. 监听 configStore 变化，自动同步到 ApiClient

## 对外接口

### 页面路由

| 路由 | 组件 | 说明 |
|------|------|------|
| `/` | `pages/home/index.vue` | 主页（文件管理） |
| `/settings` | `pages/settings/index.vue` | 设置页 |
| `/share` | `pages/share/index.vue` | 分享下载页 |

### API 客户端 (`core/api/client.ts`)

`ApiClient` 类，通过构造函数注入 `NetworkAdapter`。

**文件 API：**
- `getFiles()` - 获取文件列表
- `uploadFile(filePath, onProgress, file)` - 上传文件
- `deleteFile(fileName)` - 删除文件
- `getFileInfo(fileName)` - 获取单个文件信息
- `downloadFile(fileName, onProgress)` - 下载文件
- `getDownloadUrl(fileName)` - 构建下载 URL
- `healthCheck()` - 健康检查

**分享 API：**
- `createShare(storedName, password, expireHours)` - 创建分享
- `getShares(storedName)` - 获取分享列表
- `deleteShare(token)` - 删除分享
- `getShareInfo(token)` - 获取分享信息（公开）
- `verifySharePassword(token, password)` - 验证密码（公开）
- `getShareDownloadUrl(token, password)` - 构建分享下载 URL

## 关键依赖与配置

### 前端依赖

| 包 | 版本 | 用途 |
|----|------|------|
| @tauri-apps/api | ^2.0.0 | Tauri 核心 API |
| @tauri-apps/plugin-store | ^2.0.0 | 持久化存储 |
| @tauri-apps/plugin-http | ^2.0.0 | HTTP 请求 |
| @tauri-apps/plugin-dialog | ^2.0.0 | 文件选择/确认对话框 |
| @tauri-apps/plugin-fs | ^2.0.0 | 文件系统操作 |
| @tauri-apps/plugin-os | ^2.0.0 | 操作系统信息 |
| @tauri-apps/plugin-shell | ^2.0.0 | 打开文件/URL |
| vue | ^3.4.21 | Vue 3 框架 |
| pinia | ^2.1.7 | 状态管理 |
| vue-router | ^4.3.0 | 路由 |

### Rust 依赖 (`src-tauri/Cargo.toml`)

| 包 | 版本 | 用途 |
|----|------|------|
| tauri | 2 | Tauri 核心 |
| tauri-plugin-store | 2 | 存储插件 |
| tauri-plugin-http | 2 | HTTP 插件 |
| tauri-plugin-dialog | 2 | 对话框插件 |
| tauri-plugin-fs | 2 | 文件系统插件 |
| tauri-plugin-os | 2 | OS 信息插件 |
| tauri-plugin-shell | 2 | Shell 插件 |
| serde / serde_json | 1 | 序列化 |

### Tauri 配置 (`src-tauri/tauri.conf.json`)

- 应用标识: `com.lightclouddisk.app`
- 窗口: 1200x800, 最小 375x600, 居中
- Android: minSdk 24, 支持 aarch64/armv7/i686/x86_64
- 安全: CSP 禁用（开发阶段）
- 插件: store, http, dialog, fs (scope: **), shell

### Vite 配置 (`vite.config.ts`)

- 端口: 1420 (strictPort)
- 路径别名: `@` -> `src/`, `@core` -> `src/core/`, `@platform` -> `src/platform/`, `@ui` -> `src/ui/`
- SCSS 全局变量注入
- 开发代理: `/api` -> `http://117.72.196.45` (rewrite: `/api` -> `/cloud/api`)

## 数据模型

### Store: config.store.ts (工厂函数模式)

```typescript
// 通过 StorageAdapter 持久化，不直接调用平台 API
function createConfigStore(storage: StorageAdapter) {
  return defineStore('config', () => {
    // serverUrl, apiKey, theme, language, viewMode
    // init() - 从 storage 加载
    // save() - 写入 storage
    // setServerUrl(), setApiKey(), setTheme(), toggleTheme() 等
  })
}
```

### Store: file.store.ts (工厂函数模式)

```typescript
function createFileStore(apiClient: ApiClient) {
  return defineStore('file', () => {
    // files, loading, searchQuery, sortBy, sortOrder, selectedTypes
    // filteredFiles (computed - 搜索 + 类型过滤 + 排序)
    // totalSize, fileCount (computed)
    // fetchFiles(), uploadFile(), deleteFile(), downloadFile()
    // setSearchQuery(), setSort(), toggleTypeFilter(), clearTypeFilter()
  })
}
```

### Store: share.store.ts (工厂函数模式)

```typescript
function createShareStore(apiClient: ApiClient) {
  return defineStore('share', () => {
    // currentShares, currentStoredName, loading
    // fetchShares(), createShare(), deleteShare(), getShareUrl(), clear()
  })
}
```

### 类型定义 (`core/types/index.ts`)

包含：`FileInfo`, `ShareRecord`, `AppConfig`, `DEFAULT_CONFIG`, `FileCategory`, `FileTypeFilter`, `FILE_TYPE_FILTERS`, `SortField`, `SortOrder`, `SortOption`, `SORT_OPTIONS`, `ShareInfo`, `CreateShareResponse`, `SharesResponse` 等。

## 测试与质量

- **测试**: 无
- **ESLint**: Vue 3 + TypeScript 规则，`__TAURI_INTERNALS__` 全局变量声明
- **Prettier**: 无分号、单引号、2 空格缩进
- **TypeScript**: 严格模式（`strict: true`）
- **Rust**: release profile 优化（LTO, strip, opt-level "s"）

## 常见问题 (FAQ)

**Q: 如何添加新的平台适配器？**
A: 实现 `PlatformAdapters` 接口中的所有适配器（Storage/Network/File/UI/System/Navigation），然后在 `main.ts` 的 `bootstrap()` 中添加环境检测逻辑。

**Q: stores 为什么用工厂函数而不是直接 defineStore？**
A: 为了依赖注入。工厂函数接收适配器/API 客户端作为参数，使 stores 不直接依赖任何平台 API，实现平台无关。

**Q: 开发时 API 请求为什么走代理？**
A: `vite.config.ts` 配置了 `/api` -> `http://117.72.196.45` 的代理，`ApiClient.buildUrl()` 在 DEV 模式下返回相对路径，避免 CORS 问题。

**Q: Tauri 插件的作用是什么？**
A: Tauri 2.0 将功能拆分为独立插件：`plugin-store`（持久化）、`plugin-http`（网络请求）、`plugin-dialog`（文件选择/对话框）、`plugin-fs`（文件系统）、`plugin-os`（系统信息）、`plugin-shell`（打开文件/URL）。

## 相关文件清单

| 文件 | 说明 |
|------|------|
| `package.json` | 前端依赖和脚本 |
| `vite.config.ts` | Vite 构建配置 |
| `tsconfig.json` | TypeScript 配置 |
| `index.html` | HTML 入口 |
| `.eslintrc.cjs` | ESLint 规则 |
| `.prettierrc` | Prettier 配置 |
| `.gitignore` | Git 忽略规则 |
| `README.md` | 模块说明 |
| `src/main.ts` | 应用入口（环境检测 + 适配器选择） |
| `src/env.d.ts` | 环境类型声明 |
| `src/core/api/client.ts` | API 客户端（平台无关） |
| `src/core/types/index.ts` | 业务类型定义 |
| `src/core/stores/config.store.ts` | 配置 Store（工厂函数） |
| `src/core/stores/file.store.ts` | 文件 Store（工厂函数） |
| `src/core/stores/share.store.ts` | 分享 Store（工厂函数） |
| `src/core/utils/format.ts` | 格式化工具 |
| `src/platform/adapters/index.ts` | 适配器接口定义 |
| `src/platform/context.ts` | 依赖注入容器 |
| `src/platform/tauri/index.ts` | Tauri 适配器实现 |
| `src/platform/web/index.ts` | Web 适配器实现 |
| `src/ui/App.vue` | 根组件 |
| `src/ui/pages/home/index.vue` | 主页 |
| `src/ui/pages/settings/index.vue` | 设置页 |
| `src/ui/pages/share/index.vue` | 分享页 |
| `src/ui/components/Toast.vue` | Toast 组件 |
| `src/ui/components/LoadingOverlay.vue` | 加载遮罩组件 |
| `src/ui/styles/_variables.scss` | SCSS 变量 |
| `src/ui/styles/_mixins.scss` | SCSS Mixins |
| `src/ui/styles/_reset.scss` | 样式重置 |
| `src-tauri/Cargo.toml` | Rust 依赖配置 |
| `src-tauri/tauri.conf.json` | Tauri 应用配置 |
| `src-tauri/src/main.rs` | Rust 入口 |
| `src-tauri/src/lib.rs` | Rust 库 |
| `src-tauri/build.rs` | Rust 构建脚本 |
| `src-tauri/capabilities/default.json` | Tauri 权限配置 |
