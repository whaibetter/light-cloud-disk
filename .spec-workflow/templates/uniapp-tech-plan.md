# Uni-app 跨平台应用开发技术方案

**项目名称：** 轻量云盘 (Light Cloud Disk)  
**技术框架：** Uni-app + Vue 3 + TypeScript  
**版本：** v2.0.0  
**编制日期：** 2026-05-06  
**文档状态：** 正式发布

---

## 目录

1. [技术选型依据](#一技术选型依据)
2. [项目架构设计](#二项目架构设计)
3. [组件划分方案](#三组件划分方案)
4. [状态管理策略](#四状态管理策略)
5. [路由配置方案](#五路由配置方案)
6. [跨端适配方案](#六跨端适配方案)
7. [性能优化措施](#七性能优化措施)
8. [开发与测试流程](#八开发与测试流程)
9. [部署策略](#九部署策略)
10. [项目进度规划](#十项目进度规划)

---

## 一、技术选型依据

### 1.1 技术选型对比分析

#### 1.1.1 主流跨平台框架对比

| 对比维度 | Uni-app | Taro | React Native | Flutter |
|----------|---------|------|--------------|---------|
| **框架基础** | Vue 2/3 | React | React | Dart |
| **学习成本** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **国内生态** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **多端编译** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Android编译** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **iOS编译** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Web编译** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 不支持 |
| **小程序编译** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 不支持 |
| **性能表现** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **组件库丰富度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **社区活跃度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **文档完善度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **IDE支持** | HBuilderX / VSCode | VSCode | VSCode | Android Studio |

#### 1.1.2 本项目选型结论

**选择 Uni-app 作为开发框架，核心依据如下：**

| 依据 | 说明 |
|------|------|
| **Vue技术栈** | 团队现有Web端使用Vue.js，技术栈统一，学习成本最低 |
| **国内生态优势** | DCloud背书，插件市场丰富，组件库成熟（uView、Uni-ui） |
| **小程序支持** | 后续可快速扩展微信小程序、支付宝小程序 |
| **Android原生渲染** | 使用renderjs实现原生渲染，性能接近原生 |
| **一次开发多端** | 同一套代码同时输出Android、iOS、Web三端 |
| **TypeScript支持** | Uni-app 3.x全面支持TS，提供完整的类型定义 |

### 1.2 技术栈清单

| 层级 | 技术选型 | 版本要求 | 说明 |
|------|---------|---------|------|
| **开发框架** | Uni-app | 3.x | 跨平台应用开发框架 |
| **前端框架** | Vue.js | 3.2+ | 响应式前端框架 |
| **构建工具** | Vite | 4.x | 现代构建工具 |
| **UI组件库** | uView Plus | 3.x | Uni-app官方推荐UI库 |
| **状态管理** | Pinia | 2.x | Vue官方推荐状态管理 |
| **网络请求** | Uni-request | - | Uni-app官方请求库 |
| **路由管理** | Uni-simple-router | 4.x | Vue Router封装 |
| **代码规范** | ESLint + Prettier | - | 代码质量工具 |
| **打包工具** | HBuilderX / CLI | 最新版 | 应用打包工具 |

### 1.3 技术可行性分析

#### 1.3.1 现有代码资产复用评估

| 模块 | 现有实现 | 复用方式 | 复用率 |
|------|---------|---------|--------|
| **API接口定义** | Kotlin (ApiService.kt) | 重写为TypeScript | 100% (接口不变) |
| **数据模型** | Kotlin (FileInfo.kt) | 转换为TS接口 | 100% |
| **配置管理** | Kotlin (ConfigManager.kt) | 重写为TS类 | 90% |
| **上传逻辑** | FileUploadService.kt | 重写为Uni-app API | 80% |
| **权限处理** | Android Manifest | 使用Uni-app权限API | 30% |
| **UI组件** | Android XML / Web HTML | 重新实现 | 20% |
| **样式代码** | CSS / Material Design | 重构为SCSS | 40% |

#### 1.3.2 风险评估与应对

| 风险项 | 风险等级 | 应对措施 |
|--------|---------|---------|
| Web端打包体积过大 | 中 | 使用按需加载、代码分割 |
| Android端性能不足 | 低 | 使用nvue原生渲染 |
| 第三方插件不兼容 | 中 | 优先使用Uni-app官方插件 |
| 样式跨平台不一致 | 中 | 使用条件编译处理 |
| 小程序API差异 | 低 | 使用条件编译 + shim |

---

## 二、项目架构设计

### 2.1 整体架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                        应用分层架构                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    视图层 (View Layer)                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │   Web端页面   │  │ Android页面   │  │  小程序页面   │      │   │
│  │  │  (Vue组件)   │  │  (nvue组件)  │  │  (Vue组件)   │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   组件层 (Component Layer)                  │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │   │
│  │  │FileCard│ │FileList│ │ Upload │ │Toolbar │ │Modal  │   │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  业务逻辑层 (Service Layer)                  │   │
│  │  ┌────────────────┐  ┌────────────────┐                    │   │
│  │  │  FileService   │  │ ConfigService  │                    │   │
│  │  │  (文件业务)     │  │  (配置业务)     │                    │   │
│  │  └────────────────┘  └────────────────┘                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    数据层 (Data Layer)                        │   │
│  │  ┌────────────────┐  ┌────────────────┐                    │   │
│  │  │    API Client   │  │    Storage     │                    │   │
│  │  │   (网络请求)    │  │   (本地存储)   │                    │   │
│  │  └────────────────┘  └────────────────┘                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  平台适配层 (Platform Layer)                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │  #ifdef H5 │  │#ifdef APP-ANDROID│ │#ifdef MP │          │   │
│  │  │  (Web适配)  │  │  (Android适配) │ │(小程序适配)│          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构设计

```
light-cloud-disk-v2/
│
├── .github/                          # GitHub配置
│   └── workflows/
│       └── ci.yml                   # CI/CD工作流
│
├── .vscode/                         # VSCode配置
│   ├── extensions.json
│   └── settings.json
│
├── docs/                            # 技术文档
│   ├── api.md                       # API接口文档
│   ├── deploy.md                    # 部署文档
│   └── changelog.md                 # 变更日志
│
├── public/                          # 静态资源
│   ├── favicon.ico
│   └── logo.png
│
├── src/                            # 源代码目录
│   ├── App.vue                     # 应用根组件
│   ├── main.ts                     # 应用入口
│   ├── pages.json                  # 页面路由配置
│   ├── uni.scss                    # 全局样式变量
│   │
│   ├── api/                        # 网络请求层
│   │   ├── index.ts               # 请求封装
│   │   ├── types.ts               # TypeScript类型
│   │   └── modules/
│   │       └── file.ts            # 文件相关API
│   │
│   ├── components/                # 全局通用组件
│   │   ├── FileCard/              # 文件卡片组件
│   │   ├── FileList/              # 文件列表组件
│   │   ├── UploadButton/          # 上传按钮组件
│   │   ├── EmptyState/            # 空状态组件
│   │   ├── Loading/               # 加载组件
│   │   └── Modal/                 # 模态框组件
│   │
│   ├── composables/                # 组合式API (Vue3)
│   │   ├── useFile.ts             # 文件操作逻辑
│   │   ├── useUpload.ts           # 上传逻辑
│   │   ├── useConfig.ts           # 配置逻辑
│   │   └── usePlatform.ts         # 平台判断
│   │
│   ├── pages/                      # 页面组件
│   │   ├── index/                 # 首页 (文件列表)
│   │   │   ├── index.vue
│   │   │   ├── index.scss
│   │   │   └── index.hooks.ts
│   │   │
│   │   ├── settings/              # 设置页
│   │   │   ├── settings.vue
│   │   │   └── settings.scss
│   │   │
│   │   └── error/                 # 错误页
│   │       └── 404.vue
│   │
│   ├── router/                     # 路由配置
│   │   ├── index.ts               # 路由入口
│   │   ├── routes.ts              # 路由定义
│   │   └── guards.ts              # 路由守卫
│   │
│   ├── services/                   # 业务服务层
│   │   ├── file.service.ts        # 文件业务服务
│   │   ├── config.service.ts      # 配置业务服务
│   │   └── auth.service.ts        # 认证服务
│   │
│   ├── stores/                     # 状态管理 (Pinia)
│   │   ├── file.store.ts          # 文件状态
│   │   ├── config.store.ts       # 配置状态
│   │   └── user.store.ts          # 用户状态
│   │
│   ├── styles/                     # 全局样式
│   │   ├── _variables.scss        # 样式变量
│   │   ├── _mixins.scss           # 样式混入
│   │   ├── _reset.scss           # 样式重置
│   │   └── common.scss            # 通用样式
│   │
│   ├── types/                      # 类型定义
│   │   ├── global.d.ts           # 全局类型声明
│   │   └── env.d.ts              # 环境变量类型
│   │
│   └── utils/                      # 工具函数
│       ├── format.ts              # 格式化工具
│       ├── storage.ts             # 存储工具
│       ├── platform.ts            # 平台判断
│       └── validate.ts            # 验证工具
│
├── index.html                       # Web端入口HTML (仅H5)
├── main.js                         # Web端入口JS
├── App.vue                         # Web端根组件
│
├── manifest.json                   # 应用配置文件
├── pages.json                      # 页面配置文件
├── uni.scss                        # Uni-app全局样式
├── vite.config.ts                  # Vite配置
├── tsconfig.json                   # TypeScript配置
├── package.json                    # 依赖配置
├── .eslintrc.js                    # ESLint配置
├── .prettierrc                     # Prettier配置
└── README.md                       # 项目说明
```

### 2.3 模块职责说明

| 模块 | 职责 | 关键类/函数 |
|------|------|------------|
| **api/** | 封装HTTP请求、统一错误处理 | `request()`, `createAPI()` |
| **components/** | 可复用UI组件 | `FileCard`, `FileList` |
| **composables/** | 组合式业务逻辑 | `useFile()`, `useUpload()` |
| **pages/** | 页面级组件 | `IndexPage`, `SettingsPage` |
| **router/** | 路由管理 | 路由配置、导航守卫 |
| **services/** | 业务逻辑封装 | `FileService`, `ConfigService` |
| **stores/** | 状态管理 | `useFileStore()`, `useConfigStore()` |
| **styles/** | 全局样式 | 变量、混入、通用样式 |
| **utils/** | 通用工具函数 | 格式化、存储、平台判断 |

---

## 三、组件划分方案

### 3.1 组件层级结构

```
组件层级:
├── 原子组件 (Atomic)
│   ├── Button
│   ├── Icon
│   ├── Input
│   └── Text
│
├── 分子组件 (Molecular)
│   ├── FileCard
│   ├── FileItem
│   ├── UploadButton
│   ├── SearchBar
│   └── Toolbar
│
├── 有机体组件 (Organic)
│   ├── FileList
│   ├── UploadPanel
│   ├── SettingsForm
│   └── EmptyState
│
└── 模板组件 (Template)
    ├── MainLayout
    ├── SettingsLayout
    └── AuthLayout
```

### 3.2 核心组件详细设计

#### 3.2.1 文件卡片组件 (FileCard)

```vue
<!-- src/components/FileCard/FileCard.vue -->
<template>
  <view class="file-card" @click="handleClick">
    <view class="file-icon">
      <image :src="getFileIcon(file.mimetype)" mode="aspectFit" />
    </view>
    <view class="file-info">
      <text class="file-name">{{ file.originalName }}</text>
      <text class="file-meta">{{ formatSize(file.size) }} · {{ formatDate(file.uploadTime) }}</text>
    </view>
    <view class="file-actions">
      <button class="action-btn" @click.stop="handleDownload">
        <text class="icon-download">↓</text>
      </button>
      <button class="action-btn delete" @click.stop="handleDelete">
        <text class="icon-delete">×</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { FileInfo } from '@/api/types'
import { formatSize, formatDate } from '@/utils/format'
import { getFileIcon } from '@/utils/file'

interface Props {
  file: FileInfo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click', file: FileInfo): void
  (e: 'download', file: FileInfo): void
  (e: 'delete', file: FileInfo): void
}>()

const handleClick = () => emit('click', props.file)
const handleDownload = () => emit('download', props.file)
const handleDelete = () => emit('delete', props.file)
</script>

<style lang="scss" scoped>
.file-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  
  .file-icon {
    width: 80rpx;
    height: 80rpx;
    margin-right: 24rpx;
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .file-info {
    flex: 1;
    min-width: 0;
    
    .file-name {
      display: block;
      font-size: 28rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-meta {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
  
  .file-actions {
    display: flex;
    gap: 16rpx;
    
    .action-btn {
      width: 64rpx;
      height: 64rpx;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: #f5f5f5;
      
      &.delete {
        background: #fee;
        color: #f56c6c;
      }
    }
  }
}
</style>
```

#### 3.2.2 文件列表组件 (FileList)

```vue
<!-- src/components/FileList/FileList.vue -->
<template>
  <view class="file-list">
    <!-- 列表视图 -->
    <view v-if="viewMode === 'list'" class="list-view">
      <view 
        v-for="file in files" 
        :key="file.id"
        class="list-item"
      >
        <FileCard 
          :file="file"
          @click="$emit('itemClick', file)"
          @download="$emit('download', file)"
          @delete="$emit('delete', file)"
        />
      </view>
    </view>
    
    <!-- 网格视图 -->
    <view v-else class="grid-view">
      <view 
        v-for="file in files" 
        :key="file.id"
        class="grid-item"
      >
        <FileCard 
          :file="file"
          @click="$emit('itemClick', file)"
          @download="$emit('download', file)"
          @delete="$emit('delete', file)"
        />
      </view>
    </view>
    
    <!-- 空状态 -->
    <EmptyState 
      v-if="files.length === 0"
      :message="emptyMessage"
      :hint="emptyHint"
    />
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import type { FileInfo } from '@/api/types'
import FileCard from '../FileCard/FileCard.vue'
import EmptyState from '../EmptyState/EmptyState.vue'

interface Props {
  files: FileInfo[]
  viewMode?: 'list' | 'grid'
  emptyMessage?: string
  emptyHint?: string
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'list',
  emptyMessage: '暂无文件',
  emptyHint: '点击下方按钮上传文件'
})

defineEmits<{
  (e: 'itemClick', file: FileInfo): void
  (e: 'download', file: FileInfo): void
  (e: 'delete', file: FileInfo): void
}>()
</script>

<style lang="scss" scoped>
.file-list {
  width: 100%;
  
  .list-view {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding: 0 24rpx;
  }
  
  .grid-view {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    padding: 24rpx;
  }
}
</style>
```

#### 3.2.3 上传面板组件 (UploadPanel)

```vue
<!-- src/components/UploadPanel/UploadPanel.vue -->
<template>
  <view class="upload-panel">
    <!-- 拖拽上传区域 (仅H5) -->
    #ifdef H5
    <view 
      class="drop-zone"
      :class="{ 'drag-over': isDragOver }"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="handleChooseFile"
    >
      <view class="upload-icon">📤</view>
      <text class="upload-text">点击或拖拽文件到此处上传</text>
      <text class="upload-hint">支持任意类型文件</text>
    </view>
    #endif
    
    <!-- APP端选择按钮 -->
    #ifndef H5
    <view class="upload-actions">
      <button class="upload-btn" @click="handleChooseFile">
        选择文件
      </button>
      <button class="upload-btn camera" @click="handleChooseImage">
        拍照上传
      </button>
    </view>
    #endif
    
    <!-- 进度显示 -->
    <view v-if="uploading" class="upload-progress">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progress + '%' }"></view>
      </view>
      <text class="progress-text">{{ progress }}%</text>
    </view>
    
    <!-- 上传队列 -->
    <view v-if="uploadQueue.length > 0" class="upload-queue">
      <view v-for="item in uploadQueue" :key="item.name" class="queue-item">
        <text class="queue-name">{{ item.name }}</text>
        <text class="queue-status" :class="item.status">
          {{ item.status === 'pending' ? '等待中' : 
             item.status === 'uploading' ? '上传中' :
             item.status === 'success' ? '成功' : '失败' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUpload } from '@/composables/useUpload'
import { chooseFile, chooseImage } from '@/utils/file'

interface UploadItem {
  name: string
  status: 'pending' | 'uploading' | 'success' | 'error'
}

const props = defineProps<{
  multiple?: boolean
}>()

const emit = defineEmits<{
  (e: 'success', files: any[]): void
  (e: 'error', error: Error): void
}>()

const { upload, progress, uploading } = useUpload({
  onSuccess: (files) => emit('success', files),
  onError: (error) => emit('error', error)
})

const isDragOver = ref(false)
const uploadQueue = reactive<UploadItem[]>([])

const handleDragEnter = () => { isDragOver.value = true }
const handleDragLeave = () => { isDragOver.value = false }

const handleDrop = async (e: DragEvent) => {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files) {
    await upload(Array.from(files))
  }
}

const handleChooseFile = async () => {
  const files = await chooseFile({ multiple: props.multiple })
  if (files) {
    await upload(files)
  }
}

const handleChooseImage = async () => {
  const images = await chooseImage({ count: 9 })
  if (images) {
    await upload(images)
  }
}
</script>

<style lang="scss" scoped>
.upload-panel {
  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 40rpx;
    border: 2rpx dashed #ddd;
    border-radius: 16rpx;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.3s;
    
    &.drag-over {
      border-color: #4CAF50;
      background: #f0f9f0;
    }
    
    .upload-icon {
      font-size: 80rpx;
      margin-bottom: 24rpx;
    }
    
    .upload-text {
      font-size: 28rpx;
      color: #333;
    }
    
    .upload-hint {
      font-size: 24rpx;
      color: #999;
      margin-top: 12rpx;
    }
  }
  
  .upload-actions {
    display: flex;
    gap: 24rpx;
    padding: 24rpx;
    
    .upload-btn {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      background: #4CAF50;
      color: #fff;
      border-radius: 44rpx;
      border: none;
      
      &.camera {
        background: #2196F3;
      }
    }
  }
  
  .upload-progress {
    padding: 24rpx;
    
    .progress-bar {
      height: 8rpx;
      background: #f0f0f0;
      border-radius: 4rpx;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        transition: width 0.3s;
      }
    }
    
    .progress-text {
      display: block;
      text-align: center;
      font-size: 24rpx;
      color: #666;
      margin-top: 12rpx;
    }
  }
}
</style>
```

### 3.3 组件通信模式

| 场景 | 通信方式 | 实现方式 |
|------|---------|---------|
| 父子组件通信 | Props/Emit | Vue3 defineProps/defineEmits |
| 跨级组件通信 | Provide/Inject | Vue3 provide/inject |
| 全局状态通信 | Pinia Store | useXxxStore() |
| 事件总线 | EventBus | uni.$emit / uni.$on |
| 页面间通信 | EventChannel | uni.eventChannel |

---

## 四、状态管理策略

### 4.1 状态管理架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Pinia 状态管理                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐     ┌─────────────────┐              │
│  │   useFileStore   │     │ useConfigStore  │              │
│  │   (文件状态)      │     │   (配置状态)    │              │
│  ├─────────────────┤     ├─────────────────┤              │
│  │ files: FileInfo │     │ serverUrl: str  │              │
│  │ loading: bool   │     │ apiKey: str     │              │
│  │ viewMode: str   │     │ theme: str      │              │
│  │ selectedIds: []  │     │ language: str   │              │
│  ├─────────────────┤     ├─────────────────┤              │
│  │ fetchFiles()    │     │ setServerUrl()  │              │
│  │ uploadFile()    │     │ setApiKey()     │              │
│  │ deleteFile()    │     │ setTheme()      │              │
│  └─────────────────┘     └─────────────────┘              │
│                                                             │
│  ┌─────────────────┐                                       │
│  │ useUploadStore  │                                       │
│  │   (上传状态)     │                                       │
│  ├─────────────────┤                                       │
│  │ queue: []       │                                       │
│  │ progress: num   │                                       │
│  │ uploading: bool │                                       │
│  ├─────────────────┤                                       │
│  │ addQueue()     │                                       │
│  │ removeQueue()  │                                       │
│  │ clearQueue()   │                                       │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 核心Store实现

#### 4.2.1 文件状态管理 (FileStore)

```typescript
// src/stores/file.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileInfo } from '@/api/types'
import { fileApi } from '@/api/modules/file'

export const useFileStore = defineStore('file', () => {
  // === State ===
  const files = ref<FileInfo[]>([])
  const loading = ref(false)
  const viewMode = ref<'list' | 'grid'>('list')
  const selectedIds = ref<string[]>([])
  const searchQuery = ref('')
  const sortBy = ref<'name' | 'time' | 'size'>('time')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  
  // === Getters ===
  const filteredFiles = computed(() => {
    let result = [...files.value]
    
    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(f => 
        f.originalName.toLowerCase().includes(query)
      )
    }
    
    // 排序
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy.value) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName)
          break
        case 'time':
          comparison = new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
      }
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
    
    return result
  })
  
  const selectedFiles = computed(() => 
    files.value.filter(f => selectedIds.value.includes(f.id))
  )
  
  const hasSelection = computed(() => selectedIds.value.length > 0)
  
  // === Actions ===
  async function fetchFiles() {
    loading.value = true
    try {
      const response = await fileApi.getFiles()
      files.value = response.files
    } catch (error) {
      console.error('Fetch files error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  async function uploadFile(file: File | string, onProgress?: (p: number) => void) {
    const result = await fileApi.uploadFile(file, onProgress)
    files.value.push(...result.files)
    return result
  }
  
  async function deleteFile(fileId: string) {
    const file = files.value.find(f => f.id === fileId)
    if (!file) throw new Error('File not found')
    
    await fileApi.deleteFile(file.storedName)
    files.value = files.value.filter(f => f.id !== fileId)
  }
  
  function setViewMode(mode: 'list' | 'grid') {
    viewMode.value = mode
  }
  
  function toggleSelection(fileId: string) {
    const index = selectedIds.value.indexOf(fileId)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(fileId)
    }
  }
  
  function clearSelection() {
    selectedIds.value = []
  }
  
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }
  
  function setSort(field: 'name' | 'time' | 'size', order: 'asc' | 'desc') {
    sortBy.value = field
    sortOrder.value = order
  }
  
  return {
    // State
    files,
    loading,
    viewMode,
    selectedIds,
    searchQuery,
    sortBy,
    sortOrder,
    // Getters
    filteredFiles,
    selectedFiles,
    hasSelection,
    // Actions
    fetchFiles,
    uploadFile,
    deleteFile,
    setViewMode,
    toggleSelection,
    clearSelection,
    setSearchQuery,
    setSort
  }
})
```

#### 4.2.2 配置状态管理 (ConfigStore)

```typescript
// src/stores/config.store.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEYS = {
  SERVER_URL: 'lcd_server_url',
  API_KEY: 'lcd_api_key',
  THEME: 'lcd_theme',
  LANGUAGE: 'lcd_language',
  VIEW_MODE: 'lcd_view_mode'
} as const

const DEFAULTS = {
  SERVER_URL: 'http://localhost:3000',
  API_KEY: 'light-cloud-disk-2026',
  THEME: 'light',
  LANGUAGE: 'zh-CN',
  VIEW_MODE: 'list'
}

export const useConfigStore = defineStore('config', () => {
  // === State ===
  const serverUrl = ref(uni.getStorageSync(STORAGE_KEYS.SERVER_URL) || DEFAULTS.SERVER_URL)
  const apiKey = ref(uni.getStorageSync(STORAGE_KEYS.API_KEY) || DEFAULTS.API_KEY)
  const theme = ref(uni.getStorageSync(STORAGE_KEYS.THEME) || DEFAULTS.THEME)
  const language = ref(uni.getStorageSync(STORAGE_KEYS.LANGUAGE) || DEFAULTS.LANGUAGE)
  const viewMode = ref(uni.getStorageSync(STORAGE_KEYS.VIEW_MODE) || DEFAULTS.VIEW_MODE)
  
  // === Watch ===
  watch(serverUrl, (val) => uni.setStorageSync(STORAGE_KEYS.SERVER_URL, val))
  watch(apiKey, (val) => uni.setStorageSync(STORAGE_KEYS.API_KEY, val))
  watch(theme, (val) => {
    uni.setStorageSync(STORAGE_KEYS.THEME, val)
    applyTheme(val)
  })
  watch(language, (val) => uni.setStorageSync(STORAGE_KEYS.LANGUAGE, val))
  watch(viewMode, (val) => uni.setStorageSync(STORAGE_KEYS.VIEW_MODE, val))
  
  // === Actions ===
  function setServerUrl(url: string) {
    serverUrl.value = url
  }
  
  function setApiKey(key: string) {
    apiKey.value = key
  }
  
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  function setLanguage(lang: string) {
    language.value = lang
  }
  
  function setViewMode(mode: 'list' | 'grid') {
    viewMode.value = mode
  }
  
  function resetToDefault() {
    serverUrl.value = DEFAULTS.SERVER_URL
    apiKey.value = DEFAULTS.API_KEY
    theme.value = DEFAULTS.THEME
    language.value = DEFAULTS.LANGUAGE
    viewMode.value = DEFAULTS.VIEW_MODE
  }
  
  function isConfigValid() {
    return serverUrl.value.length > 0 && apiKey.value.length > 0
  }
  
  function applyTheme(t: string) {
    // #ifdef H5
    document.documentElement.setAttribute('data-theme', t)
    // #endif
  }
  
  return {
    // State
    serverUrl,
    apiKey,
    theme,
    language,
    viewMode,
    // Actions
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
```

#### 4.2.3 上传状态管理 (UploadStore)

```typescript
// src/stores/upload.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UploadItem {
  id: string
  name: string
  size: number
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export const useUploadStore = defineStore('upload', () => {
  // === State ===
  const queue = ref<UploadItem[]>([])
  const currentUpload = ref<UploadItem | null>(null)
  
  // === Getters ===
  const isUploading = computed(() => 
    queue.value.some(item => item.status === 'uploading')
  )
  
  const pendingCount = computed(() => 
    queue.value.filter(item => item.status === 'pending').length
  )
  
  const successCount = computed(() => 
    queue.value.filter(item => item.status === 'success').length
  )
  
  const errorCount = computed(() => 
    queue.value.filter(item => item.status === 'error').length
  )
  
  const overallProgress = computed(() => {
    if (queue.value.length === 0) return 0
    const total = queue.value.reduce((sum, item) => sum + item.progress, 0)
    return Math.round(total / queue.value.length)
  })
  
  // === Actions ===
  function addToQueue(files: File[] | string[]) {
    const items: UploadItem[] = files.map((file, index) => ({
      id: `upload_${Date.now()}_${index}`,
      name: typeof file === 'string' ? file : file.name,
      size: typeof file === 'string' ? 0 : file.size,
      progress: 0,
      status: 'pending' as const
    }))
    queue.value.push(...items)
    return items
  }
  
  function updateProgress(id: string, progress: number) {
    const item = queue.value.find(i => i.id === id)
    if (item) {
      item.progress = progress
      if (progress > 0 && item.status === 'pending') {
        item.status = 'uploading'
      }
    }
  }
  
  function setSuccess(id: string) {
    const item = queue.value.find(i => i.id === id)
    if (item) {
      item.status = 'success'
      item.progress = 100
    }
  }
  
  function setError(id: string, error: string) {
    const item = queue.value.find(i => i.id === id)
    if (item) {
      item.status = 'error'
      item.error = error
    }
  }
  
  function removeFromQueue(id: string) {
    const index = queue.value.findIndex(i => i.id === id)
    if (index > -1) {
      queue.value.splice(index, 1)
    }
  }
  
  function clearQueue() {
    queue.value = []
    currentUpload.value = null
  }
  
  function clearCompleted() {
    queue.value = queue.value.filter(item => 
      item.status === 'pending' || item.status === 'uploading'
    )
  }
  
  return {
    // State
    queue,
    currentUpload,
    // Getters
    isUploading,
    pendingCount,
    successCount,
    errorCount,
    overallProgress,
    // Actions
    addToQueue,
    updateProgress,
    setSuccess,
    setError,
    removeFromQueue,
    clearQueue,
    clearCompleted
  }
})
```

---

## 五、路由配置方案

### 5.1 路由架构

```
路由结构:
├── / (index)              # 首页 - 文件列表
│   ├── /                  # 文件列表页
│   └── ?mode=list|grid   # 视图模式参数
│
├── /settings              # 设置页
│   ├── /settings          # 基本设置
│   └── /settings/about    # 关于页面
│
├── /login                # 登录页 (预留)
│
└── /error               # 错误页
    ├── /error/404        # 404错误
    └── /error/500        # 500错误
```

### 5.2 路由配置文件

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "轻量云盘",
        "navigationBarBackgroundColor": "#4CAF50",
        "navigationBarTextStyle": "white",
        "enablePullDownRefresh": true,
        "backgroundTextStyle": "dark"
      }
    },
    {
      "path": "pages/settings/index",
      "style": {
        "navigationBarTitleText": "设置",
        "navigationBarBackgroundColor": "#ffffff",
        "navigationBarTextStyle": "black"
      }
    },
    {
      "path": "pages/error/404",
      "style": {
        "navigationBarTitleText": "页面不存在",
        "navigationStyle": "custom"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages/settings",
      "pages": [
        {
          "path": "about",
          "style": {
            "navigationBarTitleText": "关于"
          }
        }
      ]
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "white",
    "navigationBarTitleText": "轻量云盘",
    "navigationBarBackgroundColor": "#4CAF50",
    "backgroundColor": "#F5F5F5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#4CAF50",
    "borderStyle": "white",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/tab-files.png",
        "selectedIconPath": "static/tab-files-active.png",
        "text": "文件"
      },
      {
        "pagePath": "pages/settings/index",
        "iconPath": "static/tab-settings.png",
        "selectedIconPath": "static/tab-settings-active.png",
        "text": "设置"
      }
    ]
  }
}
```

### 5.3 路由守卫实现

```typescript
// src/router/guards.ts
import type { Router } from '@uni-h5/vite-plugin-uni-pages'

export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    // 显示加载中
    uni.showLoading({ title: '加载中...' })
    
    // 记录上一个页面
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const fromPath = currentPage?.route || ''
    
    // 存储上一页路径
    uni.setStorageSync('fromPath', fromPath)
    
    next()
  })
  
  // 全局后置守卫
  router.afterEach((to) => {
    // 隐藏加载中
    uni.hideLoading()
    
    // 设置标题
    if (to.meta.title) {
      uni.setNavigationBarTitle({ title: to.meta.title as string })
    }
  })
  
  // 错误处理
  router.onError((error) => {
    console.error('Router error:', error)
    uni.showToast({
      title: '页面加载失败',
      icon: 'none'
    })
  })
}
```

---

## 六、跨端适配方案

### 6.1 条件编译策略

```typescript
// 平台判断工具
// src/utils/platform.ts

// 判断是否为H5端
export const isH5 = () => {
  // #ifdef H5
  return true
  // #endif
  return false
}

// 判断是否为App端
export const isApp = () => {
  // #ifdef APP-PLUS
  return true
  // #endif
  return false
}

// 判断是否为Android
export const isAndroid = () => {
  // #ifdef APP-PLUS
  return uni.getSystemInfoSync().platform === 'android'
  // #endif
  return false
}

// 判断是否为iOS
export const isIOS = () => {
  // #ifdef APP-PLUS
  return uni.getSystemInfoSync().platform === 'ios'
  // #endif
  return false
}

// 判断是否为小程序
export const isMiniProgram = () => {
  // #ifdef MP
  return true
  // #endif
  return false
}

// 获取当前平台
export const getPlatform = () => {
  // #ifdef H5
  return 'h5'
  // #endif
  // #ifdef APP-PLUS
  return 'app'
  // #endif
  // #ifdef MP
  return 'mp'
  // #endif
  return 'unknown'
}
```

### 6.2 文件选择适配

```typescript
// src/utils/file.ts
import { isH5, isApp, isMiniProgram } from './platform'

/**
 * 选择文件 (跨平台适配)
 */
export function chooseFile(options: {
  multiple?: boolean
  type?: 'all' | 'image' | 'video' | 'audio'
} = {}) {
  const { multiple = false, type = 'all' } = options
  
  // #ifdef H5
  return new Promise<File[]>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple
    if (type !== 'all') {
      input.accept = getAcceptType(type)
    }
    input.onchange = (e: any) => {
      resolve(Array.from(e.target.files))
    }
    input.click()
  })
  // #endif
  
  // #ifdef APP-PLUS
  return new Promise<string[]>((resolve) => {
    const sourceType = type === 'image' ? ['album', 'camera'] : ['album']
    uni.chooseImage({
      count: multiple ? 9 : 1,
      sourceType,
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: () => resolve([])
    })
  })
  // #endif
  
  // #ifdef MP
  return new Promise<string[]>((resolve) => {
    if (type === 'image') {
      uni.chooseImage({
        count: multiple ? 9 : 1,
        success: (res) => resolve(res.tempFilePaths),
        fail: () => resolve([])
      })
    } else if (type === 'video') {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        success: (res) => resolve([res.tempFilePath]),
        fail: () => resolve([])
      })
    } else {
      // 小程序不支持选择任意文件，使用业务模拟
      uni.showToast({ title: '小程序暂不支持', icon: 'none' })
      resolve([])
    }
  })
  // #endif
  
  return Promise.resolve([])
}

function getAcceptType(type: string): string {
  const types: Record<string, string> = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*'
  }
  return types[type] || '*'
}
```

### 6.3 存储适配

```typescript
// src/utils/storage.ts
import { isH5, isApp, isMiniProgram } from './platform'

interface StorageAdapter {
  get(key: string): any
  set(key: string, value: any): void
  remove(key: string): void
  clear(): void
}

// H5: 使用localStorage
const h5Storage: StorageAdapter = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
}

// App/小程序: 使用uni.getStorageSync
const uniStorage: StorageAdapter = {
  get: (key) => uni.getStorageSync(key),
  set: (key, value) => uni.setStorageSync(key, value),
  remove: (key) => uni.removeStorageSync(key),
  clear: () => uni.clearStorageSync()
}

// 根据平台选择存储适配器
export const storage: StorageAdapter = isH5() ? h5Storage : uniStorage

// 便捷方法
export const getStorage = (key: string, defaultValue?: any) => {
  const value = storage.get(key)
  if (value === undefined || value === null) {
    return defaultValue
  }
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export const setStorage = (key: string, value: any) => {
  storage.set(key, value)
}

export const removeStorage = (key: string) => {
  storage.remove(key)
}

export const clearStorage = () => {
  storage.clear()
}
```

### 6.4 样式跨平台适配

```scss
// src/styles/_variables.scss

// 基础单位
$unit: 2rpx;

// 颜色主题
$primary-color: #4CAF50;
$primary-light: #81C784;
$primary-dark: #388E3C;

$text-color: #333333;
$text-color-secondary: #666666;
$text-color-placeholder: #999999;

$border-color: #e5e5e5;
$bg-color: #f5f5f5;
$bg-color-white: #ffffff;

// 字体大小
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-base: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;

// 间距
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-base: 24rpx;
$spacing-lg: 32rpx;

// 圆角
$border-radius-sm: 8rpx;
$border-radius-base: 16rpx;
$border-radius-lg: 24rpx;

// 阴影
$box-shadow-light: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
$box-shadow-base: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);

// 平台特定样式
// #ifdef H5
$platform: 'h5';
$safe-area-inset-bottom: 0;
// #endif

// #ifdef APP-PLUS
$safe-area-inset-bottom: constant(safe-area-inset-bottom);
$safe-area-inset-bottom: env(safe-area-inset-bottom);
// #endif
```

---

## 七、性能优化措施

### 7.1 构建优化

| 优化项 | 实现方式 | 预期效果 |
|--------|---------|---------|
| **Code Splitting** | Vite路由级懒加载 | 减少首屏加载体积 |
| **Tree Shaking** | ES Module + 按需引入 | 移除未使用代码 |
| **图片压缩** | vite-plugin-imagemin | 减少资源体积 |
| **CDN加速** | 静态资源托管CDN | 加快资源加载 |
| **依赖优化** | 避免重复依赖、使用浅拷贝 | 减少包体积 |

**Vite配置优化:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  
  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'uni-ui'],
    exclude: ['@dcloudio/uni-app']
  },
  
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['uview-plus']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 资源内联阈值
    assetsInlineLimit: 4096,
    
    // CSS代码分割
    cssCodeSplit: true
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### 7.2 运行时优化

| 优化项 | 实现方式 | 适用平台 |
|--------|---------|---------|
| **列表虚拟滚动** | 大量文件列表使用nvue list组件 | App |
| **图片懒加载** | 使用lazy-load属性 | 全平台 |
| **骨架屏** | 首屏加载显示骨架屏 | Web/App |
| **请求缓存** | 列表数据缓存 | 全平台 |
| **防抖节流** | 搜索、滚动等高频操作 | 全平台 |

### 7.3 数据加载优化

```typescript
// src/composables/useFile.ts
import { ref, computed, watch } from 'vue'
import { useFileStore } from '@/stores/file.store'

export function useFile(options: {
  autoLoad?: boolean
  pageSize?: number
} = {}) {
  const { autoLoad = true, pageSize = 20 } = options
  
  const fileStore = useFileStore()
  
  // 分页状态
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loadingMore = ref(false)
  
  // 计算属性：当前页数据
  const currentPageFiles = computed(() => {
    const start = 0
    const end = currentPage.value * pageSize
    return fileStore.filteredFiles.slice(start, end)
  })
  
  // 加载更多
  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return
    
    loadingMore.value = true
    
    // 模拟延迟以避免快速滑动时请求过多
    await new Promise(resolve => setTimeout(resolve, 300))
    
    currentPage.value++
    
    if (currentPage.value * pageSize >= fileStore.filteredFiles.length) {
      hasMore.value = false
    }
    
    loadingMore.value = false
  }
  
  // 重置分页
  const resetPagination = () => {
    currentPage.value = 1
    hasMore.value = true
  }
  
  // 监听数据变化，重置分页
  watch(() => fileStore.filteredFiles.length, () => {
    resetPagination()
  })
  
  // 自动加载
  if (autoLoad) {
    fileStore.fetchFiles()
  }
  
  return {
    files: currentPageFiles,
    loading: computed(() => fileStore.loading),
    hasMore,
    loadingMore,
    loadMore,
    refresh: () => {
      resetPagination()
      return fileStore.fetchFiles()
    }
  }
}
```

### 7.4 内存优化

| 优化策略 | 实现方式 |
|---------|---------|
| **组件销毁清理** | onUnmounted中清理定时器、事件监听 |
| **图片内存释放** | 使用uni.revokeObjectURL释放URL对象 |
| **大文件处理** | 流式上传、避免一次性读取整个文件 |
| **缓存策略** | 合理使用内存缓存、清理过期缓存 |

---

## 八、开发与测试流程

### 8.1 开发环境搭建

#### 8.1.1 环境要求

| 环境 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | ≥ 16.x | JavaScript运行时 |
| npm | ≥ 8.x | 包管理工具 |
| HBuilderX | ≥ 3.6.x | Uni-app官方IDE (可选) |
| VSCode | ≥ 1.7.x | 代码编辑器 (推荐) |
| JDK | ≥ 11 | Android打包需要 |
| Android Studio | 最新版 | Android模拟器 |

#### 8.1.2 项目初始化

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/light-cloud-disk-v2.git
cd light-cloud-disk-v2

# 2. 安装依赖
npm install

# 3. 安装开发工具
npm install -D @dcloudio/uni-cli-vite
npm install -D @dcloudio/uni-app-plus
npm install -D typescript vue-tsc

# 4. 运行开发服务器
# H5端
npm run dev:h5

# App端
npm run dev:app

# 小程序端
npm run dev:mp
```

### 8.2 代码规范

#### 8.2.1 ESLint配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
```

#### 8.2.2 Prettier配置

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "avoid",
  "bracketSpacing": true
}
```

### 8.3 Git工作流

```
分支命名规范:
- master        # 主分支 (生产环境)
- develop       # 开发分支 (测试环境)
- feature/*     # 功能分支 (新功能)
- bugfix/*      # 修复分支 (Bug修复)
- hotfix/*      # 紧急修复分支
- refactor/*    # 重构分支

提交信息规范:
<type>(<scope>): <subject>

Types:
- feat:     新功能
- fix:      Bug修复
- docs:     文档更新
- style:    代码格式
- refactor: 代码重构
- perf:     性能优化
- test:     测试相关
- chore:    构建/工具

示例:
feat(api): 添加文件上传进度回调
fix(upload): 修复大文件上传失败问题
perf(list): 优化文件列表渲染性能
```

### 8.4 测试策略

#### 8.4.1 测试分层

```
测试金字塔:
         /\
        /E2E\        <- 端到端测试 (Playwright/Cypress)
       /----\
      /Integration\ <- 集成测试 (Vitest)
     /------------\
    /   Unit Tests \  <- 单元测试 (Vitest)
   /----------------\
```

#### 8.4.2 单元测试示例

```typescript
// src/stores/__tests__/config.store.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useConfigStore } from '../config.store'

describe('ConfigStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
  })
  
  it('should have default values', () => {
    const store = useConfigStore()
    expect(store.serverUrl).toBe('http://localhost:3000')
    expect(store.apiKey).toBe('light-cloud-disk-2026')
    expect(store.theme).toBe('light')
  })
  
  it('should update serverUrl', () => {
    const store = useConfigStore()
    store.setServerUrl('http://example.com')
    expect(store.serverUrl).toBe('http://example.com')
  })
  
  it('should validate config', () => {
    const store = useConfigStore()
    expect(store.isConfigValid()).toBe(true)
    
    store.setServerUrl('')
    expect(store.isConfigValid()).toBe(false)
  })
})
```

#### 8.4.3 测试覆盖率目标

| 测试类型 | 覆盖率目标 |
|---------|-----------|
| 单元测试 | ≥ 70% |
| 组件测试 | ≥ 50% |
| 集成测试 | 关键流程覆盖 |

---

## 九、部署策略

### 9.1 多端部署方案

| 平台 | 部署方式 | 目标地址 |
|------|---------|---------|
| **Web (H5)** | 静态资源托管 | 云服务器/Nginx/CDN |
| **Android** | APK/AAB打包 | 应用商店/下载页 |
| **iOS** | IPA打包 | App Store (预留) |
| **小程序** | 代码上传 | 微信/支付宝后台 |

### 9.2 Web端部署

#### 9.2.1 构建生产版本

```bash
# 构建H5生产版本
npm run build:h5

# 输出目录: dist/build/h5
```

#### 9.2.2 Nginx配置

```nginx
# /etc/nginx/conf.d/light-cloud-disk.conf

server {
    listen 80;
    server_name cloud.yourdomain.com;
    
    # 静态资源目录
    root /var/www/light-cloud-disk;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理 (如需要)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 9.3 Android端部署

#### 9.3.1 构建APK

```bash
# 使用HBuilderX
# 菜单: 发行 -> 原生App-本地打包 -> 生成Android安装包

# 或使用CLI
npm run build:app
```

#### 9.3.2 应用市场提交

| 市场 | 提交方式 | 审核周期 |
|------|---------|---------|
| 应用宝 | 开发者后台 | 3-5工作日 |
| 华为应用市场 | 开发者后台 | 2-7工作日 |
| 小米应用商店 | 开发者后台 | 3-5工作日 |
| 豌豆荚 | 开发者后台 | 1-3工作日 |
| Google Play | Play Console | 1-3工作日 |

### 9.4 CI/CD配置

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm run test
        
  build-h5:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build H5
        run: npm run build:h5
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: h5-build
          path: dist/build/h5

  build-app:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
        
      - name: Install dependencies
        run: npm ci
        
      - name: Build App
        run: npm run build:app
        
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: apps/android/app/build/outputs/apk/**/*.apk
```

---

## 十、项目进度规划

### 10.1 整体时间规划

```
项目周期: 8周 (40个工作日)

┌─────────────────────────────────────────────────────────────────────┐
│                          项目进度时间线                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  第1周      第2周      第3周      第4周      第5周      第6周       │
│  ──────    ──────    ──────    ──────    ──────    ──────         │
│  ┌─────┐                                                           │
│  │准备 │◄─────────────────────────────────────────────────────    │
│  └─────┘                                                           │
│       ┌─────────────────────────────────────┐                       │
│       │         基础架构搭建                  │                       │
│       │  (项目结构、路由、状态管理)           │                       │
│       └─────────────────────────────────────┘                       │
│                         ┌─────────────────┐                         │
│                         │   核心功能开发   │                         │
│                         │ (文件CRUD、上传)│                         │
│                         └─────────────────┘                         │
│                                      ┌──────────────┐               │
│                                      │   跨端适配   │               │
│                                      │ (Web/App)   │               │
│                                      └──────────────┘               │
│                                                   ┌────────────┐   │
│                                                   │  性能优化   │   │
│                                                   │  体验完善   │   │
│                                                   └────────────┘   │
│                                                            ┌──────┐ │
│                                                            │测试上线│ │
│                                                            └──────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 详细任务分解

#### 第1周: 项目准备与环境搭建 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| 项目初始化与依赖安装 | 开发 | 1天 | 项目骨架 |
| 项目目录结构创建 | 开发 | 0.5天 | 目录规范 |
| TypeScript基础配置 | 开发 | 0.5天 | tsconfig.json |
| ESLint/Prettier配置 | 开发 | 0.5天 | 代码规范 |
| 组件库引入(uView) | 开发 | 0.5天 | UI环境 |
| 路由配置 | 开发 | 1天 | pages.json |
| Pinia状态管理搭建 | 开发 | 1天 | Store基础 |

**里程碑:** 开发环境可运行，本地页面正常展示

#### 第2周: 基础架构与核心API (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| API请求封装 | 开发 | 1天 | request.ts |
| TypeScript类型定义 | 开发 | 0.5天 | types/ |
| 文件列表接口 | 开发 | 1天 | fileApi |
| 文件上传接口 | 开发 | 1天 | uploadApi |
| 文件删除接口 | 开发 | 0.5天 | deleteApi |
| 配置管理模块 | 开发 | 1天 | configStore |

**里程碑:** API层完成，可与后端正常通信

#### 第3周: 核心页面开发 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| 文件列表页开发 | 开发 | 2天 | index.vue |
| 文件卡片组件 | 开发 | 1天 | FileCard.vue |
| 文件列表组件 | 开发 | 1天 | FileList.vue |
| 上传面板组件 | 开发 | 1天 | UploadPanel.vue |

**里程碑:** 文件列表页功能完整

#### 第4周: 功能完善与交互优化 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| 设置页面开发 | 开发 | 1.5天 | settings.vue |
| 主题切换功能 | 开发 | 0.5天 | 主题功能 |
| 搜索过滤功能 | 开发 | 1天 | 搜索逻辑 |
| 视图切换(list/grid) | 开发 | 1天 | 视图功能 |
| 删除确认交互 | 开发 | 0.5天 | 交互优化 |
| 错误处理优化 | 开发 | 0.5天 | 错误提示 |

**里程碑:** 核心功能完成，用户体验良好

#### 第5周: 跨端适配与样式调整 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| Android端样式适配 | 开发 | 2天 | App样式 |
| Web端响应式布局 | 开发 | 1.5天 | H5响应式 |
| 平台判断与条件编译 | 开发 | 1天 | 跨端代码 |
| 原生能力适配(相机/相册) | 开发 | 0.5天 | 平台API |

**里程碑:** 多端界面正常，功能可用

#### 第6周: 性能优化与测试 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| 性能分析与优化 | 开发 | 2天 | 优化报告 |
| 单元测试编写 | 开发 | 2天 | 测试用例 |
| Bug修复 | 开发 | 1天 | 稳定版本 |

**里程碑:** 性能达标，测试通过

#### 第7周: 打包与部署 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| Android打包签名 | 开发 | 1天 | APK文件 |
| Web端构建部署 | 开发 | 1天 | H5站点 |
| CI/CD配置 | 开发 | 1天 | GitHub Actions |
| 文档编写 | 开发 | 2天 | 技术文档 |

**里程碑:** 产物可发布

#### 第8周: 验收与交付 (5工作日)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| UAT测试 | 测试 | 2天 | 测试报告 |
| 问题修复 | 开发 | 2天 | 稳定版本 |
| 正式发布 | 开发 | 1天 | 生产环境 |

**里程碑:** 项目交付

### 10.3 关键里程碑

| 里程碑 | 计划日期 | 验收标准 |
|--------|---------|---------|
| M1: 开发环境就绪 | 第1周 | 本地可运行 |
| M2: API层完成 | 第2周 | 接口可调用 |
| M3: 核心功能完成 | 第4周 | 功能可用 |
| M4: 多端适配完成 | 第5周 | 多端可运行 |
| M5: 测试通过 | 第6周 | 无阻塞Bug |
| M6: 正式发布 | 第8周 | 线上可用 |

---

## 附录

### 附录A: 环境变量配置

```typescript
// src/types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_UPLOAD_MAX_SIZE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 附录B: 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| Android Browser | 80+ |
| iOS Safari | 13+ |

### 附录C: 技术支持

| 资源 | 地址 |
|------|------|
| Uni-app官方文档 | https://uniapp.dcloud.net.cn/ |
| uView组件库 | https://www.uviewui.com/ |
| Vue3文档 | https://vuejs.org/ |
| Pinia文档 | https://pinia.vuejs.org/ |

---

**文档编制:** AI Assistant  
**审核日期:** 2026-05-06  
**版本:** 1.0  
**状态:** 正式发布
