package com.example.lightclouddisk

import android.content.Context
import android.content.SharedPreferences

/**
 * 配置管理器 - 管理服务器地址和API密钥
 */
object ConfigManager {
    private const val PREFS_NAME = "light_cloud_disk_config"
    private const val KEY_SERVER_URL = "server_url"
    private const val KEY_API_KEY = "api_key"

    // 默认值
    private const val DEFAULT_SERVER_URL = "http://117.72.196.45/syncqclous/"
    private const val DEFAULT_API_KEY = "light-cloud-disk-2026"

    private lateinit var prefs: SharedPreferences

    /**
     * 初始化配置管理器
     */
    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    /**
     * 获取服务器地址
     */
    var serverUrl: String
        get() = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
        set(value) = prefs.edit().putString(KEY_SERVER_URL, value).apply()

    /**
     * 获取API密钥
     */
    var apiKey: String
        get() = prefs.getString(KEY_API_KEY, DEFAULT_API_KEY) ?: DEFAULT_API_KEY
        set(value) = prefs.edit().putString(KEY_API_KEY, value).apply()

    /**
     * 重置为默认配置
     */
    fun resetToDefault() {
        serverUrl = DEFAULT_SERVER_URL
        apiKey = DEFAULT_API_KEY
    }

    /**
     * 检查配置是否有效
     */
    fun isConfigValid(): Boolean {
        return serverUrl.isNotBlank() && apiKey.isNotBlank()
    }
}
