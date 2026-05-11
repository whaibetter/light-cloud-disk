# API 接口文档

> 轻量云盘 (Light Cloud Disk) 后端 API 接口说明

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `http://localhost:3000` (开发) / `http://服务器IP:12140` (生产) |
| 协议 | HTTP/HTTPS |
| 数据格式 | JSON (`application/json; charset=utf-8`) |
| 认证方式 | `X-API-Key` 请求头 或 `apiKey` 查询参数 |
| 生产环境路径前缀 | `/syncqclous/api/` (Nginx 反向代理) |

## 认证说明

除 `/api/health` 外，所有 API 端点均需认证。认证方式二选一：

**方式一：请求头**
```
X-API-Key: your-api-key-here
```

**方式二：查询参数**
```
GET /api/files?apiKey=your-api-key-here
```

认证失败时返回：
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API Key"
}
```
HTTP 状态码：`401`

---

## 接口列表

### 1. 健康检查

```
GET /api/health
```

**认证**：不需要

**响应 (200)**：
```json
{
  "success": true,
  "message": "Light Cloud Disk Server is running",
  "timestamp": "2026-05-08T02:03:34.902Z"
}
```

---

### 2. 上传文件

```
POST /api/upload
```

**认证**：需要

**Content-Type**：`multipart/form-data`

**请求体**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `files` | File[] | 是 | 文件数组，字段名固定为 `files`，最多 10 个 |

**单文件大小限制**：由服务端 `MAX_FILE_SIZE` 配置决定，默认 100MB

**成功响应 (200)**：
```json
{
  "success": true,
  "message": "Successfully uploaded 3 file(s)",
  "files": [
    {
      "id": "a1b2c3d4e5f6...",
      "originalName": "测试文档.pdf",
      "storedName": "测试文档.pdf",
      "size": 102400,
      "mimetype": "application/pdf",
      "uploadTime": "2026-05-08T02:03:34.902Z",
      "md5": "9c8669b99457b6c500a257b4744e375c"
    }
  ]
}
```

**错误响应**：

| 状态码 | 错误信息 | 触发条件 |
|--------|----------|----------|
| 400 | `No files uploaded` | 请求中没有文件 |
| 400 | `File too large. Maximum size is 100MB` | 单文件超限 |
| 400 | `Too many files. Maximum is 10 files per upload` | 文件数超限 |
| 401 | `Invalid or missing API Key` | 认证失败 |
| 500 | `Internal server error during upload` | 服务端异常 |

**特殊行为**：
- 文件名自动进行 `latin1` → `utf8` 编码修复（解决中文文件名乱码）
- 重名文件自动添加数字后缀：`文档.pdf` → `文档(1).pdf` → `文档(2).pdf`
- 每个文件上传后自动计算 MD5 哈希值

---

### 3. 获取文件列表

```
GET /api/files
```

**认证**：需要

**成功响应 (200)**：
```json
{
  "success": true,
  "count": 6,
  "files": [
    {
      "id": "55c6a480a8734bddc1876da32747f5d6",
      "originalName": "测试文档.pdf",
      "storedName": "测试文档.pdf",
      "size": 102400,
      "mimetype": "application/pdf",
      "uploadTime": "2026-05-08T02:03:34.902Z",
      "md5": "9c8669b99457b6c500a257b4744e375c"
    }
  ]
}
```

**说明**：返回所有文件记录，按插入顺序排列，无分页。

---

### 4. 获取单个文件信息

```
GET /api/files/:filename
```

**认证**：需要

**路径参数**：

| 参数 | 说明 |
|------|------|
| `filename` | 文件的存储名 (`storedName`)，需 URL 编码 |

**成功响应 (200)**：
```json
{
  "success": true,
  "file": {
    "id": "55c6a480a8734bddc1876da32747f5d6",
    "originalName": "测试文档.pdf",
    "storedName": "测试文档.pdf",
    "size": 102400,
    "mimetype": "application/pdf",
    "uploadTime": "2026-05-08T02:03:34.902Z",
    "md5": "9c8669b99457b6c500a257b4744e375c"
  }
}
```

**错误响应**：

| 状态码 | 错误信息 | 触发条件 |
|--------|----------|----------|
| 404 | `File not found` | 文件不存在 |
| 401 | `Invalid or missing API Key` | 认证失败 |

---

### 5. 下载文件

```
GET /api/download/:filename
```

**认证**：需要

**路径参数**：

| 参数 | 说明 |
|------|------|
| `filename` | 文件的存储名 (`storedName`)，需 URL 编码 |

**成功响应**：文件二进制流

**响应头**：
| 头 | 说明 |
|----|------|
| `Content-Type` | 文件 MIME 类型，回退 `application/octet-stream` |
| `Content-Disposition` | `attachment; filename*=UTF-8''<编码后的文件名>` |

**错误响应**：

| 状态码 | 错误信息 | 触发条件 |
|--------|----------|----------|
| 404 | `File not found` | 磁盘上文件不存在 |
| 401 | `Invalid or missing API Key` | 认证失败 |

**特殊行为**：
- 使用流式传输 (`fs.createReadStream().pipe(res)`)，适合大文件
- 文件名使用 RFC 5987 编码，正确处理中文文件名

---

### 6. 删除文件

```
DELETE /api/files/:filename
```

**认证**：需要

**路径参数**：

| 参数 | 说明 |
|------|------|
| `filename` | 文件的存储名 (`storedName`)，需 URL 编码 |

**成功响应 (200)**：
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**错误响应**：

| 状态码 | 错误信息 | 触发条件 |
|--------|----------|----------|
| 404 | `File not found` | 磁盘上文件不存在 |
| 401 | `Invalid or missing API Key` | 认证失败 |

**特殊行为**：先删除磁盘物理文件，再删除元数据记录

---

## 数据模型

### FileInfo（文件信息）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 文件唯一标识，MD5(storedName + timestamp) |
| `originalName` | string | 上传时的原始文件名 |
| `storedName` | string | 磁盘上的实际文件名（可能带数字后缀） |
| `size` | number | 文件大小（字节） |
| `mimetype` | string | MIME 类型 |
| `uploadTime` | string | 上传时间，ISO 8601 格式 |
| `md5` | string | 文件内容的 MD5 哈希值 |

---

## 静态文件访问

上传的文件可通过以下路径直接访问（无需认证）：

```
GET /files/:filename
```

**注意**：此路径不经过认证中间件，存在安全风险。

---

## 错误码汇总

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 404 | 资源不存在 |
| 500 | 服务端内部错误 |
