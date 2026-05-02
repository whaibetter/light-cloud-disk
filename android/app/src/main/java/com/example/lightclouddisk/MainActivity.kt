package com.example.lightclouddisk

import android.Manifest
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 使用 ViewBinding
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupApiService()
        setupClickListeners()
        loadFiles()

        // 处理分享意图
        handleIntent(intent)
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
        adapter = FileAdapter(fileList) { file ->
            // 点击文件时的操作（可以下载或预览）
            Toast.makeText(this, "点击了: ${file.originalName}", Toast.LENGTH_SHORT).show()
        }

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
            .baseUrl(BuildConfig.DEFAULT_SERVER_URL)
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
                val response = apiService.getFiles(BuildConfig.DEFAULT_API_KEY)

                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false

                    if (response.isSuccessful && response.body()?.success == true) {
                        fileList.clear()
                        response.body()?.files?.let { files ->
                            fileList.addAll(files)
                        }
                        adapter.notifyDataSetChanged()
                        updateEmptyState()
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

    private fun uploadFileFromUri(uri: Uri) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                // 从Uri获取文件信息
                val fileName = getFileName(uri)
                val fileType = contentResolver.getType(uri)
                
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
                    putExtra(FileUploadService.EXTRA_SERVER_URL, BuildConfig.DEFAULT_SERVER_URL)
                    putExtra(FileUploadService.EXTRA_API_KEY, BuildConfig.DEFAULT_API_KEY)
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
        binding.emptyState.visibility = if (fileList.isEmpty()) View.VISIBLE else View.GONE
        binding.recyclerView.visibility = if (fileList.isEmpty()) View.GONE else View.VISIBLE
    }
}
