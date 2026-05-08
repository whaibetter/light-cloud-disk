# Taro/Uni-app 跨平台迁移方案

## 一、技术选型对比分析

### 1.1 核心需求

| 需求项 | 说明 |
|--------|------|
| 输出平台 | Android + Web (微信小程序后续扩展) |
| 代码共享 | 业务逻辑、数据模型、API 层 |
| UI 差异 | 移动端原生体验 + Web 响应式布局 |
| 学习成本 | 团队现有 Kotlin/JS 技能平滑过渡 |

### 1.2 Taro vs Uni-app 详细对比

| 对比维度 | Taro | Uni-app | 胜出方 |
|----------|------|---------|--------|
| **框架基础** | React / Vue | Vue | Taro (React更贴合Android Kotlin) |
| **多端编译** | H5/小程序/App | H5/小程序/App | 持平 |
| **Android编译** | 编译为 React Native | 编译为原生 App | **Uni-app** (原生渲染) |
| **Web编译** | 编译为 React SPA | 编译为 Vue SPA | **Taro** (React生态更成熟) |
| **小程序支持** | 微信/支付宝/抖音等 | 微信/支付宝/抖音/快手等 | **Uni-app** (国内生态更全) |
| **组件库** | @tarojs/components (React风格) | uView (Vue风格) | 持平 |
| **状态管理** | Redux/MobX/Zustand | Vuex/Pinia | Taro (更灵活) |
| **热更新** | 支持 | 支持 | 持平 |
| **国内生态** | 较少 | **丰富** (DCloud背书) | Uni-app |
| **文档质量** | **优秀** (中文) | 良好 (中文) | Taro |
| **社区活跃度** | ⭐ 8.8k | ⭐ 21.6k | Uni-app |

### 1.3 最终推荐方案

```
┌─────────────────────────────────────────────────────────────┐
│                      推荐选择: Taro 4.x                      │
├─────────────────────────────────────────────────────────────┤
│  理由:                                                      │
│  1. React 与 Kotlin语法结构相似 (函数式、响应式)             │
│  2. Web 端编译质量更高，接近原生 SPA 体验                   │
│  3. 与现有 Android Kotlin 代码可共享部分工具类               │
│  4. TypeScript 支持更好，类型安全                           │
│  5. 团队可渐进式从 Kotlin → React → Taro                   │
└─────────────────────────────────────────────────────────────┘

备选方案: 如果微信小程序是核心需求 → 选择 Uni-app
```

---

## 二、现有代码资产分析

### 2.1 可复用模块

| 模块 | Android (Kotlin) | Web (JS) | 可复用程度 |
|------|------------------|----------|-----------|
| **API Client** | ApiService.kt | app.js - API | ⭐⭐⭐⭐⭐ (90%) |
| **数据模型** | FileInfo.kt, Response.kt | JSON 结构 | ⭐⭐⭐⭐⭐ (100%) |
| **配置管理** | ConfigManager.kt | Config 对象 | ⭐⭐⭐⭐ (80%) |
| **文件操作** | FileAdapter.kt | UI.renderGrid() | ⭐⭐⭐ (50%) |
| **上传服务** | FileUploadService.kt | API.uploadFiles() | ⭐⭐⭐⭐ (70%) |
| **主题/样式** | themes.xml, colors.xml | style.css | ⭐⭐ (30%) |
| **权限处理** | Android Manifest | 浏览器API | ⭐ (0%) |
| **通知服务** | NotificationManager | Web Notifications | ⭐ (0%) |

### 2.2 需要重写的模块

| 模块 | 重写原因 |
|------|---------|
| Activity/View | Taro 组件系统完全不同 |
| 布局 XML | 转换为 Taro/React JSX |
| Android 权限 | 使用 Taro 权限API |
| 通知服务 | 使用 Taro 通知或各端原生 |

---

## 三、目标项目结构

### 3.1 整体目录设计

