package com.example.lightclouddisk.api

import okhttp3.MultipartBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // 上传文件
    @Multipart
    @POST("api/upload")
    suspend fun uploadFiles(
        @Header("X-API-Key") apiKey: String,
        @Part files: List<MultipartBody.Part>
    ): Response<UploadResponse>

    // 获取文件列表
    @GET("api/files")
    suspend fun getFiles(
        @Header("X-API-Key") apiKey: String
    ): Response<FilesResponse>

    // 删除文件
    @DELETE("api/files/{filename}")
    suspend fun deleteFile(
        @Header("X-API-Key") apiKey: String,
        @Path("filename") filename: String
    ): Response<DeleteResponse>

    // 下载文件（使用流式响应）
    @GET("api/download/{filename}")
    suspend fun downloadFile(
        @Header("X-API-Key") apiKey: String,
        @Path("filename") filename: String
    ): Response<ResponseBody>
}

// 数据模型
data class UploadResponse(
    val success: Boolean,
    val message: String,
    val files: List<FileInfo>
)

data class FilesResponse(
    val success: Boolean,
    val count: Int,
    val files: List<FileInfo>
)

data class DeleteResponse(
    val success: Boolean,
    val message: String
)

data class FileInfo(
    val id: String,
    val originalName: String,
    val storedName: String,
    val size: Long,
    val mimetype: String,
    val uploadTime: String,
    val md5: String
)
