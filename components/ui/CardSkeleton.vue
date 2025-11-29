<template>
  <div class="bg-card rounded-xl p-4 space-y-3 border border-border/50">
    <!-- 头部 -->
    <div class="flex items-center gap-3">
      <div class="skeleton w-10 h-10 rounded-full" />
      <div class="flex-1 space-y-2">
        <div class="skeleton h-4 w-24 rounded" />
        <div class="skeleton h-3 w-16 rounded" />
      </div>
    </div>
    
    <!-- 内容 -->
    <div class="space-y-2">
      <div class="skeleton h-4 w-full rounded" />
      <div class="skeleton h-4 w-3/4 rounded" />
    </div>
    
    <!-- 图片占位 -->
    <div v-if="showImage" class="skeleton h-40 w-full rounded-lg" />
    
    <!-- 底部操作 -->
    <div class="flex items-center gap-4 pt-2">
      <div class="skeleton h-6 w-16 rounded" />
      <div class="skeleton h-6 w-16 rounded" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showImage?: boolean
}>()
</script>
