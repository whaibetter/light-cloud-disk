# 轻量云盘 v2.0 - Uni-app 跨平台版本

基于 Uni-app + Vue 3 + TypeScript 的跨平台文件管理应用。

## 技术栈

- **框架**: Uni-app 3.x (Vue 3)
- **语言**: TypeScript
- **状态管理**: Pinia
- **UI组件**: uView Plus
- **构建工具**: Vite

## 项目结构

```
src/
├── api/                # API请求层
│   ├── client.ts      # HTTP客户端封装
│   ├── types.ts       # TypeScript类型定义
│   └── modules/       # API模块
├── components/         # 通用组件
│   ├── FileCard/     # 文件卡片
│   ├── FileList/     # 文件列表
│   └── UploadPanel/  # 上传面板
├── pages/            # 页面
│   ├── index/       # 首页
│   └── settings/    # 设置页
├── stores/          # Pinia状态管理
│   ├── config.store.ts
│   └── file.store.ts
├── styles/          # 样式
├── utils/           # 工具函数
├── App.vue          # 应用根组件
├── main.ts          # 入口文件
├── manifest.json     # 应用配置
├── pages.json       # 页面路由配置
└── uni.scss        # 全局样式变量
```

## 开发

```bash
# 安装依赖
npm install

# 开发 H5
npm run dev:h5

# 开发 Android
npm run dev:app-android

# 开发 微信小程序
npm run dev:mp-weixin

# 构建 H5
npm run build:h5

# 构建 Android
npm run build:app-android
```

## 功能

- 文件列表展示 (列表/网格视图)
- 文件上传 (支持多文件)
- 文件下载
- 文件删除
- 服务器配置
- 主题切换
- 响应式布局

## 许可证

MIT
