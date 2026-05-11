# src - Uni-app 前端

[根目录](../CLAUDE.md) > **src**

> 变更记录 (Changelog)
> - 2026-05-10 21:26:03: 全仓扫描刷新，确认模块状态无变化
> - 2026-05-10: 初始化模块文档

## 模块职责

基于 Uni-app 的跨平台前端应用（v2.0.0），支持 H5、Android、iOS、微信小程序等多端运行。使用 Vue 3 + Pinia + TypeScript 构建，uview-plus 提供 UI 组件。

## 入口与启动

- **入口文件**: `src/main.ts`（创建 Vue 应用 + Pinia）
- **根组件**: `src/App.vue`（主题管理、全局样式变量）
- **路由配置**: `src/pages.json`（两个页面 + TabBar）
- **应用配置**: `src/manifest.json`（平台配置、权限、H5 路由等）

### 启动命令

```bash
npm install
npm run dev:h5           # H5 开发 (localhost:5173)
npm run dev:app-android  # Android 开发
npm run dev:mp-weixin    # 微信小程序开发
npm run build:h5         # H5 生产构建
npm run lint             # ESLint 检查修复
npm run type-check       # TypeScript 类型检查
```

## 对外接口

### 页面路由

| 页面 | 路径 | 说明 |
|------|------|------|
| 主页 | `pages/index/index` | 文件管理（自定义导航栏，移动端/桌面端双布局） |
| 设置 | `pages/settings/index` | 服务器配置、显示设置、存储信息 |

TabBar：文件、设置

### API 客户端 (`api/client.ts`)

`ApiClient` 类封装所有网络请求，自动从 `configStore` 读取服务器地址和 API Key。

核心方法：
- `request<T>(options)` - 通用请求（uni.request）
- `uploadFile(url, filePath, name, onProgress, file)` - 文件上传（H5 用 XMLHttpRequest，App 用 uni.uploadFile）
- `downloadFile(url, fileName)` - 文件下载（uni.downloadFile）

### 文件 API (`api/modules/file.ts`)

| 方法 | 说明 |
|------|------|
| `getFiles()` | GET /api/files |
| `uploadFile(filePath, onProgress, file)` | POST /api/upload |
| `deleteFile(fileName)` | DELETE /api/files/:filename |
| `getDownloadUrl(fileName, baseURL)` | 构建下载 URL |

### 类型定义 (`api/types.ts`)

```typescript
interface FileInfo {
  id: string; originalName: string; storedName: string;
  size: number; mimetype: string; uploadTime: string; md5: string;
}
interface UploadResponse { success: boolean; message: string; files: FileInfo[] }
interface FilesResponse { success: boolean; count: number; files: FileInfo[] }
interface DeleteResponse { success: boolean; message: string }
interface UploadProgress { loaded: number; total: number; percent: number }
```

## 关键依赖与配置

### 依赖

| 包 | 版本 | 用途 |
|----|------|------|
| @dcloudio/uni-app | 3.0.0-alpha | Uni-app 核心 |
| @dcloudio/uni-h5 | 3.0.0-alpha | H5 平台支持 |
| @dcloudio/uni-mp-weixin | 3.0.0-alpha | 微信小程序支持 |
| @dcloudio/uni-app-plus | 3.0.0-alpha | App 平台支持 |
| vue | ^3.4.21 | Vue 3 框架 |
| pinia | ^2.1.7 | 状态管理 |
| sass | ^1.72.0 | SCSS 预处理器 |
| typescript | ^5.4.3 | TypeScript |
| vite | ^5.2.6 | 构建工具 |

### 构建配置

- **Vite** (`vite.config.ts`): CLI 开发/构建，base 为 `/cloud/`，SCSS 全局变量注入，terser 压缩移除 console
- **Vue CLI** (`vue.config.js`): HBuilderX IDE 使用
- **开发代理**: `/api` -> `http://localhost:3000`
- **H5 路由模式**: hash，base 为 `/cloud/`

## 数据模型

### Store: config.store.ts

