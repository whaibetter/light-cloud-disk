<template>
  <view class="file-list">
    <view
      v-if="viewMode === 'list'"
      class="list-view"
    >
      <view 
        v-for="file in files" 
        :key="file.id"
        class="list-item"
      >
        <FileCard 
          :file="file"
          @click="$emit('itemClick', file)"
          @download="$emit('download', file)"
          @delete="$emit('delete', file)"
        />
      </view>
    </view>
    
    <view
      v-else
      class="grid-view"
    >
      <view 
        v-for="file in files" 
        :key="file.id"
        class="grid-item"
      >
        <FileCard 
          :file="file"
          @click="$emit('itemClick', file)"
          @download="$emit('download', file)"
          @delete="$emit('delete', file)"
        />
      </view>
    </view>
    
    <view
      v-if="files.length === 0"
      class="empty-state"
    >
      <text class="empty-icon">
        📭
      </text>
      <text class="empty-message">
        {{ emptyMessage }}
      </text>
      <text class="empty-hint">
        {{ emptyHint }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { FileInfo } from '@/api/types'
import FileCard from '../FileCard/FileCard.vue'

interface Props {
  files: FileInfo[]
  viewMode?: 'list' | 'grid'
  emptyMessage?: string
  emptyHint?: string
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'list',
  emptyMessage: '暂无文件',
  emptyHint: '点击下方按钮上传文件'
})

defineEmits<{
  (e: 'itemClick', file: FileInfo): void
  (e: 'download', file: FileInfo): void
  (e: 'delete', file: FileInfo): void
}>()
</script>

<style lang="scss" scoped>
.file-list {
  width: 100%;
  min-height: 400rpx;

  .list-view {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0 24rpx;
  }

  .grid-view {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    padding: 24rpx;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    min-height: 500rpx;

    .empty-icon {
      font-size: 120rpx;
      margin-bottom: 32rpx;
    }

    .empty-message {
      font-size: 32rpx;
      color: #333333;
      margin-bottom: 16rpx;
    }

    .empty-hint {
      font-size: 24rpx;
      color: #999999;
    }
  }
}
</style>
