# 轻量云盘系统 (Light Cloud Disk)

一个基于 Uni-app 的跨平台云盘系统，支持 Web、Android、iOS 等多端运行，实现文件的便捷同步与管理。

## 📋 项目特性

- **跨平台支持**：基于 Uni-app，一套代码多端运行
- **轻量化设计**：极简架构，避免复杂认证流程
- **简单易用**：拖放上传、一键下载、文件管理
- **安全可控**：基于API Key的简单认证机制
- **响应式界面**：适配不同屏幕尺寸

## 🏗️ 项目结构

```
light-cloud-disk/
├── server/                    # 后端服务（Node.js + Express）
│   ├── index.js              # 主服务文件
│   ├── package.json          # 依赖配置
│   ├── .env.example          # 环境变量示例
│   ├── uploads/              # 文件存储目录（自动创建）
│   └── data/                 # 元数据存储
│       └── files.json        # 文件列表
│
└── src/                      # Uni-app 前端（Vue 3）
    ├── pages/            # 页面组件
    ├── static/           # 静态资源
    ├── App.vue           # 根组件
    ├── main.ts           # 入口文件
    ├── manifest.json     # 应用配置
    ├── pages.json        # 页面路由配置
    ├── package.json      # 依赖配置
    └── vite.config.ts    # 构建配置
```

## 🚀 快速开始

### 1. 后端服务部署

#### 环境要求
- Node.js 16.x 或更高版本
- npm 或 yarn

#### 安装步骤

```bash
# 进入服务端目录
cd server

# 安装依赖
npm install

# 复制环境变量配置
copy .env.example .env   # Windows
# 或
cp .env.example .env     # Linux/Mac

# 编辑 .env 文件，修改配置（可选）
# 默认配置即可运行

# 启动服务
npm start
```

服务启动后，默认运行在 `http://localhost:3000`

#### 环境变量说明

```env
PORT=3000                    # 服务器端口
API_KEY=light-cloud-disk-2026  # API密钥（请修改为复杂字符串）
UPLOAD_DIR=./uploads        # 上传文件存储目录
MAX_FILE_SIZE=100           # 单个文件大小限制（MB）
ALLOWED_ORIGINS=*           # 允许跨域的域名
```

### 2. Uni-app 前端开发

#### 环境要求
- Node.js 18.x 或更高版本
- HBuilderX（推荐）或 VS Code

#### 安装步骤

```bash
# 进入前端目录
cd src

# 安装依赖
npm install

# 启动 H5 开发服务器
npm run dev:h5
```

开发服务器启动后，访问 `http://localhost:5173`

### 3. 打包部署

#### 打包为 Web 应用

```bash
cd src

# 打包 H5 版本
npm run build:h5
```

打包完成后，文件位于 `src/dist/build/h5` 目录，可部署到任何 Web 服务器。

#### 打包为 Android 应用

**方式一：使用 HBuilderX（推荐）**

1. 在 HBuilderX 中打开 `src` 目录
2. 菜单栏选择「发行」→「原生App-云打包」
3. 选择 Android 平台，配置包名等信息
4. 点击「打包」，等待完成后下载 APK

**方式二：使用 CLI 命令**

```bash
cd src

# 打包 Android 版本
npm run build:app-android
```

打包完成后，需要使用 Android Studio 打开 `src/dist/build/app` 目录进行编译：

1. 打开 Android Studio
2. 选择「Open an Existing Project」
3. 选择 `src/dist/build/app` 目录
4. 等待 Gradle 同步完成
5. 点击「Build」→「Build Bundle(s) / APK(s)」→「Build APK(s)」

#### 打包为 iOS 应用

**方式一：使用 HBuilderX（推荐）**

1. 在 HBuilderX 中打开 `src` 目录
2. 菜单栏选择「发行」→「原生App-云打包」
3. 选择 iOS 平台，配置 Bundle ID 等信息
4. 点击「打包」，等待完成后下载 IPA

