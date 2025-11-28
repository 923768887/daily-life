<script setup lang="ts">
interface Photo {
  id: number
  url: string
  thumbnailUrl?: string
  description?: string
  location?: string
  likeCount?: number
  isLiked?: boolean
}

const props = defineProps<{
  photo: Photo
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'like'): void
}>()
</script>

<template>
  <div 
    class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer card-hover"
    @click="emit('click')"
  >
    <img 
      :src="photo.thumbnailUrl || photo.url" 
      :alt="photo.description || '照片'"
      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
    
    <!-- 悬浮遮罩 -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="absolute bottom-0 left-0 right-0 p-3">
        <p v-if="photo.description" class="text-white text-sm truncate mb-1">
          {{ photo.description }}
        </p>
        <div class="flex items-center justify-between text-white/80 text-xs">
          <div v-if="photo.location" class="flex items-center gap-1">
            <Icon name="lucide:map-pin" class="w-3 h-3" />
            <span class="truncate max-w-24">{{ photo.location }}</span>
          </div>
          <button 
            class="flex items-center gap-1 hover:text-romantic-pink transition-colors"
            :class="{ 'text-romantic-pink': photo.isLiked }"
            @click.stop="emit('like')"
          >
            <Icon name="lucide:heart" :class="{ 'fill-current': photo.isLiked }" class="w-4 h-4" />
            <span>{{ photo.likeCount || 0 }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
