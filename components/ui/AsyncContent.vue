<template>
  <div>
    <!-- 加载状态 -->
    <Transition name="fade" mode="out-in">
      <div v-if="loading" key="loading">
        <slot name="loading">
          <PageLoading :message="loadingMessage" />
        </slot>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" key="error" class="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
        <Icon name="lucide:alert-circle" class="w-12 h-12 text-destructive/60" />
        <p class="text-sm text-muted-foreground text-center">{{ error }}</p>
        <button 
          v-if="retryable"
          @click="$emit('retry')"
          class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="empty" key="empty" class="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
        <slot name="empty">
          <Icon name="lucide:inbox" class="w-12 h-12 text-muted-foreground/40" />
          <p class="text-sm text-muted-foreground">{{ emptyMessage }}</p>
        </slot>
      </div>
      
      <!-- 内容 -->
      <div v-else key="content">
        <Transition name="slide-up" appear>
          <div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean
  error?: string | null
  empty?: boolean
  loadingMessage?: string
  emptyMessage?: string
  retryable?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>