```
light-cloud-disk/
├── .github/                      # GitHub Actions (CI/CD)
├── .spec-workflow/               # 项目规范文档
├── docs/                        # 技术文档
│   ├── api.md                   # API 接口文档
│   ├── deploy.md                # 部署指南
│   └── arch.md                  # 架构设计
│
├── packages/                     # 共享核心包 (Monorepo)
│   ├── api/                     # API 客户端层
│   │   ├── src/
│   │   │   ├── client.ts        # HTTP 客户端 (Axios)
│   │   │   ├── endpoints.ts     # 接口定义
│   │   │   ├── types.ts         # TypeScript 类型
│   │   │   └── index.ts         # 导出
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/                    # 核心业务逻辑
│   │   ├── src/
│   │   │   ├── config.ts        # 配置管理
│   │   │   ├── storage.ts      # 存储抽象
│   │   │   ├── auth.ts         # 认证模块
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                      # 共享 UI 组件
│       ├── src/
│       │   ├── FileCard/        # 文件卡片组件
│       │   ├── FileList/        # 文件列表组件
│       │   ├── UploadButton/    # 上传按钮
│       │   ├── EmptyState/      # 空状态组件
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/                        # 各端应用
│   ├── mobile/                  # Taro 移动端 (Android + iOS)
│   │   ├── src/
│   │   │   ├── app.ts          # 入口文件
│   │   │   ├── app.config.ts   # 全局配置
│   │   │   ├── pages/
│   │   │   │   ├── index/      # 首页 (文件列表)
│   │   │   │   └── settings/    # 设置页
│   │   │   ├── components/     # 移动端特有组件
│   │   │   └── services/       # 移动端服务 (通知等)
│   │   ├── package.json
│   │   ├── taro.config.ts      # Taro 配置
│   │   └── project.config.json # 小程序配置
│   │
│   └── web/                     # Taro Web 端
│       ├── src/
│       │   ├── app.tsx         # 入口文件
│       │   ├── app.config.ts   # 全局配置
│       │   ├── pages/
│       │   │   ├── index/      # 首页
│       │   │   └── settings/   # 设置页
│       │   ├── components/     # Web 端特有组件
│       │   └── styles/         # CSS/SCSS
│       ├── public/
│       │   └── index.html
│       ├── package.json
│       └── vite.config.ts      # Vite 配置
│
├── server/                      # 后端服务 (保持不变)
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── android/                     # 原生 Android (保留, 逐步迁移)
│   └── ...
│
├── web/                         # 原生 Web (保留, 逐步迁移)
│   └── ...
│
├── package.json                 # 根 workspace 配置
├── pnpm-workspace.yaml         # PNPM Monorepo 配置
├── tsconfig.base.json          # 基础 TS 配置
├── turbo.json                  # Turborepo 构建配置
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

### 3.2 共享包依赖关系

```
                    ┌─────────────────┐
                    │   packages/api  │
                    │   (HTTP Client) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐
    │  packages/core  │ │  apps/mobile │ │    apps/web      │
    │ (Config/Auth)  │ │ (Taro App)  │ │  (Taro Web)      │
    └────────┬────────┘ └──────┬──────┘ └────────┬─────────┘
              │                 │                 │
              └────────┬────────┴────────┬────────┘
                       ▼                 ▼
              ┌─────────────────┐ ┌──────────────────┐
              │  packages/ui    │ │                  │
              │ (共享UI组件)    │ │                  │
              └─────────────────┘ └──────────────────┘
