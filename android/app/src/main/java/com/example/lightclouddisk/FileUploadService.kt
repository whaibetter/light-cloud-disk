package com.example.lightclouddisk

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.lightclouddisk.api.ApiService
import com.example.lightclouddisk.api.FileInfo
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.runBlocking

class FileUploadService : Service() {

    companion object {
        const val CHANNEL_ID = "upload_channel"
        const val NOTIFICATION_ID = 1
        const val ACTION_UPLOAD = "com.example.lightclouddisk.action.UPLOAD"
        const val EXTRA_FILE_PATH = "file_path"
        const val EXTRA_SERVER_URL = "server_url"
        const val EXTRA_API_KEY = "api_key"
    }

    private lateinit var apiService: ApiService
    private lateinit var notificationManager: NotificationManager
    private lateinit var notificationBuilder: NotificationCompat.Builder

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_UPLOAD) {
            val filePath = intent.getStringExtra(EXTRA_FILE_PATH)
            val serverUrl = intent.getStringExtra(EXTRA_SERVER_URL) ?: BuildConfig.DEFAULT_SERVER_URL
            val apiKey = intent.getStringExtra(EXTRA_API_KEY) ?: BuildConfig.DEFAULT_API_KEY

            if (filePath != null) {
                startForeground(NOTIFICATION_ID, createNotification("准备上传...", 0))
                uploadFile(filePath, serverUrl, apiKey)
            }
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "文件上传",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "显示文件上传进度"
            }
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(contentText: String, progress: Int): Notification {
        notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("文件上传")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_menu_upload)
            .setOngoing(true)
            .setProgress(100, progress, progress == 0)

        return notificationBuilder.build()
    }

    private fun updateNotification(contentText: String, progress: Int) {
        notificationBuilder
            .setContentText(contentText)
            .setProgress(100, progress, false)
        notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build())
    }

    private fun uploadFile(filePath: String, serverUrl: String, apiKey: String) {
        val file = File(filePath)
        if (!file.exists()) {
            stopSelf()
            return
        }

        // 创建 OkHttpClient
        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC))
            .build()

        // 创建 Retrofit 实例
        val retrofit = Retrofit.Builder()
            .baseUrl(serverUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(ApiService::class.java)

        // 创建 MultipartBody.Part
        val requestFile = file.asRequestBody("application/octet-stream".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("files", file.name, requestFile)

        // 使用协程进行上传
        Thread {
            try {
                updateNotification("正在上传: ${file.name}", 50)

                // 使用 runBlocking 在线程中调用 suspend 函数
                val response = kotlinx.coroutines.runBlocking {
                    apiService.uploadFiles(apiKey, listOf(body))
                }

                if (response.isSuccessful && response.body()?.success == true) {
                    updateNotification("上传成功: ${file.name}", 100)
                    Log.d("FileUploadService", "Upload successful")
                } else {
                    updateNotification("上传失败: ${file.name}", 0)
                    Log.e("FileUploadService", "Upload failed: ${response.errorBody()?.string()}")
                }

                // 延迟1秒后停止服务
                Thread.sleep(1000)
                stopSelf()
            } catch (e: Exception) {
                updateNotification("上传出错: ${e.message}", 0)
                Log.e("FileUploadService", "Upload error", e)
                Thread.sleep(2000)
                stopSelf()
            }
        }.start()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopForeground(STOP_FOREGROUND_REMOVE)
    }
}
