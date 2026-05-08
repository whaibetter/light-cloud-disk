# 轻量云盘 (Light Cloud Disk) — Code Wiki

> 版本：v2.0.0 | 许可证：MIT | 作者：QClaw

---

## 目录

1. [项目概览](#1-项目概览)
2. [整体架构](#2-整体架构)
3. [目录结构](#3-目录结构)
4. [后端服务 (server/)](#4-后端服务-server)
5. [Web 前端 (web/)](#5-web-前端-web)
6. [Uni-app 跨平台前端 (src/)](#6-uni-app-跨平台前端-src)
7. [Android 原生客户端 (android/)](#7-android-原生客户端-android)
8. [部署与运维配置](#8-部署与运维配置)
9. [API 接口文档](#9-api-接口文档)
10. [数据模型](#10-数据模型)
11. [依赖关系图](#11-依赖关系图)
12. [项目运行方式](#12-项目运行方式)
13. [安全与配置说明](#13-安全与配置说明)

---

## 1. 项目概览

轻量云盘是一个面向个人用户的轻量级文件同步与管理系统，核心设计理念为**极简架构、轻量部署、跨平台访问**。系统支持文件在 Android 设备与 Web 端之间的便捷同步与管理，采用基于 API Key 的简单认证机制，避免复杂的 OAuth / JWT 流程。

### 核心特性

| 特性 | 说明 |
|------|------|
| 轻量化设计 | 后端单文件 Express 服务，无数据库依赖，JSON 文件存储元数据 |
| 跨平台支持 | Web 端（原生 HTML/JS + Uni-app H5）、Android 原生、微信小程序 |
| 简单认证 | 基于 `X-API-Key` 请求头认证，无用户体系 |
| 文件管理 | 上传（多文件）、下载（流式传输）、删除、搜索、排序 |
| 响应式界面 | Web 端支持桌面/移动设备，网格/列表双视图，深色模式 |
| **搜索与排序** | 支持按文件名搜索、按文件类型筛选、按时间/名称/大小排序 |

---

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Clients)                        │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐ │
│  │  Web 前端     │  │  Uni-app 前端     │  │  Android 原生      │ │
│  │  (HTML/JS/CSS)│  │  (Vue3 + Pinia)  │  │  (Kotlin+Retrofit)│ │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬──────────┘ │
│         │                   │                      │            │
│         │  fetch / XHR      │  uni.request         │  Retrofit   │
│         │                   │  uni.uploadFile       │  OkHttp     │
└─────────┼───────────────────┼──────────────────────┼────────────┘
          │                   │                      │
          ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Nginx 反向代理 (可选)                         │
│         /syncqclous/api/  →  http://127.0.0.1:12140/            │
│         /syncqclous/      →  静态文件服务                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  后端服务 (Node.js + Express)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ CORS 中间件 │  │ JSON 解析   │  │ API Key  │  │ Multer     │ │
│  │            │  │ 中间件      │  │ 认证中间件│  │ 文件上传   │ │
│  └────────────┘  └────────────┘  └──────────┘  └────────────┘ │
│                                                                  │
│  路由:                                                           │
│  GET  /api/health          — 健康检查                            │
│  POST /api/upload          — 上传文件                            │
│  GET  /api/files           — 获取文件列表                        │
│  GET  /api/files/:filename — 获取单个文件信息                    │
│  GET  /api/download/:filename — 下载文件                         │
│  DELETE /api/files/:filename — 删除文件                          │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       存储层 (Storage)                            │
│  ┌──────────────────┐  ┌──────────────────────────────────┐    │
│  │ uploads/         │  │ data/files.json                  │    │
│  │ (物理文件存储)    │  │ (文件元数据 JSON 数据库)          │    │
│  └──────────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 架构特点

- **无数据库**：使用 `files.json` 文件作为元数据存储，读写通过 `fs.readFileSync / writeFileSync` 实现
- **单进程**：Express 单进程服务，适合个人使用场景
- **流式传输**：文件下载使用 `fs.createReadStream().pipe(res)` 流式传输，支持大文件
- **配置双源**：支持 `.env` 环境变量和 `config.json` 配置文件，优先级为 `.env` > `config.json` > 默认值

---

## 3. 目录结构

```
light-cloud-disk/
├── server/                          # 后端服务 (Node.js + Express)
│   ├── index.js                     # 主服务文件（所有路由与中间件）
│   ├── package.json                 # 依赖配置
│   ├── .env.example                 # 环境变量模板
│   ├── uploads/                     # 文件存储目录（运行时自动创建）
│   └── data/
│       └── files.json               # 文件元数据（运行时自动创建）
│
├── web/                             # Web 前端（原生 HTML/CSS/JS）
│   ├── index.html                   # 主页面
│   ├── style.css                    # 样式文件
│   └── app.js                       # 前端逻辑（Config/API/UI 三大模块）
│
├── src/                             # Uni-app 跨平台前端 (Vue3 + Pinia)
│   ├── main.ts                      # 应用入口，创建 SSR App + Pinia
│   ├── App.vue                      # 根组件
│   ├── pages.json                   # 页面路由与导航栏配置
│   ├── manifest.json                # Uni-app 应用配置
│   ├── package.json                 # 依赖配置
│   ├── vite.config.ts               # Vite 构建配置
│   ├── tsconfig.json                # TypeScript 配置
│   ├── uni.scss                     # 全局 SCSS 变量引入
│   ├── api/                         # API 请求层
│   │   ├── index.ts                 # 统一导出
│   │   ├── client.ts                # ApiClient 封装类
│   │   ├── types.ts                 # TypeScript 类型定义
│   │   └── modules/
│   │       └── file.ts              # 文件相关 API
│   ├── components/                  # 公共组件
│   │   ├── FileCard/
│   │   │   └── FileCard.vue         # 文件卡片组件
│   │   ├── FileList/
│   │   │   └── FileList.vue         # 文件列表组件（列表/网格视图）
│   │   └── UploadPanel/
│   │       └── UploadPanel.vue      # 上传面板组件
│   ├── pages/                       # 页面
│   │   ├── index/
│   │   │   └── index.vue            # 首页（文件列表与上传）
│   │   └── settings/
│   │       └── index.vue            # 设置页
│   ├── stores/                      # Pinia 状态管理
│   │   ├── index.ts                 # 统一导出
│   │   ├── file.store.ts            # 文件状态
│   │   └── config.store.ts          # 配置状态
│   ├── styles/                      # 全局样式
│   │   ├── _variables.scss          # SCSS 变量
│   │   ├── _mixins.scss             # SCSS 混入
│   │   └── _reset.scss              # 样式重置
│   ├── utils/                       # 工具函数
│   │   ├── index.ts                 # 统一导出
│   │   ├── format.ts                # 格式化工具
│   │   ├── platform.ts              # 平台检测工具
│   │   └── file.ts                  # 文件操作工具
│   └── static/                      # 静态资源
│       └── plugin.js                # 插件脚本
│
├── android/                         # Android 原生客户端 (Kotlin)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/example/lightclouddisk/
│   │   │   │   ├── MainActivity.kt       # 主界面 Activity
│   │   │   │   ├── SettingsActivity.kt   # 设置界面 Activity
│   │   │   │   ├── FileUploadService.kt  # 后台上传 Service
│   │   │   │   ├── FileAdapter.kt        # RecyclerView 适配器
│   │   │   │   ├── ConfigManager.kt      # 配置管理单例
│   │   │   │   └── api/
│   │   │   │       └── ApiService.kt     # Retrofit API 接口 + 数据模型
│   │   │   ├── res/                      # Android 资源文件
│   │   │   └── AndroidManifest.xml       # 应用清单
│   │   └── build.gradle                  # 应用构建配置
│   ├── build.gradle                      # 项目构建配置
│   ├── settings.gradle                   # Gradle 设置
│   └── gradle.properties                 # Gradle 属性
│
├── config.example.json              # 全局配置模板
├── nginx-syncqclous.conf            # Nginx 反向代理配置
├── deploy-to-server.sh              # 服务器部署脚本
├── .gitignore                       # Git 忽略规则
└── README.md                        # 项目说明
```

---

## 4. 后端服务 (server/)

### 4.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | ^4.18.2 | HTTP 服务框架 |
| Multer | ^1.4.5-lts.1 | multipart/form-data 文件上传处理 |
| cors | ^2.8.5 | 跨域资源共享 |
| md5 | ^2.3.0 | 文件 MD5 哈希计算 |
| dotenv | ^16.3.1 | 环境变量加载 |
| nodemon | ^3.0.1 (dev) | 开发热重载 |

### 4.2 核心文件：[index.js](server/index.js)

整个后端服务集中在单一文件 `index.js` 中，约 315 行代码。

#### 4.2.1 配置加载机制

```
优先级: .env 环境变量 > config.json 文件 > 代码默认值
```

| 配置项 | 环境变量 | config.json 路径 | 默认值 |
|--------|----------|------------------|--------|
| 端口 | `PORT` | `server.port` | `3000` |
| API 密钥 | `API_KEY` | `server.api_key` | `light-cloud-disk-2026` |
| 上传目录 | `UPLOAD_DIR` | `server.upload_dir` | `./uploads` |
| 文件大小限制 | `MAX_FILE_SIZE` | `server.max_file_size` | `100` (MB) |
| 跨域域名 | `ALLOWED_ORIGINS` | `server.allowed_origins` | `*` |

#### 4.2.2 关键函数

| 函数 | 说明 |
|------|------|
| `authenticateAPIKey(req, res, next)` | API Key 认证中间件，从 `X-API-Key` 请求头或 `apiKey` 查询参数获取密钥 |
| `readFilesDB()` | 读取 `data/files.json` 文件元数据，返回数组 |
| `writeFilesDB(data)` | 写入文件元数据到 `data/files.json` |
| `calculateMD5(filePath)` | 计算指定文件的 MD5 哈希值 |

#### 4.2.3 API 路由

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 否 | 健康检查，返回服务器运行状态 |
| POST | `/api/upload` | 是 | 上传文件，支持多文件（最多10个），字段名 `files` |
| GET | `/api/files` | 是 | 获取全部文件列表 |
| GET | `/api/files/:filename` | 是 | 获取单个文件的元数据 |
| GET | `/api/download/:filename` | 是 | 下载文件，流式传输，设置 `Content-Disposition` |
| DELETE | `/api/files/:filename` | 是 | 删除文件（物理删除 + 元数据移除） |

#### 4.2.4 Multer 存储配置

- **存储位置**：`UPLOAD_DIR` 目录
- **命名规则**：`{原始文件名}-{时间戳}-{随机数}{扩展名}`，避免重名冲突
- **大小限制**：单文件最大 `MAX_FILE_SIZE` MB，单次最多 10 个文件
- **MD5 校验**：上传完成后计算文件 MD5 并存入元数据

#### 4.2.5 错误处理

- Multer 专用错误处理中间件，区分 `LIMIT_FILE_SIZE` 和 `LIMIT_FILE_COUNT`
- 通用 500 错误兜底

#### 4.2.6 静态文件服务

```javascript
app.use('/files', express.static(UPLOAD_DIR));
```

上传的文件可通过 `/files/{storedName}` 直接访问（无需认证）。

---

## 5. Web 前端 (web/)

### 5.1 技术栈

纯原生技术，无框架依赖：HTML5 + CSS3 + Vanilla JavaScript。

### 5.2 核心文件：[app.js](web/app.js)

代码组织为三大对象模块：

#### 5.2.1 `Config` 对象 — 配置管理

| 属性/方法 | 说明 |
|-----------|------|
| `serverUrl` (getter/setter) | 服务器地址，持久化到 `localStorage` |
| `apiKey` (getter/setter) | API 密钥，持久化到 `localStorage` |
| `sortBy` (getter/setter) | 排序字段（time/name/size），持久化 |
| `sortOrder` (getter/setter) | 排序方向（asc/desc），持久化 |
| `viewMode` (getter/setter) | 视图模式（grid/list），持久化 |
| `clear()` | 清除所有配置 |

#### 5.2.2 `API` 对象 — 网络请求

| 方法 | 说明 |
|------|------|
| `request(endpoint, options)` | 通用请求方法，自动附加 `X-API-Key` 头 |
| `uploadFiles(files, onProgress)` | 文件上传，使用 `XMLHttpRequest` 支持进度回调 |
| `getFiles()` | 获取文件列表 |
| `deleteFile(filename)` | 删除文件 |
| `getDownloadUrl(filename)` | 构造下载 URL（含 `apiKey` 查询参数） |

#### 5.2.3 `UI` 对象 — 界面交互

| 方法 | 说明 |
|------|------|
| `showToast(message, type)` | 显示 Toast 通知 |
| `showLoading(show)` | 显示/隐藏加载指示器 |
| `renderGrid(files)` | 渲染网格视图 |
| `renderList(files)` | 渲染列表视图（表格） |
| `getFileIcon(mimetype)` | 根据 MIME 类型返回 Emoji 图标 |
| `formatFileSize(bytes)` | 格式化文件大小 |
| `downloadFile(filename)` | 下载文件（新窗口打开） |
| `deleteFile(filename, originalName)` | 删除文件（带确认对话框） |
| `updateSortUI()` | 更新排序和筛选按钮的高亮状态 |

#### 5.2.4 全局功能

| 功能 | 说明 |
|------|------|
| `switchView(view)` | 切换网格/列表视图 |
| `loadFiles()` | 加载文件列表 |
| `uploadFiles(files)` | 上传文件，显示进度条 |
| `initDragDrop()` | 初始化拖放上传区域 |
| `initTheme()` / `toggleTheme()` | 深色/浅色主题切换 |
| `initModal()` | 初始化配置弹窗 |
| `getFilteredAndSortedFiles()` | 获取经过搜索过滤、类型筛选和排序后的文件列表 |
| `setSort(field, order)` | 设置排序字段和方向 |
| `toggleTypeFilter(type)` | 切换文件类型筛选 |
| `handleSearch(e)` | 处理搜索输入 |

### 5.3 [index.html](web/index.html) 页面结构

```
header          — Logo + 主题切换 + 配置按钮 + 刷新按钮
search-section  — 搜索框 + 清除按钮
filter-section  — 类型筛选标签 + 排序方式标签
toolbar         — 文件计数 + 视图切换按钮
dropArea        — 文件列表（网格/列表视图）+ 空状态 + 加载指示器
uploadArea      — 上传控件 + 进度条
configModal     — 配置弹窗（服务器地址 + API 密钥）
toast           — Toast 通知容器
```

---

## 6. Uni-app 跨平台前端 (src/)

### 6.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.4.21 | 响应式 UI 框架 |
| Pinia | ^2.1.7 | 状态管理 |
| Uni-app | 3.0.0-alpha | 跨平台框架（H5/App/微信小程序） |
| TypeScript | ^5.4.3 | 类型安全 |
| Vite | ^5.2.6 | 构建工具 |
| Sass | ^1.72.0 | CSS 预处理器 |

### 6.2 应用入口

#### [main.ts](src/main.ts)

```typescript
export function createApp() {
  const app = createSSRApp(App)  // SSR 兼容的 Vue 应用
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
```

使用 `createSSRApp` 以兼容 Uni-app 的 SSR 渲染模式。

#### [App.vue](src/App.vue)

根组件，提供：
- 应用容器布局（`.app-container`）
- 底部安全区域适配（`.app-tabbar`）
- 全局样式导入（`_variables`、`_mixins`、`_reset`）
- `onShow` 生命周期钩子

### 6.3 API 请求层 (src/api/)

#### [client.ts](src/api/client.ts) — `ApiClient` 类

核心 HTTP 客户端封装，基于 `uni.request` / `uni.uploadFile` / `uni.downloadFile`。

| 方法 | 说明 |
|------|------|
| `updateConfig()` | 从 `configStore` 刷新 `baseURL` 和 `apiKey` |
| `request<T>(options)` | 通用请求方法，支持 GET/POST/PUT/DELETE |
| `get<T>(url, data)` | GET 请求快捷方法 |
| `post<T>(url, data)` | POST 请求快捷方法 |
| `put<T>(url, data)` | PUT 请求快捷方法 |
| `delete<T>(url, data)` | DELETE 请求快捷方法 |
| `uploadFile(url, filePath, name, onProgress)` | 文件上传，支持进度回调 |
| `downloadFile(url, fileName)` | 文件下载，自动保存并显示进度 |

**特性**：
- 每次请求前自动调用 `updateConfig()` 刷新配置
- 自动拼接 `baseURL`，支持完整 URL 覆盖
- GET 请求参数自动序列化为查询字符串
- 上传进度通过 `uploadTask.onProgressUpdate` 回调

#### [types.ts](src/api/types.ts) — TypeScript 类型定义

| 接口 | 说明 |
|------|------|
| `FileInfo` | 文件信息（id, originalName, storedName, size, mimetype, uploadTime, md5） |
| `UploadResponse` | 上传响应（success, message, files） |
| `FilesResponse` | 文件列表响应（success, count, files） |
| `DeleteResponse` | 删除响应（success, message） |
| `ApiError` | 错误响应（error, message） |
| `UploadProgress` | 上传进度（loaded, total, percent） |

#### [modules/file.ts](src/api/modules/file.ts) — `fileApi` 对象

| 方法 | 说明 |
|------|------|
| `getFiles()` | 获取文件列表 |
| `uploadFile(filePath, onProgress)` | 上传单个文件 |
| `deleteFile(fileName)` | 删除文件（自动编码文件名） |
| `getDownloadUrl(fileName, baseURL)` | 构造下载 URL |

### 6.4 状态管理 (src/stores/)

#### [config.store.ts](src/stores/config.store.ts) — `useConfigStore`

管理应用配置，使用 `uni.getStorageSync / setStorageSync` 持久化。

| 状态 | Storage Key | 默认值 | 说明 |
|------|-------------|--------|------|
| `serverUrl` | `lcd_server_url` | `http://117.72.196.45/syncqclous/` | 服务器地址 |
| `apiKey` | `lcd_api_key` | `light-cloud-disk-2026` | API 密钥 |
| `theme` | `lcd_theme` | `light` | 主题（light/dark） |
| `language` | `lcd_language` | `zh-CN` | 语言 |
| `viewMode` | `lcd_view_mode` | `list` | 视图模式（list/grid） |

| 方法 | 说明 |
|------|------|
| `setServerUrl(url)` | 设置服务器地址并持久化 |
| `setApiKey(key)` | 设置 API 密钥并持久化 |
| `setTheme(theme)` | 设置主题并持久化 |
| `toggleTheme()` | 切换深色/浅色主题 |
| `resetToDefault()` | 恢复所有配置为默认值 |
| `isConfigValid()` | 校验配置是否有效（非空） |

#### [file.store.ts](src/stores/file.store.ts) — `useFileStore`

管理文件列表状态与操作。

| 状态 | 类型 | 说明 |
|------|------|------|
| `files` | `ref<FileInfo[]>` | 文件列表 |
| `loading` | `ref<boolean>` | 加载状态 |
| `viewMode` | `ref<'list' \| 'grid'>` | 视图模式 |
| `selectedIds` | `ref<string[]>` | 已选文件 ID |
| `searchQuery` | `ref<string>` | 搜索关键词 |
| `sortBy` | `ref<'name' \| 'time' \| 'size'>` | 排序字段 |
| `sortOrder` | `ref<'asc' \| 'desc'>` | 排序方向 |

| 计算属性 | 说明 |
|----------|------|
| `filteredFiles` | 经过搜索过滤和排序后的文件列表 |
| `selectedFiles` | 已选中的文件列表 |
| `hasSelection` | 是否有选中文件 |

| 方法 | 说明 |
|------|------|
| `fetchFiles()` | 从服务器加载文件列表 |
| `uploadFile(filePath, onProgress)` | 上传文件并追加到列表 |
| `deleteFile(fileId)` | 删除文件并从列表移除 |
| `setViewMode(mode)` | 设置视图模式 |
| `toggleSelection(fileId)` | 切换文件选中状态 |
| `clearSelection()` | 清空选中 |
| `setSearchQuery(query)` | 设置搜索关键词 |
| `setSort(field, order)` | 设置排序方式 |

### 6.5 页面 (src/pages/)

#### [pages/index/index.vue](src/pages/index/index.vue) — 首页

核心页面，包含：

| 区域 | 说明 |
|------|------|
| 搜索栏 | 实时搜索文件名，支持清除 |
| 筛选按钮 | 点击展开筛选面板 |
| 排序工具栏 | 排序字段选择（时间/名称/大小）+ 升序/降序切换 + 视图切换 |
| 筛选面板 | 按文件类型筛选（图片/视频/音频/文档/压缩包）+ 排序设置 |
| 文件列表区域 | 可下拉刷新，使用 `scroll-view` + `refresher-enabled`，支持网格/列表双视图 |
| 上传按钮 | 固定底部，点击弹出上传面板 |
| 上传面板 | 底部弹出模态框，选择图片或文件 |
| 上传进度遮罩 | 全屏遮罩显示上传进度百分比 |

**关键交互流程**：
1. `onMounted` / `onShow` → `loadFiles()` → `fileStore.fetchFiles()`
2. 上传 → `chooseFile()` → `uploadFiles(filePaths)` → `fileStore.uploadFile()`
3. 下载 → `fileApi.getDownloadUrl()` → `window.open(url, '_blank')`
4. 删除 → `uni.showModal` 确认 → `fileStore.deleteFile()`
5. 搜索 → 输入关键词 → `filteredFiles` 实时过滤
6. 筛选 → 选择类型标签 → 按文件类型过滤（图片/视频/音频/文档/压缩包）
7. 排序 → 选择排序字段和方向 → 文件列表重新排序

#### [pages/settings/index.vue](src/pages/settings/index.vue) — 设置页

| 区域 | 说明 |
|------|------|
| 服务器配置 | 服务器地址输入 + API 密钥输入 |
| 显示设置 | 列表/网格视图切换 |
| 主题设置 | 深色模式开关 |
| 连接测试 | 测试服务器连通性 |
| 操作按钮 | 保存配置 / 恢复默认 |
| 版本信息 | 显示版本号 v2.0.0 |

### 6.6 组件 (src/components/)

#### [FileCard.vue](src/components/FileCard/FileCard.vue) — 文件卡片

| Props | 类型 | 说明 |
|-------|------|------|
| `file` | `FileInfo` | 文件信息 |

| Events | 说明 |
|--------|------|
| `click` | 卡片点击 |
| `download` | 下载按钮点击 |
| `delete` | 删除按钮点击 |

根据 `mimetype` 自动计算图标和背景色（使用 `getFileIcon` / `getFileIconColor`）。

#### [FileList.vue](src/components/FileList/FileList.vue) — 文件列表

| Props | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| `files` | `FileInfo[]` | — | 文件列表数据 |
| `viewMode` | `'list' \| 'grid'` | `'list'` | 视图模式 |
| `emptyMessage` | `string` | `'暂无文件'` | 空状态消息 |
| `emptyHint` | `string` | `'点击下方按钮上传文件'` | 空状态提示 |

| Events | 说明 |
|--------|------|
| `itemClick` | 文件项点击 |
| `download` | 下载 |
| `delete` | 删除 |

列表视图使用纵向 flex 布局，网格视图使用 `grid-template-columns: repeat(2, 1fr)`。

#### [UploadPanel.vue](src/components/UploadPanel/UploadPanel.vue) — 上传面板

虚线边框的上传区域，点击触发 `chooseFile()` 并通过 `select` 事件返回文件路径。

### 6.7 工具函数 (src/utils/)

#### [format.ts](src/utils/format.ts)

| 函数 | 签名 | 说明 |
|------|------|------|
| `formatFileSize` | `(bytes: number) => string` | 格式化文件大小（B/KB/MB/GB/TB） |
| `formatDate` | `(dateString: string) => string` | 格式化日期为 `YYYY-MM-DD HH:mm` |
| `formatDateShort` | `(dateString: string) => string` | 格式化日期为 `MM-DD` |
| `getFileExtension` | `(filename: string) => string` | 获取文件扩展名 |
| `getFileNameWithoutExtension` | `(filename: string) => string` | 获取不含扩展名的文件名 |

#### [platform.ts](src/utils/platform.ts)

| 函数 | 说明 |
|------|------|
| `getPlatform()` | 获取当前运行平台（使用 Uni-app 条件编译） |
| `isH5()` | 是否为 H5 平台 |
| `isApp()` | 是否为 App 平台 |
| `isMiniProgram()` | 是否为小程序平台 |
| `isWeiXin()` | 是否为微信小程序 |
| `getSystemInfo()` | 获取系统信息 |
| `getPlatformName()` | 获取平台名称 |

使用 Uni-app 条件编译 `#ifdef` 实现平台差异化逻辑。

#### [file.ts](src/utils/file.ts)

| 函数 | 说明 |
|------|------|
| `getFileIcon(mimetype)` | 根据 MIME 类型返回 Emoji 图标 |
| `getFileIconColor(mimetype)` | 根据 MIME 类型返回图标背景色 |
| `chooseFile(options)` | 跨平台文件选择（H5 用 `<input>`，App 用 `uni.chooseMessageFile`，小程序用 `uni.chooseImage`） |
| `openFilePreview(filePath, mimetype)` | 跨平台文件预览（H5 用 `window.open`，App 用 `uni.previewMedia`，小程序用 `uni.previewImage`） |

### 6.8 样式体系 (src/styles/)

#### [_variables.scss](src/styles/_variables.scss)

定义全局设计 Token：

| 类别 | 变量示例 |
|------|----------|
| 主色 | `$primary-color: #4CAF50` |
| 文字色 | `$text-color: #333333` |
| 背景色 | `$bg-color: #f5f5f5` |
| 字号 | `$font-size-base: 28rpx` |
| 间距 | `$spacing-base: 24rpx` |
| 圆角 | `$border-radius-base: 16rpx` |
| 阴影 | `$box-shadow-light: 0 2rpx 12rpx rgba(0, 0, 0, 0.08)` |
| 安全区域 | `$safe-area-bottom: env(safe-area-inset-bottom)` |

---

## 7. Android 原生客户端 (android/)

### 7.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Kotlin | 1.8+ | 开发语言 |
| Retrofit | 2.9.0 | HTTP 客户端 |
| OkHttp | 4.12.0 | 底层网络库 |
| Gson | (via converter-gson) | JSON 序列化 |
| Glide | 4.16.0 | 图片加载 |
| Coroutines | 1.7.3 | 异步编程 |
| ViewBinding | — | 视图绑定 |
| AndroidX | — | 现代 Android 库 |

### 7.2 构建配置

- `compileSdk` / `targetSdk`：34
- `minSdk`：21（Android 5.0+）
- `applicationId`：`com.example.lightclouddisk`
- 从 `config.json` 读取 `DEFAULT_SERVER_URL` 和 `DEFAULT_API_KEY` 注入 `BuildConfig`
- 支持 Release 签名（通过 `keystore.properties` 配置）

### 7.3 核心类

#### [MainActivity.kt](android/app/src/main/java/com/example/lightclouddisk/MainActivity.kt)

主界面 Activity，`launchMode="singleTask"` 以处理分享意图。

| 职责 | 说明 |
|------|------|
| 初始化 | `ConfigManager.init()`、ViewBinding、Retrofit、RecyclerView |
| 文件列表 | 通过 `apiService.getFiles()` 加载，支持搜索过滤 |
| 文件上传 | 通过 `filePickerLauncher` 选择文件 → 复制到缓存 → 启动 `FileUploadService` |
| 文件下载 | 使用系统 `DownloadManager`，自动显示通知 |
| 文件删除 | 通过 `apiService.deleteFile()` 删除 |
| 分享接收 | 处理 `ACTION_SEND` / `ACTION_SEND_MULTIPLE` Intent |
| 下拉刷新 | `SwipeRefreshLayout` 触发 `loadFiles()` |

**关键方法**：

| 方法 | 说明 |
|------|------|
| `setupApiService()` | 创建 OkHttpClient + Retrofit 实例 |
| `loadFiles()` | 协程中调用 API 加载文件列表 |
| `uploadFileFromUri(uri)` | 从 Uri 复制文件到缓存并启动上传 Service |
| `downloadFile(file)` | 使用 DownloadManager 下载文件 |
| `filterFiles(query)` | 按文件名/MIME类型过滤列表 |

#### [SettingsActivity.kt](android/app/src/main/java/com/example/lightclouddisk/SettingsActivity.kt)

设置界面，提供：
- 服务器地址和 API 密钥编辑
- 保存配置（写入 `ConfigManager`）
- 恢复默认配置
- 连接测试（直接使用 OkHttpClient 调用 `/api/health`）

#### [FileUploadService.kt](android/app/src/main/java/com/example/lightclouddisk/FileUploadService.kt)

前台 Service，处理文件后台上传。

| 特性 | 说明 |
|------|------|
| 前台通知 | Android Q+ 使用 `FOREGROUND_SERVICE_TYPE_DATA_SYNC` |
| 通知渠道 | `upload_channel`，低优先级 |
| 上传方式 | 创建 Retrofit 实例 → `MultipartBody.Part` → `apiService.uploadFiles()` |
| 生命周期 | 上传完成后延迟停止 Service |

#### [FileAdapter.kt](android/app/src/main/java/com/example/lightclouddisk/FileAdapter.kt)

`RecyclerView.Adapter` 实现：

| 方法 | 说明 |
|------|------|
| `onBindViewHolder` | 根据 MIME 类型设置图标，格式化大小和日期 |
| `updateFiles(newFiles)` | 更新数据并刷新列表 |
| `formatFileSize(bytes)` | 格式化文件大小 |

#### [ConfigManager.kt](android/app/src/main/java/com/example/lightclouddisk/ConfigManager.kt)

配置管理单例对象，使用 `SharedPreferences` 持久化。

| 属性 | Key | 默认值 |
|------|-----|--------|
| `serverUrl` | `server_url` | `http://117.72.196.45/syncqclous/` |
| `apiKey` | `api_key` | `light-cloud-disk-2026` |

| 方法 | 说明 |
|------|------|
| `init(context)` | 初始化 SharedPreferences |
| `resetToDefault()` | 恢复默认配置 |
| `isConfigValid()` | 校验配置有效性 |

#### [ApiService.kt](android/app/src/main/java/com/example/lightclouddisk/api/ApiService.kt)

Retrofit API 接口定义 + 数据模型。

| 接口方法 | HTTP | 路径 | 说明 |
|----------|------|------|------|
| `uploadFiles` | POST | `api/upload` | Multipart 文件上传 |
| `getFiles` | GET | `api/files` | 获取文件列表 |
| `deleteFile` | DELETE | `api/files/{filename}` | 删除文件 |
| `downloadFile` | GET | `api/download/{filename}` | 下载文件（流式响应） |

**数据模型**：

| 类 | 字段 |
|----|------|
| `FileInfo` | id, originalName, storedName, size, mimetype, uploadTime, md5 |
| `UploadResponse` | success, message, files: List\<FileInfo\> |
| `FilesResponse` | success, count, files: List\<FileInfo\> |
| `DeleteResponse` | success, message |

### 7.4 AndroidManifest.xml 权限

| 权限 | 说明 |
|------|------|
| `INTERNET` | 网络访问 |
| `READ_EXTERNAL_STORAGE` | 读取存储（Android 12 及以下） |
| `WRITE_EXTERNAL_STORAGE` | 写入存储（Android 12 及以下） |
| `READ_MEDIA_IMAGES/VIDEO/AUDIO` | 媒体权限（Android 13+） |
| `FOREGROUND_SERVICE` | 前台服务 |
| `FOREGROUND_SERVICE_DATA_SYNC` | 数据同步前台服务类型 |
| `POST_NOTIFICATIONS` | 发送通知 |

### 7.5 Intent Filter

`MainActivity` 注册了 `ACTION_SEND` 和 `ACTION_SEND_MULTIPLE` Intent Filter，支持从其他应用分享文件到本应用。

---

## 8. 部署与运维配置

### 8.1 Nginx 反向代理 ([nginx-syncqclous.conf](nginx-syncqclous.conf))

| 路径 | 代理目标 | 说明 |
|------|----------|------|
| `/syncqclous` | 静态文件 `/opt/light-cloud-disk/web` | 前端页面 |
| `/syncqclous/api/` | `http://127.0.0.1:12140/` | 后端 API |
| `/syncqclous/download/` | `http://127.0.0.1:12140/download/` | 文件下载 |

- 后端服务运行在端口 `12140`
- 支持大文件上传：`client_max_body_size 100M`
- 静态资源缓存：1 年，`Cache-Control: public, immutable`

### 8.2 部署脚本 ([deploy-to-server.sh](deploy-to-server.sh))

自动化部署流程：
1. 创建部署目录 `/opt/light-cloud-disk`
2. 安装 PM2 进程管理器
3. 创建 `.env` 环境变量文件（端口 12140）
4. 提示上传后端文件并执行 `npm install`
5. 使用 PM2 启动服务：`pm2 start server.js --name light-cloud-disk-server`

### 8.3 全局配置 ([config.example.json](config.example.json))

```json
{
  "server": {
    "port": 3000,
    "api_key": "YOUR_API_KEY_HERE",
    "upload_dir": "./uploads",
    "max_file_size": 100,
    "allowed_origins": "*"
  },
  "android": {
    "default_server_url": "YOUR_SERVER_URL_HERE",
    "default_api_key": "YOUR_API_KEY_HERE",
    "signing": { ... }
  }
}
```

此配置文件同时服务于后端服务（`server` 节）和 Android 构建（`android` 节，通过 `build.gradle` 读取）。

---

## 9. API 接口文档

### 基础信息

- **Base URL**: `http://your-server:3000`
- **认证方式**: 请求头 `X-API-Key: your-api-key`（下载接口支持 `?apiKey=` 查询参数）

### 接口详情

#### 9.1 健康检查

```
GET /api/health
```

无需认证。响应：

```json
{
  "success": true,
  "message": "Light Cloud Disk Server is running",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

#### 9.2 上传文件

```
POST /api/upload
Content-Type: multipart/form-data
X-API-Key: your-api-key
Body: files (支持多文件，最多10个)
```

响应：

```json
{
  "success": true,
  "message": "Successfully uploaded 1 file(s)",
  "files": [{
    "id": "abc123...",
    "originalName": "example.jpg",
    "storedName": "example-1234567890-123456789.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploadTime": "2026-05-02T10:00:00.000Z",
    "md5": "d41d8cd98f00b204e9800998ecf8427e"
  }]
}
```

#### 9.3 获取文件列表

```
GET /api/files
X-API-Key: your-api-key
```

响应：

```json
{
  "success": true,
  "count": 1,
  "files": [ ... ]
}
```

#### 9.4 获取单个文件信息

```
GET /api/files/{storedName}
X-API-Key: your-api-key
```

响应：

```json
{
  "success": true,
  "file": { ... }
}
```

#### 9.5 下载文件

```
GET /api/download/{storedName}?apiKey=your-api-key
```

响应：文件流，自动设置 `Content-Disposition: attachment` 和 `Content-Type`。

#### 9.6 删除文件

```
DELETE /api/files/{storedName}
X-API-Key: your-api-key
```

响应：

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 10. 数据模型

### 10.1 文件元数据 (FileInfo)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 文件唯一标识（MD5(filename + timestamp)） |
| `originalName` | string | 原始文件名 |
| `storedName` | string | 存储文件名（含时间戳防重名） |
| `size` | number | 文件大小（字节） |
| `mimetype` | string | MIME 类型 |
| `uploadTime` | string | 上传时间（ISO 8601） |
| `md5` | string | 文件 MD5 哈希 |

### 10.2 存储结构

```
server/
├── uploads/                        # 物理文件存储
│   ├── photo-1714641600000-123456789.jpg
│   └── document-1714641700000-987654321.pdf
└── data/
    └── files.json                  # 元数据 JSON 数组
```

`files.json` 示例：

```json
[
  {
    "id": "abc123def456",
    "originalName": "photo.jpg",
    "storedName": "photo-1714641600000-123456789.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploadTime": "2026-05-02T10:00:00.000Z",
    "md5": "d41d8cd98f00b204e9800998ecf8427e"
  }
]
```

---

## 11. 依赖关系图

### 11.1 后端依赖

```
server/index.js
├── express (^4.18.2)        — HTTP 框架
├── multer (^1.4.5-lts.1)   — 文件上传中间件
├── cors (^2.8.5)            — CORS 中间件
├── md5 (^2.3.0)             — MD5 哈希
└── dotenv (^16.3.1)         — 环境变量加载
```

### 11.2 Uni-app 前端依赖

```
src/
├── vue (^3.4.21)                    — UI 框架
├── pinia (^2.1.7)                   — 状态管理
├── @dcloudio/uni-app (3.0.0-alpha)  — 跨平台框架
├── @dcloudio/uni-h5                 — H5 平台支持
├── @dcloudio/uni-app-plus           — App 平台支持
├── @dcloudio/uni-mp-weixin          — 微信小程序支持
├── sass (^1.72.0)                   — CSS 预处理器
├── typescript (^5.4.3)              — 类型系统
└── vite (^5.2.6)                    — 构建工具
```

### 11.3 Android 依赖

```
android/
├── androidx.core:core-ktx:1.12.0            — Kotlin 扩展
├── androidx.appcompat:appcompat:1.6.1        — 兼容库
├── com.google.android.material:1.11.0        — Material Design
├── androidx.recyclerview:1.3.2               — 列表控件
├── androidx.swiperefreshlayout:1.1.0         — 下拉刷新
├── com.squareup.retrofit2:retrofit:2.9.0     — HTTP 客户端
├── com.squareup.retrofit2:converter-gson     — JSON 转换器
├── com.squareup.okhttp3:okhttp:4.12.0        — 网络库
├── com.squareup.okhttp3:logging-interceptor  — 日志拦截器
├── kotlinx-coroutines-android:1.7.3          — 协程
├── androidx.lifecycle:runtime-ktx:2.7.0      — 生命周期
└── com.github.bumptech.glide:glide:4.16.0    — 图片加载
```

### 11.4 模块间调用关系

```
┌─────────────────────────────────────────────────────┐
│                   Uni-app 前端                       │
│                                                     │
│  pages/index/index.vue                              │
│    ├── stores/file.store.ts ──→ api/modules/file.ts │
│    ├── stores/config.store.ts                       │
│    │       └── api/client.ts (读取配置)              │
│    ├── components/FileList.vue                      │
│    │       └── components/FileCard.vue              │
│    └── utils/file.ts (chooseFile)                   │
│                                                     │
│  pages/settings/index.vue                           │
│    ├── stores/config.store.ts                       │
│    └── api/client.ts (testConnection)               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   Android 客户端                     │
│                                                     │
│  MainActivity.kt                                    │
│    ├── ConfigManager.kt (配置)                       │
│    ├── api/ApiService.kt (网络请求)                  │
│    ├── FileAdapter.kt (列表渲染)                     │
│    └── FileUploadService.kt (后台上传)               │
│          └── api/ApiService.kt                      │
│                                                     │
│  SettingsActivity.kt                                │
│    └── ConfigManager.kt (配置读写)                   │
└─────────────────────────────────────────────────────┘
```

---

## 12. 项目运行方式

### 12.1 后端服务

```bash
cd server
npm install
cp .env.example .env       # 复制环境变量配置
# 编辑 .env 修改配置（可选）
npm start                   # 生产启动
# 或
npm run dev                 # 开发模式（nodemon 热重载）
```

默认运行在 `http://localhost:3000`。

### 12.2 Web 前端（原生版）

```bash
cd web
# 使用任意静态文件服务器
python -m http.server 8080
# 或
npx http-server -p 8080
```

访问 `http://localhost:8080`，首次使用需在界面中配置服务器地址和 API 密钥。

### 12.3 Uni-app 前端

```bash
cd src
npm install

# H5 开发模式
npm run dev:h5

# Android 开发模式
npm run dev:app-android

# 微信小程序开发模式
npm run dev:mp-weixin

# 构建生产版本
npm run build:h5
npm run build:app-android
npm run build:mp-weixin
```

### 12.4 Android 客户端

1. 使用 Android Studio 打开 `android/` 目录
2. 等待 Gradle 同步完成
3. 修改 `config.json` 或 `app/build.gradle` 中的服务器地址
4. 连接设备或启动模拟器
5. 点击 Run 运行

**模拟器特殊地址**：`http://10.0.2.2:3000`（访问宿主机）

### 12.5 生产部署

```bash
# 1. 在服务器上执行部署脚本
bash deploy-to-server.sh

# 2. 上传后端文件到 /opt/light-cloud-disk/server/

# 3. 安装依赖并启动
cd /opt/light-cloud-disk/server
npm install
pm2 start index.js --name light-cloud-disk-server
pm2 save
pm2 startup

# 4. 配置 Nginx
cp nginx-syncqclous.conf /etc/nginx/sites-available/light-cloud-disk
ln -s /etc/nginx/sites-available/light-cloud-disk /etc/nginx/sites-enabled/
nginx -t && nginx -s reload
```

---

## 13. 安全与配置说明

### 13.1 认证机制

- 所有写操作（上传、删除）和敏感读操作（文件列表、文件信息）均需 `X-API-Key` 认证
- 下载接口支持 `?apiKey=` 查询参数（为浏览器直接下载场景设计）
- 健康检查接口无需认证
- 静态文件服务 `/files/` 无需认证（需注意）

### 13.2 安全建议

| 项目 | 建议 |
|------|------|
| API 密钥 | 修改默认密钥为复杂随机字符串 |
| HTTPS | 生产环境使用 Nginx 反向代理 + SSL 证书 |
| 防火墙 | 限制服务器端口仅允许信任 IP 访问 |
| 数据备份 | 定期备份 `uploads/` 和 `data/files.json` |
| 磁盘监控 | 设置磁盘空间告警，避免上传文件写满磁盘 |
| CORS | 生产环境配置具体域名，避免使用 `*` |

### 13.3 环境变量参考

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务监听端口 |
| `API_KEY` | `light-cloud-disk-2026` | API 认证密钥 |
| `UPLOAD_DIR` | `./uploads` | 文件存储目录 |
| `MAX_FILE_SIZE` | `100` | 单文件大小上限（MB） |
| `ALLOWED_ORIGINS` | `*` | CORS 允许的域名（逗号分隔） |

### 13.4 已知限制

- 元数据存储使用 JSON 文件读写，不适合高并发场景
- 无用户体系，所有客户端共享同一 API Key
- 无文件分享链接功能
- 无断点续传支持
- 无文件预览功能（仅下载）
- 无存储配额管理
