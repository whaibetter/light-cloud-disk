package com.example.lightclouddisk

import android.Manifest
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.widget.SearchView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.lightclouddisk.api.ApiService
import com.example.lightclouddisk.api.FileInfo
import com.example.lightclouddisk.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var adapter: FileAdapter
    private lateinit var apiService: ApiService
    private val fileList = mutableListOf<FileInfo>()
    private val filteredFileList = mutableListOf<FileInfo>()
    private var downloadId: Long = -1

    // 文件选择器的回调
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri ->
                uploadFileFromUri(uri)
            }
        }
    }

    // 权限请求
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Toast.makeText(this, "权限已授予", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "需要存储权限来上传文件", Toast.LENGTH_SHORT).show()
        }
    }

    // 下载完成广播接收器
    private val downloadReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
            if (id == downloadId) {
                Toast.makeText(this@MainActivity, "下载完成", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            // 初始化配置管理器
            ConfigManager.init(this)

            // 使用 ViewBinding
            binding = ActivityMainBinding.inflate(layoutInflater)
            setContentView(binding.root)

            setupToolbar()
            setupRecyclerView()
            setupApiService()
            setupClickListeners()
            setupSearchView()
            loadFiles()

            // 处理分享意图
            handleIntent(intent)

            // 注册下载完成广播
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), RECEIVER_NOT_EXPORTED)
            } else {
                registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
            }
        } catch (e: Exception) {
            Log.e("MainActivity", "App initialization failed", e)
            Toast.makeText(this, "应用初始化失败: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        if (::binding.isInitialized) {
            setupApiService()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(downloadReceiver)
    }

    private fun setupToolbar() {
        binding.toolbar.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.action_settings -> {
                    startActivity(Intent(this, SettingsActivity::class.java))
                    true
                }
                else -> false
            }
        }
    }

    private fun setupSearchView() {
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                filterFiles(query)
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                filterFiles(newText)
                return true
            }
        })

        // 清除搜索时显示所有文件
        binding.searchView.setOnCloseListener {
            filterFiles(null)
            false
        }
    }

    private fun filterFiles(query: String?) {
        filteredFileList.clear()
        if (query.isNullOrBlank()) {
            filteredFileList.addAll(fileList)
        } else {
            val lowerQuery = query.lowercase()
            filteredFileList.addAll(fileList.filter {
                it.originalName.lowercase().contains(lowerQuery) ||
                it.mimetype.lowercase().contains(lowerQuery)
            })
        }
        adapter.updateFiles(filteredFileList)
        updateEmptyState()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleIntent(it) }
    }

    private fun handleIntent(intent: Intent) {
        when (intent.action) {
            Intent.ACTION_SEND -> {
                if (intent.type != null) {
                    val uri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    uri?.let { uploadFileFromUri(it) }
                }
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                val uris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
                uris?.forEach { uploadFileFromUri(it) }
            }
        }
    }

    private fun setupRecyclerView() {
        adapter = FileAdapter(
            files = filteredFileList,
            onItemClick = { file ->
                // 点击文件下载
                downloadFile(file)
            },
            onDownloadClick = { file ->
                // 下载按钮点击
                downloadFile(file)
            },
            onDeleteClick = { file ->
                // 删除按钮点击
                showDeleteConfirmation(file)
            }
        )

        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter
    }

    private fun setupApiService() {
        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(
                HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC)
            )
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(ConfigManager.serverUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(ApiService::class.java)
    }

    private fun setupClickListeners() {
        binding.fabUpload.setOnClickListener {
            // 检查权限（Android 13+需要READ_MEDIA_IMAGES等权限）
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                requestPermissionLauncher.launch(Manifest.permission.READ_MEDIA_IMAGES)
            }

            // 打开文件选择器
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "*/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            filePickerLauncher.launch(intent)
        }

        binding.swipeRefresh.setOnRefreshListener {
            loadFiles()
        }
    }

    private fun loadFiles() {
        binding.swipeRefresh.isRefreshing = true

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = apiService.getFiles(ConfigManager.apiKey)

                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false

                    if (response.isSuccessful && response.body()?.success == true) {
                        fileList.clear()
                        response.body()?.files?.let { files ->
                            fileList.addAll(files)
                        }
                        // 更新过滤列表
                        filterFiles(binding.searchView.query?.toString())
                    } else {
                        Toast.makeText(
                            this@MainActivity,
                            "加载失败: ${response.errorBody()?.string()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false
                    Toast.makeText(
                        this@MainActivity,
                        "网络错误: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    Log.e("MainActivity", "Load files error", e)
                }
            }
        }
    }

    private fun downloadFile(file: FileInfo) {
        try {
            val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val url = "${ConfigManager.serverUrl}api/download/${file.storedName}"

            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle(file.originalName)
                .setDescription("正在下载 ${file.originalName}")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    file.originalName
                )
                .addRequestHeader("X-API-Key", ConfigManager.apiKey)

            downloadId = downloadManager.enqueue(request)
            Toast.makeText(this, "开始下载: ${file.originalName}", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "下载失败: ${e.message}", Toast.LENGTH_SHORT).show()
            Log.e("MainActivity", "Download error", e)
        }
    }

    private fun showDeleteConfirmation(file: FileInfo) {
        AlertDialog.Builder(this)
            .setTitle("删除文件")
            .setMessage("确定要删除 ${file.originalName} 吗？")
            .setPositiveButton("删除") { _, _ ->
                deleteFile(file)
            }
            .setNegativeButton("取消", null)
            .show()
    }

    private fun deleteFile(file: FileInfo) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = apiService.deleteFile(ConfigManager.apiKey, file.storedName)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        Toast.makeText(this@MainActivity, "删除成功", Toast.LENGTH_SHORT).show()
                        loadFiles() // 重新加载文件列表
                    } else {
                        Toast.makeText(
                            this@MainActivity,
                            "删除失败: ${response.errorBody()?.string()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "删除失败: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    Log.e("MainActivity", "Delete error", e)
                }
            }
        }
    }

    private fun uploadFileFromUri(uri: Uri) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                // 从Uri获取文件信息
                val fileName = getFileName(uri)

                // 将Uri对应的文件复制到缓存目录
                val inputStream = contentResolver.openInputStream(uri)
                val cacheFile = File(cacheDir, fileName ?: "upload_${System.currentTimeMillis()}")
                val outputStream = FileOutputStream(cacheFile)

                inputStream?.use { input ->
                    outputStream.use { output ->
                        input.copyTo(output)
                    }
                }

                // 启动上传服务
                val intent = Intent(this@MainActivity, FileUploadService::class.java).apply {
                    action = FileUploadService.ACTION_UPLOAD
                    putExtra(FileUploadService.EXTRA_FILE_PATH, cacheFile.absolutePath)
                    putExtra(FileUploadService.EXTRA_SERVER_URL, ConfigManager.serverUrl)
                    putExtra(FileUploadService.EXTRA_API_KEY, ConfigManager.apiKey)
                }

                startService(intent)

                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "开始上传: $fileName",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "上传失败: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    Log.e("MainActivity", "Upload error", e)
                }
            }
        }
    }

    private fun getFileName(uri: Uri): String? {
        var name: String? = null
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                name = it.getString(it.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
            }
        }
        return name
    }

    private fun updateEmptyState() {
        val isEmpty = filteredFileList.isEmpty()
        binding.emptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
        binding.recyclerView.visibility = if (isEmpty) View.GONE else View.VISIBLE

        if (isEmpty) {
            val isSearching = !binding.searchView.query.isNullOrBlank()
            binding.tvEmptyMessage.text = if (isSearching) "没有找到匹配的文件" else "暂无文件"
        }
    }
}
