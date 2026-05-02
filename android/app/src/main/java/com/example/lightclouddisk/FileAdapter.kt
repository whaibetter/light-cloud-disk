package com.example.lightclouddisk

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.lightclouddisk.api.FileInfo
import java.text.SimpleDateFormat
import java.util.*

class FileAdapter(
    private val files: List<FileInfo>,
    private val onItemClick: (FileInfo) -> Unit
) : RecyclerView.Adapter<FileAdapter.FileViewHolder>() {

    inner class FileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val iconImageView: ImageView = itemView.findViewById(R.id.imageViewIcon)
        val nameTextView: TextView = itemView.findViewById(R.id.textViewFileName)
        val sizeTextView: TextView = itemView.findViewById(R.id.textViewFileSize)
        val dateTextView: TextView = itemView.findViewById(R.id.textViewUploadDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_file, parent, false) // 需要创建item_file.xml布局文件
        return FileViewHolder(view)
    }

    override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
        val file = files[position]
        
        // 设置文件图标（根据MIME类型）
        val iconRes = when {
            file.mimetype.startsWith("image/") -> R.drawable.ic_image
            file.mimetype.startsWith("video/") -> R.drawable.ic_video
            file.mimetype.startsWith("audio/") -> R.drawable.ic_audio
            file.mimetype.contains("pdf") -> R.drawable.ic_pdf
            else -> R.drawable.ic_file
        }
        holder.iconImageView.setImageResource(iconRes)
        
        // 设置文件名
        holder.nameTextView.text = file.originalName
        
        // 设置文件大小
        holder.sizeTextView.text = formatFileSize(file.size)
        
        // 设置上传日期
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        val date = try {
            dateFormat.format(Date(file.uploadTime))
        } catch (e: Exception) {
            file.uploadTime
        }
        holder.dateTextView.text = date
        
        // 点击事件
        holder.itemView.setOnClickListener {
            onItemClick(file)
        }
    }

    override fun getItemCount(): Int = files.size

    private fun formatFileSize(bytes: Long): String {
        val units = arrayOf("B", "KB", "MB", "GB")
        var size = bytes.toDouble()
        var unitIndex = 0
        
        while (size >= 1024 && unitIndex < units.size - 1) {
            size /= 1024
            unitIndex++
        }
        
        return String.format("%.2f %s", size, units[unitIndex])
    }
}
