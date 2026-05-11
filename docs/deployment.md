# 部署文档

> 轻量云盘 (Light Cloud Disk) 部署指南

## 1. 环境要求

### 1.1 服务器环境

| 要求 | 版本 |
|------|------|
| Node.js | >= 18.0.0 |
| npm | >= 8.0.0 |
| Nginx | >= 1.18 |
| PM2 | >= 5.0 (推荐) |

### 1.2 开发环境

| 要求 | 说明 |
|------|------|
| Node.js | >= 18.0.0 |
| HBuilderX | 5.07+ (Android 打包) |
| Android Studio | (可选，调试用) |

---

## 2. 后端部署

### 2.1 手动部署

#### 步骤 1：上传文件

将 `server/` 目录上传到服务器：

```bash
scp -r server/ user@your-server:/opt/light-cloud-disk/
```

#### 步骤 2：安装依赖

```bash
cd /opt/light-cloud-disk/server
npm install --production
```

#### 步骤 3：配置环境变量

创建 `.env` 文件：

```bash
cat > .env << EOF
PORT=12140
API_KEY=your-secure-api-key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100
ALLOWED_ORIGINS=*
EOF
```

或创建 `config.json`（项目根目录）：

```json
{
  "server": {
    "port": 12140,
    "api_key": "your-secure-api-key",
    "upload_dir": "./uploads",
    "max_file_size": 100,
    "allowed_origins": "*"
  }
}
```

#### 步骤 4：启动服务

```bash
# 直接启动
node index.js

# 或使用 PM2（推荐）
pm2 start index.js --name light-cloud-disk-server
pm2 save
pm2 startup
```

### 2.2 使用部署脚本

```bash
# 在项目根目录执行
bash deploy-to-server.sh
```

脚本会自动：
1. 创建部署目录 `/opt/light-cloud-disk`
2. 安装 PM2（如果未安装）
3. 创建 `.env` 配置文件

**注意**：脚本执行后仍需手动上传文件、安装依赖、启动服务。

---

## 3. 前端部署

### 3.1 H5 构建

```bash
cd src
npm install
npm run build:h5
```

构建产物位于 `src/dist/build/h5/`。

### 3.2 部署到 Nginx

将构建产物复制到 Nginx 静态文件目录：

```bash
cp -r src/dist/build/h5/* /opt/light-cloud-disk/web/
```

### 3.3 Nginx 配置

```nginx
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location /syncqclous {
        alias /opt/light-cloud-disk/web;
        try_files $uri $uri/ /syncqclous/index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /syncqclous/api/ {
        rewrite ^/syncqclous/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:12140;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    # 下载代理
    location /syncqclous/download/ {
        rewrite ^/syncqclous/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:12140;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3.4 重载 Nginx

```bash
sudo nginx -t          # 测试配置
sudo systemctl reload nginx  # 重载配置
```

---

## 4. Android 打包

### 4.1 使用 HBuilderX 云打包

1. 打开 HBuilderX
2. 导入项目：`src/` 目录
3. 登录 DCloud 账号
4. 菜单：**发行 → 原生APP-云打包**
5. 选择 Android 平台
6. 包名填写：`com.lightclouddisk.app`
7. 选择证书（推荐使用"使用云端证书"）
8. 点击打包

### 4.2 使用 CLI 本地打包

```bash
cd src
npm run build:app-android
```

### 4.3 配置文件说明

`pack.config.json` 打包配置：

```json
{
  "appid": "__UNI__14104B9",
  "platform": "android",
  "android": {
    "packagename": "com.lightclouddisk.app"
  },
  "androidpacktype": 1,
  "safemode": false,
  "sourceMap": false,
  "isconfusion": false
}
```

---

## 5. 微信小程序发布

### 5.1 构建

```bash
cd src
npm run build:mp-weixin
```

构建产物位于 `src/dist/build/mp-weixin/`。

### 5.2 发布

1. 打开微信开发者工具
2. 导入项目：`src/dist/build/mp-weixin/`
3. 填写 AppID
4. 预览/上传/发布

---

## 6. 配置参考

### 6.1 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务端口 |
| `API_KEY` | `light-cloud-disk-2026` | API 密钥 |
| `UPLOAD_DIR` | `./uploads` | 上传目录 |
| `MAX_FILE_SIZE` | `100` | 最大文件大小 (MB) |
| `ALLOWED_ORIGINS` | `*` | CORS 允许的域名 |

### 6.2 config.json 完整结构

```json
{
  "server": {
    "port": 3000,
    "api_key": "your-api-key",
    "upload_dir": "./uploads",
    "max_file_size": 100,
    "allowed_origins": "*"
  },
  "android": {
    "default_server_url": "http://your-server:12140",
    "default_api_key": "your-api-key",
    "signing": {
      "store_file": "release-key.jks",
      "store_password": "your-password",
      "key_alias": "lightclouddisk",
      "key_password": "your-password"
    }
  },
  "api": {
    "defaultServerUrl": "",
    "defaultApiKey": ""
  },
  "ui": {
    "defaultTheme": "light",
    "defaultLanguage": "zh",
    "defaultViewMode": "list"
  }
}
```

---

## 7. 维护命令

### 7.1 PM2 常用命令

```bash
pm2 list                    # 查看所有进程
pm2 logs light-cloud-disk-server  # 查看日志
pm2 restart light-cloud-disk-server  # 重启服务
pm2 stop light-cloud-disk-server    # 停止服务
pm2 delete light-cloud-disk-server  # 删除进程
```

### 7.2 日志查看

```bash
# PM2 日志
pm2 logs light-cloud-disk-server

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 7.3 数据备份

```bash
# 备份元数据
cp /opt/light-cloud-disk/server/data/files.json /backup/files_$(date +%Y%m%d).json

# 备份上传文件
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /opt/light-cloud-disk/server/uploads/
```

---

## 8. 故障排查

### 8.1 服务无法启动

```bash
# 检查端口占用
lsof -i :12140

# 检查 Node.js 版本
node --version

# 检查依赖
cd /opt/light-cloud-disk/server && npm ls
```

### 8.2 上传失败

```bash
# 检查上传目录权限
ls -la /opt/light-cloud-disk/server/uploads/

# 检查磁盘空间
df -h

# 检查文件大小限制
cat /opt/light-cloud-disk/server/.env | grep MAX_FILE_SIZE
```

### 8.3 无法访问 API

```bash
# 测试健康检查
curl http://localhost:12140/api/health

# 测试 API Key
curl -H "X-API-Key: your-key" http://localhost:12140/api/files

# 检查 Nginx 配置
sudo nginx -t
```

---

## 9. 安全建议

### 9.1 生产环境

- [ ] 修改默认 API Key
- [ ] 配置 HTTPS (SSL 证书)
- [ ] 限制 CORS 允许的域名
- [ ] 禁用 `/files/*` 静态文件访问（或添加认证）
- [ ] 配置防火墙，仅开放必要端口
- [ ] 定期备份数据

### 9.2 Nginx HTTPS 配置

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... 其他配置
}
```
