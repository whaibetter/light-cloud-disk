# 架构文档

> 轻量云盘 (Light Cloud Disk) 系统架构说明

## 1. 系统架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  H5/Web  │  │ Android  │  │   iOS    │  │ 微信小程序 │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └──────────────┴──────────────┴──────────────┘         │
│                         Uni-app                              │
└─────────────────────────────────┬───────────────────────────┘
                                  │ HTTP
┌─────────────────────────────────┴───────────────────────────┐
│                       服务端层                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Nginx (反向代理)                     │    │
│  │         端口 80 → 前端静态文件 + API 代理             │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│  ┌─────────────────────┴───────────────────────────────┐    │
│  │               Express 服务 (端口 12140)               │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐              │    │
│  │  │  CORS   │  │  Auth   │  │ Multer  │              │    │
│  │  └─────────┘  └─────────┘  └─────────┘              │    │
│  │                                                      │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              API 路由层                       │    │    │
│  │  │  /api/health  /api/upload  /api/files  ...   │    │    │
│  │  └─────────────────────┬───────────────────────┘    │    │
│  └────────────────────────┼────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │                   数据层                              │    │
│  │  ┌──────────────┐  ┌──────────────────────────────┐ │    │
│  │  │  uploads/    │  │  data/files.json             │ │    │
│  │  │  (文件存储)   │  │  (元数据存储)                 │ │    │
│  │  └──────────────┘  └──────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈

### 2.1 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18.0.0 | 运行时 |
| Express | ^4.18.2 | Web 框架 |
| Multer | ^1.4.5-lts.1 | 文件上传处理 |
| CORS | ^2.8.5 | 跨域处理 |
| MD5 | ^2.3.0 | 文件哈希计算 |
| dotenv | ^16.3.1 | 环境变量管理 |

### 2.2 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.4.21 | UI 框架 (Composition API) |
| Pinia | ^2.1.7 | 状态管理 |
| TypeScript | ^5.4.3 | 类型系统 |
| Uni-app | 3.0.0-alpha | 跨平台框架 |
| SCSS | ^1.72.0 | CSS 预处理器 |
| Vite | ^5.2.6 | 构建工具 |

### 2.3 部署

| 技术 | 用途 |
|------|------|
| Nginx | 反向代理、静态文件服务 |
| PM2 | Node.js 进程管理 |

---

## 3. 后端架构

### 3.1 单文件架构

后端采用**单文件架构**，所有逻辑集中在 `server/index.js`（约 353 行）：

```
server/index.js
├── 配置加载 (config.json + .env + 默认值)
├── 中间件链
│   ├── CORS
│   ├── Body Parser (10MB)
│   ├── 响应头设置 (UTF-8)
│   ├── 静态文件服务 (/files)
│   └── API Key 认证
├── 文件上传配置 (Multer)
│   ├── 磁盘存储
│   ├── 文件名编码修复 (latin1→utf8)
│   └── 重名处理 (数字后缀)
├── API 路由
│   ├── GET  /api/health
│   ├── POST /api/upload
│   ├── GET  /api/files
│   ├── GET  /api/files/:filename
│   ├── GET  /api/download/:filename
│   └── DELETE /api/files/:filename
└── 错误处理中间件
```

### 3.2 配置系统

三级配置优先级：环境变量 > config.json > 默认值

```javascript
// 配置加载顺序
1. 加载 config.json (项目根目录)
2. 加载 .env (server 目录)
3. 环境变量覆盖 config.json
4. 未设置的使用默认值
```

### 3.3 数据存储

使用 JSON 文件作为元数据存储，结构简单，无需数据库：

```json
// server/data/files.json
[
  {
    "id": "md5_hash",
    "originalName": "原始文件名.pdf",
    "storedName": "存储文件名.pdf",
    "size": 102400,
    "mimetype": "application/pdf",
    "uploadTime": "2026-05-08T02:03:34.902Z",
    "md5": "file_content_md5"
  }
]
```

**特点**：
- 同步读写 (`readFileSync` / `writeFileSync`)
- 适合小规模使用（< 1000 文件）
- 无并发控制

---

## 4. 前端架构

### 4.1 目录结构

```
src/src/
├── api/                    # API 层
│   ├── client.ts           # 统一请求客户端
│   ├── types.ts            # TypeScript 类型定义
│   └── modules/file.ts     # 文件 API 模块
├── stores/                 # Pinia 状态管理
│   ├── config.store.ts     # 配置存储
│   └── file.store.ts       # 文件存储
├── components/             # 组件
│   ├── FileCard/           # 文件卡片
│   ├── FileList/           # 文件列表
│   └── UploadPanel/        # 上传面板
├── pages/                  # 页面
│   ├── index/              # 主页 (文件管理)
│   └── settings/           # 设置页
├── utils/                  # 工具函数
│   ├── file.ts             # 文件操作
│   ├── format.ts           # 格式化
│   └── platform.ts         # 平台检测
└── styles/                 # 样式
    ├── _variables.scss     # 设计令牌
    ├── _mixins.scss        # Mixins 工具库
    └── _reset.scss         # CSS 重置 + 工具类
```

### 4.2 数据流

```
┌──────────────────────────────────────────────────────────┐
│                     数据流架构                             │
│                                                          │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐     │
│  │  页面    │───→│  Pinia Store │───→│  API Client  │     │
│  │ (View)   │←───│  (State)    │←───│  (Service)   │     │
│  └─────────┘    └─────────────┘    └──────┬───────┘     │
│                                           │              │
│                                    ┌──────┴───────┐      │
│                                    │   Express    │      │
│                                    │   Server     │      │
│                                    └──────────────┘      │
└──────────────────────────────────────────────────────────┘
```

