# Android APK 打包指南

## 方式一：HBuilderX 云打包（推荐）

### 1. 安装 HBuilderX
下载地址：https://www.dcloud.io/hbuilderx.html

### 2. 打开项目
- 启动 HBuilderX
- 文件 → 打开目录 → 选择 `src` 目录

### 3. 配置打包信息
- 菜单：`发行` → `原发APP-云打包`
- 勾选 Android
- 包名：`com.lightclouddisk.app`
- 选择证书（可以使用公共测试证书）

### 4. 开始打包
- 点击"打包"按钮
- 等待云端构建完成（约5-10分钟）
- 下载生成的 APK 文件

## 方式二：CLI 本地打包

### 1. 环境准备
```bash
# 安装依赖
cd src
npm install
```

### 2. 构建 APP 资源
```bash
npm run build:app-android
```

### 3. 使用 Android Studio 打包
- 安装 Android Studio
- 打开生成的 Android 项目
- 构建 APK

## 分享功能说明

已配置 Android Share Intent，支持：
- 单文件分享（SEND）
- 多文件分享（SEND_MULTIPLE）
- 所有文件类型（*/*）

### 使用方法
1. 在文件管理器中选择文件
2. 点击"分享"按钮
3. 选择"轻量云盘"
4. 文件将自动上传到云盘

## 注意事项

1. **签名证书**：发布时需要使用自己的签名证书
2. **权限配置**：已配置存储、网络、相机等权限
3. **最低版本**：Android 5.0 (API 21) 及以上
