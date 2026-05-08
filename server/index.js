const express = require('express');
const multer = require('multer');
const cors = require('cors');
const md5 = require('md5');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

let config = {};
const configPath = path.join(__dirname, '..', 'config.json');
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ Loaded configuration from config.json');
  } catch (error) {
    console.warn('⚠️  Failed to load config.json, using environment variables');
  }
}

const PORT = process.env.PORT || config.server?.port || 3000;
const API_KEY = process.env.API_KEY || config.server?.api_key || 'light-cloud-disk-2026';
const UPLOAD_DIR = process.env.UPLOAD_DIR || config.server?.upload_dir || './uploads';
const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE || config.server?.max_file_size || 100) * 1024 * 1024;

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 确保数据目录和文件存在
const DATA_DIR = path.join(__dirname, 'data');
const FILES_DB = path.join(DATA_DIR, 'files.json');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(FILES_DB)) {
  fs.writeFileSync(FILES_DB, JSON.stringify([], null, 2));
}

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') || config.server?.allowed_origins;
    if (!allowed || allowed === '*' || (Array.isArray(allowed) && allowed.includes('*'))) {
      callback(null, true);
    } else if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// 设置字符编码
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 设置响应头
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 静态文件服务（用于提供上传的文件下载）
app.use('/files', express.static(UPLOAD_DIR));

// API Key认证中间件
const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API Key'
    });
  }
  
  next();
};

