<template>
  <view class="upload-panel">
    <view class="upload-content">
      <view class="upload-icon">
        📤
      </view>
      <text class="upload-text">
        点击选择文件上传
      </text>
      <text class="upload-hint">
        支持图片、视频、文档等文件
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import { chooseFile } from '@/utils/file'

const emit = defineEmits<{
  (e: 'select', filePaths: string[]): void
}>()

async function handleSelect() {
  const filePaths = await chooseFile({ multiple: true })
  if (filePaths && filePaths.length > 0) {
    emit('select', filePaths)
  }
}
</script>

<style lang="scss" scoped>
.upload-panel {
  padding: 24rpx;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  border: 2rpx dashed #dddddd;
  border-radius: 16rpx;
  background: #fafafa;
  
  .upload-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }
  
  .upload-text {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 12rpx;
  }
  
  .upload-hint {
    font-size: 24rpx;
    color: #999999;
  }
}
</style>