```

---

## 四、迁移实施路线图

### 4.1 阶段一：基础设施搭建 (第1周)

| 任务 | 说明 | 产出 |
|------|------|------|
| 1.1 初始化 Monorepo | 使用 pnpm/turborepo | package.json, pnpm-workspace.yaml |
| 1.2 创建 TypeScript 配置 | 基础 tsconfig.base.json | tsconfig.json |
| 1.3 搭建 packages/api | HTTP 客户端封装 | api 包 |
| 1.4 搭建 packages/core | 配置管理模块 | core 包 |
| 1.5 选型 UI 框架 | AntD (Web) / Taro UI (移动) | 组件库选定 |

### 4.2 阶段二：核心功能开发 (第2周)

| 任务 | 说明 | 产出 |
|------|------|------|
| 2.1 开发文件列表页面 | 列表/网格视图切换 | FileList 组件 |
| 2.2 开发文件上传功能 | 拖拽/点击上传 + 进度 | Upload 组件 |
| 2.3 开发文件下载功能 | 直接下载/唤起下载器 | Download 逻辑 |
| 2.4 开发文件删除功能 | 确认对话框 | Delete 逻辑 |
| 2.5 开发设置页面 | 服务器地址/API Key 配置 | Settings 页面 |

### 4.3 阶段三：多端适配 (第3周)

| 任务 | 说明 | 产出 |
|------|------|------|
| 3.1 Web 端响应式布局 | 适配桌面/移动端 | web 端上线 |
| 3.2 Android 端打包 | Taro 编译为 APK | android 端上线 |
| 3.3 iOS 端打包 (可选) | Taro 编译为 IPA | iOS 端可测试 |
| 3.4 原生功能适配 | 通知、分享、权限 | 各端体验优化 |

### 4.4 阶段四：优化与发布 (第4周)

| 任务 | 说明 | 产出 |
|------|------|------|
| 4.1 性能优化 | 代码分割、懒加载 | 加载速度提升 |
| 4.2 错误处理 | 全局异常捕获 | 崩溃率降低 |
| 4.3 CI/CD 搭建 | GitHub Actions | 自动化构建 |
| 4.4 文档完善 | API 文档、使用指南 | 项目文档 |

---

## 五、核心代码示例

### 5.1 packages/api - HTTP 客户端

```typescript
// packages/api/src/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'X-API-Key': config.apiKey,
      },
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const message = error.response?.data?.error || error.message;
        throw new Error(message);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  uploadFile(
    url: string,
    file: File | Blob,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('files', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.client.defaults.baseURL}${url}`);

      // 设置请求头
      this.client.defaults.headers.common['X-API-Key'] && 
        xhr.setRequestHeader('X-API-Key', this.client.defaults.headers.common['X-API-Key'] as string);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.send(formData);
    });
  }
}

export const createApiClient = (config: ApiConfig) => new ApiClient(config);
```

```typescript
// packages/api/src/types.ts
export interface FileInfo {
  id: string;
  originalName: string;
  storedName: string;
  size: number;
  mimetype: string;
  uploadTime: string;
  md5: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  files: FileInfo[];
}

export interface FilesResponse {
  success: boolean;
  count: number;
  files: FileInfo[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
```

```typescript
// packages/api/src/endpoints.ts
import { ApiClient } from './client';
import type { UploadResponse, FilesResponse, DeleteResponse } from './types';

export class FileApi {
  constructor(private client: ApiClient) {}

  async getFiles(): Promise<FilesResponse> {
    return this.client.get('/api/files');
  }

  async uploadFiles(
    files: File | Blob | FileList,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    const fileList = files instanceof FileList ? Array.from(files) : [files];
    const results: UploadResponse = { success: true, message: '', files: [] };

    for (const file of fileList) {
      const result = await this.client.uploadFile<UploadResponse>(
        '/api/upload',
        file,
        onProgress
      );
      results.files.push(...result.files);
    }

    return results;
  }

  async deleteFile(filename: string): Promise<DeleteResponse> {
    return this.client.delete(`/api/files/${encodeURIComponent(filename)}`);
  }

  getDownloadUrl(filename: string, apiKey: string): string {
    return `${this.client.defaults.baseURL}/api/download/${encodeURIComponent(filename)}?apiKey=${encodeURIComponent(apiKey)}`;
  }
}
```

```typescript
// packages/api/src/index.ts
export { ApiClient, createApiClient, type ApiConfig } from './client';
export type { FileInfo, UploadResponse, FilesResponse, DeleteResponse } from './types';
export { FileApi } from './endpoints';
```

### 5.2 packages/core - 配置管理

```typescript
// packages/core/src/config.ts
export interface AppConfig {
  serverUrl: string;
  apiKey: string;
}

const CONFIG_KEYS = {
  SERVER_URL: 'light_cloud_server_url',
  API_KEY: 'light_cloud_api_key',
} as const;

const DEFAULT_CONFIG: AppConfig = {
  serverUrl: 'http://localhost:3000',
  apiKey: 'light-cloud-disk-2026',
};

class ConfigManager {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  get serverUrl(): string {
    return this.storage.getItem(CONFIG_KEYS.SERVER_URL) || DEFAULT_CONFIG.serverUrl;
  }

  set serverUrl(url: string) {
    this.storage.setItem(CONFIG_KEYS.SERVER_URL, url);
  }

  get apiKey(): string {
    return this.storage.getItem(CONFIG_KEYS.API_KEY) || DEFAULT_CONFIG.apiKey;
  }

  set apiKey(key: string) {
    this.storage.setItem(CONFIG_KEYS.API_KEY, key);
  }

  reset(): void {
    this.storage.removeItem(CONFIG_KEYS.SERVER_URL);
    this.storage.removeItem(CONFIG_KEYS.API_KEY);
  }

  isValid(): boolean {
    return this.serverUrl.length > 0 && this.apiKey.length > 0;
  }
}

export const configManager = new ConfigManager();
export type { AppConfig };
```

```typescript
// packages/core/src/index.ts
export { configManager, type AppConfig } from './config';
```

### 5.3 apps/web - Web 端入口

```tsx
// apps/web/src/app.tsx
import { Component, ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { configManager } from '@light-cloud-disk/core';
import { FileApi, createApiClient } from '@light-cloud-disk/api';
import MainLayout from './components/MainLayout';

import './styles/index.css';

class App extends Component<{ children: ReactNode }> {
  static config = {
    pages: ['pages/index/index', 'pages/settings/index'],
  };

  componentDidMount() {
    console.log('Light Cloud Disk Web Started');
  }

  render() {
    return (
      <ConfigProvider locale={zhCN}>
        <MainLayout>{this.props.children}</MainLayout>
      </ConfigProvider>
    );
  }
}

export default App;

// 全局 API 实例
export const api = new FileApi(
  createApiClient({
    baseURL: configManager.serverUrl,
    apiKey: configManager.apiKey,
  })
);
```

```tsx
// apps/web/src/pages/index/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { InboxOutder, Upload, message } from 'antd';
import { api, FileInfo } from '@light-cloud-disk/api';
import { configManager } from '@light-cloud-disk/core';
import FileCard from '@/components/FileCard';
import './index.less';

const { Dragger } = Upload;

export default function FileListPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getFiles();
      setFiles(response.files);
    } catch (error) {
      message.error(`加载失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (info: any) => {
    const { status } = info.file;
    
    if (status === 'uploading') {
      setUploading(true);
      setUploadProgress(Math.round(info.file.percent));
      return;
    }

    if (status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      setUploading(false);
      loadFiles();
    } else if (status === 'error') {
      message.error(`${info.file.name} 上传失败`);
      setUploading(false);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    try {
      await api.deleteFile(file.storedName);
      message.success('删除成功');
      loadFiles();
    } catch (error) {
      message.error(`删除失败: ${error.message}`);
    }
  };

  const handleDownload = (file: FileInfo) => {
    const url = api.getDownloadUrl(file.storedName, configManager.apiKey);
    window.open(url, '_blank');
  };

  return (
    <div className="page-file-list">
      <div className="header">
        <h1>轻量云盘</h1>
        <a href="/settings">设置</a>
      </div>

      <Dragger
        name="files"
        multiple={true}
        action={`${configManager.serverUrl}/api/upload`}
        headers={{ 'X-API-Key': configManager.apiKey }}
        onChange={handleUpload}
        showUploadList={false}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个或多个文件上传
        </p>
        {uploading && <p>上传进度: {uploadProgress}%</p>}
      </Dragger>

      <div className="file-grid">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDownload={() => handleDownload(file)}
            onDelete={() => handleDelete(file)}
          />
        ))}
      </div>

      {files.length === 0 && !loading && (
        <div className="empty-state">
          <p>暂无文件</p>
          <p>点击上方按钮或拖拽文件到此处上传</p>
        </div>
      )}
    </div>
  );
}
```

### 5.4 apps/mobile - 移动端入口

```typescript
// apps/mobile/src/app.tsx
import { Component, ReactNode } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { configManager } from '@light-cloud-disk/core';
import { FileApi, createApiClient } from '@light-cloud-disk/api';