**请求流程**：
1. 页面触发操作 → 调用 Store Action
2. Store Action → 调用 API Client 方法
3. API Client → 发起 HTTP 请求
4. 响应返回 → 更新 Store State
5. State 变化 → 页面自动更新

### 4.3 API 客户端设计

`ApiClient` 类采用单例模式，核心设计：

- **配置自动同步**：每次请求前从 `configStore` 读取最新配置
- **平台差异处理**：H5 使用 XMLHttpRequest，App 使用 uni.uploadFile
- **统一错误处理**：非 2xx 状态码统一 reject
- **进度回调**：上传支持实时进度回调

### 4.4 状态管理

#### configStore（配置存储）

负责管理应用配置，持久化到 `uni.storage`：

```
State: serverUrl, apiKey, theme, language, viewMode
Actions: setServerUrl, setApiKey, setTheme, toggleTheme, resetToDefault
```

#### fileStore（文件存储）

负责管理文件列表和操作：

```
State: files, loading, viewMode, selectedIds, searchQuery, sortBy, sortOrder
Computed: filteredFiles, selectedFiles, hasSelection
Actions: fetchFiles, uploadFile, deleteFile, setViewMode, setSort
```

---

## 5. 样式系统

### 5.1 双层变量架构

```
SCSS 编译时层                    CSS 运行时层
_variables.scss                  App.vue
├── $gray-50 ~ $gray-900        ├── :root { --bg-page: #F8FAFC }
├── $brand-primary               ├── [data-theme="dark"] { --bg-page: #111827 }
├── $space-1 ~ $space-16        └── .theme-dark { ... }
├── $radius-sm ~ $radius-full
└── $shadow-xs ~ $shadow-lg
```

- **静态值**（中性色阶、间距、圆角等）：SCSS 变量，编译时确定
- **动态值**（语义色）：CSS 变量，支持运行时主题切换

### 5.2 响应式策略

```
移动端 (< 768px)              桌面端 (>= 768px)
┌─────────────┐              ┌──────┬──────────────┐
│   Header    │              │      │   Top Bar    │
├─────────────┤              │ Side │──────────────│
│             │              │ bar  │   Content    │
│   Content   │              │      │              │
│             │              │      │              │
├─────────────┤              │      │              │
│  TabBar     │              └──────┴──────────────┘
└─────────────┘
```

- 通过 `@include respond-above('md')` 控制显示/隐藏
- 移动端和桌面端各自有完整的 HTML 结构
- 桌面端隐藏原生 TabBar，使用自定义侧边栏导航

---

## 6. 跨平台适配

### 6.1 条件编译

使用 Uni-app 条件编译处理平台差异：

```typescript
// #ifdef H5
// H5 平台专用代码
// #endif

// #ifdef APP-PLUS
// App 平台专用代码
// #endif

// #ifdef MP
// 小程序平台专用代码
// #endif
```

### 6.2 平台差异点

| 功能 | H5 | App | 小程序 |
|------|-----|------|--------|
| 文件选择 | `<input type="file">` | uni.chooseImage/chooseMessageFile | uni.chooseImage |
| 文件上传 | XMLHttpRequest + FormData | uni.uploadFile | uni.uploadFile |
| 文件下载 | `<a>` 标签 | uni.downloadFile + uni.saveFile | uni.saveFile |
| 主题切换 | document.documentElement | uni.setStorageSync | uni.setStorageSync |
| 文件预览 | window.open | uni.previewMedia | uni.previewImage |

---

## 7. 构建系统

### 7.1 双轨构建

```
CLI 开发                          HBuilderX 开发
    │                                  │
    ▼                                  ▼
vite.config.ts                   vue.config.js
├── SCSS 注入                    ├── SCSS 注入
├── 开发服务器 (5173)            └── HBuilderX 专用
├── API 代理 (/api → localhost:3000)
└── Terser 压缩
```

### 7.2 构建产物

| 平台 | 命令 | 输出目录 |
|------|------|----------|
| H5 | `npm run build:h5` | `dist/build/h5` |
| Android | `npm run build:app-android` | `dist/build/app` |
| 微信小程序 | `npm run build:mp-weixin` | `dist/build/mp-weixin` |

---

## 8. 安全设计

### 8.1 认证机制

- **API Key 认证**：简单的密钥认证，适合个人/小团队使用
- **无用户体系**：所有客户端共享同一个 API Key
- **无 Token 机制**：每次请求携带 API Key，无会话管理

### 8.2 安全风险

| 风险 | 说明 | 缓解措施 |
|------|------|----------|
| 静态文件无认证 | `/files/*` 路径直接暴露 | 生产环境可通过 Nginx 限制 |
| 单一 API Key | 所有用户共享同一密钥 | 适合小规模使用 |
| 同步 I/O | 高并发下可能阻塞 | 适合低并发场景 |
| MD5 内存计算 | 大文件可能导致内存压力 | 文件大小限制 |

---

## 9. 扩展性考虑

### 9.1 当前架构限制

- JSON 文件存储：不适合大规模数据
- 单文件后端：不易扩展
- 无用户体系：无法区分不同用户
- 同步 I/O：不适合高并发

### 9.2 可扩展方向

- **数据库迁移**：JSON → SQLite/MySQL/PostgreSQL
- **用户体系**：添加注册/登录/权限管理
- **对象存储**：本地文件 → S3/OSS/COS
- **微服务拆分**：单文件 → 模块化服务
- **缓存层**：添加 Redis 缓存