**方式二：使用 CLI 命令**

```bash
cd src

# 打包 iOS 版本
npm run build:app
```

打包完成后，需要使用 Xcode 打开 `src/dist/build/app` 目录进行编译。

#### 打包为微信小程序

```bash
cd src

# 打包微信小程序版本
npm run build:mp-weixin
```

打包完成后，文件位于 `src/dist/build/mp-weixin` 目录，使用微信开发者工具导入即可。

## 📡 API接口文档

### 基础信息
- **Base URL**: `http://your-server:3000`
- **认证方式**: 在请求头中添加 `X-API-Key: your-api-key`

### 接口列表

#### 1. 健康检查
```
GET /api/health
```
响应：
```json
{
  "success": true,
  "message": "Light Cloud Disk Server is running",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

#### 2. 上传文件
```
POST /api/upload
Headers: X-API-Key: your-api-key
Body: multipart/form-data (字段名: files)
```
响应：
```json
{
  "success": true,
  "message": "Successfully uploaded 1 file(s)",
  "files": [
    {
      "id": "abc123...",
      "originalName": "example.jpg",
      "storedName": "example-1234567890-123456789.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "uploadTime": "2026-05-02T10:00:00.000Z",
      "md5": "d41d8cd98f00b204e9800998ecf8427e"
    }
  ]
}
```

#### 3. 获取文件列表
```
GET /api/files
Headers: X-API-Key: your-api-key
```
响应：
```json
{
  "success": true,
  "count": 1,
  "files": [ ... ]
}
```

#### 4. 下载文件
```
GET /api/download/{storedName}?apiKey=your-api-key
```
响应：文件流（自动下载）

#### 5. 删除文件
```
DELETE /api/files/{storedName}
Headers: X-API-Key: your-api-key
```
响应：
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## ⚙️ 高级配置

### 修改API密钥

1. 服务端：编辑 `server/.env` 文件，修改 `API_KEY`
2. Uni-app端：在应用设置中修改服务器地址和API密钥

### 配置CORS（跨域）

编辑 `server/.env`：
```env
ALLOWED_ORIGINS=http://localhost:5173,http://192.168.1.100:5173
```

### 修改文件大小限制

编辑 `server/.env`：
```env
MAX_FILE_SIZE=500  # 500MB
```

## 🔒 安全建议

1. **修改默认API密钥**：不要使用默认的API密钥
2. **使用HTTPS**：在生产环境中使用Nginx等反向代理配置SSL证书
3. **配置防火墙**：只允许信任的IP访问服务器
4. **定期备份**：定期备份 `server/uploads` 和 `server/data` 目录
5. **监控磁盘空间**：设置告警，避免磁盘写满

## 🐛 常见问题

### 1. H5 端无法连接服务器
- 检查服务器是否启动
- 检查API密钥是否正确
- 检查CORS配置（浏览器控制台查看错误）

### 2. Android 打包失败
- 确保已安装 Android Studio 和 Android SDK
- 检查 `manifest.json` 中的配置是否正确
- 查看构建日志获取详细错误信息

### 3. 文件上传后找不到
- 检查 `server/uploads` 目录权限
- 查看 `server/data/files.json` 是否记录了文件信息

## 📝 开发笔记

### 技术选型说明
- **后端**：Node.js + Express，轻量且易于部署
- **前端**：Uni-app + Vue 3，跨平台一套代码
- **UI框架**：uview-plus，适配多端

### 未来改进方向
- [ ] 添加用户系统（多用户支持）
- [ ] 支持文件分享链接生成
- [ ] 添加文件预览功能
- [ ] 实现断点续传
- [ ] 支持文件搜索和分类
- [ ] 添加存储空间配额管理

## 📄 许可证

MIT License

## 🤝 贡献

这是一个个人项目，欢迎提出建议和改进意见！

---

**Made with ❤️ by QClaw**