import IndexPage from './pages/index';
import SettingsPage from './pages/settings';

const Tab = createBottomTabNavigator();

class App extends Component {
  static config = {
    pages: ['pages/index/index', 'pages/settings/index'],
    window: {
      navigationBarBackgroundColor: '#ffffff',
      backgroundTextStyle: 'dark',
      navigationBarTitleText: '轻量云盘',
      navigationBarShadowStyle: 'noShadow',
    },
    tabBar: {
      color: '#999999',
      selectedColor: '#4CAF50',
      borderStyle: 'white',
      backgroundColor: '#ffffff',
    },
  };

  componentDidMount() {
    console.log('Light Cloud Disk Mobile Started');
  }

  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen 
            name="Files" 
            component={IndexPage}
            options={{ title: '文件' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsPage}
            options={{ title: '设置' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;

// 全局 API 实例
export const api = new FileApi(
  createApiClient({
    baseURL: configManager.serverUrl,
    apiKey: configManager.apiKey,
  })
);
```

```typescript
// apps/mobile/src/pages/index/index.tsx
import { useState, useEffect, useCallback } from '@tarojs/taro';
import { View, Text, Button, FilePicker, AtFab } from 'taro-ui';
import { api, FileInfo } from '@light-cloud-disk/api';
import { configManager } from '@light-cloud-disk/core';
import FileList from '@/components/FileList';
import './index.less';

export default function IndexPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      const response = await api.getFiles();
      setFiles(response.files);
    } catch (error) {
      console.error('Load files error:', error);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  };

  const handleUpload = async () => {
    try {
      const result = await FilePickerchoose({
        count: 9,
        type: 'all',
        success: async (res) => {
          setLoading(true);
          const files = res.tempFilePaths;
          for (const filePath of files) {
            await api.uploadFiles(file as any);
          }
          await loadFiles();
          setLoading(false);
        },
        fail: () => setLoading(false),
      });
    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    try {
      await api.deleteFile(file.storedName);
      await loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDownload = (file: FileInfo) => {
    const url = api.getDownloadUrl(file.storedName, configManager.apiKey);
    Taro.downloadFile({ url });
  };

  return (
    <View className="page-index">
      <View className="header">
        <Text className="title">轻量云盘</Text>
      </View>

      <View className="content">
        <View
          className="refresh-wrapper"
          onPullDownRefresh={handleRefresh}
        >
          <FileList
            files={files}
            onItemClick={handleDownload}
            onDelete={handleDelete}
          />
        </View>
      </View>

      <View className="fab-wrapper">
        <AtFab onClick={handleUpload}>
          <Text className="at-fab__icon">+</Text>
        </AtFab>
      </View>
    </View>
  );
}
```

---

## 六、关键技术决策

### 6.1 状态管理选型

| 环境 | 推荐方案 | 理由 |
|------|---------|------|
| Web | Zustand | 轻量、简单、TypeScript友好 |
| Mobile | Taro 内置状态 | 与页面生命周期绑定 |
| 共享 | Taro Props | 必要时使用 Context |

### 6.2 UI 组件库选型

| 环境 | 推荐方案 | 理由 |
|------|---------|------|
| Web | Ant Design React | 成熟稳定，组件丰富 |
| Mobile | Taro UI / NutUI | Taro 官方/京东出品 |
| 共享 | 自定义基础组件 | FileCard, Button 等可共享 |

### 6.3 构建工具

- **Monorepo**: PNPM + Turborepo
- **Web**: Vite (Taro 默认)
- **Mobile**: Taro CLI (内置)

---

## 七、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| Taro Web 编译质量 | 可能不如纯 React | 使用 React 模式，验证输出 |
| 第三方库不兼容 | 部分 npm 包无法在 Taro 使用 | 使用 Taro 兼容方案或原生实现 |
| 样式差异 | 移动端与 Web 端样式不一致 | 使用响应式设计 + 条件渲染 |
| 权限API差异 | 相机/存储等权限处理不同 | 使用 Taro 权限 API 封装 |

---

## 八、验收标准

### 8.1 功能验收

- [ ] 文件列表正确显示
- [ ] 文件上传成功（含进度显示）
- [ ] 文件下载功能正常
- [ ] 文件删除功能正常
- [ ] 配置页面可修改服务器地址和 API Key
- [ ] 深色/浅色主题切换

### 8.2 平台验收

- [ ] Web 端在 Chrome/Edge/Safari 正常显示
- [ ] Web 端响应式布局正常（桌面/平板/手机）
- [ ] Android 端 APK 可正常安装和运行
- [ ] 移动端文件选择器正常工作

### 8.3 性能验收

- [ ] 首次加载时间 < 3秒
- [ ] 文件列表渲染 100 个文件无卡顿
- [ ] APK 包大小 < 20MB
