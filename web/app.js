// ===== Configuration Management =====
const Config = {
  KEYS: {
    SERVER_URL: 'light_cloud_server_url',
    API_KEY: 'light_cloud_api_key'
  },

  get serverUrl() {
    return localStorage.getItem(this.KEYS.SERVER_URL) || 'http://localhost:3000';
  },

  set serverUrl(url) {
    localStorage.setItem(this.KEYS.SERVER_URL, url);
  },

  get apiKey() {
    return localStorage.getItem(this.KEYS.API_KEY) || 'light-cloud-disk-2026';
  },

  set apiKey(key) {
    localStorage.setItem(this.KEYS.API_KEY, key);
  },

  clear() {
    localStorage.removeItem(this.KEYS.SERVER_URL);
    localStorage.removeItem(this.KEYS.API_KEY);
  }
};

// ===== API Client =====
const API = {
  async request(endpoint, options = {}) {
    const url = `${Config.serverUrl}${endpoint}`;
    const headers = {
      'X-API-Key': Config.apiKey,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('无法连接到服务器，请检查服务器地址和API密钥配置');
      }
      throw error;
    }
  },

  // 上传文件（支持进度回调）
  uploadFiles(files, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('解析响应失败'));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `上传失败: ${xhr.status}`));
          } catch (e) {
            reject(new Error(`上传失败: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('上传失败，请检查网络连接'));
      });

      xhr.open('POST', `${Config.serverUrl}/api/upload`);
      xhr.setRequestHeader('X-API-Key', Config.apiKey);
      xhr.send(formData);
    });
  },

  // 获取文件列表
  async getFiles() {
    return this.request('/api/files');
  },

  // 删除文件
  async deleteFile(filename) {
    return this.request(`/api/files/${filename}`, {
      method: 'DELETE'
    });
  },

  // 获取下载链接
  getDownloadUrl(filename) {
    return `${Config.serverUrl}/api/download/${encodeURIComponent(filename)}?apiKey=${encodeURIComponent(Config.apiKey)}`;
  }
};

// ===== UI Components =====
const UI = {
  // Toast通知
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  // 显示/隐藏加载指示器
  showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
  },

  // 显示/隐藏空状态
  showEmptyState(show) {
    document.getElementById('emptyState').style.display = show ? 'block' : 'none';
  },

  // 更新文件计数
  updateFileCount(count) {
    document.getElementById('fileCount').textContent = count;
  },

  // 渲染文件列表（网格视图）
  renderGrid(files) {
    const grid = document.getElementById('filesGrid');
    grid.innerHTML = '';

    if (files.length === 0) {
      this.showEmptyState(true);
      return;
    }

    this.showEmptyState(false);

    files.forEach(file => {
      const card = document.createElement('div');
      card.className = 'file-card';
      
      const icon = this.getFileIcon(file.mimetype);
      const size = this.formatFileSize(file.size);
      const date = new Date(file.uploadTime).toLocaleDateString('zh-CN');
      
      card.innerHTML = `
        <div class="file-icon">${icon}</div>
        <div class="file-name" title="${file.originalName}">${file.originalName}</div>
        <div class="file-info">${size} • ${date}</div>
        <div class="file-actions">
          <button class="btn-download" onclick="UI.downloadFile('${file.storedName}')">下载</button>
          <button class="btn-delete" onclick="UI.deleteFile('${file.storedName}', '${file.originalName}')">删除</button>
        </div>
      `;
      
      grid.appendChild(card);
    });
  },

  // 渲染文件列表（列表视图）
  renderList(files) {
    const list = document.getElementById('filesList');
    
    if (files.length === 0) {
      this.showEmptyState(true);
      return;
    }

    this.showEmptyState(false);

    let html = `
      <table>
        <thead>
          <tr>
            <th>文件名</th>
            <th>大小</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    files.forEach(file => {
      const icon = this.getFileIcon(file.mimetype);
      const size = this.formatFileSize(file.size);
      const date = new Date(file.uploadTime).toLocaleString('zh-CN');
      
      html += `
        <tr>
          <td>
            <span style="margin-right: 8px;">${icon}</span>
            ${file.originalName}
          </td>
          <td>${size}</td>
          <td>${date}</td>
          <td>
            <button class="btn-download" style="margin-right: 5px;" onclick="UI.downloadFile('${file.storedName}')">下载</button>
            <button class="btn-delete" onclick="UI.deleteFile('${file.storedName}', '${file.originalName}')">删除</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    list.innerHTML = html;
  },

  // 根据MIME类型获取文件图标
  getFileIcon(mimetype) {
    if (!mimetype) return '📄';
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎬';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📕';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    if (mimetype.includes('text')) return '📝';
    if (mimetype.includes('javascript') || mimetype.includes('json')) return '📜';
    return '📄';
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 下载文件
  downloadFile(filename) {
    window.open(API.getDownloadUrl(filename), '_blank');
  },

  // 删除文件
  async deleteFile(filename, originalName) {
    if (!confirm(`确定要删除文件 "${originalName}" 吗？`)) {
      return;
    }

    try {
      await API.deleteFile(filename);
      UI.showToast('文件删除成功', 'success');
      loadFiles(); // 重新加载文件列表
    } catch (error) {
      UI.showToast(`删除失败: ${error.message}`, 'error');
    }
  }
};

// ===== View Management =====
let currentView = 'grid';

function switchView(view) {
  currentView = view;
  const gridBtn = document.getElementById('gridView');
  const listBtn = document.getElementById('listView');
  const grid = document.getElementById('filesGrid');
  const list = document.getElementById('filesList');

  if (view === 'grid') {
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    grid.style.display = 'grid';
    list.style.display = 'none';
  } else {
    gridBtn.classList.remove('active');
    listBtn.classList.add('active');
    grid.style.display = 'none';
    list.style.display = 'block';
  }

  // 重新渲染当前视图
  loadFiles();
}

// ===== File Operations =====
async function loadFiles() {
  UI.showLoading(true);
  UI.showEmptyState(false);

  try {
    const response = await API.getFiles();
    const files = response.files || [];
    
    UI.updateFileCount(files.length);
    
    if (currentView === 'grid') {
      UI.renderGrid(files);
    } else {
      UI.renderList(files);
    }
  } catch (error) {
    UI.showToast(`加载文件失败: ${error.message}`, 'error');
    console.error('Load files error:', error);
  } finally {
    UI.showLoading(false);
  }
}

function handleFileSelect(files) {
  if (!files || files.length === 0) return;

  uploadFiles(files);
}

async function uploadFiles(files) {
  const progressDiv = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  progressDiv.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';

  try {
    const result = await API.uploadFiles(files, (percent) => {
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `${percent}%`;
    });

    UI.showToast(`成功上传 ${result.files.length} 个文件`, 'success');
    
    // 重置文件输入
    document.getElementById('fileInput').value = '';
    
    // 重新加载文件列表
    setTimeout(() => {
      progressDiv.style.display = 'none';
      loadFiles();
    }, 1000);
  } catch (error) {
    UI.showToast(`上传失败: ${error.message}`, 'error');
    progressDiv.style.display = 'none';
  }
}

// ===== Drag and Drop =====
function initDragDrop() {
  const dropArea = document.getElementById('dropArea');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove('dragover');
    }, false);
  });

  dropArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, false);
}

// ===== Theme Toggle =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ===== Modal Management =====
function initModal() {
  const modal = document.getElementById('configModal');
  const configBtn = document.getElementById('configBtn');
  const closeBtn = modal.querySelector('.close');
  const form = document.getElementById('configForm');

  // 填充当前配置
  document.getElementById('serverUrl').value = Config.serverUrl;
  document.getElementById('apiKey').value = Config.apiKey;

  configBtn.onclick = () => {
    modal.style.display = 'block';
  };

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    
    const serverUrl = document.getElementById('serverUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!serverUrl || !apiKey) {
      UI.showToast('请填写所有字段', 'error');
      return;
    }

    Config.serverUrl = serverUrl;
    Config.apiKey = apiKey;

    modal.style.display = 'none';
    UI.showToast('配置已保存', 'success');
    
    // 重新加载文件列表
    loadFiles();
  };
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  // 初始化主题
  initTheme();

  // 初始化拖放
  initDragDrop();

  // 初始化模态框
  initModal();

  // 绑定事件
  document.getElementById('fileInput').addEventListener('change', (e) => {
    handleFileSelect(e.target.files);
  });

  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadFiles();
  });

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.getElementById('gridView').addEventListener('click', () => switchView('grid'));
  document.getElementById('listView').addEventListener('click', () => switchView('list'));

  // 加载文件列表
  loadFiles();
});