```typescript
// 持久化到 uni.storage
const STORAGE_KEYS = {
  SERVER_URL: 'lcd_server_url',
  API_KEY: 'lcd_api_key',
  THEME: 'lcd_theme',       // 'light' | 'dark'
  LANGUAGE: 'lcd_language',  // 默认 'zh'
  VIEW_MODE: 'lcd_view_mode' // 'list' | 'grid'
}
```

主要方法：`setServerUrl()`, `setApiKey()`, `setTheme()`, `toggleTheme()`, `setViewMode()`, `resetToDefault()`, `isConfigValid()`

### Store: file.store.ts

状态：`files`, `loading`, `viewMode`, `selectedIds`, `searchQuery`, `sortBy`, `sortOrder`

计算属性：`filteredFiles`（搜索 + 排序）, `selectedFiles`, `hasSelection`

主要方法：`fetchFiles()`, `uploadFile()`, `deleteFile()`, `setSearchQuery()`, `setSort()`

## 测试与质量

- **测试**: 无
- **ESLint**: Vue 3 + TypeScript 规则，生产环境禁止 console/debugger
- **Prettier**: 无分号、单引号、2 空格缩进、100 字符行宽
- **TypeScript**: 宽松配置（允许 `any`、允许非空断言）

## 常见问题 (FAQ)

**Q: 如何添加新页面？**
A: 在 `src/pages/` 下创建目录和 `.vue` 文件，然后在 `src/pages.json` 的 `pages` 数组中注册。

**Q: easycom 组件如何使用？**
A: `u-` 前缀组件自动映射到 uview-plus，如 `<u-button>` 自动导入 `uview-plus/components/u-button/u-button.vue`。

**Q: 如何处理平台差异？**
A: 使用条件编译 `// #ifdef H5` / `// #endif`，或使用 `uni.getSystemInfoSync()` 判断平台。

**Q: 主题切换如何工作？**
A: SCSS 变量（编译时）+ CSS 变量（运行时）双层架构。`App.vue` 中定义 `:root` 和 `[data-theme="dark"]` 的 CSS 变量，`configStore.setTheme()` 切换 `data-theme` 属性。

## 相关文件清单

| 文件 | 说明 |
|------|------|
| `package.json` | 依赖和脚本 |
| `vite.config.ts` | Vite 构建配置 |
| `vue.config.js` | Vue CLI 配置（HBuilderX） |
| `tsconfig.json` | TypeScript 配置 |
| `.eslintrc.js` | ESLint 规则 |
| `.prettierrc` | Prettier 格式化配置 |
| `index.html` | H5 入口 HTML |
| `src/main.ts` | 应用入口 |
| `src/App.vue` | 根组件（主题 + 全局样式） |
| `src/pages.json` | 页面路由和 TabBar 配置 |
| `src/manifest.json` | 应用配置（平台、权限、H5 路由） |
| `src/api/client.ts` | API 客户端封装 |
| `src/api/types.ts` | 类型定义 |
| `src/api/modules/file.ts` | 文件 API 模块 |
| `src/api/index.ts` | API 导出 |
| `src/stores/config.store.ts` | 配置 Store |
| `src/stores/file.store.ts` | 文件 Store |
| `src/stores/index.ts` | Store 导出 |
| `src/pages/index/index.vue` | 主页（文件管理） |
| `src/pages/settings/index.vue` | 设置页 |
| `src/components/FileList/FileList.vue` | 文件列表组件 |
| `src/components/FileCard/FileCard.vue` | 文件卡片组件 |
| `src/components/UploadPanel/UploadPanel.vue` | 上传面板组件 |
| `src/utils/file.ts` | 文件选择工具 |
| `src/utils/format.ts` | 格式化工具 |
| `src/utils/platform.ts` | 平台判断工具 |
| `src/utils/index.ts` | 工具导出 |
| `src/styles/_variables.scss` | 全局 SCSS 变量 |
| `src/styles/_mixins.scss` | 全局 SCSS Mixins |
| `src/styles/_reset.scss` | 样式重置 |
