# 轻量云盘 - Tauri 2.0 跨平台客户端

基于 Tauri 2.0 + Vue 3 + Pinia + TypeScript 构建的跨平台云盘客户端，支持桌面端（Windows/macOS/Linux）、Android、iOS 和 Web。

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面/移动端运行时 | Tauri 2.0 (Rust) |
| 前端框架 | Vue 3 + TypeScript |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 构建工具 | Vite 5 |
| 样式 | SCSS + CSS Variables |

## 项目结构

```
clientSys/
├── index.html                 # HTML 入口
├── package.json               # 依赖配置
├── vite.config.ts             # Vite 构建配置
├── tsconfig.json              # TypeScript 配置
├── src-tauri/                 # Tauri Rust 后端
│   ├── Cargo.toml             # Rust 依赖
│   ├── tauri.conf.json        # Tauri 应用配置
│   ├── capabilities/          # 权限配置
│   └── src/
│       ├── lib.rs             # 库入口（插件注册）
│       └── main.rs            # 桌面端入口
└── src/
    ├── main.ts                # 应用入口（环境检测 + 适配器选择）
    ├── core/                  # 平台无关的业务逻辑
    │   ├── api/client.ts      # API 客户端
    │   ├── stores/            # Pinia Store（工厂模式）
    │   ├── types/             # 业务类型定义
    │   └── utils/             # 工具函数
    ├── platform/              # 平台适配层
    │   ├── adapters/index.ts  # 适配器接口定义
    │   ├── context.ts         # DI 容器
    │   ├── tauri/index.ts     # Tauri 适配器实现
    │   └── web/index.ts       # Web 适配器实现
    └── ui/                    # UI 层
        ├── App.vue            # 根组件
        ├── components/        # 通用组件
        ├── pages/             # 页面
        └── styles/            # 样式系统
```

## 架构设计

### 平台适配器模式

```
┌─────────────────────────────────┐
│           UI 层 (Vue)           │
├─────────────────────────────────┤
│        业务逻辑层 (Core)         │
│   Stores / API Client / Utils   │
├─────────────────────────────────┤
│       平台适配层 (Adapters)      │
│  Storage │ Network │ File │ UI  │
├──────────┴─────────┴──────┴─────┤
│  Tauri 适配器  │  Web 适配器     │
│  (Rust 插件)   │  (浏览器 API)   │
└─────────────────────────────────┘
```

- **存储适配器**：Tauri 使用 `@tauri-apps/plugin-store`，Web 使用 `localStorage`
- **网络适配器**：Tauri 使用 `@tauri-apps/plugin-http`，Web 使用 `fetch`
- **文件适配器**：Tauri 使用 `@tauri-apps/plugin-dialog` + `plugin-fs`，Web 使用 `<input type="file">`
- **UI 适配器**：Tauri 使用 `@tauri-apps/plugin-dialog`，Web 使用自定义 Toast/Modal

运行时自动检测 `window.__TAURI_INTERNALS__` 选择适配器。

## 开发命令

```bash
# 安装依赖
cd clientSys
npm install

# Web 开发
npm run dev

# Tauri 桌面端开发
npm run dev:tauri

# Tauri Android 开发
npm run dev:android

# 构建
npm run build:web          # Web 构建
npm run build:tauri        # 桌面端构建
npm run build:android      # Android 构建

# 代码检查
npm run lint
npm run type-check
```

## 环境要求

- Node.js >= 18
- Rust (通过 [rustup](https://rustup.rs/) 安装)
- Android SDK (Android 构建需要)
- Tauri CLI (`@tauri-apps/cli` 已在 devDependencies 中)

## 主题系统

支持浅色/深色主题切换，使用 CSS 自定义属性实现运行时切换：

- 浅色模式：默认
- 深色模式：`<html data-theme="dark">` 或 `.theme-dark` 类
- 主题偏好持久化到本地存储

## 响应式布局

- 移动端 (<768px)：单栏布局，底部导航栏
- 桌面端 (>=768px)：侧边栏 + 主内容区
