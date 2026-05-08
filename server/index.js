const express = require('express');
const multer = require('multer');
const cors = require('cors');
const md5 = require('md5');
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
        md5: calculateMD5(file.path)
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
