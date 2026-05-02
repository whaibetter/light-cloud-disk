package com.example.lightclouddisk

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.lightclouddisk.databinding.ActivitySettingsBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        loadCurrentConfig()
        setupClickListeners()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }
    }

    private fun loadCurrentConfig() {
        binding.etServerUrl.setText(ConfigManager.serverUrl)
        binding.etApiKey.setText(ConfigManager.apiKey)
    }

    private fun setupClickListeners() {
        // 保存配置
        binding.btnSave.setOnClickListener {
            saveConfig()
        }

        // 恢复默认
        binding.btnReset.setOnClickListener {
            ConfigManager.resetToDefault()
            loadCurrentConfig()
            showStatus("已恢复默认配置", false)
            Toast.makeText(this, "已恢复默认配置", Toast.LENGTH_SHORT).show()
        }

        // 测试连接
        binding.btnTest.setOnClickListener {
            testConnection()
        }
    }

    private fun saveConfig() {
        val serverUrl = binding.etServerUrl.text.toString().trim()
        val apiKey = binding.etApiKey.text.toString().trim()

        if (serverUrl.isBlank()) {
            showStatus("请输入服务器地址", true)
            return
        }

        if (apiKey.isBlank()) {
            showStatus("请输入API密钥", true)
            return
        }

        // 确保URL以/结尾
        val normalizedUrl = if (serverUrl.endsWith("/")) serverUrl else "$serverUrl/"

        ConfigManager.serverUrl = normalizedUrl
        ConfigManager.apiKey = apiKey

        showStatus("配置已保存", false)
        Toast.makeText(this, "配置已保存", Toast.LENGTH_SHORT).show()
    }

    private fun testConnection() {
        val serverUrl = binding.etServerUrl.text.toString().trim()
        val apiKey = binding.etApiKey.text.toString().trim()

        if (serverUrl.isBlank() || apiKey.isBlank()) {
            showStatus("请先填写服务器地址和API密钥", true)
            return
        }

        showStatus("正在测试连接...", false)
        binding.btnTest.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val normalizedUrl = if (serverUrl.endsWith("/")) serverUrl else "$serverUrl/"
                val url = "${normalizedUrl}api/health"

                val client = OkHttpClient.Builder()
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(10, TimeUnit.SECONDS)
                    .build()

                val request = Request.Builder()
                    .url(url)
                    .header("X-API-Key", apiKey)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                withContext(Dispatchers.Main) {
                    binding.btnTest.isEnabled = true
                    if (response.isSuccessful) {
                        showStatus("连接成功！", false)
                        Toast.makeText(this@SettingsActivity, "服务器连接正常", Toast.LENGTH_SHORT).show()
                    } else {
                        showStatus("连接失败: HTTP ${response.code}", true)
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.btnTest.isEnabled = true
                    showStatus("连接失败: ${e.message}", true)
                }
            }
        }
    }

    private fun showStatus(message: String, isError: Boolean) {
        binding.tvStatus.text = message
        binding.tvStatus.setTextColor(
            if (isError) getColor(android.R.color.holo_red_dark)
            else getColor(android.R.color.holo_green_dark)
        )
    }
}
