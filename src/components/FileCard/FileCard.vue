<template>
  <view class="file-card" @click="handleClick">
    <view class="file-icon" :style="{ backgroundColor: iconBgColor }">
      <text class="icon">{{ icon }}</text>
    </view>
    <view class="file-info">
      <text class="file-name">{{ file.originalName }}</text>
      <text class="file-meta">{{ formatSize(file.size) }} · {{ formatDate(file.uploadTime) }}</text>
    </view>
    <view class="file-actions">
      <button class="action-btn" @click.stop="handleDownload">
        <text class="icon-text">↓</text>
      </button>
      <button class="action-btn delete" @click.stop="handleDelete">
        <text class="icon-text">×</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import type { FileInfo } from '@/api/types'
import { formatFileSize, formatDate, getFileIcon, getFileIconColor } from '@/utils'

interface Props {
  file: FileInfo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click', file: FileInfo): void
  (e: 'download', file: FileInfo): void
  (e: 'delete', file: FileInfo): void
}>()

const icon = computed(() => getFileIcon(props.file.mimetype))
const iconBgColor = computed(() => getFileIconColor(props.file.mimetype))

function handleClick() {
  emit('click', props.file)
}

function handleDownload() {
  emit('download', props.file)
}

function handleDelete() {
  emit('delete', props.file)
}
</script>

<style lang="scss" scoped>
.file-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 16rpx;

  .file-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;

    .icon {
      font-size: 48rpx;
    }
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      display: block;
      font-size: 28rpx;
      color: #333333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 8rpx;
    }

    .file-meta {
      display: block;
      font-size: 24rpx;
      color: #999999;
    }
  }

  .file-actions {
    display: flex;
    gap: 16rpx;
    flex-shrink: 0;

    .action-btn {
      width: 64rpx;
      height: 64rpx;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon-text {
        font-size: 32rpx;
        color: #666666;
      }

      &.delete {
        background: #fee;

        .icon-text {
          color: #f56c6c;
        }
      }
    }
  }
}
</style>
