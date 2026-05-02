# 轻量云盘系统 (Light Cloud Disk)

一个面向个人用户的轻量级云盘系统，实现文件在安卓设备与Web端之间的便捷同步与管理。

## 📋 项目特性

- **轻量化设计**：极简架构，避免复杂认证流程
- **跨平台支持**：Web端 + 安卓端双平台
- **简单易用**：拖放上传、一键下载、文件管理
- **安全可控**：基于API Key的简单认证机制
- **响应式界面**：Web端支持桌面和移动设备

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
├── web/                      # Web前端
│   ├── index.html           # 主页面
│   ├── style.css            # 样式文件
│   └── app.js               # 前端逻辑
│
└── android/                  # 安卓端
    ├── app/
    │   ├── src/main/
    │   │   ├── java/com/example/lightclouddisk/
    │   │   │   ├── MainActivity.kt       # 主界面
    │   │   │   ├── FileUploadService.kt  # 上传服务
    │   │   │   ├── FileAdapter.kt        # 列表适配器
    │   │   │   └── api/
    │   │   │       └── ApiService.kt     # API接口
    │   │   └── res/
    │   │       ├── layout/
    │   │       │   ├── activity_main.xml  # 主界面布局
    │   │       │   └── item_file.xml     # 列表项布局
    │   │       └── values/
    │   │           └── strings.xml        # 字符串资源
    │   └── AndroidManifest.xml           # 应用配置
    ├── build.gradle                       # 项目构建配置
    └── PROJECT_SETUP.md                  # 安卓项目设置说明
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

### 2. Web前端使用

#### 方法一：直接打开
由于使用了现代化API，建议使用本地服务器运行：

```bash
# 在 web 目录下启动简单的HTTP服务器
cd web

# 使用 Node.js 的 http-server（需要先安装：npm install -g http-server）
http-server -p 8080

# 或使用 Python
python -m http.server 8080

# 或使用 PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

#### 方法二：直接打开 index.html
部分浏览器可能会因为CORS策略限制，建议使用本地服务器。

#### 配置Web端

首次打开Web界面时：
1. 点击右上角「配置」按钮
2. 输入服务器地址（如 `http://localhost:3000`）
3. 输入API密钥（默认：`light-cloud-disk-2026`）
4. 点击「保存配置」

#### Web端功能
- **上传文件**：拖放文件到上传区域，或点击「选择文件」
- **查看文件**：自动加载服务器上的文件列表
- **下载文件**：点击文件卡片的「下载」按钮
- **删除文件**：点击「删除」按钮
- **切换视图**：网格视图 / 列表视图
- **深色模式**：点击右上角🌙图标切换主题

### 3. 安卓端编译和安装

#### 环境要求
- Android Studio Electric Eel 或更高版本
- JDK 11 或更高版本
- Android SDK 34

#### 导入项目

1. 打开 Android Studio
2. 选择「Open an Existing Project」
3. 选择 `android` 目录
4. 等待 Gradle 同步完成

#### 配置服务器地址

编辑 `android/app/build.gradle` 文件：

```gradle
defaultConfig {
    // ... 其他配置
    
    buildConfigField "String", "DEFAULT_SERVER_URL", "\"http://你的服务器IP:3000\""
    buildConfigField "String", "DEFAULT_API_KEY", "\"light-cloud-disk-2026\""
}
```

**注意**：
- 如果在模拟器上测试，使用 `http://10.0.2.2:3000`（10.0.2.2是模拟器访问宿主机的特殊地址）
- 如果在真机上测试，使用服务器的实际IP地址
- 确保手机和服务器在同一网络下

#### 编译和运行

1. 连接安卓设备或启动模拟器
2. 点击 Android Studio 的「Run」按钮
3. 选择目标设备
4. 等待应用安装和启动

#### 安卓端功能
- **接收分享**：从其他应用分享文件到本应用
- **文件上传**：点击右下角「+」按钮选择文件上传
- **文件列表**：查看服务器上的所有文件
- **后台上传**：上传任务在后台进行，显示通知
- **下拉刷新**：下拉刷新文件列表

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
2. Web端：在界面配置中输入新的API密钥
3. 安卓端：修改 `app/build.gradle` 中的 `DEFAULT_API_KEY`，重新编译

### 配置CORS（跨域）

编辑 `server/.env`：
```env
ALLOWED_ORIGINS=http://localhost:8080,http://192.168.1.100:8080
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

### 1. Web端无法连接服务器
- 检查服务器是否启动
- 检查API密钥是否正确
- 检查CORS配置（浏览器控制台查看错误）

### 2. 安卓端上传失败
- 检查服务器地址是否正确
- 确保手机和服务器在同一网络
- 检查是否授予了应用存储权限

### 3. 文件上传后找不到
- 检查 `server/uploads` 目录权限
- 查看 `server/data/files.json` 是否记录了文件信息

## 📝 开发笔记

### 技术选型说明
- **后端**：Node.js + Express，轻量且易于部署
- **前端**：原生HTML/CSS/JS，无框架依赖，加载快
- **安卓**：Kotlin + Retrofit，现代安卓开发标准

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