// 配置Multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 修复中文文件名编码问题
    // multer/busboy 默认使用 latin1 编码，需要转换为 utf8
    let originalName;
    try {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      // 验证转换结果是否有效
      if (originalName.includes('\ufffd')) {
        // 转换失败，已经是 utf8 编码
        originalName = file.originalname;
      }
    } catch (e) {
      originalName = file.originalname;
    }

    const ext = path.extname(originalName);
    const basename = path.basename(originalName, ext);
    let finalName = originalName;
    let counter = 1;

    // 检查文件是否已存在，如果存在则添加数字后缀
    while (fs.existsSync(path.join(UPLOAD_DIR, finalName))) {
      finalName = `${basename}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // 最多同时上传10个文件
  }
});

// 读取文件数据库
const readFilesDB = () => {
  try {
    const data = fs.readFileSync(FILES_DB, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// 写入文件数据库
const writeFilesDB = (data) => {
  fs.writeFileSync(FILES_DB, JSON.stringify(data, null, 2));
};

// 计算文件MD5
const calculateMD5 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return md5(fileBuffer);
};

// API路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Light Cloud Disk Server is running',
    timestamp: new Date().toISOString()
  });
});

// 上传文件（支持多文件）
app.post('/api/upload', authenticateAPIKey, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const filesDB = readFilesDB();
    const uploadedFiles = [];

    req.files.forEach(file => {
      const fileInfo = {
        id: md5(file.filename + Date.now()),
        originalName: file.originalname,
        storedName: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        uploadTime: new Date().toISOString(),
        md5: calculateMD5(file.path),
        shares: []
      };

      filesDB.push(fileInfo);
      uploadedFiles.push(fileInfo);
    });

    writeFilesDB(filesDB);

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during upload'
    });
  }
});

// 获取文件列表
app.get('/api/files', authenticateAPIKey, (req, res) => {
  try {
    const filesDB = readFilesDB();
    res.json({
      success: true,
      count: filesDB.length,
      files: filesDB
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file list'
    });
  }
});

// 下载文件
app.get('/api/download/:filename', authenticateAPIKey, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // 获取文件信息
    const filesDB = readFilesDB();
    const fileInfo = filesDB.find(f => f.storedName === filename);

    // 设置下载头
    if (fileInfo) {
      const encodedName = encodeURIComponent(fileInfo.originalName);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
      res.setHeader('Content-Type', fileInfo.mimetype || 'application/octet-stream');
    }

    // 流式传输文件
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during download'
    });
  }
});

// 删除文件
app.delete('/api/files/:filename', authenticateAPIKey, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    // 从数据库中移除记录
    const filesDB = readFilesDB();
    const updatedDB = filesDB.filter(f => f.storedName !== filename);
    writeFilesDB(updatedDB);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during deletion'
    });
  }
});

// 获取单个文件信息
app.get('/api/files/:filename', authenticateAPIKey, (req, res) => {
  try {
    const filename = req.params.filename;
    const filesDB = readFilesDB();
    const fileInfo = filesDB.find(f => f.storedName === filename);

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      file: fileInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve file information'
    });
  }
});

// 生成随机 token
function generateToken() {
  return crypto.randomBytes(16).toString('hex').slice(0, 16);
}

// 创建分享链接
app.post('/api/share/:filename', authenticateAPIKey, (req, res) => {
  try {
    const filename = req.params.filename;
    const { password, expireHours } = req.body || {};

    const filesDB = readFilesDB();
    const fileInfo = filesDB.find(f => f.storedName === filename);

    if (!fileInfo) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // 确保 shares 数组存在
    if (!fileInfo.shares) {
      fileInfo.shares = [];
    }

    const token = generateToken();
    const share = {
      token,
      password: password ? md5(password) : '',
      expireAt: expireHours ? new Date(Date.now() + expireHours * 3600000).toISOString() : null,
      createdAt: new Date().toISOString()
    };

    fileInfo.shares.push(share);
    writeFilesDB(filesDB);

    // 构建分享链接
    const baseUrl = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/cloud/#/pages/share/index?token=${token}`;

    res.json({
      success: true,
      shareUrl,
      token,
      hasPassword: !!password,
      expireAt: share.expireAt
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 获取文件的分享列表
app.get('/api/shares/:filename', authenticateAPIKey, (req, res) => {
  try {
    const filename = req.params.filename;
    const filesDB = readFilesDB();
    const fileInfo = filesDB.find(f => f.storedName === filename);

    if (!fileInfo) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({
      success: true,
      shares: (fileInfo.shares || []).map(s => ({
        token: s.token,
        hasPassword: !!s.password,
        expireAt: s.expireAt,
        createdAt: s.createdAt,
        expired: s.expireAt ? new Date(s.expireAt) < new Date() : false
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 获取所有分享链接（全局）
app.get('/api/shares', authenticateAPIKey, (req, res) => {
  try {
    const filesDB = readFilesDB();
    const allShares = [];

    for (const file of filesDB) {
      if (file.shares && file.shares.length > 0) {
        for (const share of file.shares) {
          allShares.push({
            token: share.token,
            fileName: file.originalName,
            storedName: file.storedName,
            fileSize: file.size,
            mimetype: file.mimetype,
            hasPassword: !!share.password,
            expireAt: share.expireAt,
            createdAt: share.createdAt,
            expired: share.expireAt ? new Date(share.expireAt) < new Date() : false
          });
        }
      }
    }

    // 按创建时间降序排列
    allShares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, shares: allShares });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 删除分享链接
app.delete('/api/share/:token', authenticateAPIKey, (req, res) => {
  try {
    const token = req.params.token;
    const filesDB = readFilesDB();
    let found = false;

    for (const fileInfo of filesDB) {
      if (fileInfo.shares) {
        const index = fileInfo.shares.findIndex(s => s.token === token);
        if (index > -1) {
          fileInfo.shares.splice(index, 1);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, error: 'Share not found' });
    }

    writeFilesDB(filesDB);
    res.json({ success: true, message: 'Share deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 公开分享下载 - 获取分享信息
app.get('/api/s/:token', (req, res) => {
  try {
    const token = req.params.token;
    const filesDB = readFilesDB();
    let shareInfo = null;
    let fileInfo = null;

    for (const file of filesDB) {
      if (file.shares) {
        const share = file.shares.find(s => s.token === token);
        if (share) {
          shareInfo = share;
          fileInfo = file;
          break;
        }
      }
    }

    if (!shareInfo || !fileInfo) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    // 检查是否过期
    if (shareInfo.expireAt && new Date(shareInfo.expireAt) < new Date()) {
      return res.status(410).json({ success: false, error: 'Share link has expired' });
    }

    // 如果需要密码，只返回基本信息
    if (shareInfo.password) {
      return res.json({
        success: true,
        needPassword: true,
        fileName: fileInfo.originalName,
        fileSize: fileInfo.size,
        mimetype: fileInfo.mimetype
      });
    }

    // 无密码，直接返回文件信息供下载
    res.json({
      success: true,
      needPassword: false,
      fileName: fileInfo.originalName,
      fileSize: fileInfo.size,
      mimetype: fileInfo.mimetype,
      downloadReady: true
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 公开分享 - 验证密码并下载
app.post('/api/s/:token/verify', (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body || {};
    const filesDB = readFilesDB();
    let shareInfo = null;
    let fileInfo = null;

    for (const file of filesDB) {
      if (file.shares) {
        const share = file.shares.find(s => s.token === token);
        if (share) {
          shareInfo = share;
          fileInfo = file;
          break;
        }
      }
    }

    if (!shareInfo || !fileInfo) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    // 检查是否过期
    if (shareInfo.expireAt && new Date(shareInfo.expireAt) < new Date()) {
      return res.status(410).json({ success: false, error: 'Share link has expired' });
    }

    // 验证密码
    if (shareInfo.password) {
      if (!password || md5(password) !== shareInfo.password) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }

    // 密码正确，返回文件信息供下载
    res.json({
      success: true,
      fileName: fileInfo.originalName,
      fileSize: fileInfo.size,
      mimetype: fileInfo.mimetype,
      downloadReady: true
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 公开分享 - 下载文件
app.get('/api/s/:token/download', (req, res) => {
  try {
    const token = req.params.token;
    const password = req.query.password;
    const filesDB = readFilesDB();
    let shareInfo = null;
    let fileInfo = null;

    for (const file of filesDB) {
      if (file.shares) {
        const share = file.shares.find(s => s.token === token);
        if (share) {
          shareInfo = share;
          fileInfo = file;
          break;
        }
      }
    }

    if (!shareInfo || !fileInfo) {
      return res.status(404).json({ success: false, error: 'Share link not found' });
    }

    // 检查是否过期
    if (shareInfo.expireAt && new Date(shareInfo.expireAt) < new Date()) {
      return res.status(410).json({ success: false, error: 'Share link has expired' });
    }

    // 验证密码
    if (shareInfo.password) {
      if (!password || md5(password) !== shareInfo.password) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }

    // 检查文件是否存在
    const filePath = path.join(UPLOAD_DIR, fileInfo.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found on disk' });
    }

    // 设置下载头
    const encodedName = encodeURIComponent(fileInfo.originalName);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.setHeader('Content-Type', fileInfo.mimetype || 'application/octet-stream');

    // 流式传输
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Share download error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer错误处理
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE || 100}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 10 files per upload'
      });
    }
  }
  
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Light Cloud Disk Server is running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${path.resolve(UPLOAD_DIR)}`);
  console.log(`🔑 API Key: ${API_KEY}`);
});
