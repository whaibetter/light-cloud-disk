#!/bin/bash
# 部署脚本 - 在云服务器上执行

set -e

echo "=== 轻量云盘部署脚本 ==="

# 1. 创建部署目录
DEPLOY_DIR="/opt/light-cloud-disk"
echo "1. 创建部署目录: $DEPLOY_DIR"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 2. 安装 PM2（如果未安装）
if ! command -v pm2 &> /dev/null; then
    echo "2. 安装 PM2..."
    npm install -g pm2
else
    echo "2. PM2 已安装，跳过"
fi

# 3. 创建后端目录
echo "3. 创建后端目录"
mkdir -p server
cd server

# 注意：实际文件需要通过scp上传
echo "后端文件需要上传到: $DEPLOY_DIR/server/"
echo "请上传以下文件:"
echo "  - server.js"
echo "  - package.json"
echo "  - .env (需要创建)"

# 4. 创建环境变量文件
cat > .env << 'EOF'
PORT=12140
API_KEY=light-cloud-disk-2026
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100
ALLOWED_ORIGINS=*
EOF

echo "4. 环境变量文件已创建 (.env)"
echo "   端口: 12140"
echo "   API密钥: light-cloud-disk-2026"

# 5. 安装依赖（上传文件后执行）
echo ""
echo "=== 上传文件后，请执行以下命令 ==="
echo "cd $DEPLOY_DIR/server"
echo "npm install"
echo "pm2 start server.js --name light-cloud-disk-server"
echo "pm2 save"
echo "pm2 startup"

cd $DEPLOY_DIR
echo ""
echo "=== 部署目录结构 ==="
ls -la

echo ""
echo "=== 下一步: 配置 Nginx ==="
echo "请将以下配置添加到 /etc/nginx/sites-available/default 或创建新配置文件"
