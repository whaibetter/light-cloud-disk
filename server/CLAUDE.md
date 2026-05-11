# server - 后端服务

[根目录](../CLAUDE.md) > **server**

> 变更记录 (Changelog)
> - 2026-05-10 21:26:03: 全仓扫描刷新，确认模块状态无变化

## 模块职责

Node.js + Express 单文件后端服务，提供文件上传、下载、删除、分享等 RESTful API。使用 JSON 文件存储元数据，Multer 处理文件上传，无数据库依赖。

## 入口与启动

- **入口文件**: `index.js`（单文件架构，所有逻辑集中在此）
- **启动命令**: `npm start`（生产）/ `npm run dev`（nodemon 热重载）
- **默认端口**: 3000（可通过 PORT 环境变量或 config.json 修改）
- **生产端口**: 12140

## 对外接口

### 文件管理 API（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 上传文件（最多 10 个，multipart/form-data，字段名 `files`） |
| GET | `/api/files` | 获取文件列表 |
| GET | `/api/files/:filename` | 获取单个文件信息 |
| GET | `/api/download/:filename` | 下载文件（流式传输） |
| DELETE | `/api/files/:filename` | 删除文件 |

### 分享 API

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/share/:storedName` | 需要 | 创建分享链接（支持密码和过期时间） |
| GET | `/api/shares/:storedName` | 需要 | 获取文件的分享列表 |
| DELETE | `/api/share/:token` | 需要 | 删除分享 |
| GET | `/api/s/:token` | 不需要 | 获取分享信息（公开） |
| POST | `/api/s/:token/verify` | 不需要 | 验证分享密码（公开） |
| GET | `/api/s/:token/download` | 不需要 | 下载分享文件（公开） |

### 系统 API

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 不需要 | 健康检查 |

### 认证方式

请求头 `X-API-Key: <api-key>` 或查询参数 `?apiKey=<api-key>`。

## 关键依赖与配置

### 依赖

| 包 | 版本 | 用途 |
|----|------|------|
| express | ^4.18.2 | Web 框架 |
| multer | ^1.4.5-lts.1 | 文件上传处理 |
| cors | ^2.8.5 | 跨域支持 |
| md5 | ^2.3.0 | 文件 MD5 计算和密码哈希 |
| dotenv | ^16.3.1 | 环境变量加载 |
| nodemon | ^3.0.1 | 开发热重载 (devDep) |

### 配置

配置优先级：`.env` > `config.json` > 默认值

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | 服务端口 |
| API_KEY | light-cloud-disk-2026 | API 认证密钥 |
| UPLOAD_DIR | ./uploads | 文件上传目录 |
| MAX_FILE_SIZE | 100 | 单文件大小限制 (MB) |
| ALLOWED_ORIGINS | * | CORS 允许的源 |

`config.json` 位于项目根目录（`../config.json`），同时供前后端使用。

## 数据模型

### 文件元数据 (server/data/files.json)

```typescript
interface FileInfo {
  id: string              // MD5(filename + timestamp)
  originalName: string    // 原始文件名
  storedName: string      // 存储文件名（含数字后缀防冲突）
  size: number            // 文件大小 (bytes)
  mimetype: string        // MIME 类型
  uploadTime: string      // ISO 8601 时间戳
  md5: string             // 文件内容 MD5
  shares?: ShareRecord[]  // 分享记录数组
}

interface ShareRecord {
  token: string           // 16 位分享令牌
  password: string        // MD5 哈希后的密码（空字符串表示无密码）
  expireAt: string | null // ISO 8601 过期时间（null 表示永不过期）
  createdAt: string       // ISO 8601 创建时间
}
```

### 文件存储

- 上传目录：`server/uploads/`（自动创建）
- 元数据：`server/data/files.json`（同步读写 `fs.readFileSync` / `fs.writeFileSync`）
- 文件名冲突处理：自动添加数字后缀 `basename(1).ext`, `basename(2).ext` ...
- 中文文件名编码修复：`latin1` -> `utf8` 转换

## 测试与质量

- **测试**: 无
- **Lint**: 无
- **CI/CD**: 无
- **错误处理**: Multer 错误（文件过大/过多）、通用 500 错误

## 常见问题 (FAQ)

**Q: 如何修改 API Key？**
A: 编辑 `server/.env` 文件的 `API_KEY` 字段，或修改根目录 `config.json` 的 `server.api_key`。

**Q: 文件上传后存储在哪里？**
A: 物理文件在 `server/uploads/`，元数据在 `server/data/files.json`。

**Q: 如何支持大文件上传？**
A: 修改 `MAX_FILE_SIZE` 环境变量（单位 MB），同时 Nginx 需配置 `client_max_body_size`。

## 相关文件清单

| 文件 | 说明 |
|------|------|
| `index.js` | 主服务文件（全部后端逻辑） |
| `package.json` | 依赖和脚本配置 |
| `.env.example` | 环境变量模板 |
| `data/files.json` | 文件元数据存储 |
