# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

轻量云盘系统 (Light Cloud Disk) - 基于 Uni-app 的跨平台云盘，支持 Web、Android、iOS、微信小程序等多端运行。

**技术栈：**
- 后端：Node.js + Express，单文件服务，JSON 文件存储元数据
- 前端：Uni-app + Vue 3 + Pinia + TypeScript
- UI框架：uview-plus（自动导入组件，前缀 `u-`）
- 样式：SCSS，全局变量和 mixins 自动注入

## 常用命令

### 后端服务 (server/)

```bash
cd server
npm install              # 安装依赖
npm start                # 生产环境启动（默认端口 3000）
npm run dev              # 开发模式（nodemon 热重载）
```

环境变量配置：复制 `.env.example` 为 `.env`，或在根目录创建 `config.json`（优先级：.env > config.json > 默认值）。

### 前端开发 (src/)

```bash
cd src
npm install              # 安装依赖
npm run dev:h5           # H5 开发服务器（localhost:5173）
npm run dev:app-android  # Android 开发
npm run dev:mp-weixin    # 微信小程序开发
npm run build:h5         # H5 生产构建 → dist/build/h5
npm run build:app-android # Android 构建 → dist/build/app
npm run build:mp-weixin  # 微信小程序构建 → dist/build/mp-weixin
npm run lint             # ESLint 检查并自动修复
npm run type-check       # TypeScript 类型检查
```

### 部署

```bash
# 云服务器部署（端口 12140）
bash deploy-to-server.sh
# PM2 管理进程
pm2 start server.js --name light-cloud-disk-server
```

Nginx 配置参考 `nginx-syncqclous.conf`，前端路径 `/syncqclous`，API 路径 `/syncqclous/api/`。

## 架构要点

### 后端 (server/index.js)

单文件 Express 服务，核心模块：
- **认证中间件**：基于 `X-API-Key` 请求头，无用户体系
- **文件上传**：Multer 处理，最多 10 个文件，保留原始文件名（中文编码修复）
- **元数据存储**：`server/data/files.json`，同步读写
- **文件存储**：`server/uploads/` 目录
- **流式下载**：`fs.createReadStream().pipe(res)`

API 端点：
- `GET /api/health` - 健康检查（无需认证）
- `POST /api/upload` - 上传文件
- `GET /api/files` - 获取文件列表
- `GET /api/files/:filename` - 获取单个文件信息
- `GET /api/download/:filename` - 下载文件
- `DELETE /api/files/:filename` - 删除文件

### 前端架构 (src/src/)

```
src/src/
├── api/              # API 层
│   ├── client.ts     # 统一请求客户端（自动注入 API Key）
│   ├── types.ts      # 类型定义
│   └── modules/file.ts  # 文件相关 API
├── stores/           # Pinia 状态管理
│   ├── config.store.ts  # 配置（服务器地址、API Key、主题等，持久化到 uni.storage）
│   └── file.store.ts    # 文件列表、上传、删除、搜索排序
├── components/       # 组件
│   ├── FileList/     # 文件列表（支持 list/grid 视图）
│   ├── FileCard/     # 文件卡片
│   └── UploadPanel/  # 上传面板
├── pages/            # 页面
│   ├── index/        # 主页（文件管理）
│   └── settings/     # 设置页
├── utils/            # 工具函数
│   ├── file.ts       # 文件选择
│   ├── format.ts     # 格式化（文件大小、扩展名）
│   └── platform.ts   # 平台判断
└── styles/           # 全局样式（variables.scss, mixins.scss 自动注入）
```

### 关键设计模式

1. **配置双源**：`config.json`（根目录）和 `.env`（server 目录），config.json 同时供前后端使用
2. **API 客户端封装**：`apiClient` 类自动从 `configStore` 读取服务器地址和 API Key，支持 H5 和 App 两种上传方式
3. **跨平台条件编译**：使用 `// #ifdef H5` / `// #endif` 处理平台差异
4. **easycom 自动导入**：`u-` 前缀组件自动映射到 uview-plus

### 页面路由

`pages.json` 定义两个页面：
- `pages/index/index` - 主页（自定义导航栏）
- `pages/settings/index` - 设置页（标准导航栏）

底部 TabBar：文件、设置

## 代码规范

- **ESLint**：Vue 3 + TypeScript 规则，生产环境禁止 console/debugger
- **Prettier**：无分号、单引号、2 空格缩进、100 字符行宽、无尾逗号
- **TypeScript**：宽松配置（允许 `any`、允许非空断言）
- **组件命名**：多词组件名规则已关闭
- **变量**：优先 `const`，禁止 `var`

## 注意事项

- H5 开发服务器已配置代理：`/api` → `http://localhost:3000`，开发时无需担心跨域
- 文件名中文编码问题已在后端修复（`latin1` → `utf8` 转换）
- `config.json` 包含敏感信息，已在 `.gitignore` 中排除
- Android 打包需要配置签名信息，参考 `config.example.json` 的 `android.signing` 部分
- 构建时会压缩代码并移除 console/debugger（terser 配置）
